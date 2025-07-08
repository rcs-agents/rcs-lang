import { RCLParser } from '@rcl/parser';
import { ImportResolver } from '../import-resolver';
import { WorkspaceIndex } from '../workspace-index';
import { SymbolType } from '../import-resolver/types';
import { TextDocument, Position } from './types';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Represents hover information
 */
export interface Hover {
  /** The formatted content to display */
  contents: MarkupContent | string;
  /** The range that the hover applies to */
  range?: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}

/**
 * Markup content with language and value
 */
export interface MarkupContent {
  /** The markup kind (markdown or plaintext) */
  kind: 'markdown' | 'plaintext';
  /** The content value */
  value: string;
}

/**
 * Provides hover documentation for RCL symbols
 */
export class HoverProvider {
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
   * Provide hover information for a symbol at the given position
   */
  async provideHover(
    document: TextDocument,
    position: Position
  ): Promise<Hover | null> {
    try {
      const symbol = this.getSymbolAtPosition(document, position);
      if (!symbol) {
        return null;
      }

      const symbolRange = this.getSymbolRange(document, position, symbol);

      // First try to find local definition
      const localHover = await this.getLocalHover(document, symbol, position);
      if (localHover) {
        return {
          contents: localHover,
          range: symbolRange
        };
      }

      // Then try to find imported definition
      const importedHover = await this.getImportedHover(document, symbol);
      if (importedHover) {
        return {
          contents: importedHover,
          range: symbolRange
        };
      }

      // If no specific hover found, provide basic information
      const basicHover = this.getBasicHover(symbol);
      if (basicHover) {
        return {
          contents: basicHover,
          range: symbolRange
        };
      }

      return null;
    } catch (error) {
      console.error('Error providing hover:', error);
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
   * Get the range of the symbol at position
   */
  private getSymbolRange(document: TextDocument, position: Position, symbol: string): any {
    const content = document.getText();
    const lines = content.split('\n');
    
    if (position.line >= lines.length) {
      return null;
    }

    const line = lines[position.line];
    const symbolIndex = line.indexOf(symbol, Math.max(0, position.character - symbol.length));
    
    if (symbolIndex !== -1) {
      return {
        start: { line: position.line, character: symbolIndex },
        end: { line: position.line, character: symbolIndex + symbol.length }
      };
    }

    return null;
  }

  /**
   * Check if character is part of a word
   */
  private isWordCharacter(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  /**
   * Get hover information for local symbols
   */
  private async getLocalHover(
    document: TextDocument,
    symbol: string,
    position: Position
  ): Promise<MarkupContent | null> {
    const content = document.getText();
    const rclDocument = await this.parser.parseDocument(content, document.uri);

    // Find the symbol definition in the AST
    const definition = this.findSymbolDefinitionInAST(rclDocument.ast, symbol);
    if (!definition) {
      return null;
    }

    return this.createHoverContent(definition, symbol);
  }

  /**
   * Get hover information for imported symbols
   */
  private async getImportedHover(
    document: TextDocument,
    symbol: string
  ): Promise<MarkupContent | null> {
    // Get symbol from workspace index
    const symbolLocations = this.workspaceIndex.findSymbol(symbol);
    const externalSymbols = symbolLocations.filter(loc => loc.uri !== document.uri);
    
    if (externalSymbols.length === 0) {
      return null;
    }

    // Use the first external symbol found
    const symbolLoc = externalSymbols[0];
    
    try {
      // Parse the external file to get full definition context
      const externalContent = fs.readFileSync(symbolLoc.uri, 'utf-8');
      const externalDocument = await this.parser.parseDocument(externalContent, symbolLoc.uri);
      
      const definition = this.findSymbolDefinitionInAST(externalDocument.ast, symbol);
      if (definition) {
        const hoverContent = this.createHoverContent(definition, symbol);
        if (hoverContent) {
          // Add information about the import source
          const importPath = this.getRelativePath(document.uri, symbolLoc.uri);
          hoverContent.value = `**Imported from:** \`${importPath}\`\n\n${hoverContent.value}`;
          return hoverContent;
        }
      }
    } catch (error) {
      console.error(`Error reading external file ${symbolLoc.uri}:`, error);
    }

    return null;
  }

  /**
   * Get basic hover information when no definition is found
   */
  private getBasicHover(symbol: string): MarkupContent | null {
    return {
      kind: 'markdown',
      value: `**Symbol:** \`${symbol}\`\n\n*No definition found*`
    };
  }

  /**
   * Find symbol definition in AST
   */
  private findSymbolDefinitionInAST(ast: any, symbol: string): any | null {
    if (!ast) return null;

    let definition: any = null;

    this.walkAST(ast, (node) => {
      if (this.isDefinitionNode(node)) {
        const nodeName = this.extractNodeName(node);
        if (nodeName === symbol) {
          definition = node;
        }
      }
    });

    return definition;
  }

  /**
   * Create formatted hover content for a definition
   */
  private createHoverContent(definition: any, symbol: string): MarkupContent {
    const symbolType = this.getSymbolTypeFromNode(definition);
    let content = `**${this.capitalizeSymbolType(symbolType)}:** \`${symbol}\`\n\n`;

    // Add type-specific information
    switch (symbolType) {
      case SymbolType.Agent:
        content += this.createAgentHover(definition);
        break;
      case SymbolType.Flow:
        content += this.createFlowHover(definition);
        break;
      case SymbolType.Message:
        content += this.createMessageHover(definition);
        break;
      case SymbolType.Property:
        content += this.createPropertyHover(definition);
        break;
      default:
        content += this.createGenericHover(definition);
    }

    // Add documentation comments if available
    const documentation = this.extractDocumentation(definition);
    if (documentation) {
      content += `\n\n**Documentation:**\n${documentation}`;
    }

    return {
      kind: 'markdown',
      value: content
    };
  }

  /**
   * Create hover content for agent definitions
   */
  private createAgentHover(definition: any): string {
    let content = '';
    
    // Extract agent properties
    const properties = this.extractAgentProperties(definition);
    
    if (properties.name) {
      content += `**Name:** ${properties.name}\n`;
    }
    if (properties.brandName) {
      content += `**Brand:** ${properties.brandName}\n`;
    }
    if (properties.displayName) {
      content += `**Display Name:** ${properties.displayName}\n`;
    }

    // List flows associated with this agent
    const flows = this.extractAgentFlows(definition);
    if (flows.length > 0) {
      content += `\n**Flows:** ${flows.join(', ')}\n`;
    }

    return content;
  }

  /**
   * Create hover content for flow definitions
   */
  private createFlowHover(definition: any): string {
    let content = '';

    // Extract flow states and transitions
    const states = this.extractFlowStates(definition);
    const transitions = this.extractFlowTransitions(definition);

    if (states.length > 0) {
      content += `**States:** ${states.join(', ')}\n`;
    }

    if (transitions.length > 0) {
      content += `**Transitions:**\n`;
      transitions.forEach(transition => {
        content += `- ${transition.from} → ${transition.to}\n`;
      });
    }

    return content;
  }

  /**
   * Create hover content for message definitions
   */
  private createMessageHover(definition: any): string {
    let content = '';

    // Extract message content
    const messageText = this.extractMessageText(definition);
    if (messageText) {
      content += `**Content:** "${messageText}"\n`;
    }

    // Extract message type
    const messageType = this.extractMessageType(definition);
    if (messageType) {
      content += `**Type:** ${messageType}\n`;
    }

    return content;
  }

  /**
   * Create hover content for property definitions
   */
  private createPropertyHover(definition: any): string {
    let content = '';

    const value = this.extractPropertyValue(definition);
    if (value) {
      content += `**Value:** ${value}\n`;
    }

    const propertyType = this.extractPropertyType(definition);
    if (propertyType) {
      content += `**Type:** ${propertyType}\n`;
    }

    return content;
  }

  /**
   * Create generic hover content
   */
  private createGenericHover(definition: any): string {
    return `**Definition found**\n\nNo additional information available.`;
  }

  /**
   * Extract documentation comments from around a definition
   */
  private extractDocumentation(definition: any): string | null {
    // For now, return null - documentation extraction would need
    // to look at preceding comment nodes in the AST
    return null;
  }

  /**
   * Extract agent properties from definition
   */
  private extractAgentProperties(definition: any): any {
    const properties: any = {};

    this.walkAST(definition, (node) => {
      if (node.type === 'property') {
        const name = node.name?.trim();
        const value = node.value?.trim();
        
        if (name && value) {
          // Remove quotes from string values
          const cleanValue = value.replace(/^["']|["']$/g, '');
          properties[name] = cleanValue;
        }
      }
    });

    return properties;
  }

  /**
   * Extract flows associated with an agent
   */
  private extractAgentFlows(definition: any): string[] {
    // This would need to be implemented based on how agent-flow
    // relationships are represented in the AST
    return [];
  }

  /**
   * Extract states from a flow definition
   */
  private extractFlowStates(definition: any): string[] {
    const states: string[] = [];

    this.walkAST(definition, (node) => {
      if (node.type === 'property' && node.name) {
        states.push(node.name.trim());
      }
    });

    return [...new Set(states)]; // Remove duplicates
  }

  /**
   * Extract transitions from a flow definition
   */
  private extractFlowTransitions(definition: any): Array<{from: string, to: string}> {
    const transitions: Array<{from: string, to: string}> = [];

    this.walkAST(definition, (node) => {
      if (node.type === 'transition') {
        transitions.push({
          from: node.from || 'unknown',
          to: node.to || 'unknown'
        });
      }
    });

    return transitions;
  }

  /**
   * Extract text content from a message
   */
  private extractMessageText(definition: any): string | null {
    // Extract the message text content
    if (definition.value) {
      return definition.value.replace(/^["']|["']$/g, '');
    }
    return null;
  }

  /**
   * Extract message type
   */
  private extractMessageType(definition: any): string | null {
    // This would extract message type information if available
    return null;
  }

  /**
   * Extract property value
   */
  private extractPropertyValue(definition: any): string | null {
    if (definition.value) {
      return definition.value.replace(/^["']|["']$/g, '');
    }
    return null;
  }

  /**
   * Extract property type
   */
  private extractPropertyType(definition: any): string | null {
    // This would infer or extract property type information
    if (definition.value) {
      const value = definition.value.trim();
      if (value.match(/^["']/)) {
        return 'string';
      } else if (value.match(/^\d+$/)) {
        return 'number';
      } else if (value.match(/^(true|false)$/i)) {
        return 'boolean';
      }
    }
    return null;
  }

  /**
   * Get symbol type from AST node
   */
  private getSymbolTypeFromNode(node: any): SymbolType {
    switch (node.type) {
      case 'agent_definition': return SymbolType.Agent;
      case 'flow_definition': return SymbolType.Flow;
      case 'message_definition': return SymbolType.Message;
      case 'property': return SymbolType.Property;
      default: return SymbolType.Property;
    }
  }

  /**
   * Capitalize symbol type for display
   */
  private capitalizeSymbolType(symbolType: SymbolType): string {
    return symbolType.charAt(0).toUpperCase() + symbolType.slice(1);
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
   * Get relative path between two files
   */
  private getRelativePath(fromUri: string, toUri: string): string {
    return path.relative(path.dirname(fromUri), toUri);
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