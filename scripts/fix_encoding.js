const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'public', 'index.html');
let s = fs.readFileSync(file, 'utf8');

let beforeCount = (s.match(/\uFFFD/g) || []).length;
// replace replacement char (�) with superscript 3 (³)
// Also ensure any m� sequences become m³
s = s.replace(/\uFFFD/g, '\u00B3');
// As a safety, also replace literal 'm�' to 'm³'
s = s.replace(/m�/g, 'm³');

fs.writeFileSync(file, s, 'utf8');
console.log('fixed replacement chars —', beforeCount, 'replacements attempted');
