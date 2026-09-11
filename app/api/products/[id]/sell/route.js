import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Sale from '@/models/Sale';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { computeStockStatus } from '@/lib/stockStatus';

// POST /api/products/[id]/sell
// body: { quantity: number, amountReceived: number, soldAt?: ISO date string }
// amountReceived is what the customer actually paid in total (handles bargaining -
// it does not have to match quantity x listed price). soldAt lets the admin
// backdate a sale entered late (e.g. recorded the next day).
export async function POST(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const quantitySold = Number(body.quantity) > 0 ? Number(body.quantity) : 1;
    const revenue = Number(body.amountReceived);

    if (!(revenue >= 0)) {
      return NextResponse.json({ error: 'Enter the amount actually received for this sale' }, { status: 400 });
    }

    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stockQuantity == null) {
      return NextResponse.json(
        { error: 'This product has no stock quantity set. Add one in Edit Product first.' },
        { status: 400 }
      );
    }

    const newQuantity = Math.max(0, product.stockQuantity - quantitySold);
    const stockStatus = await computeStockStatus(product, newQuantity);

    product.stockQuantity = newQuantity;
    product.stockStatus = stockStatus;
    await product.save();

    const costPricePerUnit = product.costPrice || 0;
    const cost = costPricePerUnit * quantitySold;
    const profit = revenue - cost;
    const soldAt = body.soldAt ? new Date(body.soldAt) : new Date();

    const sale = await Sale.create({
      product: product._id,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      unitType: product.unitType,
      quantitySold,
      costPricePerUnit,
      revenue,
      cost,
      profit,
      soldAt,
      recordedBy: session.email,
    });

    await logAction({
      actor: session.email,
      action: 'stock.sell',
      target: product.name,
      details: `Sold ${quantitySold} ${product.unitType} for KSh ${revenue} (profit KSh ${profit.toFixed(0)}), ${newQuantity} remaining - dated ${soldAt.toLocaleDateString()}`,
    });

    return NextResponse.json({ product, sale });
  } catch (err) {
    console.error('Record sale error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
