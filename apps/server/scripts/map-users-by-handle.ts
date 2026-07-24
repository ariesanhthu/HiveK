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

async function mapUsersByHandle() {
  console.log('🔗 Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('tiktok_crawler');

    console.log('🔄 Fetching all users from tiktok_users and youtube_users...');
    const tiktokUsers = await db.collection('tiktok_users').find({}).toArray();
    const youtubeUsers = await db.collection('youtube_users').find({}).toArray();

    console.log(
      `📊 Found ${tiktokUsers.length} TikTok users and ${youtubeUsers.length} YouTube users.`,
    );

    // Map YouTube handles (lowercased) to their respective _ids for fast lookup
    const youtubeMap = new Map<string, ObjectId>();
    for (const yt of youtubeUsers) {
      if (yt.handle) {
        youtubeMap.set(yt.handle.toLowerCase(), yt._id);
      }
    }

    const matchedTiktokIds = new Set<string>();
    const matchedYoutubeIds = new Set<string>();

    let matchedCount = 0;
    let tiktokOnlyCount = 0;
    let youtubeOnlyCount = 0;
    const userCol = db.collection('user');

    console.log('🚀 Matching uniqueId from TikTok with handle from YouTube...');
    for (const tk of tiktokUsers) {
      if (!tk.uniqueId) continue;

      const targetHandle = `@${tk.uniqueId.toLowerCase()}`;
      const ytId = youtubeMap.get(targetHandle);

      if (ytId) {
        matchedTiktokIds.add(tk._id.toString());
        matchedYoutubeIds.add(ytId.toString());

        // Check if there is an existing mapping for either tiktok_id or youtube_id
        const existing = await userCol.findOne({
          $or: [
            { tiktok_id: tk._id },
            { youtube_id: ytId },
          ],
        });

        if (existing) {
          await userCol.updateOne(
            { _id: existing._id },
            { $set: { tiktok_id: tk._id, youtube_id: ytId } },
          );
        } else {
          await userCol.insertOne({
            tiktok_id: tk._id,
            youtube_id: ytId,
          });
        }
        matchedCount++;
      }
    }

    console.log('📝 Upserting standalone TikTok-only mappings...');
    for (const tk of tiktokUsers) {
      if (matchedTiktokIds.has(tk._id.toString())) continue;

      await userCol.updateOne(
        { tiktok_id: tk._id },
        {
          $set: { tiktok_id: tk._id },
          $setOnInsert: { youtube_id: null },
        },
        { upsert: true },
      );
      tiktokOnlyCount++;
    }

    console.log('📝 Upserting standalone YouTube-only mappings...');
    for (const yt of youtubeUsers) {
      if (matchedYoutubeIds.has(yt._id.toString())) continue;

      await userCol.updateOne(
        { youtube_id: yt._id },
        {
          $set: { youtube_id: yt._id },
          $setOnInsert: { tiktok_id: null },
        },
        { upsert: true },
      );
      youtubeOnlyCount++;
    }

    console.log(`\n🎉 Success! Processed mapping completed.`);
    console.log(`- Matched profiles (TikTok & YouTube): ${matchedCount}`);
    console.log(`- TikTok-only profiles: ${tiktokOnlyCount}`);
    console.log(`- YouTube-only profiles: ${youtubeOnlyCount}`);
  } catch (error) {
    console.error('❌ Error executing mapping script:', error);
  } finally {
    await client.close();
    console.log('🔌 Closed MongoDB connection.');
  }
}

mapUsersByHandle();
