// Script to check for elements with delivery dates but no delivery note
// Run this with: node scripts/check_orphaned_deliveries.js

const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkOrphanedDeliveries() {
  console.log('Checking for elements with delivery dates but no delivery note...\n');

  try {
    // Get all elements with delivery dates
    const elementsSnapshot = await db.collection('elements')
      .where('deliveryDate', '!=', null)
      .get();
    
    // Get all delivery notes
    const notesSnapshot = await db.collection('delivery_notes').get();
    
    const deliveredElements = elementsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const notes = notesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Total elements with delivery dates: ${deliveredElements.length}`);
    console.log(`Total delivery notes: ${notes.length}\n`);
    
    // Check which elements don't have a delivery note
    const orphanedElements = [];
    
    for (const el of deliveredElements) {
      const hasNote = notes.some(note => {
        return Array.isArray(note.items) && note.items.some(item => 
          item && (String(item.id) === String(el.id) || String(item.elementId) === String(el.elementId))
        );
      });
      
      if (!hasNote) {
        orphanedElements.push(el);
      }
    }
    
    if (orphanedElements.length === 0) {
      console.log('✅ No orphaned elements found. All elements with delivery dates have corresponding delivery notes.');
    } else {
      console.log(`⚠️  Found ${orphanedElements.length} orphaned elements (have delivery dates but no delivery note):\n`);
      
      orphanedElements.forEach(el => {
        console.log(`- Element ID: ${el.elementId}`);
        console.log(`  Project: ${el.projectName || el.projectNumber || 'N/A'}`);
        console.log(`  Delivery Date: ${el.deliveryDate}`);
        console.log(`  Status: ${el.status}`);
        console.log(`  Database ID: ${el.id}`);
        console.log('');
      });
      
      console.log('\n--- SUMMARY ---');
      console.log(`Total orphaned elements: ${orphanedElements.length}`);
      console.log('\nWould you like to clean these up? (Run check_orphaned_deliveries_fix.js)');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkOrphanedDeliveries();
