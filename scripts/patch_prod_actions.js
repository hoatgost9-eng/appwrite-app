const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'public', 'index.html');
let s = fs.readFileSync(file, 'utf8');

s = s.replace('<button onClick={() => setEditingEl(el)} className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded hover:bg-blue-100 transition"><Icon name="pencil" size={14}/></button>', '<button onClick={() => setEditingEl(el)} className="w-full sm:w-auto text-blue-500 hover:text-blue-700 p-2 bg-blue-50 rounded hover:bg-blue-100 transition text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={!canEditLocal}><Icon name="pencil" size={14}/></button>');

s = s.replace('{tab === \'casting\' && <button onClick={() => initiateAction(el.id, \'cast\')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold">Cast</button>}', "{tab === 'casting' && <button onClick={() => initiateAction(el.id, 'cast')} className=\"w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed\" disabled={!canEditLocal}>Cast</button>}");

s = s.replace('{tab === \'delivery\' && <button onClick={() => initiateAction(el.id, \'ship\')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs font-bold">Ship</button>}', "{tab === 'delivery' && <button onClick={() => initiateAction(el.id, 'ship')} className=\"w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed\" disabled={!canEditLocal}>Ship</button>}");

s = s.replace('<button onClick={() => initiateAction(el.id, \'delete\')} className="text-red-400 hover:text-red-600 p-1"><Icon name="trash" size={14}/></button>', "<button onClick={() => initiateAction(el.id, 'delete')} className=\"w-full sm:w-auto text-red-400 hover:text-red-600 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed\" disabled={!isAdminLocal}><Icon name=\"trash\" size={14}/></button>");

fs.writeFileSync(file, s, 'utf8');
console.log('patched index.html');
