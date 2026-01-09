const admin = require('firebase-admin');
const fs = require('fs');

// Initialize with the NEW Firebase project
const serviceAccount = JSON.parse(fs.readFileSync('./service-account-new.json.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createAdminUser() {
  try {
    // Use the CORRECT UID from the console output (with capital T)
    const uid = 'XfNPBQJvRHTgjhAXU7FyYH9Cnu43';
    const email = 'keshab@naran.com';
    
    console.log(`Creating user document for UID: ${uid}`);
    
    await db.collection('users').doc(uid).set({
      email: email,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log('✅ Successfully created admin user with correct UID!');
    console.log(`   Email: ${email}`);
    console.log(`   UID: ${uid}`);
    console.log(`   Role: admin`);
    console.log('\nPlease refresh your browser now.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
}

createAdminUser();
