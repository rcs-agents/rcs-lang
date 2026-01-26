import * as fs from 'fs';
import * as path from 'path';
import { RCLParser } from '@rcl/parser';
import { ImportResolver } from '../import-resolver';
import { SymbolType, ExportedSymbol } from '../import-resolver/types';
import { 
  SymbolLocation, 
  SymbolInfo, 
  RCLDocument, 
  FileChangeEvent,
  FileChangeType,
  WorkspaceIndexConfig 
} from './types';

/**
 * Manages workspace-wide indexing of RCL files
 */
export class WorkspaceIndex {
  private parser: RCLParser;
  private importResolver: ImportResolver;
  private config: WorkspaceIndexConfig;
  
  // Index storage
  private documents = new Map<string, RCLDocument>();
  private symbolsByName = new Map<string, SymbolInfo[]>();
  private symbolsByType = new Map<SymbolType, SymbolInfo[]>();
  private symbolsByFile = new Map<string, SymbolInfo[]>();
  private dependencies = new Map<string, Set<string>>(); // file -> files it depends on
  private dependents = new Map<string, Set<string>>(); // file -> files that depend on it

  constructor(config: WorkspaceIndexConfig) {
    this.config = config;
    this.parser = new RCLParser();
    this.importResolver = new ImportResolver({
      projectRoot: config.workspaceRoot
    });
  }

  /**
   * Initialize the workspace index
   */
  async initialize(): Promise<void> {
    await this.scanWorkspace();
  }

  /**
   * Add a file to the index
   */
  async addFile(uri: string, content?: string): Promise<void> {
    try {
      const fileContent = content || fs.readFileSync(uri, 'utf-8');
      const document = await this.parseDocument(uri, fileContent);
      
      this.documents.set(uri, document);
      await this.updateSymbolIndex(document);
      await this.updateDependencyGraph(document);
      
      // Update dependents
      await this.updateDependents(uri);
    } catch (error) {
      console.error(`Error adding file ${uri}:`, error);
    }
  }

  /**
   * Remove a file from the index
   */
  removeFile(uri: string): void {
    const document = this.documents.get(uri);
    if (!document) return;

    // Remove from main index
    this.documents.delete(uri);
    
    // Remove symbols
    this.removeSymbolsFromIndex(uri);
    
    // Update dependency graph
    this.removeDependencies(uri);
    
    // Update dependents
    this.updateDependentsAfterRemoval(uri);
  }

  /**
   * Update a file in the index
   */
  async updateFile(uri: string, content: string): Promise<void> {
    // Remove old version
    this.removeFile(uri);
    
    // Add new version
    await this.addFile(uri, content);
  }

  /**
   * Find symbol by name
   */
  findSymbol(name: string, type?: SymbolType): SymbolLocation[] {
    const symbols = this.symbolsByName.get(name) || [];
    
    const filtered = type 
      ? symbols.filter(s => s.symbol.type === type)
      : symbols;
    
    return filtered.map(s => ({
      uri: s.uri,
      symbol: s.symbol
    }));
  }

  /**
   * Get all symbols in a file
   */
  getFileSymbols(uri: string): SymbolInfo[] {
    return this.symbolsByFile.get(uri) || [];
  }

  /**
   * Get files that depend on the given file
   */
  getDependents(uri: string): string[] {
    const dependents = this.dependents.get(uri);
    return dependents ? Array.from(dependents) : [];
  }

  /**
   * Get files that the given file depends on
   */
  getDependencies(uri: string): string[] {
    const dependencies = this.dependencies.get(uri);
    return dependencies ? Array.from(dependencies) : [];
  }

  /**
   * Get all symbols of a specific type
   */
  getSymbolsByType(type: SymbolType): SymbolLocation[] {
    const symbols = this.symbolsByType.get(type) || [];
    return symbols.map(s => ({
      uri: s.uri,
      symbol: s.symbol
    }));
  }

  /**
   * Search symbols by partial name
   */
  searchSymbols(query: string, type?: SymbolType): SymbolLocation[] {
    const results: SymbolLocation[] = [];
    const lowerQuery = query.toLowerCase();
    
    for (const [name, symbols] of this.symbolsByName) {
      if (name.toLowerCase().includes(lowerQuery)) {
        const filtered = type 
          ? symbols.filter(s => s.symbol.type === type)
          : symbols;
        
        results.push(...filtered.map(s => ({
          uri: s.uri,
          symbol: s.symbol
        })));
      }
    }
    
    return results;
  }

  /**
   * Get workspace statistics
   */
  getStats(): {
    totalFiles: number;
    totalSymbols: number;
    symbolsByType: Record<string, number>;
  } {
    const symbolsByType: Record<string, number> = {};
    
    for (const [type, symbols] of this.symbolsByType) {
      symbolsByType[type] = symbols.length;
    }
    
    return {
      totalFiles: this.documents.size,
      totalSymbols: Array.from(this.symbolsByName.values()).reduce((sum, symbols) => sum + symbols.length, 0),
      symbolsByType
    };
  }

  /**
   * Scan the workspace for RCL files
   */
  private async scanWorkspace(): Promise<void> {
    const files = await this.findRCLFiles(this.config.workspaceRoot);
    
    for (const file of files) {
      await this.addFile(file);
    }
  }

  /**
   * Find all RCL files in a directory
   */
  private async findRCLFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip excluded directories
          if (this.isExcluded(fullPath)) continue;
          
          const subFiles = await this.findRCLFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.rcl')) {
          if (!this.isExcluded(fullPath)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }
    
    return files;
  }

  /**
   * Check if a path should be excluded
   */
  private isExcluded(filePath: string): boolean {
    const relativePath = path.relative(this.config.workspaceRoot, filePath);
    
    return this.config.exclude.some(pattern => {
      // Simple pattern matching - could be enhanced with glob patterns
      return relativePath.includes(pattern);
    });
  }

  /**
   * Parse a document and extract symbols
   */
  private async parseDocument(uri: string, content: string): Promise<RCLDocument> {
    const document = this.parser.parseDocument(content, uri);
    const symbols = await this.importResolver.getExports(uri);
    const imports = await this.importResolver.extractImports(uri);
    
    return {
      uri,
      content,
      ast: document.ast,
      symbols,
      imports: imports.map(imp => imp.path),
      version: Date.now()
    };
  }

  /**
   * Update symbol index for a document
   */
  private async updateSymbolIndex(document: RCLDocument): Promise<void> {
    const symbolInfos: SymbolInfo[] = document.symbols.map(symbol => ({
      symbol,
      uri: document.uri,
      references: [],
      lastModified: document.version
    }));

    // Update by-file index
    this.symbolsByFile.set(document.uri, symbolInfos);

    // Update by-name index
    for (const symbolInfo of symbolInfos) {
      const name = symbolInfo.symbol.name;
      if (!this.symbolsByName.has(name)) {
        this.symbolsByName.set(name, []);
      }
      this.symbolsByName.get(name)!.push(symbolInfo);
    }

    // Update by-type index
    for (const symbolInfo of symbolInfos) {
      const type = symbolInfo.symbol.type;
      if (!this.symbolsByType.has(type)) {
        this.symbolsByType.set(type, []);
      }
      this.symbolsByType.get(type)!.push(symbolInfo);
    }
  }

  /**
   * Update dependency graph for a document
   */
  private async updateDependencyGraph(document: RCLDocument): Promise<void> {
    const dependencies = new Set<string>();
    
    for (const importPath of document.imports) {
      const resolved = await this.importResolver.resolveImport(importPath, document.uri);
      if (resolved.exists) {
        dependencies.add(resolved.resolvedPath);
      }
    }
    
    this.dependencies.set(document.uri, dependencies);
  }

  /**
   * Update dependents after adding/updating a file
   */
  private async updateDependents(uri: string): Promise<void> {
    // Clear existing dependents
    this.dependents.delete(uri);
    
    // Rebuild dependents by checking all files
    for (const [fileUri, deps] of this.dependencies) {
      if (deps.has(uri)) {
        if (!this.dependents.has(uri)) {
          this.dependents.set(uri, new Set());
        }
        this.dependents.get(uri)!.add(fileUri);
      }
    }
  }

  /**
   * Remove symbols from index
   */
  private removeSymbolsFromIndex(uri: string): void {
    const symbols = this.symbolsByFile.get(uri) || [];
    
    // Remove from by-name index
    for (const symbolInfo of symbols) {
      const name = symbolInfo.symbol.name;
      const nameSymbols = this.symbolsByName.get(name) || [];
      const filtered = nameSymbols.filter(s => s.uri !== uri);
      
      if (filtered.length === 0) {
        this.symbolsByName.delete(name);
      } else {
        this.symbolsByName.set(name, filtered);
      }
    }

    // Remove from by-type index
    for (const symbolInfo of symbols) {
      const type = symbolInfo.symbol.type;
      const typeSymbols = this.symbolsByType.get(type) || [];
      const filtered = typeSymbols.filter(s => s.uri !== uri);
      
      if (filtered.length === 0) {
        this.symbolsByType.delete(type);
      } else {
        this.symbolsByType.set(type, filtered);
      }
    }

    // Remove from by-file index
    this.symbolsByFile.delete(uri);
  }

  /**
   * Remove dependencies for a file
   */
  private removeDependencies(uri: string): void {
    this.dependencies.delete(uri);
  }

  /**
   * Update dependents after removing a file
   */
  private updateDependentsAfterRemoval(uri: string): void {
    // Remove this file from all dependents lists
    for (const [fileUri, dependents] of this.dependents) {
      dependents.delete(uri);
      if (dependents.size === 0) {
        this.dependents.delete(fileUri);
      }
    }
    
    // Remove dependents list for this file
    this.dependents.delete(uri);
  }
}