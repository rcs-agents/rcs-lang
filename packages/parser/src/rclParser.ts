import Parser from 'tree-sitter';
import { RCLNode, RCLASTNode } from './astTypes';
import { RCLDocument } from './rclTypes';

// Import the compiled RCL language
let rclLanguage: any;

try {
  // Try to load the actual tree-sitter RCL language binding
  rclLanguage = require('/home/ubuntu/tree-sitter/bindings/node');
  console.log('Successfully loaded tree-sitter RCL language');
} catch (error) {
  console.warn('Tree-sitter RCL language not found, using mock parser:', error);
}

export class RCLParser {
  private parser: Parser | null = null;
  private documentCache: Map<string, RCLDocument> = new Map();

  constructor() {
    if (rclLanguage) {
      try {
        this.parser = new Parser();
        this.parser.setLanguage(rclLanguage.language);
        console.log('RCL parser initialized with real tree-sitter grammar');
      } catch (error) {
        console.warn('Failed to initialize real parser, falling back to mock:', error);
        rclLanguage = null; // Force fallback to mock parser
      }
    } else {
      // Don't initialize tree-sitter parser if we don't have the language
      console.log('Using mock RCL parser - no tree-sitter grammar available');
    }
  }

  public parseDocument(content: string, uri: string, version = 1): RCLDocument {

    // Check cache
    const cached = this.documentCache.get(uri);
    if (cached && cached.version === version) {
      return cached;
    }

    const ast = this.parseText(content);
    const rclDocument: RCLDocument = {
      uri,
      version,
      content,
      ast,
      imports: this.extractImports(ast),
      symbols: this.extractSymbols(ast),
      diagnostics: []
    };

    this.documentCache.set(uri, rclDocument);
    return rclDocument;
  }

  private parseText(text: string): RCLASTNode | null {
    if (!rclLanguage || !this.parser) {
      return this.mockParse(text);
    }

    try {
      const tree = this.parser.parse(text);
      return this.convertToRCLNode(tree.rootNode) as RCLASTNode;
    } catch (error) {
      console.error('Error parsing RCL document with tree-sitter:', error);
      console.log('Falling back to mock parser');
      return this.mockParse(text);
    }
  }

  private mockParse(text: string): RCLASTNode | null {
    // Enhanced mock parser that properly handles RCL indentation-based syntax
    const lines = text.split('\n');
    const mockNode: RCLASTNode = {
      type: 'source_file',
      text: text,
      startPosition: { row: 0, column: 0 },
      endPosition: { row: lines.length - 1, column: lines[lines.length - 1]?.length || 0 },
      children: [],
      parent: null
    };

    let currentSection: RCLASTNode | null = null;
    let currentIndentLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      const indentLevel = this.getIndentLevel(line);
      
      // Top-level definitions (agent, flow, messages, etc.)
      if (indentLevel === 0) {
        if (trimmedLine.match(/^(agent|flow|messages|configuration|defaults|import)\s+/)) {
          const [keyword, ...nameParts] = trimmedLine.split(/\s+/);
          const name = nameParts.join(' ');
          
          currentSection = {
            type: `${keyword}_definition` as any,
            text: line,
            startPosition: { row: i, column: 0 },
            endPosition: { row: i, column: line.length },
            children: [],
            parent: mockNode,
            name: name
          };
          
          mockNode.children!.push(currentSection);
          currentIndentLevel = 0;
        }
      } 
      // Indented content within sections
      else if (currentSection && indentLevel > currentIndentLevel) {
        this.parseIndentedContent(currentSection, line, i, indentLevel);
      }
    }

    return mockNode;
  }

  private getIndentLevel(line: string): number {
    let indent = 0;
    for (const char of line) {
      if (char === ' ') {
        indent++;
      } else if (char === '\t') {
        indent += 2; // Treat tab as 2 spaces
      } else {
        break;
      }
    }
    return indent;
  }

  private parseIndentedContent(parent: RCLASTNode, line: string, lineNumber: number, indentLevel: number): void {
    const trimmedLine = line.trim();
    
    // Handle different types of indented content
    if (trimmedLine.includes(':')) {
      // Property or state definition
      const [key, ...valueParts] = trimmedLine.split(':');
      const value = valueParts.join(':').trim();
      
      const propertyNode: RCLASTNode = {
        type: 'property',
        text: line,
        startPosition: { row: lineNumber, column: 0 },
        endPosition: { row: lineNumber, column: line.length },
        children: [],
        parent: parent,
        name: key.trim(),
        value: value
      };
      
      parent.children!.push(propertyNode);
    } else if (trimmedLine.includes('->')) {
      // Flow transition
      const [from, to] = trimmedLine.split('->').map(s => s.trim());
      
      const transitionNode: RCLASTNode = {
        type: 'transition',
        text: line,
        startPosition: { row: lineNumber, column: 0 },
        endPosition: { row: lineNumber, column: line.length },
        children: [],
        parent: parent,
        from: from,
        to: to
      };
      
      parent.children!.push(transitionNode);
    } else {
      // Generic content
      const contentNode: RCLASTNode = {
        type: 'content',
        text: line,
        startPosition: { row: lineNumber, column: 0 },
        endPosition: { row: lineNumber, column: line.length },
        children: [],
        parent: parent
      };
      
      parent.children!.push(contentNode);
    }
  }

  private convertToRCLNode(node: Parser.SyntaxNode): RCLNode {
    const rclNode: RCLNode = {
      type: node.type,
      text: node.text,
      startPosition: node.startPosition,
      endPosition: node.endPosition,
      children: node.children.map(child => this.convertToRCLNode(child)),
      parent: null
    };

    // Set parent references
    rclNode.children?.forEach(child => {
      child.parent = rclNode;
    });

    return rclNode;
  }

  private extractImports(ast: RCLASTNode | null): any[] {
    if (!ast) return [];
    
    const imports: any[] = [];
    this.traverseAST(ast, (node) => {
      if (node.type === 'import_statement') {
        imports.push({
          path: this.extractImportPath(node),
          range: this.nodeToRange(node),
          resolved: false
        });
      }
    });
    
    return imports;
  }

  private extractSymbols(ast: RCLASTNode | null): any[] {
    if (!ast) return [];
    
    const symbols: any[] = [];
    this.traverseAST(ast, (node) => {
      if (['agent_definition', 'flow_definition', 'message_definition'].includes(node.type)) {
        symbols.push({
          name: this.extractNodeName(node),
          kind: this.nodeTypeToSymbolKind(node.type),
          range: this.nodeToRange(node),
          selectionRange: this.nodeToRange(node)
        });
      }
    });
    
    return symbols;
  }

  private traverseAST(node: RCLASTNode, callback: (node: RCLASTNode) => void): void {
    callback(node);
    if ('children' in node && node.children) {
      node.children.forEach(child => this.traverseAST(child as RCLASTNode, callback));
    }
  }

  private extractImportPath(node: RCLASTNode): string {
    // Extract import path from import statement
    return node.text?.replace(/^import\s+/, '').trim() || '';
  }

  private extractNodeName(node: RCLASTNode): string {
    // Extract name from definition nodes
    if ('name' in node) {
      return node.name as string;
    }
    
    // Fallback: extract from text
    const match = node.text?.match(/^\w+\s+(\w+)/);
    return match ? match[1] : 'unknown';
  }

  private nodeTypeToSymbolKind(nodeType: string): string {
    switch (nodeType) {
      case 'agent_definition': return 'agent';
      case 'flow_definition': return 'flow';
      case 'message_definition': return 'message';
      default: return 'unknown';
    }
  }

  private nodeToRange(node: RCLASTNode): any {
    return {
      start: {
        line: node.startPosition.row,
        character: node.startPosition.column
      },
      end: {
        line: node.endPosition.row,
        character: node.endPosition.column
      }
    };
  }

  public getNodeAt(document: RCLDocument, line: number, character: number): RCLASTNode | null {
    if (!document.ast) return null;
    
    return this.findNodeAtPosition(document.ast, line, character);
  }

  private findNodeAtPosition(node: RCLASTNode, line: number, character: number): RCLASTNode | null {
    if (line < node.startPosition.row || line > node.endPosition.row) {
      return null;
    }
    
    if (line === node.startPosition.row && character < node.startPosition.column) {
      return null;
    }
    
    if (line === node.endPosition.row && character > node.endPosition.column) {
      return null;
    }

    // Check children for more specific match
    if ('children' in node && node.children) {
      for (const child of node.children) {
        const childMatch = this.findNodeAtPosition(child as RCLASTNode, line, character);
        if (childMatch) {
          return childMatch;
        }
      }
    }

    return node;
  }

  public clearCache(uri?: string): void {
    if (uri) {
      this.documentCache.delete(uri);
    } else {
      this.documentCache.clear();
    }
  }
}