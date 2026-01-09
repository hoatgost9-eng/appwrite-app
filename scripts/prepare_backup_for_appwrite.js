// Prepare Firebase backup for Appwrite - removes users and fixes data types
const fs = require('fs');
const path = require('path');

// Input and output file paths
const inputFile = 'c:\\Users\\KeshabShahi\\Downloads\\naran_backup_2026-01-08.json';
const outputFile = path.join(__dirname, '../backups/appwrite_ready_backup.json');

console.log('🔄 Processing backup file for Appwrite...\n');

try {
    // Read the backup file
    const rawData = fs.readFileSync(inputFile, 'utf8');
    const backup = JSON.parse(rawData);
    
    // Get data object (support both formats)
    const data = backup.data || backup;
    
    console.log('📦 Collections found:', Object.keys(data).join(', '));
    
    // Remove users collection (users need to register in Appwrite separately)
    if (data.users) {
        console.log('🗑️  Removing users collection (users must register in Appwrite)');
        delete data.users;
    }
    
    let totalDocs = 0;
    let processedDocs = 0;
    
    // Process each collection
    for (const [collectionName, documents] of Object.entries(data)) {
        const docs = Array.isArray(documents) ? documents : Object.values(documents);
        totalDocs += docs.length;
        
        console.log(`\n📝 Processing collection: ${collectionName} (${docs.length} documents)`);
        
        // Process each document
        for (let i = 0; i < docs.length; i++) {
            const doc = docs[i];
            
            // Convert volume field from string to number
            if (doc.volume !== undefined) {
                if (typeof doc.volume === 'string') {
                    doc.volume = doc.volume === '' ? 0 : parseFloat(doc.volume) || 0;
                }
            }
            
            // Convert any numeric strings that should be numbers
            for (const [key, value] of Object.entries(doc)) {
                // Check if it's a numeric string and the key suggests it should be a number
                if (typeof value === 'string' && !isNaN(value) && value !== '' && 
                    (key.toLowerCase().includes('volume') || 
                     key.toLowerCase().includes('quantity') || 
                     key.toLowerCase().includes('amount'))) {
                    doc[key] = parseFloat(value);
                }
            }
            
            processedDocs++;
        }
    }
    
    // Create output backup
    const output = {
        data: data,
        exportDate: new Date().toISOString(),
        source: 'Firebase',
        target: 'Appwrite',
        preparedBy: 'prepare_backup_for_appwrite.js'
    };
    
    // Ensure backups directory exists
    const backupsDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    // Write the processed backup
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    
    console.log('\n✅ SUCCESS!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Collections processed: ${Object.keys(data).length}`);
    console.log(`📄 Total documents: ${totalDocs}`);
    console.log(`✨ Documents processed: ${processedDocs}`);
    console.log(`🗑️  Users removed: Yes`);
    console.log(`\n💾 Output file: ${outputFile}`);
    console.log('\n📝 Next steps:');
    console.log('1. Open your app at http://localhost:8000');
    console.log('2. Log in as admin');
    console.log('3. Go to Admin panel → Backup & Restore tab');
    console.log('4. Click "Select Backup File to Restore"');
    console.log('5. Select: backups/appwrite_ready_backup.json');
    console.log('6. Confirm and wait for restoration to complete');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. The backup file exists at:', inputFile);
    console.error('2. The file is valid JSON format');
    process.exit(1);
}
