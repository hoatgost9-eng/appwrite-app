// Restore script - imports data from a single JSON backup file
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// IMPORTANT: Update this to point to your NEW Firebase service account key
const serviceAccount = require('../service-account-new.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function restoreFromJSON() {
  console.log('🔄 RESTORATION STARTING...\n');
  
  // Path to your JSON backup file
  const backupFile = path.join(__dirname, '../backups/backup_latest.json');
  
  if (!fs.existsSync(backupFile)) {
    console.error('❌ Backup file not found at:', backupFile);
    console.log('\nPlease make sure firestore-backup-2025-12-06.json is in the project root folder.');
    process.exit(1);
  }
  
  console.log(`📂 Reading backup file...\n`);
  
  try {
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    // The backup might be structured differently, let's handle common formats
    let collections = {};
    
    // Check if it's already organized by collection
    if (typeof backupData === 'object' && !Array.isArray(backupData)) {
      collections = backupData;
    } else {
      console.error('❌ Unexpected backup format. Please share the structure of your JSON file.');
      process.exit(1);
    }
    
    // Restore each collection
    for (const [collectionName, documents] of Object.entries(collections)) {
      console.log(`📦 Restoring collection: ${collectionName}`);
      
      if (!Array.isArray(documents) && typeof documents === 'object') {
        // Documents are in object format {docId: {data}, docId2: {data}}
        let successCount = 0;
        let errorCount = 0;
        
        for (const [docId, docData] of Object.entries(documents)) {
          try {
            const cleanedData = cleanTimestamps(docData);
            await db.collection(collectionName).doc(docId).set(cleanedData);
            successCount++;
          } catch (error) {
            console.error(`  ❌ Error restoring doc ${docId}:`, error.message);
            errorCount++;
          }
        }
        
        console.log(`✅ Restored ${successCount} documents to ${collectionName}`);
        if (errorCount > 0) {
          console.log(`⚠️  ${errorCount} documents failed`);
        }
      } else if (Array.isArray(documents)) {
        // Documents are in array format [{id, ...data}]
        let successCount = 0;
        let errorCount = 0;
        
        for (const doc of documents) {
          try {
            const { id, ...docData } = doc;
            const cleanedData = cleanTimestamps(docData);
            await db.collection(collectionName).doc(id || db.collection(collectionName).doc().id).set(cleanedData);
            successCount++;
          } catch (error) {
            console.error(`  ❌ Error restoring doc:`, error.message);
            errorCount++;
          }
        }
        
        console.log(`✅ Restored ${successCount} documents to ${collectionName}`);
        if (errorCount > 0) {
          console.log(`⚠️  ${errorCount} documents failed`);
        }
      }
      console.log('');
    }
    
    console.log('✅ RESTORATION COMPLETE!\n');
    console.log('Next steps:');
    console.log('1. Go to Firebase Console → Firestore Database');
    console.log('2. Verify your data is there');
    console.log('3. Create your admin user profile in the users collection');
    console.log('4. Test your app!');
    
  } catch (error) {
    console.error('❌ Restoration failed:', error);
    process.exit(1);
  }
}

// Helper function to convert timestamp strings back to Firestore Timestamps
function cleanTimestamps(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const cleaned = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object') {
      // Check if it looks like a Firestore timestamp
      if (value._seconds !== undefined && value._nanoseconds !== undefined) {
        cleaned[key] = new admin.firestore.Timestamp(value._seconds, value._nanoseconds);
      } else if (value.seconds !== undefined && value.nanoseconds !== undefined) {
        cleaned[key] = new admin.firestore.Timestamp(value.seconds, value.nanoseconds);
      } else {
        // Recursively clean nested objects
        cleaned[key] = cleanTimestamps(value);
      }
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

// Run the restoration
restoreFromJSON()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
