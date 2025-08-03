#!/usr/bin/env node

import { Command } from 'commander';
import { version } from '../package.json';
import { compileRCL } from './compiler.js';

const program = new Command();

program
  .name('rcl')
  .description('CLI tool for compiling RCL files to JavaScript/JSON')
  .version(version);

program
  .command('compile <input>')
  .description('Compile an RCL file to JavaScript/JSON')
  .option('-o, --output <file>', 'Output file path')
  .option('-f, --format <format>', 'Output format (js|json)', 'js')
  .option('--pretty', 'Pretty print JSON output', true)
  .action(async (input: string, options: any) => {
    try {
      await compileRCL(input, options);
      console.log('✓ Compilation successful');
    } catch (error) {
      console.error('✗ Compilation failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
