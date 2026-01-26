const fs = require('fs');
const { CharStreams, CommonTokenStream } = require('antlr4ts');
const { RclLexer } = require('./dist/generated/RclLexer');
const { RclParser } = require('./dist/generated/RclParser');

const input = fs.readFileSync('../../examples/coffee-shop.rcl', 'utf8');
const inputStream = CharStreams.fromString(input);
const lexer = new RclLexer(inputStream);
const tokenStream = new CommonTokenStream(lexer);
const parser = new RclParser(tokenStream);

// Collect all syntax errors
const errors = [];
parser.removeErrorListeners();
parser.addErrorListener({
  syntaxError: (recognizer, offendingSymbol, line, charPositionInLine, msg, e) => {
    errors.push({
      line,
      column: charPositionInLine,
      msg,
      token: offendingSymbol ? offendingSymbol.text : 'EOF',
    });
  },
});

const tree = parser.rcl_file();
console.log(`Total syntax errors: ${errors.length}`);
console.log('\nErrors by type:');

// Group errors by message pattern
const errorGroups = {};
errors.forEach((err) => {
  const key = err.msg.replace(/line \d+:\d+/, 'line X:Y');
  if (!errorGroups[key]) errorGroups[key] = [];
  errorGroups[key].push(err);
});

Object.entries(errorGroups).forEach(([msg, errs]) => {
  console.log(`\n${msg} (count: ${errs.length})`);
  errs.slice(0, 3).forEach((err) => {
    console.log(`  - Line ${err.line}:${err.column} token: '${err.token}'`);
  });
  if (errs.length > 3) console.log(`  ... and ${errs.length - 3} more`);
});

// Show specific line content for first few errors
console.log('\nDetailed error context:');
const lines = input.split('\n');
errors.slice(0, 5).forEach((err, i) => {
  console.log(`\nError ${i + 1}: Line ${err.line}:${err.column}`);
  console.log(`Message: ${err.msg}`);
  console.log(`Token: '${err.token}'`);
  if (err.line > 0 && err.line <= lines.length) {
    console.log(`Line content: "${lines[err.line - 1]}"`);
    console.log(`              ${' '.repeat(err.column)}^`);
  }
});
