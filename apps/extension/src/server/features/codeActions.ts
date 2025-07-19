import type { RCLParser } from '@rcs-lang/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import {
  type CodeAction,
  CodeActionKind,
  type CodeActionParams,
  Command,
  type Diagnostic,
  DiagnosticSeverity,
  type Position,
  type Range,
  type TextEdit,
  WorkspaceEdit,
} from 'vscode-languageserver/node';

export class CodeActionProvider {
  constructor(private parser: RCLParser) { }

  /**
   * Provide code actions for the given range and context
   */
  public async getCodeActions(
    document: TextDocument,
    params: CodeActionParams,
  ): Promise<CodeAction[]> {
    const codeActions: CodeAction[] = [];
    const { context, range } = params;

    // Process diagnostics in the range
    for (const diagnostic of context.diagnostics) {
      const actions = await this.getActionsForDiagnostic(document, range, diagnostic);
      codeActions.push(...actions);
    }

    // Add refactoring actions
    const refactorings = await this.getRefactoringActions(document, range);
    codeActions.push(...refactorings);

    return codeActions;
  }

  /**
   * Get code actions for a specific diagnostic
   */
  private async getActionsForDiagnostic(
    document: TextDocument,
    range: Range,
    diagnostic: Diagnostic,
  ): Promise<CodeAction[]> {
    const actions: CodeAction[] = [];

    // Parse diagnostic message to determine the type of error
    const message = diagnostic.message.toLowerCase();

    if (message.includes('undefined') || message.includes('not found')) {
      // Handle undefined symbol errors
      const symbolName = this.extractSymbolName(document, diagnostic.range);
      if (symbolName) {
        // Create missing message
        if (message.includes('message')) {
          actions.push(this.createMissingMessageAction(document, symbolName));
        }
        // Create missing flow
        else if (message.includes('flow')) {
          actions.push(this.createMissingFlowAction(document, symbolName));
        }
        // Import missing symbol
        else {
          actions.push(this.createImportAction(document, symbolName));
        }
      }
    } else if (message.includes('invalid')) {
      // Handle invalid syntax errors
      if (message.includes('transition')) {
        actions.push(this.fixInvalidTransitionAction(document, diagnostic.range));
      }
    }

    return actions;
  }

  /**
   * Get refactoring actions for the selected range
   */
  private async getRefactoringActions(document: TextDocument, range: Range): Promise<CodeAction[]> {
    const actions: CodeAction[] = [];

    // Check what's selected
    const selectedText = document.getText(range);

    // Convert text message to rich card
    if (this.isTextMessage(document, range)) {
      actions.push(this.convertToRichCardAction(document, range));
    }

    // Extract inline message to Messages section
    if (this.isInlineMessage(document, range)) {
      actions.push(this.extractMessageAction(document, range));
    }

    return actions;
  }

  /**
   * Create an action to add a missing import
   */
  private createImportAction(document: TextDocument, symbolName: string): CodeAction {
    const action: CodeAction = {
      title: `Import '${symbolName}'`,
      kind: CodeActionKind.QuickFix,
      edit: {
        changes: {
          [document.uri]: [
            {
              range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
              newText: `import ${symbolName} from "./${symbolName.toLowerCase()}"\n\n`,
            },
          ],
        },
      },
    };
    return action;
  }

  /**
   * Create an action to create a missing message
   */
  private createMissingMessageAction(document: TextDocument, messageName: string): CodeAction {
    // Find the messages section
    const messagesSection = this.findMessagesSection(document);

    const action: CodeAction = {
      title: `Create message '${messageName}'`,
      kind: CodeActionKind.QuickFix,
      edit: {
        changes: {
          [document.uri]: [],
        },
      },
    };

    if (messagesSection) {
      // Add to existing messages section
      const insertPosition = messagesSection.end;
      action.edit!.changes![document.uri].push({
        range: { start: insertPosition, end: insertPosition },
        newText: `    text ${messageName} "New message text"\n`,
      });
    } else {
      // Create new messages section
      const endOfFile = document.positionAt(document.getText().length);
      action.edit!.changes![document.uri].push({
        range: { start: endOfFile, end: endOfFile },
        newText: `\n  messages Messages\n    text ${messageName} "New message text"\n`,
      });
    }

    return action;
  }

  /**
   * Create an action to create a missing flow
   */
  private createMissingFlowAction(document: TextDocument, flowName: string): CodeAction {
    const action: CodeAction = {
      title: `Create flow '${flowName}'`,
      kind: CodeActionKind.QuickFix,
      edit: {
        changes: {
          [document.uri]: [],
        },
      },
    };

    // Find a good insertion point (after other flows or after agent definition)
    const insertPosition = this.findFlowInsertPosition(document);

    action.edit!.changes![document.uri].push({
      range: { start: insertPosition, end: insertPosition },
      newText: `\n  flow ${flowName}\n    start -> end\n`,
    });

    return action;
  }

  /**
   * Fix invalid transition syntax
   */
  private fixInvalidTransitionAction(document: TextDocument, range: Range): CodeAction {
    const lineText = document.getText({
      start: { line: range.start.line, character: 0 },
      end: { line: range.start.line + 1, character: 0 },
    });

    // Try to parse and fix the transition
    const fixedTransition = this.fixTransitionSyntax(lineText);

    return {
      title: 'Fix transition syntax',
      kind: CodeActionKind.QuickFix,
      edit: {
        changes: {
          [document.uri]: [
            {
              range: {
                start: { line: range.start.line, character: 0 },
                end: { line: range.start.line, character: lineText.length - 1 },
              },
              newText: fixedTransition,
            },
          ],
        },
      },
    };
  }

  /**
   * Convert text message to rich card
   */
  private convertToRichCardAction(document: TextDocument, range: Range): CodeAction {
    const messageText = document.getText(range);
    const messageName = this.extractMessageName(document, range);

    return {
      title: 'Convert to rich card',
      kind: CodeActionKind.RefactorRewrite,
      edit: {
        changes: {
          [document.uri]: [
            {
              range: this.expandToFullLine(document, range),
              newText: `    richCard ${messageName} "Card Title"\n      description: ${messageText}\n`,
            },
          ],
        },
      },
    };
  }

  /**
   * Extract inline message to Messages section
   */
  private extractMessageAction(document: TextDocument, range: Range): CodeAction {
    const messageContent = document.getText(range);
    const messageName = `extractedMessage${Date.now()}`;

    const messagesSection = this.findMessagesSection(document);
    const edits: TextEdit[] = [];

    // Replace inline message with reference
    edits.push({
      range,
      newText: messageName,
    });

    // Add to messages section
    if (messagesSection) {
      edits.push({
        range: { start: messagesSection.end, end: messagesSection.end },
        newText: `    text ${messageName} ${messageContent}\n`,
      });
    } else {
      const endOfFile = document.positionAt(document.getText().length);
      edits.push({
        range: { start: endOfFile, end: endOfFile },
        newText: `\n  messages Messages\n    text ${messageName} ${messageContent}\n`,
      });
    }

    return {
      title: 'Extract message to Messages section',
      kind: CodeActionKind.RefactorExtract,
      edit: {
        changes: {
          [document.uri]: edits,
        },
      },
    };
  }

  // Helper methods

  private extractSymbolName(document: TextDocument, range: Range): string | null {
    const text = document.getText(range);
    const match = text.match(/\b(\w+)\b/);
    return match ? match[1] : null;
  }

  private findMessagesSection(document: TextDocument): Range | null {
    const text = document.getText();
    const messagesMatch = text.match(/^\s*messages\s+Messages\s*$/m);

    if (messagesMatch && messagesMatch.index !== undefined) {
      const startPos = document.positionAt(messagesMatch.index);
      // Find the end of the messages section (next dedent or end of file)
      const lines = text.split('\n');
      let endLine = startPos.line + 1;
      const baseIndent = lines[startPos.line].match(/^\s*/)?.[0].length || 0;

      while (endLine < lines.length) {
        const line = lines[endLine];
        const lineIndent = line.match(/^\s*/)?.[0].length || 0;
        if (line.trim() && lineIndent <= baseIndent) {
          break;
        }
        endLine++;
      }

      return {
        start: startPos,
        end: { line: endLine - 1, character: lines[endLine - 1].length },
      };
    }

    return null;
  }

  private findFlowInsertPosition(document: TextDocument): Position {
    const text = document.getText();
    const lines = text.split('\n');

    // Find the last flow definition
    let lastFlowLine = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^\s*flow\s+\w+/)) {
        lastFlowLine = i;
      }
    }

    if (lastFlowLine >= 0) {
      // Find the end of this flow
      let endLine = lastFlowLine + 1;
      const baseIndent = lines[lastFlowLine].match(/^\s*/)?.[0].length || 0;

      while (endLine < lines.length) {
        const line = lines[endLine];
        const lineIndent = line.match(/^\s*/)?.[0].length || 0;
        if (line.trim() && lineIndent <= baseIndent) {
          break;
        }
        endLine++;
      }

      return { line: endLine - 1, character: lines[endLine - 1].length };
    }

    // If no flows found, insert after agent definition
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^\s*agent\s+\w+/)) {
        // Find next line with content at same or lower indentation
        let j = i + 1;
        const baseIndent = lines[i].match(/^\s*/)?.[0].length || 0;

        while (j < lines.length) {
          const line = lines[j];
          const lineIndent = line.match(/^\s*/)?.[0].length || 0;
          if (line.trim() && lineIndent <= baseIndent) {
            return { line: j - 1, character: lines[j - 1].length };
          }
          j++;
        }
      }
    }

    // Default to end of file
    return { line: lines.length - 1, character: lines[lines.length - 1].length };
  }

  private isTextMessage(document: TextDocument, range: Range): boolean {
    const line = document.getText({
      start: { line: range.start.line, character: 0 },
      end: { line: range.start.line + 1, character: 0 },
    });
    return /^\s*text\s+\w+\s+"/.test(line);
  }

  private isInlineMessage(document: TextDocument, range: Range): boolean {
    const text = document.getText(range);
    return text.startsWith('"') && text.endsWith('"');
  }

  private extractMessageName(document: TextDocument, range: Range): string {
    const line = document.getText({
      start: { line: range.start.line, character: 0 },
      end: { line: range.start.line + 1, character: 0 },
    });
    const match = line.match(/^\s*text\s+(\w+)/);
    return match ? match[1] : 'message';
  }

  private expandToFullLine(document: TextDocument, range: Range): Range {
    return {
      start: { line: range.start.line, character: 0 },
      end: { line: range.end.line + 1, character: 0 },
    };
  }

  private fixTransitionSyntax(line: string): string {
    // Common transition syntax errors and fixes
    // "state1 -> state2 when condition" might be missing quotes
    let fixed = line;

    // Fix missing arrow
    fixed = fixed.replace(/(\w+)\s+(\w+)(?:\s+when)?/, '$1 -> $2');

    // Fix arrow syntax
    fixed = fixed.replace(/(\w+)\s*-+>\s*(\w+)/, '$1 -> $2');

    // Ensure proper spacing
    fixed = fixed.replace(/\s+/g, ' ').trim();

    return fixed;
  }
}
