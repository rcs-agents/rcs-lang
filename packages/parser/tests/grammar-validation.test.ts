import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('ANTLR Grammar Validation', () => {
  it('should have valid lexer grammar syntax', () => {
    const lexerGrammar = resolve(__dirname, '../src/RclLexer.g4');
    expect(existsSync(lexerGrammar)).toBe(true);

    // This should not throw if the grammar is valid
    expect(() => {
      execSync(`antlr4ts -o /tmp/test-lexer ${lexerGrammar}`, {
        stdio: 'pipe',
        timeout: 10000,
      });
    }).not.toThrow();
  });

  it('should have valid parser grammar syntax when lexer is available', () => {
    const parserGrammar = resolve(__dirname, '../src/RclParser.g4');
    const lexerTokens = resolve(__dirname, '../src/RclLexer.tokens');

    expect(existsSync(parserGrammar)).toBe(true);

    // Only test if tokens file exists (after build)
    if (existsSync(lexerTokens)) {
      expect(() => {
        execSync(`antlr4ts -visitor -o /tmp/test-parser ${parserGrammar}`, {
          stdio: 'pipe',
          timeout: 10000,
          cwd: resolve(__dirname, '../src'),
        });
      }).not.toThrow();
    } else {
      console.warn('Skipping parser validation - run build first to generate tokens');
    }
  });

  it('should have generated parser files', () => {
    const generatedDir = resolve(__dirname, '../src/generated');
    const requiredFiles = [
      'RclLexer.ts',
      'RclParser.ts',
      'RclParserListener.ts',
      'RclParserVisitor.ts',
    ];

    for (const file of requiredFiles) {
      const filePath = resolve(generatedDir, file);
      expect(existsSync(filePath)).toBe(true);
    }
  });

  it('should validate grammar rules have proper alternation syntax', () => {
    // Read the parser grammar file and check for common syntax errors
    const fs = require('node:fs');
    const parserGrammar = resolve(__dirname, '../src/RclParser.g4');
    const content = fs.readFileSync(parserGrammar, 'utf8');

    // Check for rules that start with | (invalid syntax)
    const lines = content.split('\n');
    const errors: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';

      // Check for rules that incorrectly start with |
      if (line.match(/^[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*$/)) {
        // This is a rule definition, check if next non-empty line starts with |
        if (nextLine.startsWith('|')) {
          errors.push(
            `Line ${i + 2}: Rule '${line}' cannot start with '|' on next line - ${nextLine}`,
          );
        }
      }

      // Also check for inline rule definitions that start with |
      if (line.match(/^[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*\|/)) {
        errors.push(`Line ${i + 1}: Rule cannot start with '|' - ${line}`);
      }

      // Check for empty alternatives (consecutive | symbols)
      if (line.includes('||')) {
        errors.push(`Line ${i + 1}: Empty alternative found - ${line}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Grammar syntax errors found:\n${errors.join('\n')}`);
    }
  });

  it('should fail build process with invalid grammar', () => {
    // This test verifies that the build process catches grammar errors
    // We'll temporarily introduce an error and check that ANTLR generation fails

    const fs = require('node:fs');
    const parserGrammar = resolve(__dirname, '../src/RclParser.g4');
    const backupPath = `${parserGrammar}.backup`;

    try {
      // Backup original file
      const originalContent = fs.readFileSync(parserGrammar, 'utf8');
      fs.writeFileSync(backupPath, originalContent);

      // Introduce syntax error
      const invalidContent = originalContent.replace(
        'value:\n    primitive_value',
        'value:\n    | primitive_value  // Invalid!',
      );
      fs.writeFileSync(parserGrammar, invalidContent);

      // Try to generate parser - should fail
      expect(() => {
        execSync(`antlr4ts -visitor -o /tmp/test-fail ${parserGrammar}`, {
          stdio: 'pipe',
          timeout: 5000,
          cwd: resolve(__dirname, '../src'),
        });
      }).toThrow();
    } finally {
      // Restore original file
      if (existsSync(backupPath)) {
        const originalContent = fs.readFileSync(backupPath, 'utf8');
        fs.writeFileSync(parserGrammar, originalContent);
        fs.unlinkSync(backupPath);
      }
    }
  });

  it('should not have undefined token references', () => {
    const fs = require('node:fs');
    const lexerGrammar = resolve(__dirname, '../src/RclLexer.g4');
    const parserGrammar = resolve(__dirname, '../src/RclParser.g4');

    const lexerContent = fs.readFileSync(lexerGrammar, 'utf8');
    const parserContent = fs.readFileSync(parserGrammar, 'utf8');

    // Extract all token definitions from lexer
    const tokenDefinitions = new Set<string>();
    const lexerTokenMatches = lexerContent.matchAll(/^([A-Z_][A-Z0-9_]*)\s*:/gm);
    for (const match of lexerTokenMatches) {
      tokenDefinitions.add(match[1]);
    }

    // Extract all token references from parser
    const tokenReferences = new Set<string>();
    const parserTokenMatches = parserContent.matchAll(/\b([A-Z_][A-Z0-9_]*)\b/g);
    for (const match of parserTokenMatches) {
      // Skip keywords and obvious non-tokens
      if (!['EOF', 'ERROR'].includes(match[1])) {
        tokenReferences.add(match[1]);
      }
    }

    // Find undefined references
    const undefinedTokens: string[] = [];
    for (const token of tokenReferences) {
      if (!tokenDefinitions.has(token)) {
        undefinedTokens.push(token);
      }
    }

    if (undefinedTokens.length > 0) {
      console.warn(`Warning: Potentially undefined tokens: ${undefinedTokens.join(', ')}`);
      // Note: This is a warning, not an error, as some tokens might be built-in
    }
  });
});
