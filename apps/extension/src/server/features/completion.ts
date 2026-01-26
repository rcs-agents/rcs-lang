import type { RCLParser } from '@rcs-lang/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import {
  type CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  MarkupKind,
  type Position,
} from 'vscode-languageserver/node';

export class CompletionProvider {
  constructor(private parser: RCLParser) {}

  public async getCompletions(
    _document: TextDocument,
    _position: Position,
  ): Promise<CompletionItem[]> {
    // Basic completion items for RCL
    return [
      {
        label: 'agent',
        kind: CompletionItemKind.Keyword,
        detail: 'Agent Definition',
        documentation: {
          kind: MarkupKind.Markdown,
          value: 'Define a new RCS agent',
        },
        insertText: 'agent ${1:AgentName}',
        insertTextFormat: InsertTextFormat.Snippet,
      },
      {
        label: 'flow',
        kind: CompletionItemKind.Keyword,
        detail: 'Flow Definition',
        documentation: 'Define a conversation flow',
        insertText: 'flow ${1:FlowName}',
        insertTextFormat: InsertTextFormat.Snippet,
      },
      {
        label: 'displayName',
        kind: CompletionItemKind.Property,
        detail: 'Agent Display Name',
        insertText: 'displayName: "${1:Name}"',
        insertTextFormat: InsertTextFormat.Snippet,
      },
    ];
  }

  public resolveCompletion(item: CompletionItem): CompletionItem {
    return item;
  }
}
