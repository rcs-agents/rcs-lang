import * as fs from 'fs';
import * as path from 'path';
import { RCLParser } from '@rcl/parser';
import { ProjectRootDetector } from './projectRoot';
import { 
  ResolvedImport, 
  ExportedSymbol, 
  SymbolType, 
  ImportStatement, 
  ImportResolverConfig 
} from './types';

/**
 * Handles import resolution for RCL files
 */
export class ImportResolver {
  private parser: RCLParser;
  private config: ImportResolverConfig;
  private symbolCache = new Map<string, ExportedSymbol[]>();

  constructor(config?: Partial<ImportResolverConfig>) {
    this.parser = new RCLParser();
    this.config = {
      projectRoot: '',
      extensions: ['.rcl'],
      caseInsensitive: true,
      ...config
    };
  }

  /**
   * Resolve an import statement to its actual file path and exports
   * @param importPath - The import path from the RCL file
   * @param fromFile - The file containing the import statement
   * @returns Resolved import information
   */
  async resolveImport(importPath: string, fromFile: string): Promise<ResolvedImport> {
    const projectRoot = this.config.projectRoot || ProjectRootDetector.getProjectRoot(fromFile);
    const resolvedPath = this.resolveImportPath(importPath, fromFile, projectRoot);
    
    const result: ResolvedImport = {
      resolvedPath,
      exports: [],
      exists: false
    };

    // Check if the resolved file exists
    if (fs.existsSync(resolvedPath)) {
      result.exists = true;
      result.exports = await this.getExports(resolvedPath);
    }

    return result;
  }

  /**
   * Extract import statements from an RCL file
   * @param filePath - Path to the RCL file
   * @returns Array of import statements found in the file
   */
  async extractImports(filePath: string): Promise<ImportStatement[]> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const document = await this.parser.parseDocument(content, filePath);
      
      const imports: ImportStatement[] = [];
      
      // Walk the AST to find import statements
      this.walkAST(document.ast, (node) => {
        if (node.type === 'import_statement') {
          const importStatement = this.parseImportStatement(node, content);
          if (importStatement) {
            imports.push(importStatement);
          }
        }
      });

      return imports;
    } catch (error) {
      console.error(`Error extracting imports from ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Get all symbols exported by an RCL file
   * @param filePath - Path to the RCL file
   * @returns Array of exported symbols
   */
  async getExports(filePath: string): Promise<ExportedSymbol[]> {
    // Check cache first
    if (this.symbolCache.has(filePath)) {
      return this.symbolCache.get(filePath)!;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const document = await this.parser.parseDocument(content, filePath);
      
      const exports: ExportedSymbol[] = [];
      
      // Walk the AST to find exportable symbols
      this.walkAST(document.ast, (node) => {
        const symbol = this.extractSymbol(node, content);
        if (symbol) {
          exports.push(symbol);
        }
      });

      // Cache the results
      this.symbolCache.set(filePath, exports);
      return exports;
    } catch (error) {
      console.error(`Error getting exports from ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Clear the symbol cache
   */
  clearCache(): void {
    this.symbolCache.clear();
  }

  /**
   * Walk the AST and call callback for each node
   */
  private walkAST(node: any, callback: (node: any) => void): void {
    if (!node) return;
    
    callback(node);
    
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        this.walkAST(child, callback);
      }
    }
  }

  /**
   * Resolve import path to absolute file path
   */
  private resolveImportPath(importPath: string, fromFile: string, projectRoot: string): string {
    // Handle relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const baseDir = path.dirname(fromFile);
      const resolved = path.resolve(baseDir, importPath);
      return this.addExtensionIfNeeded(resolved);
    }

    // Handle absolute imports from project root
    const resolved = path.resolve(projectRoot, importPath);
    return this.addExtensionIfNeeded(resolved);
  }

  /**
   * Add file extension if needed
   */
  private addExtensionIfNeeded(filePath: string): string {
    // If already has extension, return as is
    if (path.extname(filePath)) {
      return filePath;
    }

    // Try each configured extension
    for (const ext of this.config.extensions) {
      const withExt = filePath + ext;
      if (fs.existsSync(withExt)) {
        return withExt;
      }
    }

    // Default to .rcl extension
    return filePath + '.rcl';
  }

  /**
   * Parse import statement from AST node
   */
  private parseImportStatement(node: any, content: string): ImportStatement | null {
    try {
      // Extract import path and alias from the node
      // This is a simplified implementation - would need to be adapted based on actual AST structure
      const text = content.slice(node.startIndex, node.endIndex);
      const importMatch = text.match(/import\s+([^\\s]+)(?:\s+as\s+([^\\s]+))?/);
      
      if (importMatch) {
        return {
          path: importMatch[1],
          alias: importMatch[2],
          range: {
            start: { line: node.startPosition.row, character: node.startPosition.column },
            end: { line: node.endPosition.row, character: node.endPosition.column }
          }
        };
      }
    } catch (error) {
      console.error('Error parsing import statement:', error);
    }
    
    return null;
  }

  /**
   * Extract symbol information from AST node
   */
  private extractSymbol(node: any, content: string): ExportedSymbol | null {
    try {
      // Extract symbol information based on node type
      // This is a simplified implementation
      switch (node.type) {
        case 'agent_definition':
          return {
            name: this.extractSymbolName(node, content),
            type: SymbolType.Agent,
            range: {
              start: { line: node.startPosition.row, character: node.startPosition.column },
              end: { line: node.endPosition.row, character: node.endPosition.column }
            }
          };
        
        case 'flow_definition':
          return {
            name: this.extractSymbolName(node, content),
            type: SymbolType.Flow,
            range: {
              start: { line: node.startPosition.row, character: node.startPosition.column },
              end: { line: node.endPosition.row, character: node.endPosition.column }
            }
          };
        
        case 'message_definition':
          return {
            name: this.extractSymbolName(node, content),
            type: SymbolType.Message,
            range: {
              start: { line: node.startPosition.row, character: node.startPosition.column },
              end: { line: node.endPosition.row, character: node.endPosition.column }
            }
          };
      }
    } catch (error) {
      console.error('Error extracting symbol:', error);
    }
    
    return null;
  }

  /**
   * Extract symbol name from AST node
   */
  private extractSymbolName(node: any, content: string): string {
    // This would need to be implemented based on the actual AST structure
    // For now, return a placeholder
    return 'UnknownSymbol';
  }
}