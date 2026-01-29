import * as path from 'node:path';
import { RCLCompiler } from '@rcs-lang/compiler';
import { generateD2Diagram, generateMermaidDiagram } from '@rcs-lang/compiler';
import type { Result } from '@rcs-lang/core';
import type { ICompilationResult, IFileSystem } from '@rcs-lang/core';
import { NodeFileSystem } from '@rcs-lang/file-system';
import { AntlrRclParser } from '@rcs-lang/parser';
import chalk from 'chalk';

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
  const fileSystem = new NodeFileSystem();
  const compiler = new RCLCompiler({ fileSystem });

  // Resolve input path
  const resolvedInput = fileSystem.resolve(inputPath);

  // Check if file exists
  const existsResult = await fileSystem.exists(resolvedInput);
  if (!existsResult.success || !existsResult.value) {
    const error = new Error(`Input file not found: ${inputPath}`);
    (error as any).code = 'FILE_NOT_FOUND';
    throw error;
  }

  console.log(chalk.blue(`🔨 Compiling ${fileSystem.basename(inputPath)}...`));

  // Compile the file
  const compileResult = await compiler.compileFile(resolvedInput);

  if (!compileResult.success) {
    handleCompilationError(compileResult);
    throw new Error('Compilation failed');
  }

  const { output, diagnostics, success } = compileResult.value;

  // Check for errors in diagnostics
  const hasErrors = diagnostics.some((d) => d.severity === 'error');

  // Show all diagnostics
  if (diagnostics.length > 0) {
    displayDiagnostics(diagnostics);
  }

  // Fail if there are errors or compilation failed
  if (!success || hasErrors || !output) {
    const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
    if (errorCount > 0) {
      console.error(
        chalk.red(`❌ Compilation failed with ${errorCount} error${errorCount > 1 ? 's' : ''}`),
      );
    }

    // Determine error type based on diagnostics
    const syntaxErrors = diagnostics.filter(
      (d) =>
        d.severity === 'error' &&
        (d.code?.includes('SYNTAX') ||
          d.code?.includes('PARSE') ||
          d.message?.toLowerCase().includes('syntax')),
    );

    const semanticErrors = diagnostics.filter(
      (d) =>
        d.severity === 'error' &&
        (d.code?.includes('SEMANTIC') ||
          d.code?.includes('VALIDATION') ||
          d.code?.includes('REFERENCE') ||
          d.code?.includes('RCL1') || // RCL1xx are semantic errors
          d.code?.includes('RCL2') || // RCL2xx are reference errors
          d.code?.includes('RCL3') || // RCL3xx are type errors
          d.code?.includes('RCL4') || // RCL4xx are validation errors
          d.message?.toLowerCase().includes('validation') ||
          d.message?.toLowerCase().includes('undefined') ||
          d.message?.toLowerCase().includes('missing') ||
          d.message?.toLowerCase().includes('must have') ||
          d.message?.toLowerCase().includes('cannot be empty')),
    );

    const error = new Error('Compilation failed');
    if (syntaxErrors.length > 0) {
      (error as any).code = 'SYNTAX_ERROR';
    } else if (semanticErrors.length > 0) {
      (error as any).code = 'SEMANTIC_ERROR';
    } else {
      (error as any).code = 'COMPILATION_ERROR';
    }
    throw error;
  }

  // Check for empty output
  if (isOutputEmpty(output)) {
    console.error(chalk.red('❌ Compilation failed: Generated output is empty'));
    const error = new Error('Compilation failed');
    (error as any).code = 'EMPTY_OUTPUT';
    throw error;
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
    const prefix =
      diagnostic.severity === 'error'
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
  fileSystem: IFileSystem,
): Promise<void> {
  const parsed = path.parse(inputPath);
  const format = options.format || 'json';

  // Emit JSON
  if (format === 'both' || format === 'json') {
    const jsonPath = options.output
      ? options.output.endsWith('.json')
        ? options.output
        : `${options.output}.json`
      : fileSystem.join(parsed.dir, `${parsed.name}.json`);

    const jsonContent = JSON.stringify(output, null, options.pretty ? 2 : 0);
    const writeResult = await fileSystem.writeFile(jsonPath, jsonContent);

    if (!writeResult.success) {
      const error = new Error(`Failed to write JSON output: ${(writeResult as any).error.message}`);
      (error as any).code = 'OUTPUT_ERROR';
      throw error;
    }

    console.log(chalk.green(`✅ Generated: ${path.relative(process.cwd(), jsonPath)}`));
  }

  // Emit JavaScript
  if (format === 'both' || format === 'js') {
    const jsPath = options.output
      ? options.output.endsWith('.js')
        ? options.output
        : `${options.output}.js`
      : fileSystem.join(parsed.dir, `${parsed.name}.js`);

    const jsContent = generateJavaScript(output, parsed.name);
    const writeResult = await fileSystem.writeFile(jsPath, jsContent);

    if (!writeResult.success) {
      const error = new Error(
        `Failed to write JavaScript output: ${(writeResult as any).error.message}`,
      );
      (error as any).code = 'OUTPUT_ERROR';
      throw error;
    }

    console.log(chalk.green(`✅ Generated: ${path.relative(process.cwd(), jsPath)}`));
  }
}

/**
 * Check if compilation output is empty or contains only placeholder structures
 */
function isOutputEmpty(output: any): boolean {
  if (!output || typeof output !== 'object') {
    return true;
  }

  // Check if all main sections are empty objects
  const agent = output.agent || {};
  const messages = output.messages || {};
  const flows = output.flows || {};

  const agentEmpty = Object.keys(agent).length === 0;
  const messagesEmpty = Object.keys(messages).length === 0;
  const flowsEmpty = Object.keys(flows).length === 0;

  // If all sections are empty, the output is considered empty
  if (agentEmpty && messagesEmpty && flowsEmpty) {
    return true;
  }

  // Check for required agent properties
  if (!agentEmpty && !agent.displayName) {
    return true;
  }

  return false;
}

/**
 * Generate JavaScript output
 */
function generateJavaScript(data: any, name: string): string {
  const _safeName = name.replace(/[^a-zA-Z0-9]/g, '_');

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

/**
 * Parse RCL file and output the AST
 */
export async function parseRCL(
  inputPath: string,
  options: { pretty?: boolean; output?: string; exclude?: string[]; only?: string[] },
): Promise<void> {
  const fileSystem = new NodeFileSystem();
  const parser = new AntlrRclParser();

  // Resolve input path
  const resolvedInput = fileSystem.resolve(inputPath);

  // Check if file exists
  const existsResult = await fileSystem.exists(resolvedInput);
  if (!existsResult.success || !existsResult.value) {
    const error = new Error(`Input file not found: ${inputPath}`);
    (error as any).code = 'FILE_NOT_FOUND';
    throw error;
  }

  console.log(chalk.blue(`🔍 Parsing ${fileSystem.basename(inputPath)}...`));

  // Read the file
  const readResult = await fileSystem.readFile(resolvedInput);
  if (!readResult.success) {
    throw new Error(`Failed to read file: ${(readResult as any).error.message}`);
  }

  // Initialize parser if needed
  if (!parser.isInitialized()) {
    await parser.initialize();
  }

  // Parse the content
  const parseResult = await parser.parse(readResult.value);

  if (!parseResult.success) {
    console.error(chalk.red('❌ Parse failed:'));
    console.error(chalk.red((parseResult as any).error.message));

    const error = new Error('Parse failed');
    (error as any).code = 'SYNTAX_ERROR';
    throw error;
  }

  // Get the AST
  let ast = parseResult.value.ast;

  // Apply field filters
  if (options.exclude && options.exclude.length > 0) {
    ast = filterFields(ast, options.exclude, 'exclude');
  } else if (options.only && options.only.length > 0) {
    ast = filterFields(ast, options.only, 'only');
  }

  // Convert to JSON
  const jsonOutput = JSON.stringify(ast, null, options.pretty !== false ? 2 : 0);

  // Output to file or stdout
  if (options.output) {
    // Write to file
    const outputPath = fileSystem.resolve(options.output);
    const writeResult = await fileSystem.writeFile(outputPath, jsonOutput);

    if (!writeResult.success) {
      const error = new Error(`Failed to write output file: ${(writeResult as any).error.message}`);
      (error as any).code = 'OUTPUT_ERROR';
      throw error;
    }

    console.log(chalk.green(`✅ AST written to: ${path.relative(process.cwd(), outputPath)}`));
  } else {
    // Output to stdout
    console.log(jsonOutput);
  }

  console.log(chalk.green('✓ Parse successful'));
}

/**
 * Recursively filter fields from an object based on mode
 * @param obj - The object to filter
 * @param fields - The fields to exclude or include
 * @param mode - 'exclude' to remove specified fields, 'only' to keep only specified fields
 */
function filterFields(obj: any, fields: string[], mode: 'exclude' | 'only'): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => filterFields(item, fields, mode));
  }
  if (obj !== null && typeof obj === 'object') {
    const filtered: any = {};

    // Essential structural fields that should always be preserved
    const structuralFields = [
      'type',
      'imports',
      'sections',
      'body',
      'cases',
      'parameters',
      'items',
      'entries',
    ];

    for (const [key, value] of Object.entries(obj)) {
      let shouldInclude: boolean;

      if (mode === 'exclude') {
        // In exclude mode: include if NOT in fields list
        shouldInclude = !fields.includes(key);
      } else {
        // In only mode: include if in fields list OR is a structural field
        shouldInclude = fields.includes(key) || structuralFields.includes(key);
      }

      if (shouldInclude) {
        filtered[key] = filterFields(value, fields, mode);
      }
    }
    return filtered;
  }
  return obj;
}

/**
 * Generate a diagram from an RCL file
 */
export async function generateDiagram(
  inputPath: string,
  options: {
    output?: string;
    type?: 'd2' | 'mermaid';
    errorPaths?: boolean;
    separateInvalid?: boolean;
  },
): Promise<void> {
  const fileSystem = new NodeFileSystem();
  const compiler = new RCLCompiler({ fileSystem });

  // Resolve input path
  const resolvedInput = fileSystem.resolve(inputPath);

  // Check if file exists
  const existsResult = await fileSystem.exists(resolvedInput);
  if (!existsResult.success || !existsResult.value) {
    const error = new Error(`Input file not found: ${inputPath}`);
    (error as any).code = 'FILE_NOT_FOUND';
    throw error;
  }

  const format = options.type || 'd2';

  console.log(
    chalk.blue(`📊 Generating ${format} diagram from ${fileSystem.basename(inputPath)}...`),
  );

  // Compile the file
  const compileResult = await compiler.compileFile(resolvedInput);

  if (!compileResult.success) {
    handleCompilationError(compileResult);
    throw new Error('Compilation failed');
  }

  const { output, success } = compileResult.value;

  if (!success || !output) {
    throw new Error('Compilation produced no output');
  }

  // Generate diagram
  let diagramContent: string;

  if (format === 'mermaid') {
    diagramContent = generateMermaidDiagram(output, {
      title: output.agent.displayName || fileSystem.basename(inputPath, '.rcl'),
    });
  } else {
    diagramContent = generateD2Diagram(output, {
      title: output.agent.displayName || fileSystem.basename(inputPath, '.rcl'),
      showErrorPaths: options.errorPaths !== false,
      separateInvalidOptions: options.separateInvalid !== false,
    });
  }

  // Determine output path
  const outputPath = options.output || resolvedInput.replace(/\.rcl$/, `.${format}`);
  const resolvedOutput = fileSystem.resolve(outputPath);

  // Write diagram file
  const writeResult = await fileSystem.writeFile(resolvedOutput, diagramContent);

  if (!writeResult.success) {
    const error = new Error(`Failed to write diagram file: ${(writeResult as any).error.message}`);
    (error as any).code = 'OUTPUT_ERROR';
    throw error;
  }

  console.log(
    chalk.green(`✅ Diagram written to: ${path.relative(process.cwd(), resolvedOutput)}`),
  );
  console.log(chalk.gray(`   Format: ${format.toUpperCase()}`));

  // Show D2 render command if applicable
  if (format === 'd2') {
    console.log(
      chalk.gray(
        `   To render: d2 ${path.basename(resolvedOutput)} ${path.basename(resolvedOutput, '.d2')}.svg`,
      ),
    );
  }
}
