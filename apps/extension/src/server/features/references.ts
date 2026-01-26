import type { RCLParser } from '@rcs-lang/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { Location, Position, ReferenceContext } from 'vscode-languageserver/node';

export class ReferencesProvider {
  constructor(private parser: RCLParser) {}

  public async getReferences(
    _document: TextDocument,
    _position: Position,
    _context: ReferenceContext,
  ): Promise<Location[]> {
    // Basic implementation - can be enhanced later
    return [];
  }
}
