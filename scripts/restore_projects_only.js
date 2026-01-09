const sdk = require('node-appwrite');
const fs = require('fs');

const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('69356b960013d2a9d1d8')
    .setKey('standard_4aa6c584481e77ffc51c84d0873b26514b1a9f8969db5fd2e31747953c539b688d22b553260c14b39a48e8f5ff017910e725008ae85d24dbdd7181717f5fded5694516a98f90f24eeff3b7c20d4918c301701a83dc79e0249ac3bb8a9b428ff5963049d2e668a085b9eef7bd273602c22c27e32881ed33a70dbe9b023b7091e2');

const DATABASE_ID = '69356e45002e114f104d';

async function restoreProjects() {
    console.log('Reading backup file...');
    const backup = JSON.parse(fs.readFileSync('backups/naran_backup_2026-01-08.json', 'utf8'));
    const projects = backup.data.projects;
    
    console.log(`Found ${projects.length} projects to restore\n`);
    
    let restored = 0;
    let errors = 0;
    
    for (const project of projects) {
        try {
            const { _id, ...data } = project;
            
            // Add ProjectNo field and ensure proper types
            const cleanData = {
                name: data.name || '',
                projectId: data.projectId || '',
                ProjectNo: parseInt(data.projectId) || 0,
                address: data.address || '',
                contactNo: data.contactNo || '',
                archived: Boolean(data.archived)
            };
            
            await databases.createDocument(
                DATABASE_ID,
                'projects',
                _id,
                cleanData,
                [] // No document-level permissions
            );
            
            restored++;
            console.log(`✅ ${restored}. ${cleanData.name} (${cleanData.projectId})`);
            
        } catch (error) {
            errors++;
            console.error(`❌ Error restoring ${project.name}:`, error.message);
        }
    }
    
    console.log(`\n✅ Restored ${restored} projects`);
    if (errors > 0) {
        console.log(`⚠️  ${errors} errors`);
    }
}

restoreProjects();
