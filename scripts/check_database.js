const sdk = require('node-appwrite');

const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('69356b960013d2a9d1d8')
    .setKey('standard_4aa6c584481e77ffc51c84d0873b26514b1a9f8969db5fd2e31747953c539b688d22b553260c14b39a48e8f5ff017910e725008ae85d24dbdd7181717f5fded5694516a98f90f24eeff3b7c20d4918c301701a83dc79e0249ac3bb8a9b428ff5963049d2e668a085b9eef7bd273602c22c27e32881ed33a70dbe9b023b7091e2');

const DATABASE_ID = '69356e45002e114f104d';

async function checkDatabase() {
    try {
        console.log('Checking projects collection...');
        const projects = await databases.listDocuments(DATABASE_ID, 'projects', [
            sdk.Query.limit(5)
        ]);
        console.log(`Found ${projects.total} projects`);
        console.log('Sample project:', JSON.stringify(projects.documents[0], null, 2));
        
        console.log('\n\nChecking elements collection...');
        const elements = await databases.listDocuments(DATABASE_ID, 'elements', [
            sdk.Query.limit(5)
        ]);
        console.log(`Found ${elements.total} elements`);
        if (elements.documents.length > 0) {
            console.log('Sample element:', JSON.stringify(elements.documents[0], null, 2));
        }
        
        console.log('\n\nChecking delivery_notes collection...');
        const notes = await databases.listDocuments(DATABASE_ID, 'delivery_notes', [
            sdk.Query.limit(5)
        ]);
        console.log(`Found ${notes.total} delivery notes`);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

checkDatabase();
