import { RCLParser } from '@rcl/parser';
import { ImportResolver } from '../import-resolver';
import { WorkspaceIndex } from '../workspace-index';
import { SymbolType } from '../import-resolver/types';
import fs from 'node:fs';

/**
 * Represents a reference location
 */
export interface Reference {
  /** URI of the file containing the reference */
  uri: string;
  /** Range of the reference */
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  /** Context where the reference appears */
  context?: {
    /** Type of context (definition, reference, import) */
    type: 'definition' | 'reference' | 'import';
    /** Surrounding text for context */
    text?: string;
  };
}

import { TextDocument, Position } from './types';

/**
 * Provides "Find All References" functionality for RCL files
 */
export class ReferencesProvider {
  private parser: RCLParser;
  private importResolver: ImportResolver;
  private workspaceIndex: WorkspaceIndex;

  constructor(
    parser: RCLParser,
    importResolver: ImportResolver,
    workspaceIndex: WorkspaceIndex
  ) {
    this.parser = parser;
    this.importResolver = importResolver;
    this.workspaceIndex = workspaceIndex;
  }

  /**
   * Find all references to a symbol at the given position
   */
  async findAllReferences(
    document: TextDocument,
    position: Position,
    includeDeclaration = true
  ): Promise<Reference[]> {
    try {
      const symbol = this.getSymbolAtPosition(document, position);
      if (!symbol) {
        return [];
      }

      const references: Reference[] = [];

      // Find references in current file
      const localRefs = await this.findLocalReferences(document, symbol);
      references.push(...localRefs);

      // Find references across workspace
      const workspaceRefs = await this.findWorkspaceReferences(symbol, document.uri);
      references.push(...workspaceRefs);

      // Filter out declaration if not requested
      if (!includeDeclaration) {
        return references.filter(ref => ref.context?.type !== 'definition');
      }

      // Remove duplicates and sort by location
      return this.deduplicateAndSort(references);
    } catch (error) {
      console.error('Error finding references:', error);
      return [];
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
   * Find all references within the same file
   */
  private async findLocalReferences(document: TextDocument, symbol: string): Promise<Reference[]> {
    const content = document.getText();
    const rclDocument = await this.parser.parseDocument(content, document.uri);
    const references: Reference[] = [];

    // Walk the AST to find all occurrences of the symbol
    this.walkAST(rclDocument.ast, (node) => {
      const nodeReferences = this.extractReferencesFromNode(node, symbol, document.uri);
      references.push(...nodeReferences);
    });

    return references;
  }

  /**
   * Find all references across the workspace
   */
  private async findWorkspaceReferences(symbol: string, currentUri: string): Promise<Reference[]> {
    const references: Reference[] = [];

    // Get all symbols with matching name from workspace index
    const symbolLocations = this.workspaceIndex.findSymbol(symbol);

    for (const symbolLoc of symbolLocations) {
      if (symbolLoc.uri === currentUri) {
        continue; // Skip current file, already processed
      }

      try {
        // Parse the file to find all references
        const fileRefs = await this.findReferencesInFile(symbolLoc.uri, symbol);
        references.push(...fileRefs);
      } catch (error) {
        console.error(`Error finding references in ${symbolLoc.uri}:`, error);
      }
    }

    // Also check files that might import or reference this symbol
    const dependents = this.workspaceIndex.getDependents(currentUri);
    for (const dependentUri of dependents) {
      try {
        const fileRefs = await this.findReferencesInFile(dependentUri, symbol);
        references.push(...fileRefs);
      } catch (error) {
        console.error(`Error finding references in dependent ${dependentUri}:`, error);
      }
    }

    return references;
  }

  /**
   * Find references in a specific file
   */
  private async findReferencesInFile(fileUri: string, symbol: string): Promise<Reference[]> {
    try {
      const content = fs.readFileSync(fileUri, 'utf-8');
      const rclDocument = await this.parser.parseDocument(content, fileUri);
      const references: Reference[] = [];

      this.walkAST(rclDocument.ast, (node) => {
        const nodeReferences = this.extractReferencesFromNode(node, symbol, fileUri);
        references.push(...nodeReferences);
      });

      return references;
    } catch (error) {
      console.error(`Error reading file ${fileUri}:`, error);
      return [];
    }
  }

  /**
   * Extract references from an AST node
   */
  private extractReferencesFromNode(node: any, symbol: string, uri: string): Reference[] {
    const references: Reference[] = [];

    if (!node) return references;

    // Check if this node is a definition of the symbol
    if (this.isDefinitionNode(node)) {
      const nodeName = this.extractNodeName(node);
      if (nodeName === symbol) {
        references.push({
          uri,
          range: this.nodeToRange(node),
          context: {
            type: 'definition',
            text: node.text?.trim() || ''
          }
        });
      }
    }

    // Check if this node references the symbol
    if (this.isReferenceNode(node, symbol)) {
      const referenceRange = this.findSymbolRangeInNode(node, symbol);
      if (referenceRange) {
        references.push({
          uri,
          range: referenceRange,
          context: {
            type: 'reference',
            text: node.text?.trim() || ''
          }
        });
      }
    }

    // Check for import references
    if (node.type === 'import_statement') {
      const importPath = this.extractImportPath(node);
      if (importPath && importPath.includes(symbol)) {
        references.push({
          uri,
          range: this.nodeToRange(node),
          context: {
            type: 'import',
            text: node.text?.trim() || ''
          }
        });
      }
    }

    return references;
  }

  /**
   * Check if a node represents a definition
   */
  private isDefinitionNode(node: any): boolean {
    return [
      'agent_definition',
      'flow_definition', 
      'message_definition',
      'property'
    ].includes(node.type);
  }

  /**
   * Check if a node references the given symbol
   */
  private isReferenceNode(node: any, symbol: string): boolean {
    if (!node.text) return false;

    // Check for flow transitions (e.g., "start -> symbol")
    if (node.type === 'transition') {
      return node.from === symbol || node.to === symbol;
    }

    // Check for property values that reference symbols
    if (node.type === 'property') {
      return node.value && node.value.includes(symbol);
    }

    // Check text content for symbol references
    return node.text.includes(symbol);
  }

  /**
   * Find the exact range of a symbol within a node
   */
  private findSymbolRangeInNode(node: any, symbol: string): any | null {
    if (!node.text) return null;

    const symbolIndex = node.text.indexOf(symbol);
    if (symbolIndex === -1) return null;

    // Calculate line and character offsets
    const beforeSymbol = node.text.substring(0, symbolIndex);
    const lines = beforeSymbol.split('\n');
    const lineOffset = lines.length - 1;
    const charOffset = lines[lines.length - 1].length;

    return {
      start: {
        line: node.startPosition.row + lineOffset,
        character: (lineOffset === 0 ? node.startPosition.column : 0) + charOffset
      },
      end: {
        line: node.startPosition.row + lineOffset,
        character: (lineOffset === 0 ? node.startPosition.column : 0) + charOffset + symbol.length
      }
    };
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
      const match = node.text.match(/^\s*\w+\s+([^\s]+)/);
      if (match) {
        return match[1];
      }
    }

    return '';
  }

  /**
   * Extract import path from import node
   */
  private extractImportPath(node: any): string {
    if (node.text) {
      const match = node.text.match(/import\s+([^\s]+)/);
      if (match) {
        return match[1];
      }
    }
    return '';
  }

  /**
   * Convert AST node to LSP range
   */
  private nodeToRange(node: any): any {
    return {
      start: {
        line: node.startPosition?.row || 0,
        character: node.startPosition?.column || 0
      },
      end: {
        line: node.endPosition?.row || 0,
        character: node.endPosition?.column || 0
      }
    };
  }

  /**
   * Remove duplicate references and sort by location
   */
  private deduplicateAndSort(references: Reference[]): Reference[] {
    // Create a set to track unique references
    const seen = new Set<string>();
    const unique: Reference[] = [];

    for (const ref of references) {
      const key = `${ref.uri}:${ref.range.start.line}:${ref.range.start.character}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(ref);
      }
    }

    // Sort by URI, then by line, then by character
    return unique.sort((a, b) => {
      if (a.uri !== b.uri) {
        return a.uri.localeCompare(b.uri);
      }
      if (a.range.start.line !== b.range.start.line) {
        return a.range.start.line - b.range.start.line;
      }
      return a.range.start.character - b.range.start.character;
    });
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