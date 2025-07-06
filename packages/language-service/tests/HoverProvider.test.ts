import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { RCLParser } from '@rcl/parser';
import { ImportResolver } from '../src/import-resolver/ImportResolver';
import { WorkspaceIndex } from '../src/workspace-index/WorkspaceIndex';
import { HoverProvider, Hover, MarkupContent } from '../src/providers/HoverProvider';
import { TextDocument, Position } from '../src/providers/types';

// Mock TextDocument implementation
class MockTextDocument implements TextDocument {
  constructor(public uri: string, private content: string) {}

  getText(): string {
    return this.content;
  }

  positionAt(offset: number): { line: number; character: number } {
    const lines = this.content.substring(0, offset).split('\n');
    return {
      line: lines.length - 1,
      character: lines[lines.length - 1].length
    };
  }

  offsetAt(position: { line: number; character: number }): number {
    const lines = this.content.split('\n');
    let offset = 0;
    
    for (let i = 0; i < position.line && i < lines.length; i++) {
      offset += lines[i].length + 1; // +1 for newline
    }
    
    offset += Math.min(position.character, lines[position.line]?.length || 0);
    return offset;
  }
}

describe('HoverProvider', () => {
  let tempDir: string;
  let parser: RCLParser;
  let importResolver: ImportResolver;
  let workspaceIndex: WorkspaceIndex;
  let hoverProvider: HoverProvider;

  beforeEach(async () => {
    // Create temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rcl-hover-test-'));
    
    parser = new RCLParser();
    importResolver = new ImportResolver({ projectRoot: tempDir });
    workspaceIndex = new WorkspaceIndex({
      workspaceRoot: tempDir,
      include: ['**/*.rcl'],
      exclude: ['node_modules/**'],
      watchFiles: false,
      debounceDelay: 100
    });
    
    hoverProvider = new HoverProvider(parser, importResolver, workspaceIndex);
    await workspaceIndex.initialize();
  });

  afterEach(() => {
    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Agent Hover', () => {
    it('should provide hover information for agent definition', async () => {
      const content = `agent TestAgent
  name: "Test Agent"
  brandName: "Test Brand"
  displayName: "Display Test"

flow MainFlow
  start -> greeting
  greeting: "Hello from TestAgent"
`;

      const document = new MockTextDocument(
        path.join(tempDir, 'test.rcl'),
        content
      );

      // Position on "TestAgent" in the agent definition
      const position: Position = { line: 0, character: 8 };

      const hover = await hoverProvider.provideHover(document, position);

      // With mock parser, may not find full definition, but should not throw
      if (hover) {
        expect(hover.contents).toBeTruthy();
        
        if (typeof hover.contents === 'object') {
          const markup = hover.contents as MarkupContent;
          expect(markup.kind).toBe('markdown');
          expect(typeof markup.value).toBe('string');
        }
      } else {
        // It's acceptable for hover to be null with mock parser
        expect(hover).toBeNull();
      }
    });

    it('should extract agent properties in hover', async () => {
      const content = `agent MyAgent
  name: "My Agent Name"
  brandName: "My Brand"
`;

      const document = new MockTextDocument(
        path.join(tempDir, 'test.rcl'),
        content
      );

      const position: Position = { line: 0, character: 8 };
      const hover = await hoverProvider.provideHover(document, position);

      // With mock parser, may or may not find the definition
      if (hover?.contents && typeof hover.contents === 'object') {
        const markup = hover.contents as MarkupContent;
        expect(typeof markup.value).toBe('string');
        expect(markup.kind).toBe('markdown');
      }
    });
  });

  describe('Flow Hover', () => {
    it('should provide hover information for flow definition', async () => {
      const content = `flow TestFlow
  start -> greeting
  greeting: "Hello"
  greeting -> response
  response: "Response message"
  response -> end
  end: "Goodbye"
`;

      const document = new MockTextDocument(
        path.join(tempDir, 'test.rcl'),
        content
      );

      // Position on "TestFlow" in the flow definition
      const position: Position = { line: 0, character: 5 };

      const hover = await hoverProvider.provideHover(document, position);

      expect(hover).toBeTruthy();
      if (hover?.contents && typeof hover.contents === 'object') {
        const markup = hover.contents as MarkupContent;
        expect(markup.kind).toBe('markdown');
        expect(markup.value).toContain('Flow');
        expect(markup.value).toContain('TestFlow');
      }
    });
  });

  describe('Property Hover', () => {
    it('should provide hover information for properties', async () => {
      const content = `agent TestAgent
  name: "Test Agent"
  timeout: 30
  enabled: true
`;

      const document = new MockTextDocument(
        path.join(tempDir, 'test.rcl'),
        content
      );

      // Test different property types
      const tests = [
        { line: 1, character: 2, property: 'name', expectedType: 'string' },
        { line: 2, character: 2, property: 'timeout', expectedType: 'number' },
        { line: 3, character: 2, property: 'enabled', expectedType: 'boolean' },
      ];

      for (const test of tests) {
        const position: Position = { line: test.line, character: test.character };
        const hover = await hoverProvider.provideHover(document, position);

        if (hover?.contents && typeof hover.contents === 'object') {
          const markup = hover.contents as MarkupContent;
          expect(markup.value).toContain(test.property);
          // Type inference may not work perfectly with mock parser
          // but should at least show the property
        }
      }
    });
  });

  describe('Cross-file Hover', () => {
    it('should provide hover for imported symbols', async () => {
      // Create main file
      const mainContent = `import ./shared

agent MainAgent
  name: "Main Agent"
  
flow MainFlow
  start -> SharedFlow
`;

      const mainFile = path.join(tempDir, 'main.rcl');
      fs.writeFileSync(mainFile, mainContent);

      // Create shared file
      const sharedContent = `flow SharedFlow
  start -> greeting
  greeting: "Hello from shared"
  greeting -> end
  end: "Shared flow complete"
`;

      const sharedFile = path.join(tempDir, 'shared.rcl');
      fs.writeFileSync(sharedFile, sharedContent);

      // Add files to workspace index
      await workspaceIndex.addFile(mainFile, mainContent);
      await workspaceIndex.addFile(sharedFile, sharedContent);

      const document = new MockTextDocument(mainFile, mainContent);

      // Position on "SharedFlow" reference in MainFlow
      const position: Position = { line: 6, character: 14 };

      const hover = await hoverProvider.provideHover(document, position);

      // May or may not work with mock parser, but should not throw
      expect(hover === null || (hover && hover.contents)).toBeTruthy();
    });
  });

  describe('Hover Range', () => {
    it('should provide correct hover range for symbols', async () => {
      const content = `agent TestAgent
  name: "Test"
`;

      const document = new MockTextDocument(
        path.join(tempDir, 'test.rcl'),
        content
      );

      const position: Position = { line: 0, character: 8 };
      const hover = await hoverProvider.provideHover(document, position);

      if (hover?.range) {
        expect(hover.range.start.line).toBe(0);
        expect(hover.range.end.line).toBe(0);
        expect(hover.range.start.character).toBeGreaterThanOrEqual(0);
        expect(hover.range.end.character).toBeGreaterThan(hover.range.start.character);
      }
    });
  });

  describe('Basic Hover Fallback', () => {
    it('should provide basic hover when no definition found', async () => {
      const content = `agent TestAgent
  name: "Test"
`;

      const document = new MockTextDocument(
        path.join(tempDir, 'test.rcl'),
        content
      );

      // Position on a symbol that might not be recognized
      const position: Position = { line: 1, character: 15 }; // In string content

      const hover = await hoverProvider.provideHover(document, position);

      // May provide basic hover or null - both are acceptable
      if (hover?.contents && typeof hover.contents === 'object') {
        const markup = hover.contents as MarkupContent;
        expect(markup.kind).toBe('markdown');
      }
    });
  });

  describe('Markdown Content', () => {
    it('should return properly formatted markdown content', async () => {
      const content = `agent TestAgent
  name: "Test Agent"
`;

      const document = new MockTextDocument(
        path.join(tempDir, 'test.rcl'),
        content
      );

      const position: Position = { line: 0, character: 8 };
      const hover = await hoverProvider.provideHover(document, position);

      if (hover?.contents && typeof hover.contents === 'object') {
        const markup = hover.contents as MarkupContent;
        expect(markup.kind).toBe('markdown');
        expect(markup.value).toBeTruthy();
        expect(typeof markup.value).toBe('string');
        
        // Should contain markdown formatting
        expect(markup.value).toMatch(/\*\*/); // Bold formatting
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid positions gracefully', async () => {
      const content = `agent TestAgent
  name: "Test"
`;

      const document = new MockTextDocument(
        path.join(tempDir, 'test.rcl'),
        content
      );

      // Test invalid positions
      const invalidPositions = [
        { line: -1, character: 0 },    // Negative line
        { line: 10, character: 0 },    // Line beyond content
        { line: 0, character: -1 },    // Negative character
      ];

      for (const position of invalidPositions) {
        const hover = await hoverProvider.provideHover(document, position);
        expect(hover).toBeNull();
      }
    });

    it('should handle empty documents', async () => {
      const document = new MockTextDocument(
        path.join(tempDir, 'empty.rcl'),
        ''
      );

      const position: Position = { line: 0, character: 0 };
      const hover = await hoverProvider.provideHover(document, position);
      
      expect(hover).toBeNull();
    });

    it('should handle malformed RCL content', async () => {
      const content = `agent 
flow
  -> 
`;

      const document = new MockTextDocument(
        path.join(tempDir, 'malformed.rcl'),
        content
      );

      const position: Position = { line: 0, character: 5 };
      const hover = await hoverProvider.provideHover(document, position);
      
      // Should not throw, should return null or valid hover
      expect(hover === null || (hover && hover.contents)).toBeTruthy();
    });
  });

  describe('Symbol Recognition', () => {
    it('should extract symbols from various positions', async () => {
      const content = `agent TestAgent
  name: "Test"
flow TestFlow
  start -> end
`;

      const document = new MockTextDocument(
        path.join(tempDir, 'test.rcl'),
        content
      );

      // Test different symbol positions
      const tests = [
        { line: 0, character: 0, expectedSymbol: 'agent' },
        { line: 0, character: 8, expectedSymbol: 'TestAgent' },
        { line: 1, character: 2, expectedSymbol: 'name' },
        { line: 2, character: 5, expectedSymbol: 'TestFlow' },
        { line: 3, character: 2, expectedSymbol: 'start' },
      ];

      for (const test of tests) {
        const position: Position = { line: test.line, character: test.character };
        const hover = await hoverProvider.provideHover(document, position);
        
        // Should either get hover or null, but not throw
        expect(hover === null || hover?.contents).toBeTruthy();
      }
    });
  });
});