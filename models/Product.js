import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0, default: null },
    category: { type: String, required: true, index: true },
    images: { type: [ImageSchema], default: [] },
    sizes: { type: [String], default: [] },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'sold_out'],
      default: 'in_stock',
    },
    stockQuantity: { type: Number, min: 0, default: null },
    featured: { type: Boolean, default: false },
    sku: { type: String, required: true, unique: true, trim: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
