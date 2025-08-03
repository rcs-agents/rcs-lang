import { CharStream, CommonToken, Lexer, Token } from 'antlr4ng';

export abstract class RclLexerBase extends Lexer {
  // Token type constants - these will match what's generated
  protected static readonly NEWLINE = 52;
  protected static readonly INDENT = 53;
  protected static readonly DEDENT = 54;

  private indentLengths: number[] = [0];
  private tokenQueue: Token[] = [];
  private lastSignificantToken: Token | null = null;
  private pendingNewline = false;

  nextToken(): Token {
    // Return queued tokens first
    if (this.tokenQueue.length > 0) {
      return this.tokenQueue.shift()!;
    }

    const next = super.nextToken();

    // Handle newlines - this is where we check for indentation changes
    if (next.type === RclLexerBase.NEWLINE) {
      this.pendingNewline = true;
      this.tokenQueue.push(next);

      // Collect all tokens until we find a significant one or EOF
      const peekedTokens: Token[] = [];
      let firstSignificantToken: Token | null = null;

      while (true) {
        const peeked = super.nextToken();
        peekedTokens.push(peeked);

        if (peeked.type === Token.EOF) {
          // EOF reached - handle it and stop
          this.handleEOF(peeked);
          this.pendingNewline = false;
          return this.tokenQueue.shift()!;
        }

        // Check if this is a significant token (not whitespace, comment, newline, etc.)
        if (this.isSignificantToken(peeked)) {
          firstSignificantToken = peeked;
          break;
        }
      }

      // Now we have found a significant token after the newline
      // Check if indentation changed
      if (firstSignificantToken) {
        const newIndent = firstSignificantToken.column;
        const currentIndent = this.indentLengths[this.indentLengths.length - 1];

        if (newIndent > currentIndent) {
          // Increased indentation - emit INDENT
          this.indentLengths.push(newIndent);
          this.tokenQueue.push(this.createToken(RclLexerBase.INDENT, '<indent>'));
        } else if (newIndent < currentIndent) {
          // Decreased indentation - emit one or more DEDENTs
          while (this.indentLengths.length > 1 && 
                 this.indentLengths[this.indentLengths.length - 1] > newIndent) {
            this.indentLengths.pop();
            this.tokenQueue.push(this.createToken(RclLexerBase.DEDENT, '<dedent>'));
          }
          
          // If the new indentation doesn't match any previous level exactly,
          // and it's greater than the current level after popping, push it
          if (this.indentLengths.length > 0 && 
              newIndent > this.indentLengths[this.indentLengths.length - 1]) {
            this.indentLengths.push(newIndent);
            this.tokenQueue.push(this.createToken(RclLexerBase.INDENT, '<indent>'));
          }
        }
        // If newIndent === currentIndent, no change needed
      }

      // Add all peeked tokens to the queue
      for (const tok of peekedTokens) {
        this.tokenQueue.push(tok);
      }

      this.pendingNewline = false;
      return this.tokenQueue.shift()!;
    }

    // Handle EOF
    if (next.type === Token.EOF) {
      this.handleEOF(next);
      return this.tokenQueue.length > 0 ? this.tokenQueue.shift()! : next;
    }

    // Track last significant token
    if (this.isSignificantToken(next)) {
      this.lastSignificantToken = next;
    }

    // Return the token
    return next;
  }

  private handleEOF(eofToken: Token): void {
    // Emit a final NEWLINE if the last significant token wasn't followed by one
    if (this.lastSignificantToken && !this.pendingNewline) {
      this.tokenQueue.push(this.createToken(RclLexerBase.NEWLINE, '\n'));
    }

    // Emit DEDENT tokens for all remaining indentation levels
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

  private createToken(type: number, text: string, referenceToken?: Token): Token {
    // Create a synthetic token for INDENT/DEDENT
    const factory = this.tokenFactory;
    
    // Use reference token's position if provided, otherwise use current position
    const tokenLine = referenceToken ? referenceToken.line : this.line;
    const tokenColumn = referenceToken ? referenceToken.column : this.column;
    const tokenCharIndex = referenceToken ? referenceToken.start : this.getCharIndex();
    
    const token = factory.create(
      [this, this.inputStream],
      type,
      text,
      Token.DEFAULT_CHANNEL,
      tokenCharIndex,
      tokenCharIndex,
      tokenLine,
      tokenColumn
    );
    return token;
  }

  private isSignificantToken(token: Token): boolean {
    // These token types should trigger indentation calculation
    // Skip whitespace, comments, newlines, and other structural tokens
    const WS = 50; // from generated lexer - check RclLexer.ts
    const COMMENT = 51; // from generated lexer
    const NEWLINE = 52; // from generated lexer  
    const INDENT = RclLexerBase.INDENT;
    const DEDENT = RclLexerBase.DEDENT;

    return token.type !== WS && 
           token.type !== COMMENT && 
           token.type !== NEWLINE &&
           token.type !== INDENT &&
           token.type !== DEDENT &&
           token.type !== Token.EOF;
  }

  protected isKeyword(text: string): boolean {
    // List of all keywords that should not be matched as attribute names
    const keywords = [
      'import', 'as', 'with', 'match',
      'start', 'on',
      'append', 'set', 'merge', 'to', 'into', 'result'
    ];
    return keywords.includes(text.toLowerCase());
  }
}
