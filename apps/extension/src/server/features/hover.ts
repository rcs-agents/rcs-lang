import type { RCLParser } from '@rcs-lang/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { type Hover, MarkupKind, type Position } from 'vscode-languageserver/node';

export class HoverProvider {
  constructor(private parser: RCLParser) { }

  public async getHover(document: TextDocument, position: Position): Promise<Hover | null> {
    const line = document.getText({
      start: { line: position.line, character: 0 },
      end: { line: position.line + 1, character: 0 },
    });

    // Simple hover for RCL keywords
    if (line.includes('agent')) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: '## Agent\n\nDefines an RCS agent with its configuration and behavior.',
        },
      };
    }

    if (line.includes('flow')) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: '## Flow\n\nDefines a conversation flow with states and transitions.',
        },
      };
    }

    return null;
  }
}
