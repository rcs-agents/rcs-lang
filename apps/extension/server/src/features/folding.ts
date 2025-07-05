import { FoldingRange, FoldingRangeKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '../parser/rclParser';

export class FoldingProvider {
  constructor(private parser: RCLParser) {}

  public async getFoldingRanges(document: TextDocument): Promise<FoldingRange[]> {
    const ranges: FoldingRange[] = [];
    const text = document.getText();
    const lines = text.split('\n');
    
    // Simple folding for agent and flow blocks
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('agent ') || line.startsWith('flow ') || line.startsWith('messages ')) {
        // Find the end of this block
        let endLine = i;
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j].trim();
          if (nextLine.startsWith('agent ') || nextLine.startsWith('flow ') || nextLine.startsWith('messages ') || j === lines.length - 1) {
            endLine = j - 1;
            break;
          }
          if (j === lines.length - 1) {
            endLine = j;
          }
        }
        
        if (endLine > i) {
          ranges.push({
            startLine: i,
            endLine: endLine,
            kind: FoldingRangeKind.Region
          });
        }
      }
    }
    
    return ranges;
  }
}