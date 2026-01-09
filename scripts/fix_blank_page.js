const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'public', 'index.html');
const backup = path.join(__dirname, '..', 'public', 'index.html.bak');
let s = fs.readFileSync(file, 'utf8');
fs.writeFileSync(backup, s, 'utf8');

const map = [
  [/\busememo\b/g, 'useMemo'],
  [/\bsetmetaFilter\b/g, 'setMetaFilter'],
  [/\bcheckmetamatch\b/g, 'checkMetaMatch'],
  [/\bmath\./g, 'Math.'],
  [/\bactionmodal\b/g, 'actionModal'],
  [/\bsetActionmodal\b/g, 'setActionModal'],
  [/\bsetmetafilter\b/g, 'setMetaFilter']
];

for(const [pattern, repl] of map) {
  s = s.replace(pattern, repl);
}

fs.writeFileSync(file, s, 'utf8');
console.log('applied replacements and created backup:', backup);