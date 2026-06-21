const fs = require('fs');
const file = 'client/src/App.jsx';

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('Searching for Modal usage or showModal/isOpen state:');
lines.forEach((line, index) => {
  if (line.includes('setShowModal') || line.includes('Modal') || line.includes('dialog')) {
    if (line.trim().startsWith('const') || line.trim().startsWith('function') || line.trim().startsWith('<Modal')) {
      console.log(`${index + 1}: ${line.trim()}`);
    }
  }
});
