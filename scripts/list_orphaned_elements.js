// Simple script to list element IDs with delivery dates but no delivery note
// Run this with: node scripts/list_orphaned_elements.js

const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listOrphanedElements() {
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
    
    // Find orphaned elements
    const orphanedElementIds = [];
    
    for (const el of deliveredElements) {
      const hasNote = notes.some(note => {
        return Array.isArray(note.items) && note.items.some(item => 
          item && (String(item.id) === String(el.id) || String(item.elementId) === String(el.elementId))
        );
      });
      
      if (!hasNote) {
        orphanedElementIds.push(el.elementId);
      }
    }
    
    if (orphanedElementIds.length === 0) {
      console.log('No orphaned elements found.');
    } else {
      console.log(`Found ${orphanedElementIds.length} orphaned elements:\n`);
      console.log(orphanedElementIds.join(', '));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

listOrphanedElements();
