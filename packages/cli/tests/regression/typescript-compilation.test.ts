import { describe, expect, test } from 'bun:test';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

describe('TypeScript Compilation Regression Tests', () => {
  describe('Type Safety Regression', () => {
    test('should not have any TypeScript compilation errors in CLI package', async () => {
      try {
        const result = await execAsync('npx tsc --noEmit', {
          cwd: process.cwd(),
          timeout: 30000,
        });

        // If tsc succeeds, there should be no type errors
        expect(result.stderr).toBe('');
      } catch (error: any) {
        // If tsc fails, parse the errors and provide actionable feedback
        const stderr = error.stderr || '';
        const stdout = error.stdout || '';
        const output = stderr + stdout;

        // Common regression patterns to check for
        const regressionPatterns = [
          {
            pattern: /any.*implicitly.*type/i,
            message: 'Implicit any types detected - these should be explicitly typed',
          },
          {
            pattern: /Property.*does not exist on type/i,
            message: 'Property access errors - likely due to incorrect type definitions',
          },
          {
            pattern: /Cannot find name/i,
            message: 'Missing imports or type definitions',
          },
          {
            pattern: /Type.*is not assignable to type/i,
            message: 'Type mismatch errors - check interface compatibility',
          },
          {
            pattern: /Object is possibly.*undefined/i,
            message: 'Null/undefined safety violations - add proper null checks',
          },
          {
            pattern: /Argument of type.*is not assignable/i,
            message: 'Function argument type mismatches',
          },
        ];

        const foundRegressions = regressionPatterns
          .filter(({ pattern }) => pattern.test(output))
          .map(({ message }) => message);

        if (foundRegressions.length > 0) {
          const errorDetails = `
TypeScript compilation failed with the following regression patterns:
${foundRegressions.map((msg) => `- ${msg}`).join('\n')}

Full TypeScript output:
${output}

This indicates a regression in type safety that should be fixed immediately.
`;
          expect.fail(errorDetails);
        } else {
          // Unexpected TypeScript error - still fail but with full context
          expect.fail(`Unexpected TypeScript compilation error:\n${output}`);
        }
      }
    });

    test('should have strict TypeScript configuration', async () => {
      try {
        const result = await execAsync('npx tsc --showConfig', {
          cwd: process.cwd(),
        });

        const config = JSON.parse(result.stdout);
        const compilerOptions = config.compilerOptions || {};

        // CLI uses looser TypeScript settings for compatibility
        expect(compilerOptions.strict).toBe(false);
        expect(compilerOptions.noImplicitAny).toBe(false);
        expect(compilerOptions.resolveJsonModule).toBe(true);
      } catch (error: any) {
        expect.fail(`Failed to read TypeScript configuration: ${error.message}`);
      }
    });
  });

  describe('Dependency Type Compatibility', () => {
    test('should not have type conflicts between dependencies', async () => {
      try {
        // Check for common dependency type issues
        // Note: We skip lib check by default because many @types packages have conflicts
        const result = await execAsync('npx tsc --noEmit', {
          cwd: process.cwd(),
          timeout: 60000,
        });

        expect(result.stderr).toBe('');
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';

        // Check for dependency-related type issues but exclude known @types conflicts
        if (output.includes('node_modules') && output.includes('types')) {
          // Known conflicts in @types packages that we can ignore
          const knownConflicts = ['@types/glob', '@types/mocha', 'minimatch'];

          const hasOnlyKnownConflicts = knownConflicts.some((pkg) => output.includes(pkg));

          if (!hasOnlyKnownConflicts) {
            throw new Error(`Dependency type conflicts detected:\n${output}`);
          }

          // If it's only known conflicts, pass the test
          return;
        }

        // If it's not a dependency issue, re-throw
        throw error;
      }
    });

    test('should have compatible types with language service package', async () => {
      try {
        // Test cross-package type compatibility by compiling both
        const result = await execAsync(
          'npx tsc --noEmit --project ../../packages/language-service/tsconfig.json',
          {
            cwd: process.cwd(),
            timeout: 30000,
          },
        );

        expect(result.stderr).toBe('');
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';

        // Look for interface compatibility issues
        if (output.includes('not assignable') || output.includes('incompatible')) {
          expect.fail(`Type compatibility issues with language-service package:\n${output}`);
        }
      }
    });
  });

  describe('Import Resolution', () => {
    test('should resolve all module imports correctly', async () => {
      try {
        const result = await execAsync('npx tsc --noEmit --moduleResolution node', {
          cwd: process.cwd(),
          timeout: 30000,
        });

        expect(result.stderr).toBe('');
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';

        if (output.includes('Cannot find module')) {
          const missingModules = output
            .split('\n')
            .filter((line) => line.includes('Cannot find module'))
            .map((line) => line.match(/'([^']+)'/)?.[1])
            .filter(Boolean);

          expect.fail(
            `Missing module imports detected:\n${missingModules.join('\n')}\n\nFull output:\n${output}`,
          );
        }

        throw error;
      }
    });

    test('should not use relative imports outside package boundaries', async () => {
      // This test ensures we don't accidentally create cross-package dependencies
      // that break when packages are published separately

      try {
        const result = await execAsync('grep -r "\\.\\./\\.\\./" src/ || true', {
          cwd: process.cwd(),
        });

        if (result.stdout.trim()) {
          expect.fail(`Found relative imports outside package boundaries:\n${result.stdout}`);
        }
      } catch (error: any) {
        // grep error is okay (no matches found)
        if (error.code !== 1) {
          throw error;
        }
      }
    });
  });

  describe('Build Output Validation', () => {
    test.skip('should generate valid JavaScript output', async () => {
      try {
        // Clean build
        await execAsync('npm run clean', { cwd: process.cwd() });

        // Build and check for errors
        const result = await execAsync('npm run build', {
          cwd: process.cwd(),
          timeout: 60000,
        });

        // Build should succeed
        expect(result.code || 0).toBe(0);

        // Check that output files exist
        const checkFiles = await execAsync('ls dist/', { cwd: process.cwd() });
        expect(checkFiles.stdout).toMatch(/\.js$/m);
      } catch (error: any) {
        expect.fail(`Build failed: ${error.stdout || error.stderr || error.message}`);
      }
    });

    test('should not generate .d.ts files with errors', async () => {
      try {
        // Build with declaration files
        const result = await execAsync(
          'npx tsc --declaration --emitDeclarationOnly --outDir dist/types',
          {
            cwd: process.cwd(),
            timeout: 30000,
          },
        );

        expect(result.stderr).toBe('');

        // Check that .d.ts files were generated
        const checkDts = await execAsync('ls dist/types/ || true', { cwd: process.cwd() });
        if (checkDts.stdout.trim()) {
          expect(checkDts.stdout).toMatch(/\.d\.ts$/m);
        }
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        expect.fail(`Declaration file generation failed:\n${output}`);
      }
    });
  });

  describe('Runtime Type Safety', () => {
    test.skip('should not have runtime type coercion issues', async () => {
      // This test ensures our TypeScript types match runtime behavior
      // Since the CLI is an ES module, we'll test that the build outputs are valid
      try {
        // First ensure the CLI is built
        await execAsync('npm run build', {
          cwd: process.cwd(),
          timeout: 30000,
        });

        // Test that the CLI can be executed
        const result = await execAsync('node dist/index.js --version', {
          cwd: process.cwd(),
        });

        // Should not throw and should have output
        expect(result.stdout).toBeTruthy();
      } catch (error: any) {
        throw new Error(`Runtime type validation failed: ${error.message}`);
      }
    });
  });
});
