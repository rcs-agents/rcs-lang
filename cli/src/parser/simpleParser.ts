import { RCLNode, RCLDocument } from '../types';

export class SimpleRCLParser {
  parseDocument(content: string, uri: string): RCLDocument {
    const ast = this.mockParse(content);
    
    return {
      uri,
      version: 1,
      content,
      ast,
      imports: [],
      symbols: this.extractSymbols(ast),
      diagnostics: []
    };
  }

  private mockParse(text: string): RCLNode | null {
    const lines = text.split('\n');
    const mockNode: RCLNode = {
      type: 'source_file',
      text: text,
      startPosition: { row: 0, column: 0 },
      endPosition: { row: lines.length - 1, column: lines[lines.length - 1]?.length || 0 },
      children: [],
      parent: null
    };

    let currentSection: RCLNode | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      const indentLevel = this.getIndentLevel(line);
      
      // Top-level definitions (agent, flow, messages, etc.)
      if (indentLevel === 0) {
        if (trimmedLine.match(/^(agent|flow|messages|configuration|defaults|import)\s+/)) {
          const [keyword, ...nameParts] = trimmedLine.split(/\s+/);
          const name = nameParts.join(' ');
          
          currentSection = {
            type: `${keyword}_definition`,
            text: line,
            startPosition: { row: i, column: 0 },
            endPosition: { row: i, column: line.length },
            children: [],
            parent: mockNode,
            name: name
          };
          
          mockNode.children!.push(currentSection);
        }
      } 
      // Indented content within sections
      else if (currentSection && indentLevel > 0) {
        this.parseIndentedContent(currentSection, line, i, indentLevel);
      }
    }

    return mockNode;
  }

  private getIndentLevel(line: string): number {
    let indent = 0;
    for (const char of line) {
      if (char === ' ') {
        indent++;
      } else if (char === '\t') {
        indent += 2; // Treat tab as 2 spaces
      } else {
        break;
      }
    }
    return indent;
  }

  private parseIndentedContent(parent: RCLNode, line: string, lineNumber: number, indentLevel: number): void {
    const trimmedLine = line.trim();
    
    // Handle different types of indented content
    if (trimmedLine.includes(':') && !trimmedLine.includes('->')) {
      // Property or state definition
      const [key, ...valueParts] = trimmedLine.split(':');
      const value = valueParts.join(':').trim();
      
      const propertyNode: RCLNode = {
        type: 'property',
        text: line,
        startPosition: { row: lineNumber, column: 0 },
        endPosition: { row: lineNumber, column: line.length },
        children: [],
        parent: parent,
        name: key.trim(),
        value: value
      };
      
      parent.children!.push(propertyNode);
    } else if (trimmedLine.includes('->')) {
      // Flow transition
      const [from, to] = trimmedLine.split('->').map(s => s.trim());
      
      const transitionNode: RCLNode = {
        type: 'transition',
        text: line,
        startPosition: { row: lineNumber, column: 0 },
        endPosition: { row: lineNumber, column: line.length },
        children: [],
        parent: parent,
        from: from,
        to: to
      };
      
      parent.children!.push(transitionNode);
    } else if (trimmedLine.match(/^(text|transactional|promotional)\s+/)) {
      // Message shortcuts
      const parts = trimmedLine.split(/\s+/);
      const messageType = parts[0];
      const messageId = parts[1];
      const messageText = parts.slice(2).join(' ');
      
      const messageNode: RCLNode = {
        type: 'text_shortcut',
        text: line,
        startPosition: { row: lineNumber, column: 0 },
        endPosition: { row: lineNumber, column: line.length },
        children: [
          {
            type: 'keyword',
            text: messageType,
            startPosition: { row: lineNumber, column: 0 },
            endPosition: { row: lineNumber, column: messageType.length },
            children: [],
            parent: null
          },
          {
            type: 'identifier',
            text: messageId,
            startPosition: { row: lineNumber, column: messageType.length + 1 },
            endPosition: { row: lineNumber, column: messageType.length + 1 + messageId.length },
            children: [],
            parent: null
          },
          {
            type: 'string',
            text: messageText,
            startPosition: { row: lineNumber, column: trimmedLine.indexOf(messageText) },
            endPosition: { row: lineNumber, column: line.length },
            children: [],
            parent: null
          }
        ],
        parent: parent,
        name: messageId,
        value: messageText
      };
      
      parent.children!.push(messageNode);
    } else {
      // Generic content
      const contentNode: RCLNode = {
        type: 'content',
        text: line,
        startPosition: { row: lineNumber, column: 0 },
        endPosition: { row: lineNumber, column: line.length },
        children: [],
        parent: parent
      };
      
      parent.children!.push(contentNode);
    }
  }

  private extractSymbols(ast: RCLNode | null): any[] {
    if (!ast) return [];
    
    const symbols: any[] = [];
    this.traverseAST(ast, (node) => {
      if (node.type === 'agent_definition') {
        symbols.push({
          name: node.name || 'Unknown',
          kind: 'agent',
          range: this.nodeToRange(node),
          selectionRange: this.nodeToRange(node)
        });
      }
    });
    
    return symbols;
  }

  private traverseAST(node: RCLNode, callback: (node: RCLNode) => void): void {
    callback(node);
    if (node.children) {
      node.children.forEach(child => this.traverseAST(child, callback));
    }
  }

  private nodeToRange(node: RCLNode): any {
    return {
      start: {
        line: node.startPosition.row,
        character: node.startPosition.column
      },
      end: {
        line: node.endPosition.row,
        character: node.endPosition.column
      }
    };
  }
}