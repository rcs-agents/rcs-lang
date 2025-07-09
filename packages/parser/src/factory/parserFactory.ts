import { Result, ok, err } from '@rcl/core-types';
import { IParser, ParserConfig, IParseResult } from '@rcl/core-interfaces';
import { NodeParser } from './nodeParser';
import { WasmParser } from './wasmParser';

/**
 * Factory for creating platform-specific parser instances
 */
export class ParserFactory {
  /**
   * Create a parser for the current platform
   */
  static async create(config: ParserConfig = {}): Promise<Result<IParser>> {
    const platform = config.platform || this.detectPlatform();
    
    try {
      switch (platform) {
        case 'node':
          return await this.createNodeParser(config);
        
        case 'browser':
          return await this.createWasmParser(config);
        
        case 'universal':
          // Try Node first, fall back to WASM
          const nodeResult = await this.createNodeParser(config);
          if (nodeResult.success) {
            return nodeResult;
          }
          return await this.createWasmParser(config);
        
        default:
          return err(new Error(`Unsupported platform: ${platform}`));
      }
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Detect the current platform
   */
  private static detectPlatform(): 'node' | 'browser' {
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      return 'node';
    }
    return 'browser';
  }
  
  /**
   * Create a Node.js parser
   */
  private static async createNodeParser(config: ParserConfig): Promise<Result<IParser>> {
    try {
      const parser = new NodeParser(config);
      const initResult = await parser.initialize(config);
      
      if (!initResult.success) {
        return err(initResult.error);
      }
      
      return ok(parser);
    } catch (error) {
      return err(new Error(`Failed to create Node parser: ${error}`));
    }
  }
  
  /**
   * Create a WASM parser
   */
  private static async createWasmParser(config: ParserConfig): Promise<Result<IParser>> {
    try {
      const parser = new WasmParser(config);
      const initResult = await parser.initialize(config);
      
      if (!initResult.success) {
        return err(initResult.error);
      }
      
      return ok(parser);
    } catch (error) {
      return err(new Error(`Failed to create WASM parser: ${error}`));
    }
  }
  
  /**
   * Get available parsers for the current environment
   */
  static getAvailableParsers(): string[] {
    const available: string[] = [];
    
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      available.push('node');
    }
    
    // WASM is always available in theory
    available.push('browser');
    available.push('universal');
    
    return available;
  }
}