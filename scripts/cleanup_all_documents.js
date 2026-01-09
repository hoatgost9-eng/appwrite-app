const sdk = require('node-appwrite');

const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('69356b960013d2a9d1d8')
    .setKey('standard_4aa6c584481e77ffc51c84d0873b26514b1a9f8969db5fd2e31747953c539b688d22b553260c14b39a48e8f5ff017910e725008ae85d24dbdd7181717f5fded5694516a98f90f24eeff3b7c20d4918c301701a83dc79e0249ac3bb8a9b428ff5963049d2e668a085b9eef7bd273602c22c27e32881ed33a70dbe9b023b7091e2');

const DATABASE_ID = '69356e45002e114f104d';

async function deleteAllDocuments() {
    const collections = ['projects', 'elements', 'delivery_notes', 'logs', 'recycle'];
    
    console.log('Starting cleanup...\n');
    
    for (const collectionName of collections) {
        try {
            console.log(`Processing ${collectionName}...`);
            let hasMore = true;
            let deleted = 0;
            
            while (hasMore) {
                const result = await databases.listDocuments(DATABASE_ID, collectionName, [
                    sdk.Query.limit(100)
                ]);
                
                if (result.documents.length === 0) {
                    hasMore = false;
                    break;
                }
                
                for (const doc of result.documents) {
                    try {
                        await databases.deleteDocument(DATABASE_ID, collectionName, doc.$id);
                        deleted++;
                    } catch (err) {
                        console.error(`  Error deleting ${doc.$id}:`, err.message);
                    }
                }
                
                console.log(`  Deleted ${deleted} documents so far...`);
            }
            
            console.log(`✅ ${collectionName}: Deleted ${deleted} documents\n`);
            
        } catch (error) {
            console.error(`❌ Error processing ${collectionName}:`, error.message);
        }
    }
    
    console.log('\n✅ Cleanup complete! Now you can restore the data with correct permissions.');
}

deleteAllDocuments();
