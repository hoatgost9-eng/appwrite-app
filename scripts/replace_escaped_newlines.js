const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'public', 'index.html');
let s = fs.readFileSync(file, 'utf8');

// Replace literal backslash-n that are used between tags (e.g. '\n  <div') with an actual newline
const before = (s.match(/\\n\s*(?=<)/g) || []).length;
s = s.replace(/\\n\s*(?=<)/g, '\n');

// Also replace any literal '\\n' followed by whitespace and end tag like '</' (covered by previous) but try to be safe
const before2 = (s.match(/\\n\s*(?=<\/)/g) || []).length;
// already covered by previous. Just write file
fs.writeFileSync(file, s, 'utf8');
console.log('replaced', before, 'escaped-newline occurrences');
