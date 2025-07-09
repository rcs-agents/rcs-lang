import { Result } from '@rcl/core-types';

/**
 * File system interface - platform agnostic
 */
export interface IFileSystem {
  /**
   * Read a file as text
   */
  readFile(path: string, encoding?: string): Promise<Result<string>>;
  
  /**
   * Write text to a file
   */
  writeFile(path: string, content: string, encoding?: string): Promise<Result<void>>;
  
  /**
   * Check if a file exists
   */
  exists(path: string): Promise<Result<boolean>>;
  
  /**
   * Get file stats
   */
  stat(path: string): Promise<Result<IFileStats>>;
  
  /**
   * List directory contents
   */
  readdir(path: string): Promise<Result<string[]>>;
  
  /**
   * Create a directory
   */
  mkdir(path: string, recursive?: boolean): Promise<Result<void>>;
  
  /**
   * Remove a file
   */
  unlink(path: string): Promise<Result<void>>;
  
  /**
   * Remove a directory
   */
  rmdir(path: string, recursive?: boolean): Promise<Result<void>>;
  
  /**
   * Join path segments
   */
  join(...segments: string[]): string;
  
  /**
   * Resolve a path to absolute
   */
  resolve(...segments: string[]): string;
  
  /**
   * Get the directory name of a path
   */
  dirname(path: string): string;
  
  /**
   * Get the base name of a path
   */
  basename(path: string, ext?: string): string;
  
  /**
   * Get the extension of a path
   */
  extname(path: string): string;
  
  /**
   * Check if a path is absolute
   */
  isAbsolute(path: string): boolean;
}

/**
 * File statistics
 */
export interface IFileStats {
  size: number;
  isFile(): boolean;
  isDirectory(): boolean;
  isSymbolicLink(): boolean;
  mtime: Date;
  ctime: Date;
  atime: Date;
}

/**
 * File system provider interface
 */
export interface IFileSystemProvider {
  /**
   * Get the file system implementation
   */
  getFileSystem(): IFileSystem;
  
  /**
   * Get the provider name
   */
  getName(): string;
  
  /**
   * Check if provider is available
   */
  isAvailable(): boolean;
}