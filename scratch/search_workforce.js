const fs = require('fs');
const file = 'client/src/App.jsx';

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('Searching for "workforce" or "role counts":');
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('workforce') || line.toLowerCase().includes('rolecount') || line.toLowerCase().includes('role_counts')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
