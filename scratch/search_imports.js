const fs = require('fs');
const file = 'client/src/App.jsx';

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('Imports in App.jsx:');
lines.slice(0, 100).forEach((line, index) => {
  if (line.trim().startsWith('import')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
