import type { RCLParser } from '@rcs-lang/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { type Definition, Location, type Position } from 'vscode-languageserver/node';

export class DefinitionProvider {
  constructor(private parser: RCLParser) {}

  public async getDefinition(
    _document: TextDocument,
    _position: Position,
  ): Promise<Definition | null> {
    // Basic implementation - can be enhanced later
    return null;
  }
}
