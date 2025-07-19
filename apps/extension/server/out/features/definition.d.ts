import type { RCLParser } from '@rcs-lang/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { type Definition, type Position } from 'vscode-languageserver/node';
export declare class DefinitionProvider {
  private parser;
  constructor(parser: RCLParser);
  getDefinition(_document: TextDocument, _position: Position): Promise<Definition | null>;
}
//# sourceMappingURL=definition.d.ts.map