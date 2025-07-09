#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';
import chokidar from 'chokidar';
import { compileRCL } from './compiler';
import { version } from '../package.json';

const program = new Command();

program
  .name('rcl')
  .description('RCL compiler - compile Rich Communication Language files')
  .version(version);

program
  .command('compile <input>')
  .description('Compile an RCL file')
  .option('-o, --output <file>', 'Output file path (overrides config)')
  .option('-f, --format <format>', 'Output format: js, json, or both')
  .option('--no-pretty', 'Disable pretty printing for JSON')
  .option('-w, --watch', 'Watch for changes and recompile')
  .option('-c, --config <path>', 'Path to rcl.config.json')
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
            console.error(chalk.red('❌ Compilation failed:'), error instanceof Error ? error.message : error);
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
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize a new RCL project with rcl.config.json')
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
          declarations: true
        }
      },
      include: ['**/*.rcl'],
      exclude: ['node_modules', '**/*.test.rcl']
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
      console.error(chalk.red('❌ Compilation failed:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Show help if no arguments
if (process.argv.length === 2) {
  program.help();
}

program.parse();