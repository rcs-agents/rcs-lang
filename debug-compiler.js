const { Compiler } = require('./packages/language-service/dist/compiler/compiler.js');
const { parse } = require('./packages/parser/dist/index.js');
const fs = require('fs');

async function test() {
  const compiler = new Compiler();
  
  // Test with minimal.rcl
  console.log('Testing compiler with minimal.rcl...');
  const minimalContent = fs.readFileSync('./examples/minimal.rcl', 'utf-8');
  const minimalParsed = await parse(minimalContent);
  
  console.log('Minimal parse result:');
  console.log('  ast type:', minimalParsed.ast?.type);
  console.log('  errors:', minimalParsed.errors);
  console.log('  has children:', !!minimalParsed.ast?.children);
  
  if (minimalParsed.ast) {
    const minimalCompiled = compiler.compile(minimalParsed.ast, minimalContent, 'minimal.rcl');
    console.log('  compilation result:', minimalCompiled ? 'SUCCESS' : 'FAILED');
    const diagnostics = compiler.getDiagnostics();
    if (diagnostics.length > 0) {
      console.log('  diagnostics:', diagnostics);
    }
  }
  
  // Test with coffee-shop.rcl
  console.log('\nTesting compiler with coffee-shop.rcl...');
  const coffeeContent = fs.readFileSync('./examples/coffee-shop.rcl', 'utf-8');
  const coffeeParsed = await parse(coffeeContent);
  
  console.log('Coffee parse result:');
  console.log('  ast type:', coffeeParsed.ast?.type);
  console.log('  errors:', coffeeParsed.errors);
  console.log('  has children:', !!coffeeParsed.ast?.children);
  
  if (coffeeParsed.ast?.children?.[0]?.type === 'ERROR') {
    console.log('  First child is ERROR node');
    console.log('  ERROR children (first 10):', coffeeParsed.ast.children[0].children?.slice(0, 10).map(c => c.type));
  }
  
  if (coffeeParsed.ast) {
    const coffeeCompiled = compiler.compile(coffeeParsed.ast, coffeeContent, 'coffee-shop.rcl');
    console.log('  compilation result:', coffeeCompiled ? 'SUCCESS' : 'FAILED');
    const diagnostics = compiler.getDiagnostics();
    if (diagnostics.length > 0) {
      console.log('  diagnostics:', diagnostics);
    }
  }
}

test().catch(console.error);