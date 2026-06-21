const fs = require('fs');
const file = 'client/src/App.jsx';

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('Searching for "const AttendancePage":');
lines.forEach((line, index) => {
  if (line.includes('const AttendancePage') || line.includes('AttendancePage =')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
