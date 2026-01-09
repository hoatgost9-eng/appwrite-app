// Firestore Backup Script
// Run this in your browser console while logged into your app

(async function backupFirestore() {
    console.log('Starting backup...');
    
    const collections = ['elements', 'projects', 'delivery_notes', 'users', 'activity_logs', 'recycle_bin'];
    const backup = {};
    
    for (const collectionName of collections) {
        console.log(`Backing up ${collectionName}...`);
        try {
            const snapshot = await firebase.firestore().collection(collectionName).get();
            backup[collectionName] = [];
            
            snapshot.forEach(doc => {
                backup[collectionName].push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✓ ${collectionName}: ${backup[collectionName].length} documents`);
        } catch (e) {
            console.error(`✗ Failed to backup ${collectionName}:`, e);
        }
    }
    
    // Download as JSON file
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `firestore-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    console.log('✅ Backup complete! File downloaded.');
    return backup;
})();
