import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    actor: { type: String, required: true }, // admin email, or "system"
    action: { type: String, required: true }, // e.g. "product.create", "auth.login"
    target: { type: String, default: '' }, // e.g. product name/SKU, user email
    details: { type: String, default: '' },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
