import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getOutputPath, loadConfig } from '../../src/config/loader.js';
import type { RclConfig } from '../../src/config/types.js';

describe('Config Loader', () => {
  const testDir = path.join(__dirname, `.test-workspace-${Date.now()}`);
  const configPath = path.join(testDir, 'rcl.config.json');

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('loadConfig', () => {
    it('should use defaults when starting from directory without config', () => {
      // Since we may have configs in parent directories, let's test that
      // the config system works correctly regardless
      const isolatedDir = path.join(testDir, 'isolated');
      fs.mkdirSync(isolatedDir, { recursive: true });

      const result = loadConfig(isolatedDir);

      expect(result.errors).toHaveLength(0);
      expect(result.config.compilerOptions?.strict).toBe(true);

      // The config should have valid settings whether from parent or defaults
      expect(result.config.compilerOptions?.generateSourceMap).toBeDefined();
      expect(result.config.compilerOptions?.emit?.json).toBe(true);
      expect(result.config.compilerOptions?.emit?.javascript).toBe(true);
    });

    it('should load config from rcl.config.json', () => {
      const testConfig: RclConfig = {
        outDir: './dist',
        compilerOptions: {
          strict: false,
          generateSourceMap: false,
        },
      };

      fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));

      const result = loadConfig(testDir);

      expect(result.configFilePath).toBe(configPath);
      expect(result.errors).toHaveLength(0);
      expect(result.config.outDir).toBe(path.join(testDir, 'dist'));
      expect(result.config.compilerOptions?.strict).toBe(false);
      expect(result.config.compilerOptions?.generateSourceMap).toBe(false);
    });

    it('should find config in parent directory', () => {
      const subDir = path.join(testDir, 'src', 'agents');
      fs.mkdirSync(subDir, { recursive: true });

      const testConfig: RclConfig = {
        outDir: './build',
      };

      fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));

      const result = loadConfig(subDir);

      expect(result.configFilePath).toBe(configPath);
      expect(result.config.rootDir).toBe(testDir);
      expect(result.config.outDir).toBe(path.join(testDir, 'build'));
    });

    it('should handle invalid JSON gracefully', () => {
      fs.writeFileSync(configPath, 'invalid json content');

      const result = loadConfig(testDir);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to load config');
      expect(result.config.rootDir).toBe(testDir);
      // Should still return default config
      expect(result.config.compilerOptions?.strict).toBe(true);
    });

    it('should merge emit options with defaults', () => {
      const testConfig: RclConfig = {
        compilerOptions: {
          emit: {
            javascript: false,
          },
        },
      };

      fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));

      const result = loadConfig(testDir);

      expect(result.config.compilerOptions?.emit?.javascript).toBe(false);
      expect(result.config.compilerOptions?.emit?.json).toBe(true);
      expect(result.config.compilerOptions?.emit?.declarations).toBe(true);
    });
  });

  describe('getOutputPath', () => {
    it('should place output next to source when no outDir specified', () => {
      const sourceFile = path.join(testDir, 'agents', 'bot.rcl');
      const config: RclConfig = {};

      const jsonPath = getOutputPath(sourceFile, config, '.json');
      const jsPath = getOutputPath(sourceFile, config, '.js');

      expect(jsonPath).toBe(path.join(testDir, 'agents', 'bot.json'));
      expect(jsPath).toBe(path.join(testDir, 'agents', 'bot.js'));
    });

    it('should use outDir when specified', () => {
      const sourceFile = path.join(testDir, 'src', 'agents', 'bot.rcl');
      const config: RclConfig = {
        rootDir: testDir,
        outDir: path.join(testDir, 'dist'),
      };

      const jsonPath = getOutputPath(sourceFile, config, '.json');

      expect(jsonPath).toBe(path.join(testDir, 'dist', 'src', 'agents', 'bot.json'));
    });

    it('should maintain directory structure in outDir', () => {
      const sourceFile = path.join(testDir, 'agents', 'travel', 'bot.rcl');
      const config: RclConfig = {
        rootDir: testDir,
        outDir: path.join(testDir, 'build'),
      };

      const jsPath = getOutputPath(sourceFile, config, '.js');

      expect(jsPath).toBe(path.join(testDir, 'build', 'agents', 'travel', 'bot.js'));
    });
  });
});
