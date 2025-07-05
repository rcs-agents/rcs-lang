import * as Parser from 'tree-sitter';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLNode, RCLASTNode } from '../types/astTypes';
import { RCLDocument } from '../types/rclTypes';

// Note: In a real implementation, this would import the compiled RCL language
// For now, we'll create a mock implementation that handles the basic structure
let rclLanguage: any;

try {
  // This would be the actual tree-sitter RCL language binding
  // rclLanguage = require('tree-sitter-rcl');
} catch (error) {
  console.warn('Tree-sitter RCL language not found, using mock parser');
}

export class RCLParser {
  private parser: Parser;
  private documentCache: Map<string, RCLDocument> = new Map();

  constructor() {
    this.parser = new (Parser as any)();
    
    if (rclLanguage) {
      this.parser.setLanguage(rclLanguage);
    } else {
      // Mock parser for development
      console.log('Using mock RCL parser');
    }
  }

  public parseDocument(document: TextDocument): RCLDocument {
    const uri = document.uri;
    const version = document.version;
    const content = document.getText();

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
    if (!rclLanguage) {
      return this.mockParse(text);
    }

    try {
      const tree = this.parser.parse(text);
      return this.convertToRCLNode(tree.rootNode) as RCLASTNode;
    } catch (error) {
      console.error('Error parsing RCL document:', error);
      return null;
    }
  }

  private mockParse(text: string): RCLASTNode | null {
    // Simple mock parser for basic RCL structure
    const lines = text.split('\n');
    const mockNode: RCLASTNode = {
      type: 'source_file',
      text: text,
      startPosition: { row: 0, column: 0 },
      endPosition: { row: lines.length - 1, column: lines[lines.length - 1].length },
      children: [],
      parent: null
    };

    // Look for agent definitions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('agent ')) {
        const agentName = line.substring(6).trim();
        mockNode.children!.push({
          type: 'agent_definition',
          text: line,
          startPosition: { row: i, column: 0 },
          endPosition: { row: i, column: line.length },
          children: [],
          parent: mockNode
        });
      }
    }

    return mockNode;
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
    rclNode.children.forEach(child => {
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
    return node.text.replace(/^import\s+/, '').trim();
  }

  private extractNodeName(node: RCLASTNode): string {
    // Extract name from definition nodes
    if ('name' in node) {
      return node.name as string;
    }
    
    // Fallback: extract from text
    const match = node.text.match(/^\w+\s+(\w+)/);
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