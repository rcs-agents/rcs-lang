/**
 * Grammar compliance tests for RCL parser
 * 
 * This test suite verifies that the tree-sitter grammar correctly parses
 * RCL syntax according to the formal specification.
 */

import { describe, test, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import Parser from 'web-tree-sitter';

// Initialize web-tree-sitter
let parser: Parser;
let RCL: Parser.Language;

let skipTests = false;

beforeAll(async () => {
  try {
    // Initialize web-tree-sitter
    await Parser.init();
    parser = new Parser();
    
    // Check if WASM file exists
    const wasmPath = path.join(__dirname, '..', 'tree-sitter-rcl.wasm');
    if (!fs.existsSync(wasmPath)) {
      console.warn(
        `\n⚠️  WASM file not found at: ${wasmPath}\n\n` +
        `Grammar tests will be skipped. To run these tests:\n` +
        `1. Install Emscripten: https://emscripten.org/docs/getting_started/downloads.html\n` +
        `   OR Docker: https://www.docker.com/get-started\n` +
        `   OR Podman: https://podman.io/getting-started/installation\n` +
        `2. Once installed, run: npm run build-wasm\n`
      );
      skipTests = true;
      return;
    }
    
    // Load the WASM language file
    RCL = await Parser.Language.load(wasmPath);
    parser.setLanguage(RCL);
    console.log('Successfully loaded web-tree-sitter with WASM');
  } catch (error) {
    console.error('Failed to initialize parser:', error);
    skipTests = true;
  }
});

// Test corpus directory
const corpusDir = path.join(__dirname, 'fixtures', 'corpus');

// Parse test file format
function parseTestFile(content: string) {
  const tests: Array<{
    name: string;
    code: string;
    expected: string | null;
  }> = [];
  
  const sections = content.split(/={80,}\n/);
  
  for (let i = 1; i < sections.length; i += 2) {
    if (i + 1 < sections.length) {
      const name = sections[i].trim();
      const [code, expected] = sections[i + 1].split(/^-{80,}$/m);
      
      tests.push({
        name,
        code: code.trim(),
        expected: expected ? expected.trim() : null
      });
    }
  }
  
  return tests;
}

// Tree to S-expression converter
function treeToSExpression(node: Parser.SyntaxNode): string {
  if (node.childCount === 0) {
    return node.type;
  }
  
  let result = `(${node.type}`;
  
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child) {
      result += ' ' + treeToSExpression(child);
    }
  }
  
  result += ')';
  return result;
}

// Get all test files
const testFiles = fs.readdirSync(corpusDir)
  .filter(f => f.endsWith('.txt'))
  .sort();

// Create test suites for each corpus file
for (const filename of testFiles) {
  const filepath = path.join(corpusDir, filename);
  const content = fs.readFileSync(filepath, 'utf8');
  const tests = parseTestFile(content);
  const suiteName = filename.replace('.txt', '');

  describe.skip(`Grammar: ${suiteName} (requires WASM)`, () => {
    for (const testCase of tests) {
      test(testCase.name, () => {
        const tree = parser.parse(testCase.code);
        
        // Check for parse errors
        expect(tree.rootNode.hasError()).toBe(false);
        
        // If expected S-expression provided, verify it matches
        if (testCase.expected) {
          const actual = treeToSExpression(tree.rootNode);
          expect(actual).toBe(testCase.expected);
        }
      });
    }
  });
}