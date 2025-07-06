import { SemanticTokens, SemanticTokensLegend } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '@rcl/parser';

export class SemanticTokensProvider {
  private legend: SemanticTokensLegend;

  constructor(private parser: RCLParser) {
    this.legend = {
      tokenTypes: [
        'namespace', 'type', 'class', 'enum', 'interface', 'struct',
        'typeParameter', 'parameter', 'variable', 'property', 'enumMember',
        'event', 'function', 'method', 'macro', 'keyword', 'modifier',
        'comment', 'string', 'number', 'regexp', 'operator'
      ],
      tokenModifiers: [
        'declaration', 'definition', 'readonly', 'static', 'deprecated',
        'abstract', 'async', 'modification', 'documentation', 'defaultLibrary'
      ]
    };
  }

  public getLegend(): SemanticTokensLegend {
    return this.legend;
  }

  public async getSemanticTokens(document: TextDocument): Promise<SemanticTokens> {
    // Basic semantic tokens - return empty for now
    return { data: [] };
  }
}