const fs = require('fs');

// Read the full backup
const backupPath = 'C:\\Users\\KeshabShahi\\OneDrive - SAPCO GROUP\\Desktop\\appwrite-app\\backups\\naran_backup_2026-01-08.json';
const outputPath = 'C:\\Users\\KeshabShahi\\OneDrive - SAPCO GROUP\\Desktop\\appwrite-app\\backups\\project_467_ayba_klp6_test.json';

console.log('Reading backup file...');
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const data = backup.data || backup;

// Extract project 467
const project467 = data.projects?.find(p => p.projectId === '467' || p._id === 'PROJ_467');

if (!project467) {
    console.error('Project 467 not found in backup!');
    process.exit(1);
}

console.log('Found project:', project467.name);

// Filter related data - use projectNumber field for elements/delivery_notes
const filteredData = {
    projects: [project467],
    elements: data.elements?.filter(e => e.projectNumber === '467' || e.projectId === '467') || [],
    delivery_notes: data.delivery_notes?.filter(d => d.projectNumber === '467' || d.projectId === '467') || [],
    recycle: data.recycle?.filter(r => r.projectNumber === '467' || r.projectId === '467') || [],
    logs: data.logs?.filter(l => l.projectNumber === '467' || l.projectId === '467') || [],
    invitations: data.invitations?.filter(i => i.projectNumber === '467' || i.projectId === '467') || []
};

// Count documents
const counts = {
    projects: filteredData.projects.length,
    elements: filteredData.elements.length,
    delivery_notes: filteredData.delivery_notes.length,
    recycle: filteredData.recycle.length,
    logs: filteredData.logs.length,
    invitations: filteredData.invitations.length
};

const total = Object.values(counts).reduce((a, b) => a + b, 0);

console.log('\nExtracted data for Project 467 (AYBA KLP6):');
console.log('- Projects:', counts.projects);
console.log('- Elements:', counts.elements);
console.log('- Delivery Notes:', counts.delivery_notes);
console.log('- Recycle:', counts.recycle);
console.log('- Logs:', counts.logs);
console.log('- Invitations:', counts.invitations);
console.log('- TOTAL:', total, 'documents');

// Create new backup file
const newBackup = {
    timestamp: new Date().toISOString(),
    version: "2.1",
    note: "Test backup - Project 467 (AYBA KLP6) only",
    data: filteredData
};

fs.writeFileSync(outputPath, JSON.stringify(newBackup, null, 2));
console.log('\n✅ Test backup created:', outputPath);
console.log('You can now use this file to test the restore process.');
