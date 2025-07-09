import type { IParser } from '@rcl/core';
import type { ImportResolver } from '../import-resolver';
import { SymbolType } from '../import-resolver/types';
import type { WorkspaceIndex } from '../workspace-index';

/**
 * Represents a definition location
 */
export interface Definition {
  /** URI of the file containing the definition */
  uri: string;
  /** Range of the definition */
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  /** Type of the symbol */
  symbolType?: SymbolType;
  /** Name of the symbol */
  symbolName?: string;
}

import type { Position, TextDocument } from './types';

/**
 * Provides "Go to Definition" functionality for RCL files
 */
export class DefinitionProvider {
  private parser: IParser;
  private importResolver: ImportResolver;
  private workspaceIndex: WorkspaceIndex;

  constructor(parser: IParser, importResolver: ImportResolver, workspaceIndex: WorkspaceIndex) {
    this.parser = parser;
    this.importResolver = importResolver;
    this.workspaceIndex = workspaceIndex;
  }

  /**
   * Provide definition for a symbol at the given position
   */
  async provideDefinition(document: TextDocument, position: Position): Promise<Definition | null> {
    try {
      const symbol = this.getSymbolAtPosition(document, position);
      if (!symbol) {
        return null;
      }

      // Check local definitions first
      const localDef = await this.findLocalDefinition(document, symbol, position);
      if (localDef) {
        return localDef;
      }

      // Check imported definitions
      const importedDef = await this.findImportedDefinition(document, symbol);
      return importedDef;
    } catch (error) {
      console.error('Error providing definition:', error);
      return null;
    }
  }

  /**
   * Get symbol at the given position
   */
  private getSymbolAtPosition(document: TextDocument, position: Position): string | null {
    const content = document.getText();
    const lines = content.split('\n');

    // Validate position
    if (position.line < 0 || position.line >= lines.length) {
      return null;
    }

    const line = lines[position.line];
    if (!line || position.character < 0 || position.character >= line.length) {
      return null;
    }

    const char = position.character;

    // Find word boundaries around the cursor position
    let start = char;
    let end = char;

    // Expand backwards to find start of word
    while (start > 0 && this.isWordCharacter(line[start - 1])) {
      start--;
    }

    // Expand forwards to find end of word
    while (end < line.length && this.isWordCharacter(line[end])) {
      end++;
    }

    if (start === end) {
      return null;
    }

    return line.substring(start, end);
  }

  /**
   * Check if character is part of a word (includes letters, numbers, underscore)
   */
  private isWordCharacter(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  /**
   * Find definition within the same file
   */
  private async findLocalDefinition(
    document: TextDocument,
    symbol: string,
    position: Position,
  ): Promise<Definition | null> {
    const content = document.getText();
    const parseResult = await this.parser.parse(content, document.uri);
    if (!parseResult.success) {
      return null;
    }
    const rclDocument = parseResult.value;

    // Look for symbol definitions in the AST
    const definition = this.findSymbolDefinitionInAST(rclDocument.ast, symbol);
    if (definition) {
      return {
        uri: document.uri,
        range: definition.range,
        symbolType: definition.symbolType,
        symbolName: symbol,
      };
    }

    // Check if this is a reference within a flow (like state transitions)
    const flowRef = this.findFlowReference(rclDocument.ast, symbol, position);
    if (flowRef) {
      return flowRef;
    }

    return null;
  }

  /**
   * Find symbol definition in AST
   */
  private findSymbolDefinitionInAST(
    ast: any,
    symbol: string,
  ): { range: any; symbolType: SymbolType } | null {
    if (!ast) return null;

    const definitions: { range: any; symbolType: SymbolType }[] = [];

    this.walkAST(ast, (node) => {
      if (this.isDefinitionNode(node)) {
        const nodeName = this.extractNodeName(node);
        if (nodeName === symbol) {
          definitions.push({
            range: this.nodeToRange(node),
            symbolType: this.nodeTypeToSymbolType(node.type),
          });
        }
      }
    });

    // Return the first definition found
    return definitions.length > 0 ? definitions[0] : null;
  }

  /**
   * Find flow state references within flows
   */
  private findFlowReference(ast: any, symbol: string, position: Position): Definition | null {
    if (!ast) return null;

    let flowContext: any = null;
    let targetStateDefinition: any = null;

    // Find the flow containing the current position
    this.walkAST(ast, (node) => {
      if (node.type === 'flow_definition') {
        const nodeRange = this.nodeToRange(node);
        if (this.isPositionInRange(position, nodeRange)) {
          flowContext = node;
        }
      }
    });

    if (!flowContext) return null;

    // Look for state definitions within the flow
    this.walkAST(flowContext, (node) => {
      if (
        node.type === 'property' &&
        node.name &&
        (node.name === symbol || node.name.trim() === symbol)
      ) {
        targetStateDefinition = node;
      }
    });

    if (targetStateDefinition) {
      return {
        uri: '', // Will be filled by caller
        range: this.nodeToRange(targetStateDefinition),
        symbolType: SymbolType.Property,
        symbolName: symbol,
      };
    }

    return null;
  }

  /**
   * Find definition in imported files
   */
  private async findImportedDefinition(
    document: TextDocument,
    symbol: string,
  ): Promise<Definition | null> {
    // Get all symbols from workspace index
    const symbolLocations = this.workspaceIndex.findSymbol(symbol);

    // Filter out the current file
    const externalSymbols = symbolLocations.filter((loc) => loc.uri !== document.uri);

    if (externalSymbols.length > 0) {
      // Return the first external definition found
      const symbolLoc = externalSymbols[0];
      return {
        uri: symbolLoc.uri,
        range: symbolLoc.symbol.range,
        symbolType: symbolLoc.symbol.type,
        symbolName: symbol,
      };
    }

    return null;
  }

  /**
   * Check if a node represents a definition
   */
  private isDefinitionNode(node: any): boolean {
    return ['agent_definition', 'flow_definition', 'message_definition', 'property'].includes(
      node.type,
    );
  }

  /**
   * Extract name from a definition node
   */
  private extractNodeName(node: any): string {
    if (node.name) {
      return node.name;
    }

    // Try to extract from text
    if (node.text) {
      const match = node.text.match(/^\s*\w+\s+([^\\s]+)/);
      if (match) {
        return match[1];
      }
    }

    return '';
  }

  /**
   * Convert node type to symbol type
   */
  private nodeTypeToSymbolType(nodeType: string): SymbolType {
    switch (nodeType) {
      case 'agent_definition':
        return SymbolType.Agent;
      case 'flow_definition':
        return SymbolType.Flow;
      case 'message_definition':
        return SymbolType.Message;
      case 'property':
        return SymbolType.Property;
      default:
        return SymbolType.Property;
    }
  }

  /**
   * Convert AST node to LSP range
   */
  private nodeToRange(node: any): any {
    return {
      start: {
        line: node.startPosition?.row || 0,
        character: node.startPosition?.column || 0,
      },
      end: {
        line: node.endPosition?.row || 0,
        character: node.endPosition?.column || 0,
      },
    };
  }

  /**
   * Check if position is within range
   */
  private isPositionInRange(position: Position, range: any): boolean {
    if (position.line < range.start.line || position.line > range.end.line) {
      return false;
    }

    if (position.line === range.start.line && position.character < range.start.character) {
      return false;
    }

    if (position.line === range.end.line && position.character > range.end.character) {
      return false;
    }

    return true;
  }

  /**
   * Walk AST nodes recursively
   */
  private walkAST(node: any, callback: (node: any) => void): void {
    if (!node) return;

    callback(node);

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        this.walkAST(child, callback);
      }
    }
  }
}
