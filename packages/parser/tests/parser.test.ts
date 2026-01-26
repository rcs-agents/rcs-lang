import { describe, test, expect, beforeAll, beforeEach } from 'vitest';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RCLParser } from '../src/rclParser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wasmPath = join(__dirname, '..', 'tree-sitter-rcl.wasm');
const hasWasm = existsSync(wasmPath);

describe('RCLParser', () => {
  if (!hasWasm) {
    test.skip('Parser tests require WASM file to be built - run "npm run build-wasm"', () => {});
    return;
  }

  describe('Web-tree-sitter parser', () => {
    let parser: RCLParser;

    beforeEach(() => {
      parser = new RCLParser();
    });

    describe('parseDocument', () => {
      test('should parse a simple RCL document', async () => {
        const content = `agent TestAgent
  displayName: "Test Agent"
  flow MainFlow
    :start -> end
  messages Messages
    text Welcome "Hello!"`;

        const doc = await parser.parseDocument(content, 'test.rcl');
        
        expect(doc).toBeDefined();
        expect(doc.uri).toBe('test.rcl');
        expect(doc.content).toBe(content);
        expect(doc.ast).toBeTruthy();
        expect(doc.ast?.type).toBe('source_file');
        
        // Debug: Log the AST structure (without circular references)
        console.log('AST type:', doc.ast?.type);
        console.log('AST has children:', !!doc.ast?.children);
        console.log('Children count:', doc.ast?.children?.length);
        console.log('Children:', doc.ast?.children?.map(child => ({ 
          type: child.type, 
          text: child.text?.substring(0, 50),
          hasChildren: !!child.children,
          childrenCount: child.children?.length 
        })));
        
        // Should have an agent_definition node
        const agentNode = doc.ast?.children?.find(child => child.type === 'agent_definition');
        expect(agentNode).toBeTruthy();
      });

      test('should cache parsed documents', async () => {
        const content = 'agent Test\n  displayName: "Test"';
        const uri = 'test.rcl';
        
        const doc1 = await parser.parseDocument(content, uri, 1);
        const doc2 = await parser.parseDocument(content, uri, 1);
        
        expect(doc1).toBe(doc2); // Same object reference
      });

      test('should invalidate cache on version change', async () => {
        const content = 'agent Test\n  displayName: "Test"';
        const uri = 'test.rcl';
        
        const doc1 = await parser.parseDocument(content, uri, 1);
        const doc2 = await parser.parseDocument(content, uri, 2);
        
        expect(doc1).not.toBe(doc2); // Different objects
      });

      test('should handle parse errors gracefully', async () => {
        const content = 'invalid rcl content ###';
        
        const doc = await parser.parseDocument(content, 'invalid.rcl');
        
        expect(doc).toBeDefined();
        expect(doc.uri).toBe('invalid.rcl');
        expect(doc.ast).toBeTruthy();
        // Tree-sitter still creates a tree even with errors
        expect(doc.ast?.type).toBe('source_file');
      });
    });

    describe('parseText', () => {
      test('should parse text without URI', async () => {
        const content = 'agent Test\n  displayName: "Test"';
        
        const ast = await parser.parseText(content);
        
        expect(ast).toBeTruthy();
        expect(ast?.type).toBe('source_file');
      });
    });

    describe('cache management', () => {
      test('clearCache should remove all cached documents', async () => {
        const content = 'agent Test\n  displayName: "Test"';
        
        // Parse and cache a document
        const doc1 = await parser.parseDocument(content, 'test.rcl', 1);
        parser.clearCache();
        const doc2 = await parser.parseDocument(content, 'test.rcl', 1);
        
        expect(doc1).not.toBe(doc2); // Different objects after cache clear
      });

      test('clearCache with specific URI should only clear that document', async () => {
        const content1 = 'agent Test1\n  displayName: "Test1"';
        const content2 = 'agent Test2\n  displayName: "Test2"';
        
        // Parse and cache two documents
        const doc1a = await parser.parseDocument(content1, 'test1.rcl', 1);
        const doc2a = await parser.parseDocument(content2, 'test2.rcl', 1);
        
        // Clear only test1.rcl
        parser.clearCache('test1.rcl');
        
        const doc1b = await parser.parseDocument(content1, 'test1.rcl', 1);
        const doc2b = await parser.parseDocument(content2, 'test2.rcl', 1);
        
        expect(doc1a).not.toBe(doc1b); // test1.rcl was cleared
        expect(doc2a).toBe(doc2b); // test2.rcl still cached
      });
    });
  });
});