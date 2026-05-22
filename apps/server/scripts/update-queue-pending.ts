import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

// Load .env file manually to support standalone execution
const loadEnv = () => {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    for (const line of envConfig.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, ''); // strip optional quotes
        process.env[key] = value;
      }
    }
  }
};

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:root%40123@localhost:27017/hivek?authSource=admin';

async function updateQueueToPending() {
  console.log('⚡ Starting Queue Status Update Script...');
  console.log(`🔗 Connecting to MongoDB: ${MONGODB_URI.split('@').pop()}`);

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('tiktok_crawler');

    console.log('🔄 Updating all records in tiktok_queue_user to PENDING...');
    const result = await db.collection('tiktok_queue_user').updateMany(
      {},
      { 
        $set: { 
          status: 'PENDING',
          updated_at: new Date()
        } 
      }
    );

    console.log(`\n🎉 SUCCESS! Updated queue status.`);
    console.log(`Matched count: ${result.matchedCount}`);
    console.log(`Modified count: ${result.modifiedCount} queue items are now 'PENDING'.`);

  } catch (error) {
    console.error('❌ Error during update:', error);
  } finally {
    await client.close();
    console.log('🔌 Closed MongoDB connection.');
  }
}

updateQueueToPending();
