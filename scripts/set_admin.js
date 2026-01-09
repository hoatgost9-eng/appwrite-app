// Quick script to set a user as admin
const admin = require('firebase-admin');
const serviceAccount = require('../service-account-new.json.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Find user by email and set role to admin
async function setAdmin() {
  const email = 'keshab@naran.com';
  
  console.log(`Looking for user with email: ${email}`);
  
  const usersSnap = await db.collection('users').get();
  
  let found = false;
  for (const doc of usersSnap.docs) {
    const data = doc.data();
    if (data.email === email) {
      await db.collection('users').doc(doc.id).update({ role: 'admin' });
      console.log(`✅ Updated user ${doc.id} to admin role`);
      found = true;
    }
  }
  
  if (!found) {
    console.log('❌ User not found');
  }
  
  process.exit(0);
}

setAdmin();
