const fs = require('fs');
const file = 'client/src/App.jsx';

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('Searching for "punch" or "clock"...');
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('punch') || line.toLowerCase().includes('clock')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
