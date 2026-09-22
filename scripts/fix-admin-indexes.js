require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function main() {
  const { MONGODB_URI } = process.env;
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env.local');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  const collection = mongoose.connection.collection('admins');

  const indexes = await collection.indexes();
  console.log('Current indexes on admins collection:');
  console.log(indexes);

  for (const index of indexes) {
    if (index.name !== '_id_' && index.name !== 'email_1') {
      console.log(`Dropping stale index: ${index.name}`);
      await collection.dropIndex(index.name);
    }
  }

  console.log('Done. Remaining indexes:');
  console.log(await collection.indexes());

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});