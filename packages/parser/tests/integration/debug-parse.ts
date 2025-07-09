import { RCLParser } from '../../src/rclParser';

async function debugParse() {
  const parser = new RCLParser();
  
  const rcl = `agent CoffeeShop
  displayName: "Coffee Shop Assistant"
  
  messages Messages
    welcome:
      text: "Hello!"`;

  console.log('Parsing RCL:');
  console.log(rcl);
  console.log('---');
  
  const document = await parser.parseDocument(rcl, 'test.rcl');
  
  console.log('AST:');
  // Simple AST printer without circular references
  function printNode(node: any, indent: string = ''): void {
    if (!node) return;
    console.log(`${indent}${node.type}${node.text ? ` "${node.text}"` : ''}`);
    if (node.children) {
      node.children.forEach((child: any) => printNode(child, indent + '  '));
    }
  }
  printNode(document.ast);
  
  // Find ERROR nodes
  function findErrors(node: any, path: string = ''): void {
    if (!node) return;
    
    if (node.type === 'ERROR') {
      console.log(`ERROR node found at ${path}:`, node);
    }
    
    if (node.children) {
      node.children.forEach((child: any, index: number) => {
        findErrors(child, `${path}/${node.type}[${index}]`);
      });
    }
  }
  
  console.log('\nSearching for ERROR nodes...');
  findErrors(document.ast);
}

debugParse().catch(console.error);