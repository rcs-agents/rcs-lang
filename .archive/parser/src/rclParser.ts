import { RCLNode, type RCLASTNode, type Range } from './astTypes';
import { type RCLDocument, type ImportInfo, type SymbolInfo, SymbolKind } from './rclTypes';
import { ANTLRParserCore } from './antlrParserCore';

// Type aliases for clarity
type RCLImport = ImportInfo;
type RCLSymbol = SymbolInfo;
type RCLRange = Range;

export class RCLParser {
  private parserCore: ANTLRParserCore;
  private documentCache: Map<string, RCLDocument> = new Map();

  constructor(_options: { strict?: boolean } = {}) {
    // Using ANTLR parser now
    this.parserCore = new ANTLRParserCore();
  }

  public async parseDocument(content: string, uri: string, version = 1): Promise<RCLDocument> {
    // Check cache
    const cached = this.documentCache.get(uri);
    if (cached && cached.version === version) {
      return cached;
    }

    const ast = await this.parseText(content);
    const rclDocument: RCLDocument = {
      uri,
      version,
      content,
      ast,
      imports: this.extractImports(ast),
      symbols: this.extractSymbols(ast),
      diagnostics: [],
    };

    this.documentCache.set(uri, rclDocument);
    return rclDocument;
  }

  private async parseText(text: string): Promise<RCLASTNode | null> {
    try {
      return await this.parserCore.parse(text);
    } catch (error) {
      throw new Error(`ANTLR parsing failed: ${error}`);
    }
  }

  private extractImports(ast: RCLASTNode | null): RCLImport[] {
    if (!ast) return [];

    const imports: RCLImport[] = [];
    this.traverseAST(ast, (node) => {
      if (node.type === 'import_statement') {
        imports.push({
          path: this.extractImportPath(node),
          range: this.nodeToRange(node),
          resolved: false,
        });
      }
    });

    return imports;
  }

  private extractSymbols(ast: RCLASTNode | null): RCLSymbol[] {
    if (!ast) return [];

    const symbols: RCLSymbol[] = [];
    this.traverseAST(ast, (node) => {
      // Extract agent symbols
      if (node.type === 'agent_definition') {
        symbols.push({
          name: this.extractNodeName(node),
          kind: SymbolKind.Agent,
          range: this.nodeToRange(node),
          selectionRange: this.nodeToRange(node),
        });
      }
      
      // Extract flow symbols - support both flow_definition and flow_section
      if (node.type === 'flow_definition' || (node as any).type === 'flow_section') {
        symbols.push({
          name: this.extractNodeName(node),
          kind: SymbolKind.Flow,
          range: this.nodeToRange(node),
          selectionRange: this.nodeToRange(node),
        });
      }
      
      // Extract message symbols - add messages_section to extract the section itself
      if ((node as any).type === 'messages_section') {
        symbols.push({
          name: 'Messages',
          kind: SymbolKind.Message,
          range: this.nodeToRange(node),
          selectionRange: this.nodeToRange(node),
        });
      }
    });

    return symbols;
  }

  private traverseAST(node: RCLASTNode, callback: (node: RCLASTNode) => void): void {
    callback(node);
    if ('children' in node && node.children) {
      node.children.forEach((child) => this.traverseAST(child as RCLASTNode, callback));
    }
  }

  private extractImportPath(node: RCLASTNode): string {
    // Extract import path from import statement
    // Extract from text for tree-sitter nodes
    return node.text?.replace(/^import\s+/, '').trim() || '';
  }

  private extractNodeName(node: RCLASTNode): string {
    // Extract name from definition nodes
    if ('name' in node) {
      return node.name as string;
    }

    // Find the identifier child node
    if ('children' in node && node.children) {
      const identifierNode = node.children.find((child: any) => child.type === 'identifier');
      if (identifierNode?.text) {
        return identifierNode.text;
      }
    }

    // Fallback: extract from text for RCL's Title Case identifiers
    // Matches: agent CustomerServiceBot or flow Main Flow With Spaces
    const match = node.text?.match(/^(?:agent|flow|messages?)\s+([A-Z][A-Za-z0-9\-_]*(?:\s+[A-Z][A-Za-z0-9\-_]*)*)/);
    return match ? match[1] : 'unknown';
  }

  private nodeTypeToSymbolKind(nodeType: string): SymbolKind {
    switch (nodeType) {
      case 'agent_definition':
        return SymbolKind.Agent;
      case 'flow_definition':
      case 'flow_section':
      case 'flow':
        return SymbolKind.Flow;
      case 'message_definition':
      case 'messages_section':
      case 'messages':
        return SymbolKind.Message;
      default:
        return SymbolKind.Agent; // Default fallback
    }
  }

  private nodeToRange(node: RCLASTNode): RCLRange {
    return {
      start: {
        line: node.startPosition.row,
        character: node.startPosition.column,
      },
      end: {
        line: node.endPosition.row,
        character: node.endPosition.column,
      },
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
