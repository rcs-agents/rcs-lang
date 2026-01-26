import type { RCLParser } from '@rcl/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import {
  Connection,
  type Position,
  PrepareRenameParams,
  type Range,
  RenameParams,
  TextDocumentPositionParams,
  TextDocuments,
  TextEdit,
  type WorkspaceEdit,
} from 'vscode-languageserver/node';

export class RenameProvider {
  constructor(private parser: RCLParser) {}

  /**
   * Prepare rename - validate that the symbol can be renamed
   */
  public async prepareRename(
    document: TextDocument,
    position: Position,
  ): Promise<{ range: Range; placeholder: string } | null> {
    try {
      // For now, we'll use a simple text-based approach
      // In a full implementation, this would use the AST from the parser

      // Find the symbol at the position
      const symbol = this.findSymbolAtPosition(position, document);
      if (!symbol || !this.isRenameable(symbol)) {
        return null;
      }

      return {
        range: symbol.range,
        placeholder: symbol.name,
      };
    } catch (error) {
      console.error('Error preparing rename:', error);
      return null;
    }
  }

  /**
   * Provide rename edits
   */
  public async provideRenameEdits(
    document: TextDocument,
    position: Position,
    newName: string,
  ): Promise<WorkspaceEdit | null> {
    try {
      if (!this.isValidIdentifier(newName)) {
        return null;
      }

      // For now, we'll use a simple text-based approach
      // In a full implementation, this would use the AST from the parser

      // Find the symbol at the position
      const symbol = this.findSymbolAtPosition(position, document);
      if (!symbol || !this.isRenameable(symbol)) {
        return null;
      }

      // Find all references to this symbol
      const references = this.findAllReferences(document, symbol.name, symbol.type);

      // Create workspace edit
      const workspaceEdit: WorkspaceEdit = {
        changes: {
          [document.uri]: references.map((ref) => ({
            range: ref.range,
            newText: newName,
          })),
        },
      };

      return workspaceEdit;
    } catch (error) {
      console.error('Error providing rename edits:', error);
      return null;
    }
  }

  private findSymbolAtPosition(
    position: Position,
    document: TextDocument,
  ): { name: string; type: string; range: Range } | null {
    // This is a simplified implementation
    // In a real implementation, you would traverse the AST to find the exact symbol
    const offset = document.offsetAt(position);
    const text = document.getText();

    // Simple regex-based approach for now
    const wordPattern = /\b\w+\b/g;
    let match;

    while ((match = wordPattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      if (offset >= start && offset <= end) {
        const range = {
          start: document.positionAt(start),
          end: document.positionAt(end),
        };

        // Determine type based on context (simplified)
        let type = 'identifier';
        const lineText = document.getText(range);
        const prevText = text.substring(Math.max(0, start - 20), start);

        if (prevText.includes('agent')) type = 'agent';
        else if (prevText.includes('flow')) type = 'flow';
        else if (prevText.includes('text') || prevText.includes('richCard')) type = 'message';

        return {
          name: match[0],
          type,
          range,
        };
      }
    }

    return null;
  }

  private isRenameable(symbol: { type: string }): boolean {
    // Keywords and special identifiers cannot be renamed
    const nonRenameableTypes = ['keyword', 'builtin'];
    return !nonRenameableTypes.includes(symbol.type);
  }

  private isValidIdentifier(name: string): boolean {
    // RCL identifier rules
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  }

  private findAllReferences(
    document: TextDocument,
    symbolName: string,
    symbolType: string,
  ): { range: Range }[] {
    // This is a simplified implementation
    // In a real implementation, you would traverse the AST to find all references
    const references: { range: Range }[] = [];
    const text = document.getText();

    // Simple regex-based approach
    const pattern = new RegExp(`\\b${symbolName}\\b`, 'g');
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const start = document.positionAt(match.index);
      const end = document.positionAt(match.index + match[0].length);

      references.push({
        range: { start, end },
      });
    }

    return references;
  }
}
