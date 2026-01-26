/**
 * RCL Configuration Types
 * Similar to TypeScript's tsconfig.json structure
 */

export interface RclConfig {
  /**
   * Output directory for compiled files
   * If not specified, files are emitted next to source files
   */
  outDir?: string;

  /**
   * Root directory of source files
   * Defaults to directory containing rcl.config.json
   */
  rootDir?: string;

  /**
   * Compiler options
   */
  compilerOptions?: RclCompilerOptions;

  /**
   * Files to include in compilation
   * Supports glob patterns
   */
  include?: string[];

  /**
   * Files to exclude from compilation
   * Supports glob patterns
   */
  exclude?: string[];
}

export interface RclCompilerOptions {
  /**
   * Generate source maps for debugging
   * @default true
   */
  generateSourceMap?: boolean;

  /**
   * Preserve comments in output
   * @default false
   */
  preserveComments?: boolean;

  /**
   * Output format preferences
   */
  emit?: {
    /**
     * Generate .json files
     * @default true
     */
    json?: boolean;

    /**
     * Generate .js files
     * @default true
     */
    javascript?: boolean;

    /**
     * Generate .d.ts type definition files
     * @default true
     */
    declarations?: boolean;
  };

  /**
   * Strict mode for additional validation
   * @default true
   */
  strict?: boolean;

  /**
   * Module format for JavaScript output
   * @default "esm"
   */
  module?: 'esm' | 'commonjs';
}

export interface RclConfigLoadResult {
  config: RclConfig;
  configFilePath?: string;
  errors: string[];
}
