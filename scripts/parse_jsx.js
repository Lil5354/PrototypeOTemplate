const fs = require('fs');
const parser = require('@babel/parser');
const path = require('path');
const file = path.join(__dirname, '../src/App.jsx');
const code = fs.readFileSync(file, 'utf8');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator'] });
  console.log('Parsed OK');
} catch (e) {
  console.error('Parse error:');
  console.error(e.message);
  console.error('Location:', e.loc);
  console.error(e.codeFrame);
  process.exit(1);
}
