const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function main() {
  const buf = fs.readFileSync('Document for OKR.pdf');
  const parser = new PDFParse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const result = await parser.getText();
  console.log(result.text);
}

main().catch(e => console.error(e.message));
