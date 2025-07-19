import type { RCLParser } from '@rcs-lang/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { SemanticTokens, SemanticTokensLegend } from 'vscode-languageserver/node';

export class SemanticTokensProvider {
  private legend: SemanticTokensLegend;

  constructor(private parser: RCLParser) {
    this.legend = {
      tokenTypes: [
        'namespace',
        'type',
        'class',
        'enum',
        'interface',
        'struct',
        'typeParameter',
        'parameter',
        'variable',
        'property',
        'enumMember',
        'event',
        'function',
        'method',
        'macro',
        'keyword',
        'modifier',
        'comment',
        'string',
        'number',
        'regexp',
        'operator',
      ],
      tokenModifiers: [
        'declaration',
        'definition',
        'readonly',
        'static',
        'deprecated',
        'abstract',
        'async',
        'modification',
        'documentation',
        'defaultLibrary',
      ],
    };
  }

  public getLegend(): SemanticTokensLegend {
    return this.legend;
  }

  public async getSemanticTokens(_document: TextDocument): Promise<SemanticTokens> {
    // Basic semantic tokens - return empty for now
    return { data: [] };
  }
}
