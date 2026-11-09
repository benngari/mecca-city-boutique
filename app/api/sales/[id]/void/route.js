import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { computeStockStatus } from '@/lib/stockStatus';

// POST /api/sales/[id]/void  (owner only)
// Cancels a wrongly recorded sale: the sale stops counting toward revenue and
// profit, and its quantity goes back into stock. The record is kept (flagged as
// voided) so the history is still auditable.
export async function POST(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.role === 'staff') {
    return NextResponse.json({ error: 'Only the owner can void a sale' }, { status: 403 });
  }

  try {
    await connectDB();

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 200) : '';

    // Atomic: only the first request can flip a sale from active to voided,
    // so a double-click can never put the stock back twice.
    const sale = await Sale.findOneAndUpdate(
      { _id: params.id, voidedAt: null },
      { $set: { voidedAt: new Date(), voidedBy: session.email, voidReason: reason } },
      { new: true }
    );

    if (!sale) {
      const exists = await Sale.exists({ _id: params.id });
      return NextResponse.json(
        { error: exists ? 'This sale was already voided' : 'Sale not found' },
        { status: exists ? 400 : 404 }
      );
    }

    // Put the stock back.
    let stockNote = 'stock not restored (product removed or not tracking stock)';
    const product = await Product.findOneAndUpdate(
      { _id: sale.product, stockQuantity: { $ne: null } },
      { $inc: { stockQuantity: sale.quantitySold } },
      { new: true }
    );
    if (product) {
      product.stockStatus = await computeStockStatus(product, product.stockQuantity);
      await product.save();
      stockNote = `stock restored, ${product.stockQuantity} now in stock`;
    }

    await logAction({
      actor: session.email,
      action: 'sale.void',
      target: sale.productName,
      details: `Voided sale of ${sale.quantitySold} ${sale.unitType} for KSh ${sale.revenue} - ${stockNote}${
        reason ? ` - reason: ${reason}` : ''
      }`,
    });

    return NextResponse.json({ success: true, stockNote });
  } catch (err) {
    console.error('Void sale error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
