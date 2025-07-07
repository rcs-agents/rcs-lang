// Test script to figure out web-tree-sitter API
const TreeSitter = require('web-tree-sitter');

console.log('TreeSitter:', TreeSitter);
console.log('TreeSitter keys:', Object.keys(TreeSitter));
console.log('TreeSitter.Parser:', TreeSitter.Parser);
console.log('TreeSitter.Language:', TreeSitter.Language);

async function test() {
  try {
    // First, initialize the Parser class
    try {
      console.log('Calling TreeSitter.Parser.init()...');
      await TreeSitter.Parser.init();
      console.log('✓ TreeSitter.Parser.init() successful');
    } catch (e) {
      console.log('✗ TreeSitter.Parser.init() failed:', e.message);
      return;
    }
    
    // Now try to create a parser
    let parser;
    try {
      parser = new TreeSitter.Parser();
      console.log('✓ new TreeSitter.Parser() worked after init');
      console.log('Parser instance:', parser);
      console.log('Parser methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
    } catch (e) {
      console.log('✗ new TreeSitter.Parser() failed:', e.message);
      return;
    }
    
    // Option 3: Test loading language
    if (parser) {
      try {
        const wasmPath = './tree-sitter-rcl.wasm';
        console.log('\nTrying to load language from:', wasmPath);
        const language = await TreeSitter.Language.load(wasmPath);
        console.log('✓ Language loaded successfully');
        parser.setLanguage(language);
        console.log('✓ Language set successfully');
        
        // Test parsing
        const tree = parser.parse('agent TestAgent\n  displayName: "Test"');
        console.log('✓ Parse successful, root node type:', tree.rootNode.type);
      } catch (e) {
        console.log('✗ Language/parse error:', e.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

test();