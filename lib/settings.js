import { connectDB } from '@/lib/mongodb';
import Settings from '@/models/Settings';

// There is only ever one Settings document - fetch it, creating it with
// defaults on first use.
export async function getSettings() {
  await connectDB();
  let settings = await Settings.findOne({});
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
}
