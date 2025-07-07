import { RCLNode, RCLASTNode } from './astTypes';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { MockParser } from './mockParser';

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

export interface LanguageInterface {
  // Language interface methods if needed
}

export class ParserCore {
  private parser: ParserInterface | null = null;
  private language: LanguageInterface | null = null;
  private useNativeBinding = false;
  private useMockParser = false;
  private mockParser: MockParser | null = null;
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
      if (isNode) {
        // Try native Node.js binding first
        try {
          const TreeSitter = require('tree-sitter');
          
          // Try to load the native binding
          let Language;
          
          // First try the compiled native binding if it exists
          const bindingPath = path.join(__dirname, '..', 'build', 'Release', 'tree_sitter_rcl_binding.node');
          if (fs.existsSync(bindingPath)) {
            try {
              Language = require(bindingPath);
            } catch (e) {
              // Try node-gyp-build which handles the platform-specific binding loading
              try {
                Language = require('node-gyp-build')(path.join(__dirname, '..'));
              } catch (e2) {
                // Native binding not available
                throw new Error('Native binding not available');
              }
            }
          } else {
            // Native binding not built, skip to web-tree-sitter
            throw new Error('Native binding not built');
          }

          this.parser = new TreeSitter();

          // The binding should export a language object
          if (!Language) {
            throw new Error('Failed to load language binding');
          }

          this.language = Language;
          this.parser!.setLanguage(this.language!);
          this.useNativeBinding = true;
          console.log('Successfully loaded native Node.js RCL language binding');
          this.initialized = true;
          return true;
        } catch (error) {
          // Silently fall back to web-tree-sitter
          // console.warn('Native binding not available, falling back to web-tree-sitter');
        }
      }

      // Fall back to web-tree-sitter
      try {
        const TreeSitter = require('web-tree-sitter');
        
        // Initialize the Parser class (required in newer versions)
        if (TreeSitter.Parser.init) {
          await TreeSitter.Parser.init();
        }
        
        // Create parser instance
        this.parser = new TreeSitter.Parser();

        // Load the WASM language file
        const wasmPath = path.join(__dirname, '..', 'tree-sitter-rcl.wasm');

        if (!fs.existsSync(wasmPath)) {
          // If WASM doesn't exist but we're in Node.js, we already failed above
          if (isNode) {
            throw new Error('Neither native binding nor WASM file is available');
          }
          // For browser, we'll need to load from a URL
          throw new Error('WASM file not found and no URL provided');
        }

        const language = await TreeSitter.Language.load(wasmPath);
        this.language = language;
        this.parser!.setLanguage(language);

        console.log('Successfully loaded web-tree-sitter RCL language');
        this.initialized = true;
        return true;
      } catch (error) {
        console.error('Failed to initialize web-tree-sitter:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to initialize parser:', error);

      // Only fall back to mock parser in development mode (not during tests)
      const isTest = process.env.NODE_ENV === 'test';
      const useMockParser = process.env.RCL_USE_MOCK_PARSER === 'true';
      const isDevelopment = process.env.NODE_ENV === 'development' || (!process.env.NODE_ENV && !isTest);
      
      if (isDevelopment || useMockParser) {
        console.warn('Falling back to mock parser for development.');
        console.warn('To use the full parser, install emscripten and run: npm run build-wasm');
        console.warn('See BUILDING_WASM.md for instructions.');

        this.mockParser = new MockParser();
        this.useMockParser = true;
        this.initialized = true;
        return true;
      }
      
      // In test mode, throw the error
      throw error;
    }
  }

  async parse(text: string): Promise<ParsedTree> {
    await this.ensureInitialized();

    if (this.useMockParser && this.mockParser) {
      // Return a tree-like structure for compatibility
      const rootNode = this.mockParser.parse(text);
      return { rootNode };
    }

    if (!this.parser) {
      throw new Error('Parser not initialized');
    }

    return this.parser.parse(text);
  }

  convertToRCLNode(node: TreeNode): RCLNode {
    const rclNode: RCLNode = {
      type: node.type,
      text: node.text,
      startPosition: node.startPosition,
      endPosition: node.endPosition,
      children: node.children?.map((child: TreeNode) => this.convertToRCLNode(child)) || [],
      parent: null,
    };

    // Set parent references
    rclNode.children?.forEach((child) => {
      child.parent = rclNode;
    });

    return rclNode;
  }

  isUsingNativeBinding(): boolean {
    return this.useNativeBinding;
  }

  isUsingMockParser(): boolean {
    return this.useMockParser;
  }
}
