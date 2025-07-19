#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';
import chokidar from 'chokidar';
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));
const version = packageJson.version;
import { compileRCL, parseRCL } from './compiler.js';

const program = new Command();

program
  .name('rcl')
  .description('RCL compiler - compile Rich Communication Language files')
  .version(version)
  .exitOverride()
  .configureOutput({
    writeOut: (str) => process.stdout.write(str),
    writeErr: (str) => process.stderr.write(str),
    outputError: (str, write) => {
      // Don't write error for help/version
      if (!str.includes('outputHelp') && !str.includes(version)) {
        write(str);
      }
    }
  });

program
  .command('compile <input>')
  .description('Compile an RCL file')
  .option('-o, --output <file>', 'Output file path (overrides config)')
  .option('-f, --format <format>', 'Output format: js, json, or both')
  .option('--no-pretty', 'Disable pretty printing for JSON')
  .option('-w, --watch', 'Watch for changes and recompile')
  .option('-c, --config <path>', 'Path to rcl.config.json')
  .exitOverride()
  .action(async (input: string, options: any) => {
    try {
      // Set default format if not specified
      if (!options.format) {
        options.format = 'both';
      }
      // Initial compilation
      await compileRCL(input, options);

      // Watch mode
      if (options.watch) {
        console.log(chalk.blue('\n👁  Watching for changes...'));

        const watcher = chokidar.watch(input, {
          persistent: true,
          ignoreInitial: true,
        });

        watcher.on('change', async () => {
          console.log(chalk.yellow(`\n🔄 File changed: ${path.basename(input)}`));
          try {
            await compileRCL(input, options);
          } catch (error) {
            console.error(
              chalk.red('❌ Compilation failed:'),
              error instanceof Error ? error.message : error,
            );
          }
        });

        // Handle Ctrl+C gracefully
        process.on('SIGINT', () => {
          console.log(chalk.blue('\n👋 Stopping watch mode...'));
          watcher.close();
          process.exit(0);
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Error:'), errorMessage);

      // Use appropriate exit codes based on error type
      const errorCode = (error as any).code;
      if (
        errorCode === 'FILE_NOT_FOUND' ||
        errorMessage.includes('not found') ||
        errorMessage.includes('does not exist')
      ) {
        process.exit(3); // File not found
      } else if (errorCode === 'OUTPUT_ERROR' || errorMessage.includes('permission') || errorMessage.includes('write')) {
        process.exit(4); // Output error
      } else if (errorCode === 'SYNTAX_ERROR') {
        process.exit(1); // Syntax error
      } else if (errorCode === 'SEMANTIC_ERROR' || errorCode === 'EMPTY_OUTPUT') {
        process.exit(2); // Semantic error
      } else if (errorMessage.includes('Compilation failed')) {
        process.exit(1); // General compilation error
      } else {
        process.exit(70); // Internal error
      }
    }
  });

program
  .command('parse <input> [output]')
  .description('Parse an RCL file and output the AST')
  .option('--no-pretty', 'Disable pretty printing for JSON')
  .option(
    '--exclude <fields>',
    'Comma-separated list of fields to exclude from AST (e.g., source,location)',
  )
  .option('--only <fields>', 'Comma-separated list of fields to keep in AST (e.g., type,value)')
  .exitOverride()
  .action(async (input: string, output: string | undefined, options: any) => {
    try {
      // Parse comma-separated field lists
      if (options.exclude && typeof options.exclude === 'string') {
        options.exclude = options.exclude.split(',').map((f: string) => f.trim());
      }
      if (options.only && typeof options.only === 'string') {
        options.only = options.only.split(',').map((f: string) => f.trim());
      }
      await parseRCL(input, { ...options, output });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Error:'), errorMessage);

      // Use appropriate exit codes based on error type
      const errorCode = (error as any).code;
      if (
        errorCode === 'FILE_NOT_FOUND' ||
        errorMessage.includes('not found') ||
        errorMessage.includes('does not exist')
      ) {
        process.exit(3); // File not found
      } else if (errorCode === 'SYNTAX_ERROR') {
        process.exit(1); // Syntax error
      } else {
        process.exit(70); // Internal error
      }
    }
  });

program
  .command('diagram <input>')
  .description('Generate a flow diagram from an RCL file')
  .option('-o, --output <file>', 'Output file path')
  .option('-t, --type <type>', 'Diagram type: d2 or mermaid')
  .option('--no-error-paths', 'Hide error/invalid option paths')
  .option('--no-separate-invalid', 'Use shared InvalidOption state instead of local ones')
  .exitOverride()
  .action(async (input: string, options: any) => {
    try {
      const { generateDiagram } = await import('./compiler.js');
      await generateDiagram(input, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Error:'), errorMessage);

      // Use appropriate exit codes based on error type
      const errorCode = (error as any).code;
      if (
        errorCode === 'FILE_NOT_FOUND' ||
        errorMessage.includes('not found') ||
        errorMessage.includes('does not exist')
      ) {
        process.exit(3); // File not found
      } else if (errorCode === 'OUTPUT_ERROR' || errorMessage.includes('permission') || errorMessage.includes('write')) {
        process.exit(4); // Output error
      } else if (errorCode === 'SYNTAX_ERROR') {
        process.exit(1); // Syntax error
      } else if (errorCode === 'SEMANTIC_ERROR' || errorCode === 'EMPTY_OUTPUT') {
        process.exit(2); // Semantic error
      } else {
        process.exit(70); // Internal error
      }
    }
  });

program
  .command('init')
  .description('Initialize a new RCL project with rcl.config.json')
  .exitOverride()
  .action(() => {
    const configPath = path.join(process.cwd(), 'rcl.config.json');

    if (fs.existsSync(configPath)) {
      console.error(chalk.yellow('⚠️  rcl.config.json already exists'));
      return;
    }

    const defaultConfig = {
      outDir: './dist',
      compilerOptions: {
        generateSourceMap: true,
        preserveComments: false,
        strict: true,
        module: 'esm',
        emit: {
          json: true,
          javascript: true,
          declarations: true,
        },
      },
      include: ['**/*.rcl'],
      exclude: ['node_modules', '**/*.test.rcl'],
    };

    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log(chalk.green('✅ Created rcl.config.json'));
  });

// Add the legacy compile syntax for backwards compatibility
program
  .arguments('<input>')
  .option('-o, --output <file>', 'Output file path')
  .option('-f, --format <format>', 'Output format (js|json)', 'js')
  .option('--pretty', 'Pretty print JSON output', true)
  .allowUnknownOption(false)
  .exitOverride()
  .action(async (input: string, options: any) => {
    // Convert legacy format to new format
    if (options.format === 'js' || options.format === 'json') {
      options.format = options.format;
    } else {
      options.format = 'both';
    }

    try {
      await compileRCL(input, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Compilation failed:'), errorMessage);

      // Use appropriate exit codes based on error type
      const errorCode = (error as any).code;
      if (
        errorCode === 'FILE_NOT_FOUND' ||
        errorMessage.includes('not found') ||
        errorMessage.includes('does not exist')
      ) {
        process.exit(3); // File not found
      } else if (errorCode === 'OUTPUT_ERROR' || errorMessage.includes('permission') || errorMessage.includes('write')) {
        process.exit(4); // Output error
      } else if (errorCode === 'SYNTAX_ERROR') {
        process.exit(1); // Syntax error
      } else if (errorCode === 'SEMANTIC_ERROR' || errorCode === 'EMPTY_OUTPUT') {
        process.exit(2); // Semantic error
      } else if (errorMessage.includes('Compilation failed')) {
        process.exit(1); // General compilation error
      } else {
        process.exit(70); // Internal error
      }
    }
  });

// Show help if no arguments
if (process.argv.length === 2) {
  program.help();
}

// Check for invalid commands before parsing
const validCommands = ['compile', 'parse', 'diagram', 'init'];
const firstArg = process.argv[2];
if (firstArg && !firstArg.startsWith('-') && !validCommands.includes(firstArg) && !fs.existsSync(firstArg)) {
  console.error(chalk.red(`❌ Unknown command: ${firstArg}`));
  console.error(chalk.yellow('Available commands: compile, parse, diagram, init'));
  console.error(chalk.yellow('Use --help for more information.'));
  process.exit(64); // Usage error
}

// Handle invalid commands and arguments
program.on('command:*', () => {
  console.error(chalk.red('❌ Invalid command. See --help for available commands.'));
  process.exit(64); // Usage error
});

// Handle missing required arguments and unknown options
program.exitOverride((err) => {
  // Allow help and version to exit normally
  if (err.code === 'commander.helpDisplayed' || err.code === 'commander.version') {
    process.exit(0);
  }
  
  if (err.code === 'commander.missingMandatoryOptionValue' || 
      err.code === 'commander.missingArgument' ||
      err.code === 'commander.unknownOption') {
    console.error(chalk.red('❌ Invalid usage'));
    console.error(chalk.yellow(err.message));
    process.exit(64); // Usage error
  }
  throw err;
});

try {
  program.parse();
} catch (error: any) {
  // Don't print error messages for help/version
  if (error.code === 'commander.helpDisplayed' || 
      error.code === 'commander.version' ||
      error.message?.includes('(outputHelp)') ||
      error.message === version) {
    // Exit silently with success
    process.exit(0);
  }
  
  if (error.code?.startsWith('commander.')) {
    // Don't print "Invalid usage" for help output  
    if (!error.message?.includes('(outputHelp)')) {
      console.error(chalk.red('❌ Invalid usage:'), error.message);
    }
    process.exit(64); // Usage error
  }
  console.error(chalk.red('❌ Unexpected error:'), error instanceof Error ? error.message : error);
  process.exit(70); // Internal error
}
