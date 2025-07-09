const { parse } = require('./packages/parser/dist/index.js');
const fs = require('fs');

function hasErrorNodes(node) {
  if (!node) return false;
  if (node.type === 'ERROR') return true;
  if (node.children) {
    return node.children.some(child => hasErrorNodes(child));
  }
  return false;
}

async function test() {
  // Test coffee-shop.rcl
  console.log('Checking coffee-shop.rcl for ERROR nodes...');
  const coffeeContent = fs.readFileSync('./examples/coffee-shop.rcl', 'utf-8');
  const coffeeParsed = await parse(coffeeContent);
  
  console.log('Has ERROR nodes:', hasErrorNodes(coffeeParsed.ast));
  
  // If there are error nodes, find the first one
  if (hasErrorNodes(coffeeParsed.ast)) {
    function findFirstError(node, path = '') {
      if (node.type === 'ERROR') {
        return { node, path };
      }
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          const result = findFirstError(node.children[i], `${path}[${i}].${node.children[i].type}`);
          if (result) return result;
        }
      }
      return null;
    }
    
    const errorInfo = findFirstError(coffeeParsed.ast);
    console.log('First ERROR node path:', errorInfo.path);
    console.log('ERROR node children:', errorInfo.node.children?.slice(0, 10).map(c => c.type));
  }
}

test().catch(console.error);