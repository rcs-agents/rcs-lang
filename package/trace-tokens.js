const fs = require('fs');
const { CharStreams } = require('antlr4ts');
const { RclLexer } = require('./dist/generated/RclLexer');

// Test with the problematic pattern
const testInput = `agent Coffee Shop
  displayName: "Quick Coffee"

  config
    # comment
    description: "test"`;

console.log('Input:');
console.log(testInput);
console.log('\nTokens:');

const inputStream = CharStreams.fromString(testInput);
const lexer = new RclLexer(inputStream);

let token;
let count = 0;
while ((token = lexer.nextToken()).type !== -1 && count < 30) {
  // EOF is -1
  count++;
  const typeName =
    lexer.vocabulary.getSymbolicName(token.type) ||
    lexer.vocabulary.getLiteralName(token.type) ||
    `<${token.type}>`;
  const text = token.text?.replace(/\n/g, '\\n').replace(/\t/g, '\\t') || '';
  console.log(
    `${count.toString().padStart(2)}: ${typeName.padEnd(20)} "${text}" (line ${token.line}, col ${token.charPositionInLine})`,
  );
}
