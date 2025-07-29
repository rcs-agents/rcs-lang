/**
 * Symbol extractor for RCL documents
 * Extracts structural symbols from the AST for use in document outline
 */

import type { RclFile, Section, Attribute, MatchCase, MatchBlock as MatchBlockType, Identifier, Value as AstValue } from '@rcs-lang/ast';
import { type ISymbol } from '@rcs-lang/core';
import { SymbolKind } from 'vscode-languageserver-types';

export interface SymbolExtractorOptions {
  /**
   * Include attribute symbols in the output
   */
  includeAttributes?: boolean;
  
  /**
   * Include match clause symbols
   */
  includeMatchClauses?: boolean;
}

/**
 * Extracts document symbols from an RCL AST
 */
export class RclSymbolExtractor {
  constructor(private options: SymbolExtractorOptions = {}) {
    this.options = {
      includeAttributes: true,
      includeMatchClauses: true,
      ...options
    };
  }

  /**
   * Extract symbols from an RCL file AST
   */
  extractSymbols(ast: RclFile | null): ISymbol[] {
    if (!ast || !ast.sections) {
      return [];
    }

    const symbols: ISymbol[] = [];

    for (const section of ast.sections) {
      const symbol = this.extractSectionSymbol(section);
      if (symbol) {
        symbols.push(symbol);
      }
    }

    return symbols;
  }

  /**
   * Extract symbol from a section node
   */
  private extractSectionSymbol(section: Section): ISymbol | null {
    const symbol: ISymbol = {
      name: this.getSectionName(section),
      // detail: this.getSectionDetail(section), // Not part of ISymbol interface
      kind: this.getSectionSymbolKind(section),
      range: section.location?.range || {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 }
      },
      selectionRange: section.location?.range || {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 }
      },
      children: []
    };

    // Extract child symbols
    if (section.body) {
      for (const item of section.body) {
        const childSymbol = this.extractBodyItemSymbol(item, section);
        if (childSymbol) {
          symbol.children!.push(childSymbol);
        }
      }
    }

    return symbol;
  }

  /**
   * Extract symbol from a body item
   */
  private extractBodyItemSymbol(item: any, parentSection: Section): ISymbol | null {
    // Handle nested sections
    if (item.type === 'Section') {
      return this.extractSectionSymbol(item);
    }

    // Handle attributes
    if (this.options.includeAttributes && item.type === 'Attribute') {
      return this.extractAttributeSymbol(item as Attribute);
    }

    // Handle match blocks
    if (this.options.includeMatchClauses && item.type === 'MatchBlock') {
      return this.extractMatchBlockSymbol(item as MatchBlockType);
    }

    // Handle simple values that could be state references
    if (item.type === 'Identifier' || item.type === 'VariableAccess') {
      return this.extractValueReferenceSymbol(item);
    }

    return null;
  }

  /**
   * Extract symbol from an attribute
   */
  private extractAttributeSymbol(attribute: Attribute): ISymbol {
    return {
      name: `${attribute.key}: ${this.getValuePreview(attribute.value)}`,
      kind: SymbolKind.Property,
      range: attribute.location?.range || {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 }
      },
      selectionRange: attribute.location?.range || {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 }
      }
    };
  }

  /**
   * Extract symbol from a match block
   */
  private extractMatchBlockSymbol(matchBlock: MatchBlockType): ISymbol {
    const children: ISymbol[] = [];

    // Add match cases as children
    if (matchBlock.cases) {
      for (const matchCase of matchBlock.cases) {
        const consequencePreview = matchCase.consequence.type === 'ContextualizedValue' 
          ? this.getValuePreview(matchCase.consequence.value)
          : matchCase.consequence.type === 'FlowTermination'
          ? `:${matchCase.consequence.result}`
          : 'Unknown';
          
        children.push({
          name: `${this.getCaseValuePreview(matchCase.value)} → ${consequencePreview}`,
          kind: SymbolKind.EnumMember,
          range: matchCase.location?.range || {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 }
          },
          selectionRange: matchCase.location?.range || {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 }
          }
        });
      }
    }

    return {
      name: `match ${this.getValuePreview(matchBlock.discriminant)}`,
      kind: SymbolKind.Function,
      range: matchBlock.location?.range || {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 }
      },
      selectionRange: matchBlock.location?.range || {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 }
      },
      children
    };
  }

  /**
   * Get preview for match case values
   */
  private getCaseValuePreview(value: any): string {
    if (typeof value === 'string' && value === 'default') {
      return ':default';
    }
    return this.getValuePreview(value);
  }

  /**
   * Extract symbol from a value reference
   */
  private extractValueReferenceSymbol(item: any): ISymbol | null {
    // For now, we don't create symbols for simple value references
    // This could be enhanced in the future to show state references
    return null;
  }

  /**
   * Extract symbol from a state transition - REMOVED
   */
  private extractStateTransitionSymbol_DEPRECATED(transition: any): ISymbol {
    return {
      name: `→ ${this.getValuePreview(transition.target)}`,
      kind: SymbolKind.Event,
      range: transition.location?.range || {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 }
      },
      selectionRange: transition.location?.range || {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 }
      }
    };
  }

  /**
   * Get section name for display
   */
  private getSectionName(section: Section): string {
    let name = section.sectionType;
    
    if (section.identifier) {
      name += ` ${section.identifier.value}`;
    }

    // Add parameter preview if present
    if (section.parameters && section.parameters.length > 0) {
      const params = section.parameters
        .map(p => this.getValuePreview(p.value))
        .join(', ');
      name += ` (${params})`;
    }

    return name;
  }

  /**
   * Get section detail text
   */
  private getSectionDetail(section: Section): string {
    // Map known section types to friendly names
    const sectionTypeMap: Record<string, string> = {
      'agent': 'RCS Agent',
      'flow': 'Conversation Flow',
      'messages': 'Message Definitions',
      'config': 'Configuration',
      'on': 'State Handler',
      'richCard': 'Rich Card',
      'text': 'Text Message',
      'carousel': 'Carousel'
    };

    return sectionTypeMap[section.sectionType] || section.sectionType;
  }

  /**
   * Get appropriate symbol kind for a section
   */
  private getSectionSymbolKind(section: Section): SymbolKind {
    // Map section types to VSCode symbol kinds
    const kindMap: Record<string, SymbolKind> = {
      'agent': SymbolKind.Class,
      'flow': SymbolKind.Method,
      'messages': SymbolKind.Namespace,
      'config': SymbolKind.Object,
      'on': SymbolKind.Event,
      'richCard': SymbolKind.Struct,
      'text': SymbolKind.String,
      'carousel': SymbolKind.Array
    };

    return kindMap[section.sectionType] || SymbolKind.Object;
  }

  /**
   * Get a short preview of a value for display
   */
  private getValuePreview(value: any, maxLength: number = 30): string {
    if (!value) return '';

    if (typeof value === 'string') {
      return value.length > maxLength 
        ? value.substring(0, maxLength - 3) + '...'
        : value;
    }

    if (value.type === 'StringLiteral') {
      const str = value.value || '';
      return `"${str.length > maxLength 
        ? str.substring(0, maxLength - 3) + '...'
        : str}"`;
    }

    if (value.type === 'Identifier') {
      return value.value || '';
    }

    if (value.type === 'Number') {
      return String(value.value);
    }

    if (value.type === 'Boolean') {
      return String(value.value);
    }

    if (value.type === 'Variable') {
      return value.name || '@variable';
    }

    if (value.type === 'PropertyAccess') {
      const base = value.object?.name || '@var';
      const props = value.properties?.join('.') || '';
      return props ? `${base}.${props}` : base;
    }

    if (value.type === 'TypeTag') {
      return `<${value.tagName} ${value.value || ''}>`;
    }

    return value.type || 'value';
  }
}