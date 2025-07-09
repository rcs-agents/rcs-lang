import { Result, ok, err } from '@rcl/core-types';
import { IParseResult, ParserConfig, IParserCapabilities } from '@rcl/core-interfaces';
import { BaseParser } from './baseParser';

/**
 * Node.js native parser implementation
 */
export class NodeParser extends BaseParser {
  private parser: any = null;
  private language: any = null;
  
  async initialize(config?: ParserConfig): Promise<Result<void>> {
    if (this.initialized) {
      return ok(undefined);
    }
    
    try {
      // Dynamic import to avoid issues in browser
      const Parser = require('tree-sitter');
      
      // Try to load native binding
      const possiblePaths = [
        '../../bindings/node',
        '../bindings/node',
        '../../build/Release/tree_sitter_rcl_binding',
        '../build/Release/tree_sitter_rcl_binding'
      ];
      
      let RCLLanguage = null;
      for (const bindingPath of possiblePaths) {
        try {
          RCLLanguage = require(bindingPath);
          break;
        } catch (err) {
          // Continue to next path
        }
      }
      
      if (!RCLLanguage) {
        return err(new Error('Could not load native RCL language binding'));
      }
      
      this.parser = new Parser();
      this.language = RCLLanguage;
      this.parser.setLanguage(this.language);
      
      this.initialized = true;
      return ok(undefined);
    } catch (error) {
      return err(new Error(`Failed to initialize Node parser: ${error}`));
    }
  }
  
  async parse(text: string, uri?: string): Promise<Result<IParseResult>> {
    if (!this.initialized) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        return err(initResult.error);
      }
    }
    
    try {
      const startTime = Date.now();
      const tree = this.parser.parse(text);
      const parseTime = Date.now() - startTime;
      
      const result = this.createParseResult(tree, parseTime);
      return ok(result);
    } catch (error) {
      return err(new Error(`Parse failed: ${error}`));
    }
  }
  
  parseSync(text: string, uri?: string): Result<IParseResult> {
    if (!this.initialized) {
      return err(new Error('Parser not initialized'));
    }
    
    try {
      const startTime = Date.now();
      const tree = this.parser.parse(text);
      const parseTime = Date.now() - startTime;
      
      const result = this.createParseResult(tree, parseTime);
      return ok(result);
    } catch (error) {
      return err(new Error(`Parse failed: ${error}`));
    }
  }
  
  getCapabilities(): IParserCapabilities {
    return {
      supportsSync: true,
      supportsIncremental: true,
      supportsTreeSitter: true,
      platform: 'node',
      version: '1.0.0'
    };
  }
  
  dispose(): void {
    this.parser = null;
    this.language = null;
    this.initialized = false;
  }
}