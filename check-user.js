// Quick script to check and create user profile if missing
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkUser() {
  try {
    // Get all users from Firebase Auth
    const listUsers = await admin.auth().listUsers();
    
    console.log('\n=== Firebase Auth Users ===');
    for (const user of listUsers.users) {
      console.log(`\nUser: ${user.email}`);
      console.log(`UID: ${user.uid}`);
      
      // Check if Firestore profile exists
      const profileDoc = await db.collection('users').doc(user.uid).get();
      
      if (profileDoc.exists) {
        console.log('✓ Firestore profile EXISTS:');
        console.log(JSON.stringify(profileDoc.data(), null, 2));
      } else {
        console.log('✗ Firestore profile MISSING!');
        console.log('Creating admin profile...');
        
        await db.collection('users').doc(user.uid).set({
          email: user.email,
          name: user.displayName || user.email,
          role: 'admin',
          disabled: false,
          createdAt: new Date().toISOString()
        });
        
        console.log('✓ Profile created!');
      }
    }
    
    console.log('\n=== Done ===\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
