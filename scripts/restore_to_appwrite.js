// Restore Firebase backup to Appwrite
const fs = require('fs');
const path = require('path');
const { Client, Databases, ID } = require('node-appwrite');

// Appwrite Configuration
const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT_ID = '69356b960013d2a9d1d8';
const DATABASE_ID = '69356e45002e114f104d';
const API_KEY = 'standard_4aa6c584481e77ffc51c84d0873b26514b1a9f8969db5fd2e31747953c539b688d22b553260c14b39a48e8f5ff017910e725008ae85d24dbdd7181717f5fded5694516a98f90f24eeff3b7c20d4918c301701a83dc79e0249ac3bb8a9b428ff5963049d2e668a085b9eef7bd273602c22c27e32881ed33a70dbe9b023b7091e2'; // You need to create an API key in Appwrite Console

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

// Collection mappings (Firebase collection name -> Appwrite collection ID)
const COLLECTIONS = {
    'elements': 'elements',
    'projects': 'projects',
    'delivery_notes': 'delivery_notes',
    'logs': 'logs',
    'users': 'users',
    'recycle': 'recycle'
};

async function restoreToAppwrite() {
    console.log('🔄 APPWRITE RESTORATION STARTING...\n');
    
    // Path to your JSON backup file
    const backupFile = path.join(__dirname, '../backups/firestore-backup-2025-12-10 Latest.json');
    
    if (!fs.existsSync(backupFile)) {
        console.error('❌ Backup file not found at:', backupFile);
        process.exit(1);
    }
    
    console.log(`📂 Reading backup file...\n`);
    
    try {
        const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
        
        // Restore each collection
        for (const [collectionName, documents] of Object.entries(backupData)) {
            if (!COLLECTIONS[collectionName]) {
                console.log(`⚠️  Skipping unknown collection: ${collectionName}`);
                continue;
            }
            
            const appwriteCollectionId = COLLECTIONS[collectionName];
            console.log(`\n📦 Restoring collection: ${collectionName} -> ${appwriteCollectionId}`);
            
            if (!Array.isArray(documents)) {
                console.error(`❌ Expected array for ${collectionName}, got ${typeof documents}`);
                continue;
            }
            
            let successCount = 0;
            let errorCount = 0;
            let skippedCount = 0;
            
            for (const doc of documents) {
                try {
                    // Use the original document ID if available
                    const docId = doc.id || ID.unique();
                    
                    // Remove the 'id' field from the document data (Appwrite uses $id)
                    const { id, ...docData } = doc;
                    
                    // Convert any nested objects to JSON strings if needed
                    const cleanData = {};
                    for (const [key, value] of Object.entries(docData)) {
                        if (value === null || value === undefined) {
                            cleanData[key] = '';
                        } else if (key === 'volume') {
                            // Convert volume to a number (it's stored as string in Firebase)
                            cleanData[key] = value === '' ? 0 : parseFloat(value) || 0;
                        } else if (typeof value === 'object' && !Array.isArray(value)) {
                            cleanData[key] = JSON.stringify(value);
                        } else if (Array.isArray(value)) {
                            cleanData[key] = JSON.stringify(value);
                        } else {
                            cleanData[key] = value;
                        }
                    }
                    
                    // Create document in Appwrite
                    await databases.createDocument(
                        DATABASE_ID,
                        appwriteCollectionId,
                        docId,
                        cleanData
                    );
                    
                    successCount++;
                    if (successCount % 10 === 0) {
                        process.stdout.write(`   ✓ ${successCount} documents restored...\r`);
                    }
                } catch (error) {
                    if (error.code === 409) {
                        // Document already exists, skip
                        skippedCount++;
                    } else {
                        errorCount++;
                        console.error(`   ❌ Error restoring document ${doc.id}:`, error.message);
                    }
                }
            }
            
            console.log(`\n   ✅ ${successCount} documents restored successfully`);
            if (skippedCount > 0) console.log(`   ⏭️  ${skippedCount} documents skipped (already exist)`);
            if (errorCount > 0) console.log(`   ❌ ${errorCount} documents failed`);
        }
        
        console.log('\n✅ RESTORATION COMPLETE!\n');
        
    } catch (error) {
        console.error('❌ Fatal error during restoration:', error);
        process.exit(1);
    }
}

// Run the restoration
restoreToAppwrite().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
});
