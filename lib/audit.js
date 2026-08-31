import { connectDB } from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

// Best-effort audit logging - never throws, so a logging failure never breaks
// the action it's recording (a sale, a login, a delete, etc).
export async function logAction({ actor, action, target = '', details = '' }) {
  try {
    await connectDB();
    await AuditLog.create({ actor: actor || 'system', action, target, details });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}
