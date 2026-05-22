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

// Helpers to extract Email & Phone from bios
const extractEmail = (text: string): string | null => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
  const match = text.match(emailRegex);
  return match ? match[0] : null;
};

const extractPhone = (text: string): string | null => {
  // Matches typical Vietnamese mobile formats with optional dots, spaces, or hyphens
  const phoneRegex = /(?:\+84|0)(?:\d[\s.-]*){9,10}\b/;
  const match = text.match(phoneRegex);
  return match ? match[0].replace(/[\s.-]/g, '') : null;
};

// Seed platforms in 'hivek' if they don't exist (required for ID reference)
async function ensurePlatformsExist(client: MongoClient): Promise<{ tiktokId: string; youtubeId: string }> {
  const db = client.db('hivek');
  const platformsCol = db.collection('platforms');

  let tiktok = await platformsCol.findOne({ name: 'tiktok' });
  if (!tiktok) {
    const res = await platformsCol.insertOne({
      name: 'tiktok',
      base_url: 'https://tiktok.com',
      api_status: 'stable',
      icon_url: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png',
      created_at: new Date(),
      updated_at: new Date(),
    });
    tiktok = { _id: res.insertedId };
    console.log('✨ Initialized tiktok platform in HiveK.');
  }

  let youtube = await platformsCol.findOne({ name: 'youtube' });
  if (!youtube) {
    const res = await platformsCol.insertOne({
      name: 'youtube',
      base_url: 'https://youtube.com',
      api_status: 'stable',
      icon_url: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
      created_at: new Date(),
      updated_at: new Date(),
    });
    youtube = { _id: res.insertedId };
    console.log('✨ Initialized youtube platform in HiveK.');
  }

  return {
    tiktokId: tiktok._id.toString(),
    youtubeId: youtube._id.toString(),
  };
}

// Sync Crawler DB data to HiveK using 'user' as the main entry collection
async function syncCrawlerData(client: MongoClient, platformIds: { tiktokId: string; youtubeId: string }) {
  const crawlerDb = client.db('tiktok_crawler');
  const serverDb = client.db('hivek');

  console.log('🔄 Fetching user mappings from crawler database (collection: user)...');
  const userMappings = await crawlerDb.collection('user').find({}).toArray();
  
  if (userMappings.length === 0) {
    console.log('ℹ️ No user mappings found in user collection. Sync complete (0 records).');
    return;
  }

  console.log(`Found ${userMappings.length} mapped user records. Starting sync...`);
  let syncedCount = 0;

  // Helper to convert ID to ObjectId if it is a valid hex-24 string, or keep it as is
  const toQueryId = (id: any): any => {
    if (!id) return null;
    if (id instanceof ObjectId) return id;
    if (typeof id === 'string') {
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        return new ObjectId(id);
      }
      return id;
    }
    return id;
  };

  for (const mapping of userMappings) {
    // Look up detailed user records based on the main entry mapping IDs
    const tiktokUser = mapping.tiktok_id 
      ? await crawlerDb.collection('tiktok_users').findOne({ _id: toQueryId(mapping.tiktok_id) }) 
      : null;
      
    const youtubeUser = mapping.youtube_id 
      ? await crawlerDb.collection('youtube_users').findOne({ _id: toQueryId(mapping.youtube_id) }) 
      : null;

    if (!tiktokUser && !youtubeUser) {
      console.warn(`⚠️ Warning: No matching crawler detailed records found in tiktok_users or youtube_users for mapping ID: ${mapping._id}`);
      continue;
    }

    // 1. Resolve basic info (preferring TikTok but falling back to YouTube)
    const name = tiktokUser?.nickname || youtubeUser?.channel_name || 'Unknown Influencer';
    const location = 'Vietnam';
    const gender = 'unspecified';

    // Combine bio/signature/description texts
    const signature = tiktokUser?.signature || '';
    const description = youtubeUser?.description || '';
    const combinedBio = [signature, description].filter(Boolean).join('\n---\n');

    // 2. Extract Contact Info using regex
    let email = extractEmail(signature) || extractEmail(description);
    if (!email) {
      // Satisfy standard Mongoose required/unique constraints on email
      // const safeHandle = tiktokUser?.uniqueId || youtubeUser?.handle?.replace('@', '') || mapping._id.toString();
      // email = `${safeHandle.toLowerCase()}@placeholder.hivek.com`;
      email = null;
    }

    const phone = extractPhone(signature) || extractPhone(description) || '';

    // 3. Map platforms array (NativePlatformInfo matching database snake_case representation)
    const platforms: any[] = [];

    if (tiktokUser) {
      // Calculate engagement
      const followerCount = tiktokUser.followerCount || 0;
      const heartCount = tiktokUser.heartCount || 0;
      const avgEngagement = followerCount > 0 ? parseFloat((heartCount / followerCount).toFixed(2)) : 0;

      // Extract categories
      const categories = tiktokUser.categories ? Object.keys(tiktokUser.categories) : [];

      platforms.push({
        platform_id: platformIds.tiktokId,
        handle: tiktokUser.uniqueId,
        external_id: tiktokUser._id.toString(),
        follower_count: followerCount,
        avg_engagement: avgEngagement,
        top_tags: [],
        categories: categories,
      });
    }

    if (youtubeUser) {
      platforms.push({
        platform_id: platformIds.youtubeId,
        handle: youtubeUser.handle,
        external_id: youtubeUser._id.toString(),
        follower_count: youtubeUser.subscribers || 0,
        avg_engagement: 0,
        top_tags: youtubeUser.tags || [],
        categories: [],
      });
    }

    const isVerified = !!(tiktokUser?.verified || youtubeUser?.verified);

    // 4. Build target document
    const influencerDoc = {
      name,
      location,
      gender,
      bio: combinedBio,
      email,
      phone,
      platforms,
      is_verified: isVerified,
      updated_at: new Date(),
    };

    // 5. Upsert by email to avoid duplicate errors and keep it sync-friendly
    await serverDb.collection('influencers').updateOne(
      { email },
      { 
        $set: influencerDoc,
        $setOnInsert: { created_at: new Date() }
      },
      { upsert: true }
    );

    console.log(`✅ Synced: "${name}" (${email})`);
    syncedCount++;
  }

  console.log(`🎉 Sync successful! Synchronized ${syncedCount} profiles into the server database based on user mapping entry.`);
}

async function run() {
  console.log(`🚀 Starting Crawler to Server Database Sync Script (Main Entry: user collection)...`);
  console.log(`🔗 Connection URI: ${MONGODB_URI.split('@').pop()}`);

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB.');

    // Step 1: Ensure core social media platforms are defined
    const platformIds = await ensurePlatformsExist(client);

    // Step 2: Synchronize crawler data to server using 'user' mappings
    await syncCrawlerData(client, platformIds);

  } catch (error) {
    console.error('❌ Error executing sync script:', error);
  } finally {
    await client.close();
    console.log('🔌 Closed MongoDB connection.');
  }
}

run();
