/**
 * Creates (or resets) the admin account using ADMIN_USERNAME / ADMIN_PASSWORD from .env.local
 * Run with: npm run create-admin
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function main() {
  const { MONGODB_URI, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error('Missing MONGODB_URI, ADMIN_USERNAME or ADMIN_PASSWORD in .env.local');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  });
  const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await Admin.findOneAndUpdate(
    { username: ADMIN_USERNAME },
    { username: ADMIN_USERNAME, passwordHash },
    { upsert: true, new: true }
  );

  console.log(`Admin account ready: ${admin.username}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
