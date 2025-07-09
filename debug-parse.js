const { RCLParser } = require('./packages/parser/dist/rclParser.js');
const { findNodeByType } = require('./packages/parser/dist/ast/helpers.js');

async function test() {
  const parser = new RCLParser();
  
  // Test with the exact same content as the passing test
  const testContent = `agent TestAgent
  displayName: "Test Agent"
  flow MainFlow
    :start -> :end
  end
  messages Messages
    text Welcome "Hello!"
  end
end`;

  console.log('Testing with test content...');
  const testDoc = await parser.parseDocument(testContent, 'test.rcl');
  console.log('Test AST type:', testDoc.ast?.type);
  const testAgentNode = findNodeByType(testDoc.ast, 'agent_definition');
  console.log('Test agent node found:', !!testAgentNode);
  
  // Now test with minimal.rcl content
  // Try minimal change - just use :end instead of a message name
  const minimalContent = `agent HelloAgent
  displayName: "Hello"
  flow MainFlow
    :start -> :end
  end
  messages Messages
    text Welcome "Hello! Welcome to RCL."
  end
end`;

  console.log('\nTesting with minimal content...');
  const minimalDoc = await parser.parseDocument(minimalContent, 'minimal.rcl');
  console.log('Minimal AST type:', minimalDoc.ast?.type);
  const minimalAgentNode = findNodeByType(minimalDoc.ast, 'agent_definition');
  console.log('Minimal agent node found:', !!minimalAgentNode);
  
  if (!minimalAgentNode && minimalDoc.ast?.children?.[0]) {
    console.log('First child type:', minimalDoc.ast.children[0].type);
    if (minimalDoc.ast.children[0].type === 'ERROR') {
      console.log('ERROR node children types:', minimalDoc.ast.children[0].children?.slice(0, 10).map(c => c.type));
    }
  }
}

  // Test coffee-shop.rcl
  const fs = require('fs');
  const coffeeContent = fs.readFileSync('./examples/coffee-shop.rcl', 'utf-8');
  
  console.log('\nTesting with coffee-shop content...');
  const coffeeDoc = await parser.parseDocument(coffeeContent, 'coffee-shop.rcl');
  console.log('Coffee AST type:', coffeeDoc.ast?.type);
  const coffeeAgentNode = findNodeByType(coffeeDoc.ast, 'agent_definition');
  console.log('Coffee agent node found:', !!coffeeAgentNode);
  
  if (!coffeeAgentNode && coffeeDoc.ast?.children?.[0]) {
    console.log('First child type:', coffeeDoc.ast.children[0].type);
    if (coffeeDoc.ast.children[0].type === 'ERROR') {
      const errorChildren = coffeeDoc.ast.children[0].children?.slice(0, 20).map(c => c.type);
      console.log('ERROR node children types:', errorChildren);
    }
  }
}

test().catch(console.error);