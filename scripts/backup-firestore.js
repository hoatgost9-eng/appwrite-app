// Firestore Backup Script
// Run: node scripts/backup-firestore.js

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with your service account
const serviceAccount = require('../service-account.json.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Collections to backup
const collections = ['elements', 'projects', 'delivery_notes', 'users', 'activity_logs', 'recycle_bin'];

async function backupCollection(collectionName) {
  console.log(`Backing up ${collectionName}...`);
  
  const snapshot = await db.collection(collectionName).get();
  const data = [];
  
  snapshot.forEach(doc => {
    data.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const filename = path.join(backupDir, `${collectionName}_${timestamp}.json`);
  
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`✅ Saved ${data.length} documents to ${filename}`);
  
  return data.length;
}

async function backupAll() {
  console.log('🔄 Starting full Firestore backup...\n');
  
  let totalDocs = 0;
  
  for (const collection of collections) {
    try {
      const count = await backupCollection(collection);
      totalDocs += count;
    } catch (error) {
      console.error(`❌ Error backing up ${collection}:`, error.message);
    }
  }
  
  console.log(`\n✅ Backup complete! Total documents: ${totalDocs}`);
  console.log(`📁 Backups saved in: ${path.join(__dirname, '..', 'backups')}`);
  
  process.exit(0);
}

backupAll();
