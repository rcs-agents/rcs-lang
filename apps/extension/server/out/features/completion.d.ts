import type { RCLParser } from '@rcs-lang/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { type CompletionItem, type Position } from 'vscode-languageserver/node';
export declare class CompletionProvider {
  private parser;
  constructor(parser: RCLParser);
  getCompletions(_document: TextDocument, _position: Position): Promise<CompletionItem[]>;
  resolveCompletion(item: CompletionItem): CompletionItem;
}
//# sourceMappingURL=completion.d.ts.map