// Restore script - imports backed-up Firestore data to NEW Firebase project
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// IMPORTANT: Update this to point to your NEW Firebase service account key
const serviceAccount = require('../service-account-new.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function restoreAllCollections() {
  console.log('🔄 RESTORATION STARTING...\n');
  
  // Find the most recent backup folder
  const backupDir = path.join(__dirname, '../backups');
  
  if (!fs.existsSync(backupDir)) {
    console.error('❌ No backups folder found! Please run backup script first.');
    process.exit(1);
  }
  
  const backupFolders = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('backup_'))
    .sort()
    .reverse();
  
  if (backupFolders.length === 0) {
    console.error('❌ No backup folders found!');
    process.exit(1);
  }
  
  const latestBackup = backupFolders[0];
  const backupFolder = path.join(backupDir, latestBackup);
  
  console.log(`📂 Using backup: ${latestBackup}\n`);
  
  try {
    // List of all collections to restore
    const collections = ['elements', 'projects', 'delivery_notes', 'users', 'logs', 'recycle'];
    
    for (const collectionName of collections) {
      const filePath = path.join(backupFolder, `${collectionName}.json`);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${collectionName} - no backup file found`);
        continue;
      }
      
      console.log(`📦 Restoring collection: ${collectionName}`);
      
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const doc of data) {
        try {
          const { id, ...docData } = doc;
          
          // Convert Firestore timestamps back to proper format if needed
          const cleanedData = cleanTimestamps(docData);
          
          await db.collection(collectionName).doc(id).set(cleanedData);
          successCount++;
        } catch (error) {
          console.error(`  ❌ Error restoring doc ${doc.id}:`, error.message);
          errorCount++;
        }
      }
      
      console.log(`✅ Restored ${successCount} documents to ${collectionName}`);
      if (errorCount > 0) {
        console.log(`⚠️  ${errorCount} documents failed`);
      }
      console.log('');
    }
    
    console.log('✅ RESTORATION COMPLETE!\n');
    console.log('Next steps:');
    console.log('1. Go to Firebase Console → Firestore Database');
    console.log('2. Verify your data is there');
    console.log('3. Create your admin user profile in the users collection');
    console.log('4. Update your app config and test!');
    
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
restoreAllCollections()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
