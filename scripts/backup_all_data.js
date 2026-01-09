// Emergency backup script - exports all Firestore data to JSON files
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('../service-account.json.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function backupAllCollections() {
  console.log('🚨 EMERGENCY BACKUP STARTING...\n');
  
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFolder = path.join(backupDir, `backup_${timestamp}`);
  fs.mkdirSync(backupFolder);
  
  try {
    // List of all collections to backup
    const collections = ['elements', 'projects', 'delivery_notes', 'users', 'logs', 'recycle'];
    
    for (const collectionName of collections) {
      console.log(`📦 Backing up collection: ${collectionName}`);
      
      const snapshot = await db.collection(collectionName).get();
      const data = [];
      
      snapshot.forEach(doc => {
        data.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      const filePath = path.join(backupFolder, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      console.log(`✅ Saved ${data.length} documents to ${collectionName}.json`);
    }
    
    // Create a summary file
    const summary = {
      backupDate: new Date().toISOString(),
      collections: collections,
      totalCollections: collections.length,
      backupLocation: backupFolder
    };
    
    fs.writeFileSync(
      path.join(backupFolder, 'backup_summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('\n✅ BACKUP COMPLETED SUCCESSFULLY!');
    console.log(`📁 Backup saved to: ${backupFolder}`);
    console.log('\n⚠️  IMPORTANT: Copy this folder to a safe location immediately!');
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
  }
  
  process.exit(0);
}

backupAllCollections();
