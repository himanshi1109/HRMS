const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\himan\\Desktop\\hrms_backend\\client\\src\\App.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('onSubmit') && idx > 1200 && idx < 1500) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
