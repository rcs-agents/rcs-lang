import { SimpleRCLParser } from './simpleParser';
import { RCLDocument } from '../types';

export class RCLParser {
  private parser: SimpleRCLParser;

  constructor() {
    this.parser = new SimpleRCLParser();
  }

  parseDocument(content: string, uri: string): RCLDocument {
    return this.parser.parseDocument(content, uri);
  }

  clearCache(): void {
    // No cache to clear in simple parser
  }
}