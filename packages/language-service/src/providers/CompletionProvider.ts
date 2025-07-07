import { RCLParser } from '@rcl/parser';
import { ImportResolver } from '../import-resolver';
import { WorkspaceIndex } from '../workspace-index';
import { SymbolType } from '../import-resolver/types';
import { TextDocument, Position } from './types';
import path from 'node:path';

/**
 * Completion item kinds
 */
export enum CompletionItemKind {
  Text = 1,
  Method = 2,
  Function = 3,
  Constructor = 4,
  Field = 5,
  Variable = 6,
  Class = 7,
  Interface = 8,
  Module = 9,
  Property = 10,
  Unit = 11,
  Value = 12,
  Enum = 13,
  Keyword = 14,
  Snippet = 15,
  Color = 16,
  File = 17,
  Reference = 18,
  Folder = 19,
  EnumMember = 20,
  Constant = 21,
  Struct = 22,
  Event = 23,
  Operator = 24,
  TypeParameter = 25
}

/**
 * Represents a completion item
 */
export interface CompletionItem {
  /** The label displayed in the completion list */
  label: string;
  /** The kind of completion item */
  kind: CompletionItemKind;
  /** Optional detail information */
  detail?: string;
  /** Documentation or description */
  documentation?: string;
  /** Text to insert when selected */
  insertText?: string;
  /** Range to replace when inserting */
  textEdit?: {
    range: {
      start: { line: number; character: number };
      end: { line: number; character: number };
    };
    newText: string;
  };
  /** Additional text edits to apply */
  additionalTextEdits?: Array<{
    range: {
      start: { line: number; character: number };
      end: { line: number; character: number };
    };
    newText: string;
  }>;
  /** Sort priority (lower values appear first) */
  sortText?: string;
  /** Filter text for matching */
  filterText?: string;
}

/**
 * Completion list with metadata
 */
export interface CompletionList {
  /** Whether the list is incomplete */
  isIncomplete: boolean;
  /** The completion items */
  items: CompletionItem[];
}

/**
 * Context for completion requests
 */
interface CompletionContext {
  /** The trigger character that caused completion */
  triggerCharacter?: string;
  /** Current line content */
  lineContent: string;
  /** Prefix being completed */
  prefix: string;
  /** Position of the trigger */
  position: Position;
  /** Whether we're inside a string */
  inString: boolean;
  /** Whether we're inside a comment */
  inComment: boolean;
  /** Current scope context */
  scope: 'root' | 'agent' | 'flow' | 'property' | 'transition';
  /** Parent element type if in nested context */
  parentType?: SymbolType;
  /** Available symbols in current scope */
  availableSymbols: string[];
}

/**
 * Provides context-aware code completion for RCL
 */
export class CompletionProvider {
  private parser: RCLParser;
  private importResolver: ImportResolver;
  private workspaceIndex: WorkspaceIndex;

  // RCL keywords by context
  private readonly keywords = {
    root: ['agent', 'flow', 'import'],
    agent: ['name', 'brandName', 'displayName', 'timeout', 'enabled'],
    flow: ['start'],
    property: [],
    transition: ['->']
  };

  // Built-in property types and values
  private readonly propertyValues: Record<string, string[]> = {
    enabled: ['true', 'false'],
    timeout: ['30', '60', '120', '300'],
    brandName: [],
    name: [],
    displayName: []
  };

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
   * Provide completion items for the given position
   */
  async provideCompletion(
    document: TextDocument,
    position: Position,
    triggerCharacter?: string
  ): Promise<CompletionList> {
    try {
      const context = this.analyzeCompletionContext(document, position, triggerCharacter);
      const completions: CompletionItem[] = [];

      // Skip completion in comments
      if (context.inComment) {
        return { isIncomplete: false, items: [] };
      }

      // Provide different completions based on context
      switch (context.scope) {
        case 'root':
          completions.push(...this.provideRootCompletions(context));
          completions.push(...await this.provideImportCompletions(document, context));
          break;

        case 'agent':
          completions.push(...this.provideAgentCompletions(context));
          break;

        case 'flow':
          completions.push(...this.provideFlowCompletions(context));
          completions.push(...await this.provideSymbolCompletions(document, context));
          break;

        case 'property':
          completions.push(...this.providePropertyCompletions(context));
          break;

        case 'transition':
          completions.push(...this.provideTransitionCompletions(context));
          completions.push(...await this.provideSymbolCompletions(document, context));
          break;
      }

      // Add snippet completions
      completions.push(...this.provideSnippetCompletions(context));

      // Filter and sort completions
      const filteredCompletions = this.filterCompletions(completions, context.prefix);
      
      return {
        isIncomplete: false,
        items: filteredCompletions
      };
    } catch (error) {
      console.error('Error providing completion:', error);
      return { isIncomplete: false, items: [] };
    }
  }

  /**
   * Analyze the completion context at the given position
   */
  private analyzeCompletionContext(
    document: TextDocument,
    position: Position,
    triggerCharacter?: string
  ): CompletionContext {
    const content = document.getText();
    const lines = content.split('\n');
    const currentLine = lines[position.line] || '';
    const beforeCursor = currentLine.substring(0, position.character);
    
    // Extract prefix (word being typed)
    const prefixMatch = beforeCursor.match(/[\w]*$/);
    const prefix = prefixMatch ? prefixMatch[0] : '';

    // Check if we're in a string or comment
    const inString = this.isInString(beforeCursor);
    const inComment = this.isInComment(beforeCursor);

    // Determine scope based on indentation and context
    const scope = this.determineScope(lines, position.line);
    
    // Find available symbols in current document
    const availableSymbols = this.extractAvailableSymbols(content);

    return {
      triggerCharacter,
      lineContent: currentLine,
      prefix,
      position,
      inString,
      inComment,
      scope,
      availableSymbols
    };
  }

  /**
   * Provide completions for root level (agents, flows, imports)
   */
  private provideRootCompletions(context: CompletionContext): CompletionItem[] {
    const completions: CompletionItem[] = [];

    // Root level keywords
    this.keywords.root.forEach(keyword => {
      completions.push({
        label: keyword,
        kind: CompletionItemKind.Keyword,
        detail: `${keyword} definition`,
        documentation: this.getKeywordDocumentation(keyword),
        insertText: keyword,
        sortText: `0_${keyword}`
      });
    });

    return completions;
  }

  /**
   * Provide completions for agent context
   */
  private provideAgentCompletions(context: CompletionContext): CompletionItem[] {
    const completions: CompletionItem[] = [];

    // Agent properties
    this.keywords.agent.forEach(property => {
      const detail = this.getPropertyDetail(property);
      const insertText = this.getPropertyInsertText(property);
      
      completions.push({
        label: property,
        kind: CompletionItemKind.Property,
        detail,
        documentation: this.getPropertyDocumentation(property),
        insertText,
        sortText: `1_${property}`
      });
    });

    return completions;
  }

  /**
   * Provide completions for flow context
   */
  private provideFlowCompletions(context: CompletionContext): CompletionItem[] {
    const completions: CompletionItem[] = [];

    // Flow keywords
    this.keywords.flow.forEach(keyword => {
      completions.push({
        label: keyword,
        kind: CompletionItemKind.Keyword,
        detail: `${keyword} state`,
        documentation: this.getKeywordDocumentation(keyword),
        insertText: keyword,
        sortText: `0_${keyword}`
      });
    });

    // State names from current flow
    context.availableSymbols.forEach(symbol => {
      if (this.isStateSymbol(symbol)) {
        completions.push({
          label: symbol,
          kind: CompletionItemKind.Variable,
          detail: 'Flow state',
          documentation: `Reference to state '${symbol}'`,
          insertText: symbol,
          sortText: `2_${symbol}`
        });
      }
    });

    return completions;
  }

  /**
   * Provide completions for property values
   */
  private providePropertyCompletions(context: CompletionContext): CompletionItem[] {
    const completions: CompletionItem[] = [];

    // Extract property name from current line
    const propertyMatch = context.lineContent.match(/(\w+)\s*:\s*/);
    const propertyName = propertyMatch ? propertyMatch[1] : '';

    if (this.propertyValues[propertyName]) {
      this.propertyValues[propertyName].forEach(value => {
        completions.push({
          label: value,
          kind: CompletionItemKind.Value,
          detail: `${propertyName} value`,
          insertText: `"${value}"`,
          sortText: `0_${value}`
        });
      });
    }

    return completions;
  }

  /**
   * Provide completions for transitions
   */
  private provideTransitionCompletions(context: CompletionContext): CompletionItem[] {
    const completions: CompletionItem[] = [];

    // Transition operator
    if (context.lineContent.includes('->') === false) {
      completions.push({
        label: '->',
        kind: CompletionItemKind.Operator,
        detail: 'Transition operator',
        documentation: 'Creates a transition between states',
        insertText: '-> ',
        sortText: '0_transition'
      });
    }

    return completions;
  }

  /**
   * Provide symbol completions from workspace
   */
  private async provideSymbolCompletions(
    document: TextDocument,
    context: CompletionContext
  ): Promise<CompletionItem[]> {
    const completions: CompletionItem[] = [];

    try {
      // Get symbols by type from workspace
      const symbolTypes = [SymbolType.Agent, SymbolType.Flow, SymbolType.Message, SymbolType.Property];
      
      for (const symbolType of symbolTypes) {
        const symbols = this.workspaceIndex.getSymbolsByType(symbolType);
        
        symbols.forEach(symbolLocation => {
          // Skip symbols from current document (already handled locally)
          if (symbolLocation.uri === document.uri) {
            return;
          }

          const kind = this.getCompletionKindForSymbolType(symbolLocation.symbol.type);
          completions.push({
            label: symbolLocation.symbol.name,
            kind,
            detail: `${symbolLocation.symbol.type} from ${this.getRelativeFilePath(symbolLocation.uri)}`,
            documentation: `Reference to ${symbolLocation.symbol.type} '${symbolLocation.symbol.name}'`,
            insertText: symbolLocation.symbol.name,
            sortText: `3_${symbolLocation.symbol.name}`
          });
        });
      }
    } catch (error) {
      console.error('Error getting workspace symbols:', error);
    }

    return completions;
  }

  /**
   * Provide import path completions
   */
  private async provideImportCompletions(
    document: TextDocument,
    context: CompletionContext
  ): Promise<CompletionItem[]> {
    const completions: CompletionItem[] = [];

    // Only provide import completions if we're typing an import
    if (!context.lineContent.startsWith('import ')) {
      return completions;
    }

    try {
      // Get unique file URIs from all symbol types
      const allFiles = new Set<string>();
      const symbolTypes = [SymbolType.Agent, SymbolType.Flow, SymbolType.Message, SymbolType.Property];
      
      for (const symbolType of symbolTypes) {
        const symbols = this.workspaceIndex.getSymbolsByType(symbolType);
        symbols.forEach(symbol => {
          if (symbol.uri !== document.uri && symbol.uri.endsWith('.rcl')) {
            allFiles.add(symbol.uri);
          }
        });
      }

      allFiles.forEach(filePath => {
        const relativePath = this.getRelativeImportPath(document.uri, filePath);
        completions.push({
          label: relativePath,
          kind: CompletionItemKind.File,
          detail: 'RCL file',
          documentation: `Import symbols from ${relativePath}`,
          insertText: relativePath,
          sortText: `1_${relativePath}`
        });
      });
    } catch (error) {
      console.error('Error getting import completions:', error);
    }

    return completions;
  }

  /**
   * Provide snippet completions
   */
  private provideSnippetCompletions(context: CompletionContext): CompletionItem[] {
    const completions: CompletionItem[] = [];

    if (context.scope === 'root') {
      // Agent snippet
      completions.push({
        label: 'agent',
        kind: CompletionItemKind.Snippet,
        detail: 'Agent template',
        documentation: 'Create a new agent definition',
        insertText: `agent \${1:AgentName}\n  name: "\${2:Agent Name}"\n  brandName: "\${3:Brand Name}"\n  displayName: "\${4:Display Name}"`,
        sortText: '0_agent_snippet'
      });

      // Flow snippet
      completions.push({
        label: 'flow',
        kind: CompletionItemKind.Snippet,
        detail: 'Flow template',
        documentation: 'Create a new flow definition',
        insertText: `flow \${1:FlowName}\n  start -> \${2:initialState}\n  \${2:initialState}: "\${3:Initial message}"\n  \${2:initialState} -> end\n  end: "\${4:End message}"`,
        sortText: '0_flow_snippet'
      });
    }

    return completions;
  }

  /**
   * Filter completions based on prefix
   */
  private filterCompletions(completions: CompletionItem[], prefix: string): CompletionItem[] {
    if (!prefix) {
      return completions;
    }

    const lowerPrefix = prefix.toLowerCase();
    return completions.filter(item => 
      item.label.toLowerCase().startsWith(lowerPrefix) ||
      (item.filterText && item.filterText.toLowerCase().includes(lowerPrefix))
    );
  }

  /**
   * Determine the current scope based on line position and indentation
   */
  private determineScope(lines: string[], lineIndex: number): CompletionContext['scope'] {
    // Look backwards to find the current context
    for (let i = lineIndex; i >= 0; i--) {
      const line = lines[i];
      if (!line) continue; // Skip undefined or empty lines
      
      const trimmed = line.trim();
      
      if (trimmed.startsWith('agent ')) {
        return 'agent';
      } else if (trimmed.startsWith('flow ')) {
        return 'flow';
      } else if (trimmed.includes('->')) {
        return 'transition';
      } else if (trimmed.includes(':') && !trimmed.startsWith('import ')) {
        return 'property';
      }
    }

    return 'root';
  }

  /**
   * Check if position is inside a string
   */
  private isInString(text: string): boolean {
    const quotes = text.match(/["']/g);
    return quotes ? quotes.length % 2 === 1 : false;
  }

  /**
   * Check if position is inside a comment
   */
  private isInComment(text: string): boolean {
    return text.includes('//') || text.includes('#');
  }

  /**
   * Extract available symbols from document content
   */
  private extractAvailableSymbols(content: string): string[] {
    const symbols: string[] = [];
    const lines = content.split('\n');

    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Extract agent names
      const agentMatch = trimmed.match(/^agent\s+(\w+)/);
      if (agentMatch) {
        symbols.push(agentMatch[1]);
      }

      // Extract flow names
      const flowMatch = trimmed.match(/^flow\s+(\w+)/);
      if (flowMatch) {
        symbols.push(flowMatch[1]);
      }

      // Extract state names
      const stateMatch = trimmed.match(/^(\w+):\s*/);
      if (stateMatch && !line.includes('agent') && !line.includes('flow')) {
        symbols.push(stateMatch[1]);
      }
    });

    return symbols;
  }

  /**
   * Check if symbol is a state name
   */
  private isStateSymbol(symbol: string): boolean {
    // Simple heuristic - state symbols are typically lowercase
    return symbol === symbol.toLowerCase() && symbol !== 'start' && symbol !== 'end';
  }

  /**
   * Get completion kind for symbol type
   */
  private getCompletionKindForSymbolType(symbolType: SymbolType): CompletionItemKind {
    switch (symbolType) {
      case SymbolType.Agent:
        return CompletionItemKind.Class;
      case SymbolType.Flow:
        return CompletionItemKind.Function;
      case SymbolType.Message:
        return CompletionItemKind.Value;
      case SymbolType.Property:
        return CompletionItemKind.Property;
      default:
        return CompletionItemKind.Variable;
    }
  }

  /**
   * Get keyword documentation
   */
  private getKeywordDocumentation(keyword: string): string {
    const docs: Record<string, string> = {
      agent: 'Defines a conversational agent with properties and configuration',
      flow: 'Defines a conversation flow with states and transitions',
      import: 'Imports symbols from another RCL file',
      start: 'Initial state of a flow'
    };
    return docs[keyword] || `${keyword} keyword`;
  }

  /**
   * Get property documentation
   */
  private getPropertyDocumentation(property: string): string {
    const docs: Record<string, string> = {
      name: 'The internal name of the agent',
      brandName: 'The brand name displayed to users',
      displayName: 'The display name shown in conversations',
      timeout: 'Session timeout in seconds',
      enabled: 'Whether the agent is enabled'
    };
    return docs[property] || `${property} property`;
  }

  /**
   * Get property detail information
   */
  private getPropertyDetail(property: string): string {
    const details: Record<string, string> = {
      name: 'string',
      brandName: 'string',
      displayName: 'string',
      timeout: 'number',
      enabled: 'boolean'
    };
    return details[property] || 'property';
  }

  /**
   * Get property insert text with placeholder
   */
  private getPropertyInsertText(property: string): string {
    const templates: Record<string, string> = {
      name: 'name: "${1:Agent Name}"',
      brandName: 'brandName: "${1:Brand Name}"',
      displayName: 'displayName: "${1:Display Name}"',
      timeout: 'timeout: ${1:30}',
      enabled: 'enabled: ${1:true}'
    };
    return templates[property] || `${property}: "\${1:value}"`;
  }

  /**
   * Get relative file path for display
   */
  private getRelativeFilePath(uri: string): string {
    return path.basename(uri);
  }

  /**
   * Get relative import path between two files
   */
  private getRelativeImportPath(fromUri: string, toUri: string): string {
    let relativePath = path.relative(path.dirname(fromUri), toUri);
    
    // Remove .rcl extension for imports
    if (relativePath.endsWith('.rcl')) {
      relativePath = relativePath.slice(0, -4);
    }
    
    // Ensure relative path starts with ./ for relative imports
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    
    return relativePath;
  }
}