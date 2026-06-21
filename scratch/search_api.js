const fs = require('fs');
const file = 'client/src/App.jsx';

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('Searching for "attendanceAPI" definitions...');
lines.forEach((line, index) => {
  if (line.includes('const attendanceAPI') || line.includes('attendanceAPI =')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
