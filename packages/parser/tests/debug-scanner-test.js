const Parser = require('tree-sitter');
const fs = require('fs');
const path = require('path');

// First, let's check the grammar.json to see external tokens
const grammarJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/grammar.json'), 'utf8'));
console.log('External tokens:', grammarJson.externals);

// Now let's see what the parser produces
const TreeSitter = require('web-tree-sitter');

async function test() {
  // Initialize the Parser class (required in newer versions)
  if (TreeSitter.Parser.init) {
    await TreeSitter.Parser.init();
  }
  
  const parser = new TreeSitter.Parser();
  
  const wasmPath = path.join(__dirname, '..', 'tree-sitter-rcl.wasm');
  const language = await TreeSitter.Language.load(wasmPath);
  parser.setLanguage(language);
  
  // Test simple newline handling
  const code1 = 'agent Test\n';
  console.log('\nParsing:', JSON.stringify(code1));
  const tree1 = parser.parse(code1);
  console.log('Tree:', tree1.rootNode.toString());
  
  // Test with indent
  const code2 = 'agent Test\n  displayName: "Test"';
  console.log('\nParsing:', JSON.stringify(code2));
  const tree2 = parser.parse(code2);
  console.log('Tree:', tree2.rootNode.toString());
  
  // Print all external token indices
  console.log('\nExternal token count:', language.externalTokenCount);
  
  // Clean up (only parser has delete method)
  parser.delete();
}

test().catch(console.error);