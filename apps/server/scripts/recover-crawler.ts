import { MongoClient, ObjectId } from 'mongodb';
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

// Formats unique_id (e.g., "minh_hoang.a3_auto" -> "Minh Hoang A3 Auto")
const formatDisplayName = (uniqueId: string): string => {
  if (!uniqueId) return 'Unknown Influencer';
  return uniqueId
    .split(/[._-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

async function recover() {
  console.log('⚡ Starting Crawler Database Recovery Script...');
  console.log(`🔗 Connecting to MongoDB: ${MONGODB_URI.split('@').pop()}`);

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('tiktok_crawler');

    console.log('🧹 Clearing damaged user, tiktok_users, and youtube_users collections to rebuild...');
    await db.collection('user').deleteMany({});
    await db.collection('tiktok_users').deleteMany({});
    await db.collection('youtube_users').deleteMany({});

    // 1. Fetch completed users from queues
    console.log('🔄 Loading logs from tiktok_processed_user and youtube_processed_user...');
    
    const processedTiktok = await db.collection('tiktok_processed_user')
      .find({ status: 'COMPLETED' })
      .toArray();

    const processedYoutube = await db.collection('youtube_processed_user')
      .find({ status: 'COMPLETED' })
      .toArray();

    console.log(`📊 Found ${processedTiktok.length} completed TikTok logs and ${processedYoutube.length} completed YouTube logs.`);

    // 2. Rebuild tiktok_users collection
    if (processedTiktok.length > 0) {
      console.log('🌱 Rebuilding tiktok_users...');
      const tiktokDocs = processedTiktok.map((tk) => ({
        _id: tk._id,
        uniqueId: tk.unique_id,
        nickname: formatDisplayName(tk.unique_id),
        signature: '', // Will be updated when re-crawled
        followerCount: tk.followerCount || 0,
        heartCount: tk.heartCount || 0,
        verified: false,
        language: 'vi',
        region: 'VN',
        updatedAt: null,
      }));
      await db.collection('tiktok_users').insertMany(tiktokDocs);
      console.log(`✅ Restored ${tiktokDocs.length} documents into tiktok_users.`);
    }

    // 3. Rebuild youtube_users & mapping collection
    if (processedYoutube.length > 0) {
      console.log('🌱 Rebuilding youtube_users and user mapping entries...');
      const youtubeDocs: any[] = [];
      const mappingDocs: any[] = [];

      for (const yt of processedYoutube) {
        // Parse handle from URL: e.g. "https://www.youtube.com/@channel_name" -> "@channel_name"
        let handle = yt.url?.split('/@').pop() || '';
        if (handle && !handle.startsWith('@')) {
          handle = '@' + handle;
        }

        youtubeDocs.push({
          _id: yt._id,
          handle: handle || `@channel_${yt._id.toString().substring(18)}`,
          channel_name: formatDisplayName(handle.replace('@', '')),
          description: '', // Will be updated when re-crawled
          id: handle,
          subscribers: 0,
          tags: [],
          total_views: null,
        });

        // If it links back to a TikTok user, create the user mapping entry
        if (yt.tiktok_user_id) {
          mappingDocs.push({
            _id: new ObjectId(),
            tiktok_id: new ObjectId(yt.tiktok_user_id.toString()),
            youtube_id: yt._id,
          });
        }
      }

      if (youtubeDocs.length > 0) {
        await db.collection('youtube_users').insertMany(youtubeDocs);
        console.log(`✅ Restored ${youtubeDocs.length} documents into youtube_users.`);
      }

      if (mappingDocs.length > 0) {
        await db.collection('user').insertMany(mappingDocs);
        console.log(`✅ Restored ${mappingDocs.length} mapping documents into user collection.`);
      }
    }

    console.log('\n🎉 SUCCESS! Crawler database has been successfully reconstructed.');
    console.log(`Total Restored:`);
    console.log(`- tiktok_users: ${processedTiktok.length}`);
    console.log(`- youtube_users: ${processedYoutube.length}`);
    console.log(`- user mappings: ${processedYoutube.filter(y => y.tiktok_user_id).length}`);

  } catch (error) {
    console.error('❌ Error during recovery:', error);
  } finally {
    await client.close();
    console.log('🔌 Closed MongoDB connection.');
  }
}

recover();
