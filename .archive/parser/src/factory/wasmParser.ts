import { type Result, ok, err } from '@rcl/core';
import type { IParseResult, ParserConfig, IParserCapabilities } from '@rcl/core';
import { BaseParser } from './baseParser';

/**
 * WASM parser implementation for browser environments
 */
export class WasmParser extends BaseParser {
  private Parser: any = null;
  private parser: any = null;
  private language: any = null;
  
  async initialize(config?: ParserConfig): Promise<Result<void>> {
    if (this.initialized) {
      return ok(undefined);
    }
    
    try {
      // Dynamic import for web-tree-sitter
      const TreeSitterModule = await import('web-tree-sitter');
      const TreeSitter = TreeSitterModule.default || TreeSitterModule;
      
      // Initialize if init method exists (bypass type checking)
      if (typeof (TreeSitter as any).init === 'function') {
        await (TreeSitter as any).init();
      }
      
      this.Parser = TreeSitter;
      this.parser = new this.Parser();
      
      // Load WASM language file
      const wasmPath = config?.wasmPath || this.findWasmPath();
      if (!wasmPath) {
        return err(new Error('Could not find RCL WASM file'));
      }
      
      this.language = await this.Parser.Language.load(wasmPath);
      this.parser.setLanguage(this.language);
      
      this.initialized = true;
      return ok(undefined);
    } catch (error) {
      return err(new Error(`Failed to initialize WASM parser: ${error}`));
    }
  }
  
  async parse(text: string, _uri?: string): Promise<Result<IParseResult>> {
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
  
  getCapabilities(): IParserCapabilities {
    return {
      supportsSync: false,
      supportsIncremental: true,
      supportsTreeSitter: true,
      platform: 'browser',
      version: '1.0.0'
    };
  }
  
  dispose(): void {
    if (this.parser?.delete) {
      this.parser.delete();
    }
    this.parser = null;
    this.language = null;
    this.Parser = null;
    this.initialized = false;
  }
  
  private findWasmPath(): string | null {
    // In browser, this would typically be provided via config
    // or loaded from a CDN/server endpoint
    if (typeof globalThis !== 'undefined' && !globalThis.process) {
      // Browser environment
      return '/tree-sitter-rcl.wasm';
    }
    
    // For Node.js environments using WASM
    const possiblePaths = [
      './tree-sitter-rcl.wasm',
      '../tree-sitter-rcl.wasm',
      './build/tree-sitter-rcl.wasm',
      '../build/tree-sitter-rcl.wasm'
    ];
    
    // In a real implementation, we'd check if these files exist
    // For now, return the first one
    return possiblePaths[0];
  }
}