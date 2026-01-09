// Script to fix orphaned deliveries - removes delivery dates from elements without delivery notes
// Run this with: node scripts/check_orphaned_deliveries_fix.js

const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixOrphanedDeliveries() {
  console.log('Checking and fixing orphaned deliveries...\n');

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
    
    // Find orphaned elements
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
      console.log('✅ No orphaned elements found.');
      process.exit(0);
      return;
    }
    
    console.log(`Found ${orphanedElements.length} orphaned elements.\n`);
    console.log('Elements to be cleaned:');
    orphanedElements.forEach(el => {
      console.log(`- ${el.elementId} (${el.projectName || el.projectNumber || 'N/A'}) - ${el.deliveryDate}`);
    });
    
    console.log('\n⚠️  This will:');
    console.log('1. Remove deliveryDate from these elements');
    console.log('2. Set status back to "Stockyard" (if currently "Shipped")');
    console.log('\nProcessing in 3 seconds...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Fix the elements
    const batch = db.batch();
    
    orphanedElements.forEach(el => {
      const ref = db.collection('elements').doc(el.id);
      batch.update(ref, {
        deliveryDate: null,
        status: el.status === 'Shipped' ? 'Stockyard' : el.status
      });
    });
    
    await batch.commit();
    
    console.log(`\n✅ Successfully cleaned ${orphanedElements.length} orphaned elements!`);
    console.log('All delivery dates removed and statuses updated.');
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

fixOrphanedDeliveries();
