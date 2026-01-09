/**
 * setRoles.js
 *
 * Safe helper to set Firestore user profiles (role) by email using Firebase Admin SDK.
 * Usage:
 * 1. Create a service account JSON in Firebase console (Project Settings → Service accounts) and save as ./service-account.json
 * 2. Edit the email/role pairs below or pass them in.
 * 3. Run: node scripts/setRoles.js
 *
 * This script finds a user by email (Auth), then writes /users/{uid}.role in Firestore.
 */

const admin = require('firebase-admin');
const path = require('path');

// Load service account JSON from repo root (do NOT commit this file)
const keyPath = path.resolve(__dirname, '../service-account.json');
try {
  admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
} catch (err) {
  console.error('Could not initialize admin SDK. Create service-account.json next to the repo root as instructed in AUTH_ROLES.md');
  console.error(err.message || err);
  process.exit(1);
}

const db = admin.firestore();

// Configure your targets here. Replace with real emails.
const targets = [
  { email: 'keshab@naran.com', role: 'admin' },
  { email: 'telal@naran.com', role: 'editor' },
  { email: 'sri@naran.com', role: 'editor' }
];

async function setRoleByEmail(email, role) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;
    console.log(`Found UID ${uid} for ${email}. Setting role=${role}...`);
    await db.collection('users').doc(uid).set({ email, role, updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`Success: ${email} → ${role}`);
  } catch (err) {
    console.error(`Error handling ${email}:`, err.message || err);
  }
}

(async function main(){
  for (const t of targets) {
    await setRoleByEmail(t.email, t.role);
  }
  console.log('Done. Verify in Firestore > users/');
  process.exit(0);
})();
