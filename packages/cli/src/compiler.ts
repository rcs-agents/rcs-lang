import * as path from 'path';
import chalk from 'chalk';
import { Result } from '@rcl/core-types';
import { ICompilationResult, IFileSystem } from '@rcl/core-interfaces';
import { RCLCompiler } from '@rcl/compiler';
import { FileSystemFactory } from '@rcl/file-system';

export interface CompileOptions {
  output?: string;
  format?: 'js' | 'json' | 'both';
  pretty?: boolean;
  watch?: boolean;
  configPath?: string;
}

/**
 * Compile RCL file using the new compiler infrastructure
 */
export async function compileRCL(inputPath: string, options: CompileOptions): Promise<void> {
  const fileSystem = FileSystemFactory.getDefault();
  const compiler = new RCLCompiler({ fileSystem });
  
  // Resolve input path
  const resolvedInput = fileSystem.resolve(inputPath);
  
  // Check if file exists
  const existsResult = await fileSystem.exists(resolvedInput);
  if (!existsResult.success || !existsResult.value) {
    throw new Error(`Input file not found: ${inputPath}`);
  }
  
  console.log(chalk.blue(`🔨 Compiling ${fileSystem.basename(inputPath)}...`));
  
  // Compile the file
  const compileResult = await compiler.compileFile(resolvedInput);
  
  if (!compileResult.success) {
    handleCompilationError(compileResult);
    throw new Error('Compilation failed');
  }
  
  const { output, diagnostics, success } = compileResult.value;
  
  // Show warnings even if compilation succeeded
  if (diagnostics.length > 0) {
    displayDiagnostics(diagnostics);
  }
  
  if (!success || !output) {
    throw new Error('Compilation failed');
  }
  
  // Emit the output
  await emitOutput(output, resolvedInput, options, fileSystem);
  
  console.log(chalk.green('✓ Compilation successful'));
}

/**
 * Handle compilation errors
 */
function handleCompilationError(result: Result<ICompilationResult>): void {
  console.error(chalk.red('❌ Compilation failed:'));
  
  if (!result.success) {
    console.error(chalk.red(`  ERROR: ${(result as any).error.message}`));
    return;
  }
  
  const { diagnostics } = result.value;
  displayDiagnostics(diagnostics);
}

/**
 * Display diagnostics
 */
function displayDiagnostics(diagnostics: any[]): void {
  for (const diagnostic of diagnostics) {
    const prefix = diagnostic.severity === 'error' 
      ? chalk.red('ERROR:') 
      : diagnostic.severity === 'warning'
      ? chalk.yellow('WARNING:')
      : chalk.blue('INFO:');
      
    console.error(`  ${prefix} ${diagnostic.message}`);
    
    if (diagnostic.file && diagnostic.range) {
      const line = diagnostic.range.start.line + 1;
      const column = diagnostic.range.start.column + 1;
      console.error(chalk.gray(`    at ${diagnostic.file}:${line}:${column}`));
    }
  }
}

/**
 * Emit compilation output
 */
async function emitOutput(
  output: any,
  inputPath: string,
  options: CompileOptions,
  fileSystem: IFileSystem
): Promise<void> {
  const parsed = path.parse(inputPath);
  const format = options.format || 'json';
  
  // Emit JSON
  if (format === 'both' || format === 'json') {
    const jsonPath = options.output 
      ? (options.output.endsWith('.json') ? options.output : `${options.output}.json`)
      : fileSystem.join(parsed.dir, `${parsed.name}.json`);
    
    const jsonContent = JSON.stringify(output, null, options.pretty ? 2 : 0);
    const writeResult = await fileSystem.writeFile(jsonPath, jsonContent);
    
    if (!writeResult.success) {
      throw new Error(`Failed to write JSON output: ${(writeResult as any).error.message}`);
    }
    
    console.log(chalk.green(`✅ Generated: ${path.relative(process.cwd(), jsonPath)}`));
  }
  
  // Emit JavaScript
  if (format === 'both' || format === 'js') {
    const jsPath = options.output 
      ? (options.output.endsWith('.js') ? options.output : `${options.output}.js`)
      : fileSystem.join(parsed.dir, `${parsed.name}.js`);
    
    const jsContent = generateJavaScript(output, parsed.name);
    const writeResult = await fileSystem.writeFile(jsPath, jsContent);
    
    if (!writeResult.success) {
      throw new Error(`Failed to write JavaScript output: ${(writeResult as any).error.message}`);
    }
    
    console.log(chalk.green(`✅ Generated: ${path.relative(process.cwd(), jsPath)}`));
  }
}

/**
 * Generate JavaScript output
 */
function generateJavaScript(data: any, name: string): string {
  const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `// Generated from ${name}.rcl
export const agent = ${JSON.stringify(data.agent, null, 2)};

export const messages = ${JSON.stringify(data.messages, null, 2)};

export const flows = ${JSON.stringify(data.flows, null, 2)};

// Convenience export
export default {
  agent,
  messages,
  flows
};
`;
}