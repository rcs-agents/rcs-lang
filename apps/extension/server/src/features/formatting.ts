import { TextEdit, FormattingOptions } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '../parser/rclParser';

export class FormattingProvider {
  constructor(private parser: RCLParser) {}

  public async formatDocument(document: TextDocument, options: FormattingOptions): Promise<TextEdit[]> {
    // Basic formatting - ensure consistent indentation
    const text = document.getText();
    const lines = text.split('\n');
    const formattedLines: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('agent') || trimmed.startsWith('flow') || trimmed.startsWith('messages')) {
        formattedLines.push(trimmed);
      } else if (trimmed.length > 0 && !trimmed.startsWith('#')) {
        // Indent content
        const indent = options.insertSpaces ? ' '.repeat(options.tabSize || 2) : '\t';
        formattedLines.push(indent + trimmed);
      } else {
        formattedLines.push(trimmed);
      }
    }
    
    const formattedText = formattedLines.join('\n');
    
    if (formattedText !== text) {
      return [{
        range: {
          start: { line: 0, character: 0 },
          end: { line: document.lineCount, character: 0 }
        },
        newText: formattedText
      }];
    }
    
    return [];
  }
}