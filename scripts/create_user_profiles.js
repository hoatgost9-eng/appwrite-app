const sdk = require('node-appwrite');

const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('69356b960013d2a9d1d8')
    .setKey('standard_4aa6c584481e77ffc51c84d0873b26514b1a9f8969db5fd2e31747953c539b688d22b553260c14b39a48e8f5ff017910e725008ae85d24dbdd7181717f5fded5694516a98f90f24eeff3b7c20d4918c301701a83dc79e0249ac3bb8a9b428ff5963049d2e668a085b9eef7bd273602c22c27e32881ed33a70dbe9b023b7091e2');

const DATABASE_ID = '69356e45002e114f104d';

const users = [
    {
        $id: '695f766de98e7c9082d3',
        email: 'keshabshahi@gmail.com',
        name: 'Keshab Shahi',
        role: 'admin'
    },
    {
        $id: '695f59920011005920d40',
        email: 'keshab@naran.com',
        name: 'Keshab',
        role: 'admin'
    }
];

async function createUserProfiles() {
    for (const user of users) {
        try {
            await databases.createDocument(
                DATABASE_ID,
                'users',
                user.$id,
                {
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    disabled: false,
                    createdAt: new Date().toISOString()
                },
                [] // No document-level permissions - use collection permissions
            );
            console.log(`✅ Created profile for ${user.email} with role: ${user.role}`);
        } catch (error) {
            if (error.code === 409) {
                console.log(`⚠️  Profile already exists for ${user.email}`);
            } else {
                console.error(`❌ Error creating profile for ${user.email}:`, error.message);
            }
        }
    }
    console.log('\n✅ Done! User profiles created.');
}

createUserProfiles();
