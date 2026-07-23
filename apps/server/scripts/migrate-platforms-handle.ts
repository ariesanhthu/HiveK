import * as fs from 'fs';
import { MongoClient } from 'mongodb';
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
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = value;
      }
    }
  }
};

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI
  || 'mongodb://root:root%40123@localhost:27017/hivek?authSource=admin';

async function migrateHandlesToUniqueId() {
  console.log('⚡ Starting Handles to UniqueId Migration Script...');
  console.log(`🔗 Connecting to MongoDB: ${MONGODB_URI.split('@').pop()}`);

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(); // Connects to the default database defined in the URI ('hivek')

    const influencersCol = db.collection('influencers');
    const cursor = influencersCol.find({});

    let updatedCount = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      if (!doc) continue;

      let changed = false;
      const updatedPlatforms = (doc.platforms || []).map((platform: any) => {
        if ('handle' in platform || 'uniqueId' in platform) {
          const rawHandle = platform.handle !== undefined ? platform.handle : platform.uniqueId;
          const handleVal = String(rawHandle || '');
          const uniqueIdVal = handleVal.startsWith('@') ? handleVal.substring(1) : handleVal;

          const updatedPlatform = { ...platform };
          delete updatedPlatform.handle;
          updatedPlatform.uniqueId = uniqueIdVal;
          changed = true;
          return updatedPlatform;
        }
        return platform;
      });

      if (changed) {
        await influencersCol.updateOne(
          { _id: doc._id },
          { $set: { platforms: updatedPlatforms } },
        );
        updatedCount++;
      }
    }

    console.log(`\n🎉 SUCCESS! Migration completed.`);
    console.log(`Processed and updated ${updatedCount} influencers in the collection.`);
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await client.close();
    console.log('🔌 Closed MongoDB connection.');
  }
}

migrateHandlesToUniqueId();
