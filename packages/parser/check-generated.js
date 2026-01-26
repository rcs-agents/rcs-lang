#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const generatedDir = path.join(__dirname, 'src', 'generated');
const requiredFiles = [
  'RclLexer.ts',
  'RclParser.ts',
  'RclParserListener.ts',
  'RclParserVisitor.ts',
  'RclLexer.tokens',
  'RclParser.tokens',
];

console.log('Checking for generated ANTLR files...\n');

if (!fs.existsSync(generatedDir)) {
  console.error('❌ Generated directory does not exist: src/generated/');
  console.error('\nThe ANTLR parser has not been generated yet.');
  console.error('\nTo generate the parser:');
  console.error('1. Install Java 17 or later');
  console.error('2. Run: bun run build');
  console.error('\nFor Java installation help, run: ./install-java.sh');
  process.exit(1);
}

let allFilesExist = true;
for (const file of requiredFiles) {
  const filePath = path.join(generatedDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ ${file} - missing`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('\n✅ All generated files are present!');
  console.log('You can build the TypeScript files with: bun run build:ts');
} else {
  console.error('\n❌ Some generated files are missing.');
  console.error('Please run the full build with Java installed: bun run build');
  process.exit(1);
}
