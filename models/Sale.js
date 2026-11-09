import mongoose from 'mongoose';

// One row per recorded sale. Stores snapshots of price/cost/unit at the time
// of sale so historical profit stays accurate even if the product changes later.
const SaleSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: String, required: true },
    unitType: { type: String, enum: ['piece', 'ml'], default: 'piece' },
    quantitySold: { type: Number, required: true, min: 0 },
    costPricePerUnit: { type: Number, default: 0 },
    revenue: { type: Number, required: true, min: 0 }, // what the customer actually paid, total
    cost: { type: Number, required: true, min: 0 },
    profit: { type: Number, required: true },
    soldAt: { type: Date, required: true, index: true }, // the actual day of the sale (can be backdated)
    recordedBy: { type: String, required: true },
    // Voided sales are kept for the audit trail but no longer count toward revenue/profit.
    voidedAt: { type: Date, default: null, index: true },
    voidedBy: { type: String, default: null },
    voidReason: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Sale || mongoose.model('Sale', SaleSchema);
