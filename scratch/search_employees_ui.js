const fs = require('fs');
const file = 'client/src/App.jsx';

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('Searching for Employee list rendering / Employees tab:');
lines.forEach((line, index) => {
  if (line.includes('employeeAPI.getAll') || line.includes('const Employees') || line.includes('EmployeesPage')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
