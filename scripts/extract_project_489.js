const fs = require('fs');

// Read the full backup
const backupPath = 'C:\\Users\\KeshabShahi\\OneDrive - SAPCO GROUP\\Desktop\\appwrite-app\\backups\\naran_backup_2026-01-08.json';
const outputPath = 'C:\\Users\\KeshabShahi\\OneDrive - SAPCO GROUP\\Desktop\\appwrite-app\\backups\\project_489_vanord_test.json';

console.log('Reading backup file...');
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const data = backup.data || backup;

// Extract project 489
const project489 = data.projects?.find(p => p.projectId === '489' || p._id === 'PROJ_489');

if (!project489) {
    console.error('Project 489 not found in backup!');
    process.exit(1);
}

console.log('Found project:', project489.name);

// Filter related data
const filteredData = {
    projects: [project489],
    elements: data.elements?.filter(e => e.projectId === '489') || [],
    delivery_notes: data.delivery_notes?.filter(d => d.projectId === '489') || [],
    recycle: data.recycle?.filter(r => r.projectId === '489') || [],
    logs: data.logs?.filter(l => l.projectId === '489') || [],
    invitations: data.invitations?.filter(i => i.projectId === '489') || []
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

console.log('\nExtracted data for Project 489 (Vanord):');
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
    note: "Test backup - Project 489 (Vanord) only",
    data: filteredData
};

fs.writeFileSync(outputPath, JSON.stringify(newBackup, null, 2));
console.log('\n✅ Test backup created:', outputPath);
console.log('You can now use this file to test the restore process.');
