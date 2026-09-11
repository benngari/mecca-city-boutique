import mongoose from 'mongoose';

// Singleton document (only one ever exists) holding site-wide admin settings.
const SettingsSchema = new mongoose.Schema(
  {
    defaultLowStockThresholdPiece: { type: Number, default: 3 },
    defaultLowStockThresholdMl: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
