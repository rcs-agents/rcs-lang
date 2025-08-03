import fs from 'node:fs';
import path from 'node:path';
import type { IParseResult, IParser } from '@rcs-lang/core';
import type {
  ASTNode,
  Range as ASTRange,
  AgentNode,
  BaseNode,
  FlowNode,
  MessageNode,
  StateNode,
  StringNode,
  TransitionNode,
  ValueNode,
} from '../ast-compatibility';
import { walkAST } from '../ast-compatibility';
import type { ImportResolver } from '../import-resolver';
import { SymbolType } from '../import-resolver/types';
import type { WorkspaceIndex } from '../workspace-index';
import type { Position, TextDocument } from './types.js';

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
 * Represents a symbol range in the document
 */
export interface SymbolRange {
  start: { line: number; character: number };
  end: { line: number; character: number };
}

/**
 * Agent properties extracted from AST
 */
interface AgentProperties {
  name?: string;
  brandName?: string;
  displayName?: string;
  [key: string]: string | undefined;
}

/**
 * Flow transition representation
 */
interface FlowTransition {
  from: string;
  to: string;
}

/**
 * Type guard for string nodes
 */
function isStringNode(node: ValueNode): node is StringNode {
  return node.type === 'string';
}

/**
 * Type guard for agent nodes
 */
function isAgentNode(node: BaseNode): node is AgentNode {
  return node.type === 'agent_definition';
}

/**
 * Type guard for flow nodes
 */
function isFlowNode(node: BaseNode): node is FlowNode {
  return node.type === 'flow_definition';
}

/**
 * Type guard for message nodes
 */
function isMessageNode(node: BaseNode): node is MessageNode {
  return node.type === 'message_definition';
}

/**
 * Type guard for state nodes
 */
function isStateNode(node: BaseNode): node is StateNode {
  return node.type === 'state_definition';
}

/**
 * Type guard for transition nodes
 */
function isTransitionNode(node: BaseNode): node is TransitionNode {
  return node.type === 'transition';
}

/**
 * Provides hover documentation for RCL symbols
 */
export class HoverProvider {
  private parser: IParser;
  private importResolver: ImportResolver;
  private workspaceIndex: WorkspaceIndex;

  constructor(parser: IParser, importResolver: ImportResolver, workspaceIndex: WorkspaceIndex) {
    this.parser = parser;
    this.importResolver = importResolver;
    this.workspaceIndex = workspaceIndex;
  }

  /**
   * Provide hover information for a symbol at the given position
   */
  async provideHover(document: TextDocument, position: Position): Promise<Hover | null> {
    try {
      const symbol = this.getSymbolAtPosition(document, position);
      if (!symbol) {
        return null;
      }

      const symbolRange = this.getSymbolRange(document, position, symbol);
      if (!symbolRange) {
        return null;
      }

      // First try to find local definition
      const localHover = await this.getLocalHover(document, symbol, position);
      if (localHover) {
        return {
          contents: localHover,
          range: symbolRange,
        };
      }

      // Then try to find imported definition
      const importedHover = await this.getImportedHover(document, symbol);
      if (importedHover) {
        return {
          contents: importedHover,
          range: symbolRange,
        };
      }

      // If no specific hover found, provide basic information
      const basicHover = this.getBasicHover(symbol);
      if (basicHover) {
        return {
          contents: basicHover,
          range: symbolRange,
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
  private getSymbolRange(
    document: TextDocument,
    position: Position,
    symbol: string,
  ): SymbolRange | null {
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
        end: { line: position.line, character: symbolIndex + symbol.length },
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
    _position: Position,
  ): Promise<MarkupContent | null> {
    const content = document.getText();
    const parseResult = await this.parser.parse(content, document.uri);
    if (!parseResult.success) {
      return null;
    }
    const rclDocument = parseResult.value;

    // Find the symbol definition in the AST
    if (!rclDocument.ast) {
      return null;
    }
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
    symbol: string,
  ): Promise<MarkupContent | null> {
    // Get symbol from workspace index
    const symbolLocations = this.workspaceIndex.findSymbol(symbol);
    const externalSymbols = symbolLocations.filter((loc) => loc.uri !== document.uri);

    if (externalSymbols.length === 0) {
      return null;
    }

    // Use the first external symbol found
    const symbolLoc = externalSymbols[0];

    try {
      // Parse the external file to get full definition context
      const externalContent = fs.readFileSync(symbolLoc.uri, 'utf-8');
      const parseResult = await this.parser.parse(externalContent, symbolLoc.uri);
      if (!parseResult.success) {
        return null;
      }
      const externalDocument = parseResult.value;

      if (!externalDocument.ast) {
        return null;
      }
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
  private getBasicHover(symbol: string): MarkupContent {
    return {
      kind: 'markdown',
      value: `**Symbol:** \`${symbol}\`\n\n*No definition found*`,
    };
  }

  /**
   * Find symbol definition in AST
   */
  private findSymbolDefinitionInAST(ast: BaseNode, symbol: string): BaseNode | null {
    if (!ast) return null;

    let definition: BaseNode | null = null;

    walkAST(ast, (node: BaseNode) => {
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
  private createHoverContent(definition: BaseNode, symbol: string): MarkupContent {
    const symbolType = this.getSymbolTypeFromNode(definition);
    let content = `**${this.capitalizeSymbolType(symbolType)}:** \`${symbol}\`\n\n`;

    // Add type-specific information
    switch (symbolType) {
      case SymbolType.Agent:
        if (isAgentNode(definition)) {
          content += this.createAgentHover(definition);
        }
        break;
      case SymbolType.Flow:
        if (isFlowNode(definition)) {
          content += this.createFlowHover(definition);
        }
        break;
      case SymbolType.Message:
        if (isMessageNode(definition)) {
          content += this.createMessageHover(definition);
        }
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
      value: content,
    };
  }

  /**
   * Create hover content for agent definitions
   */
  private createAgentHover(definition: AgentNode): string {
    let content = '';

    if (definition.name) {
      content += `**Name:** ${definition.name}\n`;
    }
    if (definition.displayName) {
      content += `**Display Name:** ${definition.displayName}\n`;
    }
    if (definition.description) {
      content += `**Description:** ${definition.description}\n`;
    }

    // List flows associated with this agent
    const flows = definition.flows?.map((f) => f.name || 'unnamed') || [];
    if (flows.length > 0) {
      content += `\n**Flows:** ${flows.join(', ')}\n`;
    }

    return content;
  }

  /**
   * Create hover content for flow definitions
   */
  private createFlowHover(definition: FlowNode): string {
    let content = '';

    // Extract flow states
    const states = definition.states?.map((s) => s.name || 'unnamed') || [];
    const transitions: FlowTransition[] = [];

    // Extract transitions from states
    for (const state of definition.states || []) {
      for (const transition of state.transitions || []) {
        transitions.push({
          from: state.name || 'unnamed',
          to: transition.to,
        });
      }
    }

    if (states.length > 0) {
      content += `**States:** ${states.join(', ')}\n`;
    }

    if (transitions.length > 0) {
      content += '**Transitions:**\n';
      for (const transition of transitions) {
        content += `- ${transition.from} → ${transition.to}\n`;
      }
    }

    return content;
  }

  /**
   * Create hover content for message definitions
   */
  private createMessageHover(definition: MessageNode): string {
    let content = '';

    // Extract message content
    if (definition.content && isStringNode(definition.content)) {
      content += `**Content:** "${definition.content.value}"\n`;
    }

    // Extract message type
    if (definition.messageType) {
      content += `**Type:** ${definition.messageType}\n`;
    }

    return content;
  }

  /**
   * Create hover content for property definitions
   */
  private createPropertyHover(_definition: BaseNode): string {
    let content = '';

    // For properties in the current AST structure, we need to extract value info
    // This would depend on the specific node structure
    content += '**Property Definition**\n';

    return content;
  }

  /**
   * Create generic hover content
   */
  private createGenericHover(_definition: BaseNode): string {
    return '**Definition found**\n\nNo additional information available.';
  }

  /**
   * Extract documentation comments from around a definition
   */
  private extractDocumentation(_definition: BaseNode): string | null {
    // For now, return null - documentation extraction would need
    // to look at preceding comment nodes in the AST
    return null;
  }

  /**
   * Get symbol type from AST node
   */
  private getSymbolTypeFromNode(node: BaseNode): SymbolType {
    switch (node.type) {
      case 'agent_definition':
        return SymbolType.Agent;
      case 'flow_definition':
        return SymbolType.Flow;
      case 'message_definition':
        return SymbolType.Message;
      default:
        return SymbolType.Property;
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
  private isDefinitionNode(node: BaseNode): boolean {
    return ['agent_definition', 'flow_definition', 'message_definition', 'property'].includes(
      node.type,
    );
  }

  /**
   * Extract name from a definition node
   */
  private extractNodeName(node: BaseNode): string {
    // Type-safe name extraction
    if (isAgentNode(node)) {
      return node.name || '';
    }
    if (isFlowNode(node)) {
      return node.name || '';
    }
    if (isMessageNode(node)) {
      return node.name || '';
    }
    if (isStateNode(node)) {
      return node.name || '';
    }

    // Fallback for other node types that might have text
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
}
