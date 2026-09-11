import { connectDB } from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import { getEffectiveThreshold } from '@/lib/stockStatus';

// Daily totals (revenue, profit, items sold) between two dates, most recent first.
export async function getDailySales(startDate, endDate) {
  await connectDB();
  const rows = await Sale.aggregate([
    { $match: { soldAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$soldAt' } },
        revenue: { $sum: '$revenue' },
        profit: { $sum: '$profit' },
        itemsSold: { $sum: '$quantitySold' },
        saleCount: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);
  return rows.map((r) => ({ date: r._id, ...r, _id: undefined }));
}

// Individual sale rows in a date range, most recent first.
export async function getSalesList(startDate, endDate, limit = 200) {
  await connectDB();
  const sales = await Sale.find({ soldAt: { $gte: startDate, $lte: endDate } })
    .sort({ soldAt: -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(sales));
}

export async function getSalesTotals(startDate, endDate) {
  await connectDB();
  const [result] = await Sale.aggregate([
    { $match: { soldAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$revenue' },
        profit: { $sum: '$profit' },
        itemsSold: { $sum: '$quantitySold' },
        saleCount: { $sum: 1 },
      },
    },
  ]);
  return result
    ? { revenue: result.revenue, profit: result.profit, itemsSold: result.itemsSold, saleCount: result.saleCount }
    : { revenue: 0, profit: 0, itemsSold: 0, saleCount: 0 };
}

// Best-selling products by quantity in a date range.
export async function getTopSellers(startDate, endDate, limit = 10) {
  await connectDB();
  const rows = await Sale.aggregate([
    { $match: { soldAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: '$product',
        productName: { $first: '$productName' },
        sku: { $first: '$sku' },
        unitType: { $first: '$unitType' },
        quantitySold: { $sum: '$quantitySold' },
        revenue: { $sum: '$revenue' },
        profit: { $sum: '$profit' },
      },
    },
    { $sort: { quantitySold: -1 } },
    { $limit: limit },
  ]);
  return rows;
}

// Products that sold the LEAST (or not at all) in a date range - includes
// every active product, not just ones with at least one sale.
export async function getSlowMovers(startDate, endDate, limit = 10) {
  await connectDB();
  const sold = await Sale.aggregate([
    { $match: { soldAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: '$product', quantitySold: { $sum: '$quantitySold' } } },
  ]);
  const soldMap = Object.fromEntries(sold.map((s) => [s._id.toString(), s.quantitySold]));

  const products = await Product.find({ deletedAt: null }, 'name sku unitType').lean();
  const rows = products
    .map((p) => ({
      productName: p.name,
      sku: p.sku,
      unitType: p.unitType,
      quantitySold: soldMap[p._id.toString()] || 0,
    }))
    .sort((a, b) => a.quantitySold - b.quantitySold)
    .slice(0, limit);

  return rows;
}

// Products at or below their effective low-stock threshold right now.
export async function getLowStockProducts() {
  await connectDB();
  const products = await Product.find({
    deletedAt: null,
    stockQuantity: { $ne: null },
  }).lean();

  const results = [];
  for (const p of products) {
    const threshold = await getEffectiveThreshold(p);
    if (p.stockQuantity <= threshold) {
      results.push({
        _id: p._id,
        name: p.name,
        sku: p.sku,
        unitType: p.unitType,
        stockQuantity: p.stockQuantity,
        threshold,
      });
    }
  }
  return results.sort((a, b) => a.stockQuantity - b.stockQuantity);
}
