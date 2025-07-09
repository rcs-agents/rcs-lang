import { type Result, ok, err, DiagnosticCollectionImpl } from '@rcl/core';
import type { 
  IParser, 
  IParseResult, 
  ParserConfig, 
  IParserCapabilities,
  IASTNode,
  IRange
} from '@rcl/core';
import { checkForErrorNodes, convertTreeSitterNode } from '../parseResult';

/**
 * Base parser implementation with common functionality
 */
export abstract class BaseParser implements IParser {
  protected initialized = false;
  protected config: ParserConfig;
  
  constructor(config: ParserConfig = {}) {
    this.config = config;
  }
  
  abstract parse(text: string, uri?: string): Promise<Result<IParseResult>>;
  abstract getCapabilities(): IParserCapabilities;
  abstract initialize(config?: ParserConfig): Promise<Result<void>>;
  abstract dispose(): void;
  
  isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Convert tree-sitter parse result to our IParseResult format
   */
  protected createParseResult(tree: any, parseTime: number): IParseResult {
    const diagnostics = new DiagnosticCollectionImpl();
    
    // Convert tree-sitter node to our AST format
    const ast = tree.rootNode ? this.convertToASTNode(tree.rootNode) : null;
    
    // Check for ERROR nodes
    if (ast) {
      checkForErrorNodes(ast as any, diagnostics);
    }
    
    return {
      ast,
      diagnostics: diagnostics.diagnostics,
      parseTime,
      parserType: 'base'
    };
  }
  
  /**
   * Convert tree-sitter node to IASTNode
   */
  protected convertToASTNode(tsNode: any): IASTNode {
    const range: IRange = {
      start: {
        line: tsNode.startPosition?.row || 0,
        character: tsNode.startPosition?.column || 0
      },
      end: {
        line: tsNode.endPosition?.row || 0,
        character: tsNode.endPosition?.column || 0
      }
    };
    
    const children: IASTNode[] = [];
    if (tsNode.children) {
      for (const child of tsNode.children) {
        children.push(this.convertToASTNode(child));
      }
    }
    
    const node: IASTNode = {
      type: tsNode.type,
      text: tsNode.text,
      range,
      children: children.length > 0 ? children : undefined
    };
    
    return node;
  }
}