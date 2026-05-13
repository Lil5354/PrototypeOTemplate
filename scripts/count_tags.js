const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.join(__dirname,'../src/App.jsx'),'utf8');
const openDiv = (code.match(/<div\b/g)||[]).length;
const closeDiv = (code.match(/<\/div>/g)||[]).length;
const openSpan = (code.match(/<span\b/g)||[]).length;
const closeSpan = (code.match(/<\/span>/g)||[]).length;
console.log('div open', openDiv, 'div close', closeDiv);
console.log('span open', openSpan, 'span close', closeSpan);
