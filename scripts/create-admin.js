/**
 * Creates (or resets) the FIRST admin account, using ADMIN_NAME / ADMIN_EMAIL /
 * ADMIN_PASSWORD from .env.local. This account is created already ACTIVE, since
 * there's no other admin yet to activate it. Every admin after this one signs up
 * at /admin/signup and needs an existing admin to activate them in User Management.
 * Run with: npm run create-admin
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function main() {
  const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Missing MONGODB_URI, ADMIN_EMAIL or ADMIN_PASSWORD in .env.local');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const AdminSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
      isActive: { type: Boolean, default: false },
    },
    { timestamps: true }
  );
  const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await Admin.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase() },
    { name: ADMIN_NAME || 'Admin', email: ADMIN_EMAIL.toLowerCase(), passwordHash, isActive: true },
    { upsert: true, new: true }
  );

  console.log(`Admin account ready: ${admin.email} (active)`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
