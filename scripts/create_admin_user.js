// Create admin user document directly
const admin = require('firebase-admin');
const serviceAccount = require('../service-account-new.json.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createAdminUser() {
  const uid = 'ogC07XXdipQ8bzBO343a9cyg6Xk1';
  const email = 'keshab@naran.com';
  
  console.log(`Creating/updating user document for ${email} (UID: ${uid})`);
  
  await db.collection('users').doc(uid).set({
    email: email,
    role: 'admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  
  console.log(`✅ Successfully created/updated admin user!`);
  
  // Verify
  const doc = await db.collection('users').doc(uid).get();
  console.log('User data:', doc.data());
  
  process.exit(0);
}

createAdminUser().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
