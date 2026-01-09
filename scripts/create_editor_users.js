const admin = require('firebase-admin');
const fs = require('fs');

// Initialize with the NEW Firebase project
const serviceAccount = JSON.parse(fs.readFileSync('./service-account-new.json.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createEditorUsers() {
  try {
    // Telal's UID
    const telalUid = 'NaqTem8uSfU64ARa4hjuGqYvnn13';
    const telalEmail = 'telal@naran.com';
    
    console.log(`Creating editor user document for Telal...`);
    
    await db.collection('users').doc(telalUid).set({
      email: telalEmail,
      role: 'editor',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log('✅ Successfully created editor user for Telal!');
    console.log(`   Email: ${telalEmail}`);
    console.log(`   UID: ${telalUid}`);
    console.log(`   Role: editor`);
    console.log('\nTelal should refresh the browser now.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
}

createEditorUsers();
