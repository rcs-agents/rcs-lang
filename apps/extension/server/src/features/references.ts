import { Location, Position, ReferenceContext } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '@rcl/parser';

export class ReferencesProvider {
  constructor(private parser: RCLParser) {}

  public async getReferences(
    document: TextDocument,
    position: Position,
    context: ReferenceContext,
  ): Promise<Location[]> {
    // Basic implementation - can be enhanced later
    return [];
  }
}
