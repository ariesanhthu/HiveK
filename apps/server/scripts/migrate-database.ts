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

// --- Configuration ---
// Source database configuration (Local hivek)
const SOURCE_URI = process.env.MONGODB_URI
  || 'mongodb://root:root%40123@localhost:27017/hivek?authSource=admin';
const SOURCE_DB_NAME = 'hivek';

// Target database configuration (User to replace)
const TARGET_URI = process.env.MONGODB_ATLAS;
const TARGET_DB_NAME = 'hivek';
// ---------------------

async function migrateAllCollections() {
  console.log('⚡ Starting HiveK Database Migration Script...');
  console.log(`🔌 Source: ${SOURCE_URI.split('@').pop()}`);
  console.log(`🔌 Target: ${TARGET_URI.split('@').pop()}`);

  if (TARGET_URI.includes('YOUR_TARGET_CONNECTION_STRING')) {
    console.error(
      '❌ Error: Please fill in the TARGET_URI connection string inside the script before running!',
    );
    process.exit(1);
  }

  const sourceClient = new MongoClient(SOURCE_URI);
  const targetClient = new MongoClient(TARGET_URI);

  try {
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDb = sourceClient.db(SOURCE_DB_NAME);
    const targetDb = targetClient.db(TARGET_DB_NAME);

    // Get all collections from the source database
    const collections = await sourceDb.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections in source database.`);

    for (const colInfo of collections) {
      const colName = colInfo.name;

      // Skip system collections
      if (colName.startsWith('system.')) {
        continue;
      }

      console.log(`\n📦 Migrating collection: "${colName}"...`);
      const sourceCol = sourceDb.collection(colName);
      const targetCol = targetDb.collection(colName);

      const totalDocs = await sourceCol.countDocuments({});
      console.log(`   Total documents to migrate: ${totalDocs}`);

      if (totalDocs === 0) {
        console.log(`   Skipping empty collection.`);
        continue;
      }

      const cursor = sourceCol.find({});
      let batch: any[] = [];
      const batchSize = 500;
      let migratedCount = 0;

      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        if (!doc) continue;

        // Use upsert bulk write to avoid duplicates and ensure idempotency
        batch.push({
          replaceOne: {
            filter: { _id: doc._id },
            replacement: doc,
            upsert: true,
          },
        });

        if (batch.length >= batchSize) {
          await targetCol.bulkWrite(batch, { ordered: false });
          migratedCount += batch.length;
          console.log(`   Migrated ${migratedCount}/${totalDocs} documents...`);
          batch = [];
        }
      }

      // Write remaining documents in the final batch
      if (batch.length > 0) {
        await targetCol.bulkWrite(batch, { ordered: false });
        migratedCount += batch.length;
        console.log(`   Migrated ${migratedCount}/${totalDocs} documents...`);
      }

      console.log(`   ✅ Finished migrating "${colName}".`);
    }

    console.log('\n🎉 SUCCESS! Complete database migration finished successfully.');
  } catch (error) {
    console.error('❌ Error during database migration:', error);
  } finally {
    await sourceClient.close();
    await targetClient.close();
    console.log('🔌 Closed both MongoDB connections.');
  }
}

migrateAllCollections();
