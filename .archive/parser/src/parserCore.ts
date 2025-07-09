import { type RCLNode, RCLASTNode } from './astTypes';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Check if we're in a Node.js environment
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

// Type definitions for tree-sitter
interface TreeNode {
  type: string;
  text?: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  children?: TreeNode[];
}

interface ParsedTree {
  rootNode: TreeNode;
}

export interface ParserInterface {
  parse(text: string): ParsedTree;
  setLanguage(language: LanguageInterface): void;
}

export type LanguageInterface = {}

export class ParserCore {
  private parser: ParserInterface | null = null;
  private language: LanguageInterface | null = null;
  private useNativeBinding = false;
  private initialized = false;
  private initializationPromise: Promise<boolean> | null = null;

  async ensureInitialized(): Promise<boolean> {
    if (this.initialized) {
      return this.parser !== null;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initialize();
    return this.initializationPromise;
  }

  private async initialize(): Promise<boolean> {
    try {
      this.initialized = true;

      if (isNode) {
        // Try Node.js native binding first
        try {
          const Parser = require('tree-sitter');
          // Try different paths for the native binding
          let RCLLanguage;
          
          // Try multiple possible paths
          const possiblePaths = [
            '../../bindings/node',
            '../bindings/node',
            '../../build/Release/tree_sitter_rcl_binding',
            '../build/Release/tree_sitter_rcl_binding'
          ];
          
          for (const bindingPath of possiblePaths) {
            try {
              RCLLanguage = require(bindingPath);
              break;
            } catch (_err) {
              // Continue to next path
            }
          }
          
          if (!RCLLanguage) {
            throw new Error('Could not find native binding');
          }

          this.parser = new Parser();
          this.language = RCLLanguage;
          if (this.language && this.parser) {
            this.parser.setLanguage(this.language);
          }
          this.useNativeBinding = true;

          return true;
        } catch (nativeError: unknown) {
          const errorMessage = nativeError instanceof Error ? nativeError.message : String(nativeError);
          console.warn('Native Node.js binding failed:', errorMessage);
        }
      }

      // Try web tree-sitter with WASM
      try {
        await this.initializeWebTreeSitter();
        return true;
      } catch (wasmError: unknown) {
        const errorMessage = wasmError instanceof Error ? wasmError.message : String(wasmError);
        console.warn('WASM binding failed:', errorMessage);
      }

      // If we get here, both native and WASM failed
      throw new Error('No parser available - both native and WASM bindings failed to load');

    } catch (error) {
      console.error('Parser initialization failed:', error);
      this.initialized = true; // Mark as initialized to prevent retry loops
      return false;
    }
  }

  async parse(text: string): Promise<ParsedTree> {
    const isInitialized = await this.ensureInitialized();
    if (!isInitialized || !this.parser) {
      throw new Error('Parser not available - tree-sitter initialization failed');
    }

    try {
      return this.parser.parse(text);
    } catch (error) {
      throw new Error(`Parsing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  convertToRCLNode(treeNode: TreeNode): RCLNode {
    const rclNode: RCLNode = {
      type: treeNode.type,
      text: treeNode.text,
      startPosition: treeNode.startPosition,
      endPosition: treeNode.endPosition,
      children: [],
      parent: null,
    };

    if (treeNode.children) {
      rclNode.children = treeNode.children.map(child => {
        const childNode = this.convertToRCLNode(child);
        childNode.parent = rclNode;
        return childNode;
      });
    }

    return rclNode;
  }

  private async initializeWebTreeSitter(): Promise<void> {
    // Import web-tree-sitter - use require for better compatibility
    const Parser = require('web-tree-sitter');
    
    // Initialize
    if (Parser.init) {
      await Parser.init();
    }
    
    const wasmPath = this.findWasmFile();
    if (!wasmPath) {
      throw new Error('WASM file not found');
    }

    this.language = await Parser.Language.load(wasmPath);
    this.parser = new Parser();
    if (this.language && this.parser) {
      this.parser.setLanguage(this.language as any);
    }
    
  }

  private findWasmFile(): string | null {
    const possiblePaths = [
      path.join(__dirname, 'tree-sitter-rcl.wasm'),
      path.join(__dirname, '../tree-sitter-rcl.wasm'),
      path.join(__dirname, '../../tree-sitter-rcl.wasm'),
      path.join(process.cwd(), 'tree-sitter-rcl.wasm'),
      path.join(process.cwd(), 'packages/parser/tree-sitter-rcl.wasm'),
      path.join(process.cwd(), 'packages/parser/dist/tree-sitter-rcl.wasm'),
      path.join(process.cwd(), 'node_modules/@rcl/parser/tree-sitter-rcl.wasm'),
      path.join(process.cwd(), 'node_modules/@rcl/parser/dist/tree-sitter-rcl.wasm'),
      // For extension context
      path.join(process.cwd(), 'server/out/tree-sitter-rcl.wasm'),
      path.join(process.cwd(), '../tree-sitter-rcl.wasm'),
    ];

    for (const wasmPath of possiblePaths) {
      if (fs.existsSync(wasmPath)) {
        return wasmPath;
      }
    }

    return null;
  }

  isInitialized(): boolean {
    return this.initialized && this.parser !== null;
  }

  isUsingNativeBinding(): boolean {
    return this.useNativeBinding;
  }
}