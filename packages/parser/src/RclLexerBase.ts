import { CharStream, CommonToken, Lexer, Token } from 'antlr4ng';

export abstract class RclLexerBase extends Lexer {
  // Token type constants - these will match what's generated
  protected static readonly NEWLINE = 50;
  protected static readonly INDENT = 51;
  protected static readonly DEDENT = 52;

  private indentLengths: number[] = [0];
  private tokenQueue: Token[] = [];
  private lastSignificantToken: Token | null = null;
  private pendingNewline = false;

  nextToken(): Token {
    if (this.tokenQueue.length > 0) {
      return this.tokenQueue.shift()!;
    }

    const next = super.nextToken();

    // Track if we just saw a newline
    if (next.type === RclLexerBase.NEWLINE) {
      this.pendingNewline = true;
      this.tokenQueue.push(next);

      // Look ahead to find the next significant token
      const savedQueue = [...this.tokenQueue];
      const peekedTokens: Token[] = [];
      let significantToken: Token | null = null;

      // Peek ahead to find next significant token
      while (true) {
        const peeked = super.nextToken();
        peekedTokens.push(peeked);

        if (peeked.type === Token.EOF || this.isSignificantToken(peeked)) {
          if (peeked.type !== Token.EOF) {
            significantToken = peeked;
          }
          break;
        }
      }

      // Process indentation if we found a significant token
      if (significantToken) {
        const indentLength = significantToken.column;
        const previousIndent = this.indentLengths[this.indentLengths.length - 1];

        if (indentLength > previousIndent) {
          this.indentLengths.push(indentLength);
          this.tokenQueue.push(this.createToken(RclLexerBase.INDENT, '<indent>'));
        } else if (indentLength < previousIndent) {
          while (
            this.indentLengths.length > 1 &&
            indentLength < this.indentLengths[this.indentLengths.length - 1]
          ) {
            this.indentLengths.pop();
            this.tokenQueue.push(this.createToken(RclLexerBase.DEDENT, '<dedent>'));
          }
          // Adjust to the correct indentation level if needed
          if (
            this.indentLengths.length > 0 &&
            indentLength > this.indentLengths[this.indentLengths.length - 1]
          ) {
            this.indentLengths.push(indentLength);
            this.tokenQueue.push(this.createToken(RclLexerBase.INDENT, '<indent>'));
          }
        }
      }

      // Add all peeked tokens to queue
      for (const tok of peekedTokens) {
        if (tok.type !== Token.EOF) {
          this.tokenQueue.push(tok);
        } else {
          // Handle EOF
          this.handleEOF(tok);
          break;
        }
      }

      this.pendingNewline = false;
      return this.tokenQueue.shift()!;
    }

    // For non-newline tokens
    if (next.type !== Token.EOF) {
      this.tokenQueue.push(next);
    } else {
      this.handleEOF(next);
    }

    // Update last significant token
    if (this.isSignificantToken(next)) {
      this.lastSignificantToken = next;
    }

    return this.tokenQueue.length > 0 ? this.tokenQueue.shift()! : next;
  }

  private handleEOF(eofToken: Token): void {
    // Emit a final NEWLINE if needed
    if (this.lastSignificantToken && !this.pendingNewline) {
      this.tokenQueue.push(this.createToken(RclLexerBase.NEWLINE, '\n'));
    }

    // Emit remaining DEDENT tokens
    while (this.indentLengths.length > 1) {
      this.indentLengths.pop();
      this.tokenQueue.push(this.createToken(RclLexerBase.DEDENT, '<dedent>'));
    }
    this.tokenQueue.push(eofToken);
  }

  private calculateIndent(text: string): number {
    let count = 0;
    for (const char of text) {
      if (char === ' ') {
        count++;
      } else if (char === '\t') {
        // Assuming tab is 8 spaces, can be configured
        count += 8;
      } else {
        break;
      }
    }
    return count;
  }

  private createToken(type: number, text: string): Token {
    // For now, return any valid token as a placeholder
    // This is just for synthetic INDENT/DEDENT tokens
    return {
      type: type,
      text: text,
      line: 1,
      column: 0,
      tokenIndex: 0,
      channel: Token.DEFAULT_CHANNEL,
      start: 0,
      stop: 0
    } as Token;
  }

  private isSignificantToken(token: Token): boolean {
    // These token types should trigger indentation calculation
    // Skip whitespace, comments, newlines, and other structural tokens
    const WS = 38; // from generated lexer
    const COMMENT = 39; // from generated lexer
    const NEWLINE = 40; // from generated lexer

    return token.type !== WS && token.type !== COMMENT && token.type !== NEWLINE;
  }
}
