import * as fs from 'fs';
import * as path from 'path';
import { RclConfig, RclConfigLoadResult, RclCompilerOptions } from './types';

const CONFIG_FILE_NAME = 'rcl.config.json';

/**
 * Default compiler options
 */
const DEFAULT_COMPILER_OPTIONS: Required<RclCompilerOptions> = {
  generateSourceMap: true,
  preserveComments: false,
  emit: {
    json: true,
    javascript: true,
    declarations: true,
  },
  strict: true,
  module: 'esm',
};

/**
 * Load RCL configuration from a directory or its ancestors
 * @param searchPath Starting directory to search for rcl.config.json
 * @returns Configuration load result with config and any errors
 */
export function loadConfig(searchPath: string): RclConfigLoadResult {
  const errors: string[] = [];
  
  // Find config file
  const configPath = findConfigFile(searchPath);
  
  if (!configPath) {
    // No config file found, return defaults
    return {
      config: createDefaultConfig(searchPath),
      configFilePath: undefined,
      errors,
    };
  }

  try {
    // Read and parse config file
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const rawConfig = JSON.parse(configContent) as RclConfig;
    
    // Validate and normalize config
    const config = normalizeConfig(rawConfig, path.dirname(configPath));
    
    return {
      config,
      configFilePath: configPath,
      errors,
    };
  } catch (error) {
    errors.push(`Failed to load config from ${configPath}: ${error instanceof Error ? error.message : String(error)}`);
    return {
      config: createDefaultConfig(searchPath),
      configFilePath: configPath,
      errors,
    };
  }
}

/**
 * Find rcl.config.json file in directory or ancestors
 * @param searchPath Starting directory
 * @param stopAt Optional directory to stop searching at (for testing)
 */
function findConfigFile(searchPath: string, stopAt?: string): string | null {
  let currentPath = searchPath;
  const root = path.parse(currentPath).root;

  while (currentPath !== root) {
    const configPath = path.join(currentPath, CONFIG_FILE_NAME);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
    
    // Stop searching if we've reached the stopAt directory
    if (stopAt && currentPath === stopAt) {
      break;
    }
    
    currentPath = path.dirname(currentPath);
  }

  return null;
}

/**
 * Create default configuration
 */
function createDefaultConfig(rootDir: string): RclConfig {
  return {
    rootDir,
    compilerOptions: DEFAULT_COMPILER_OPTIONS,
    include: ['**/*.rcl'],
    exclude: ['node_modules', '**/*.test.rcl'],
  };
}

/**
 * Normalize and validate configuration
 */
function normalizeConfig(rawConfig: RclConfig, configDir: string): RclConfig {
  const config: RclConfig = {
    ...rawConfig,
    rootDir: rawConfig.rootDir 
      ? path.resolve(configDir, rawConfig.rootDir)
      : configDir,
  };

  // Resolve outDir relative to config file
  if (config.outDir) {
    config.outDir = path.resolve(configDir, config.outDir);
  }

  // Merge compiler options with defaults
  config.compilerOptions = {
    ...DEFAULT_COMPILER_OPTIONS,
    ...rawConfig.compilerOptions,
  };

  if (rawConfig.compilerOptions?.emit) {
    config.compilerOptions.emit = {
      ...DEFAULT_COMPILER_OPTIONS.emit,
      ...rawConfig.compilerOptions.emit,
    };
  }

  // Set default includes/excludes if not specified
  if (!config.include) {
    config.include = ['**/*.rcl'];
  }
  if (!config.exclude) {
    config.exclude = ['node_modules', '**/*.test.rcl'];
  }

  return config;
}

/**
 * Get output file path for a source file based on configuration
 */
export function getOutputPath(
  sourceFile: string,
  config: RclConfig,
  extension: '.json' | '.js' | '.d.ts'
): string {
  const sourceDir = path.dirname(sourceFile);
  const baseName = path.basename(sourceFile, '.rcl');
  
  if (config.outDir && config.rootDir) {
    // Calculate relative path from rootDir
    const relativePath = path.relative(config.rootDir, sourceDir);
    const outputDir = path.join(config.outDir, relativePath);
    return path.join(outputDir, baseName + extension);
  } else {
    // Output next to source file
    return path.join(sourceDir, baseName + extension);
  }
}