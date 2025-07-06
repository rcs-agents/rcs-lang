import { Definition, Position, Location } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '@rcl/parser';

export class DefinitionProvider {
  constructor(private parser: RCLParser) {}

  public async getDefinition(document: TextDocument, position: Position): Promise<Definition | null> {
    // Basic implementation - can be enhanced later
    return null;
  }
}