import * as fs from 'fs';
import { MongoClient, ObjectId } from 'mongodb';
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

const MONGODB_URI = process.env.MONGODB_URI
  || 'mongodb://root:root%40123@localhost:27017/hivek?authSource=admin';

async function enqueueTiktokScraping() {
  console.log('⚡ Starting TikTok Enqueue Scraping Script...');
  console.log(`🔗 Connecting to MongoDB: ${MONGODB_URI.split('@').pop()}`);

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('tiktok_crawler');

    console.log('🧹 Clearing existing records in tiktok_queue_user to start clean...');
    // await db.collection('tiktok_queue_user').deleteMany({});

    console.log('🔄 Loading all users from tiktok_users collection...');
    const tiktokUsers = await db.collection('tiktok_users').find({}).toArray();

    if (tiktokUsers.length === 0) {
      console.log('ℹ️ No users found in tiktok_users collection to enqueue.');
      return;
    }

    console.log(`📊 Found ${tiktokUsers.length} users in tiktok_users. Generating queue items...`);

    const queueDocs = tiktokUsers.map((user) => ({
      _id: new ObjectId(),
      unique_id: user.uniqueId,
      created_at: new Date(),
      followerCount: 1000000,
      heartCount: 1000000,
      id: user.id || user._id.toString(),
      status: 'IN_PROGRESS',
      started_at: new Date(),
    }));

    // Batch insert documents in chunks of 500
    const batchSize = 500;
    for (let i = 0; i < queueDocs.length; i += batchSize) {
      const batch = queueDocs.slice(i, i + batchSize);
      await db.collection('tiktok_queue_user').insertMany(batch);
      console.log(`⏳ Enqueued batch ${Math.floor(i / batchSize) + 1}...`);
    }

    console.log('\n🎉 SUCCESS! All users have been enqueued for scraping.');
    console.log(`Total Enqueued: ${queueDocs.length} users inside 'tiktok_queue_user'.`);
  } catch (error) {
    console.error('❌ Error during enqueuing:', error);
  } finally {
    await client.close();
    console.log('🔌 Closed MongoDB connection.');
  }
}

enqueueTiktokScraping();
