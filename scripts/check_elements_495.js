const sdk = require('node-appwrite');

const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('69356b960013d2a9d1d8')
    .setKey('standard_4aa6c584481e77ffc51c84d0873b26514b1a9f8969db5fd2e31747953c539b688d22b553260c14b39a48e8f5ff017910e725008ae85d24dbdd7181717f5fded5694516a98f90f24eeff3b7c20d4918c301701a83dc79e0249ac3bb8a9b428ff5963049d2e668a085b9eef7bd273602c22c27e32881ed33a70dbe9b023b7091e2');

const DATABASE_ID = '69356e45002e114f104d';

async function checkElements495() {
    try {
        console.log('Checking elements for project 495...');
        const elements = await databases.listDocuments(DATABASE_ID, 'elements', [
            sdk.Query.equal('projectNumber', '495'),
            sdk.Query.limit(5)
        ]);
        
        console.log(`Found ${elements.total} elements for project 495`);
        
        if (elements.documents[0]) {
            const elem = elements.documents[0];
            console.log('\nSample element:');
            console.log('- ID:', elem.$id);
            console.log('- elementId:', elem.elementId);
            console.log('- projectNumber:', elem.projectNumber);
            console.log('- projectName:', elem.projectName);
            console.log('- type:', elem.type);
            console.log('- status:', elem.status);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkElements495();
