const fs = require('fs');

// Read the full backup
const backupPath = 'C:\\Users\\KeshabShahi\\OneDrive - SAPCO GROUP\\Desktop\\appwrite-app\\backups\\naran_backup_2026-01-08.json';
const outputPath = 'C:\\Users\\KeshabShahi\\OneDrive - SAPCO GROUP\\Desktop\\appwrite-app\\backups\\project_495_test.json';

console.log('Reading backup file...');
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const data = backup.data || backup;

// Extract project 495
const project495 = data.projects?.find(p => p.projectId === '495' || p.ProjectNo === 495 || p._id === 'PROJ_495');

if (!project495) {
    console.error('Project 495 not found in backup!');
    process.exit(1);
}

console.log('Found project:', project495.name);

// Filter related data
const filteredData = {
    projects: [project495],
    elements: data.elements?.filter(e => e.projectNumber === '495' || e.projectId === '495' || e.ProjectNo === 495) || [],
    delivery_notes: data.delivery_notes?.filter(d => d.projectNumber === '495' || d.projectId === '495' || d.ProjectNo === 495) || [],
    recycle: data.recycle?.filter(r => r.projectNumber === '495' || r.projectId === '495' || r.ProjectNo === 495) || [],
    logs: data.logs?.filter(l => l.projectNumber === '495' || l.projectId === '495' || l.ProjectNo === 495) || [],
    invitations: data.invitations?.filter(i => i.projectNumber === '495' || i.projectId === '495' || i.ProjectNo === 495) || []
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

console.log('\nExtracted data for Project 495:');
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
    note: "Test backup - Project 495 only",
    data: filteredData
};

fs.writeFileSync(outputPath, JSON.stringify(newBackup, null, 2));
console.log('\n✅ Test backup created:', outputPath);
console.log('You can now use this file to test the restore process.');
