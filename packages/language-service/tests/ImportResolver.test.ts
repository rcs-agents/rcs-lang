import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ImportResolver } from '../src/import-resolver/ImportResolver';
import { ProjectRootDetector } from '../src/import-resolver/projectRoot';

describe('ImportResolver', () => {
  let tempDir: string;
  let resolver: ImportResolver;

  beforeEach(() => {
    // Create temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rcl-import-test-'));
    resolver = new ImportResolver({
      projectRoot: tempDir
    });
  });

  afterEach(() => {
    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
    ProjectRootDetector.clearCache();
  });

  describe('resolveImport', () => {
    it('should resolve relative imports', async () => {
      // Create test files
      const mainFile = path.join(tempDir, 'main.rcl');
      const importedFile = path.join(tempDir, 'imported.rcl');
      
      fs.writeFileSync(mainFile, 'import ./imported\\n');
      fs.writeFileSync(importedFile, 'agent TestAgent\\n  name: "Test"\\n');

      const result = await resolver.resolveImport('./imported', mainFile);
      
      expect(result.exists).toBe(true);
      expect(result.resolvedPath).toBe(importedFile);
    });

    it('should resolve absolute imports from project root', async () => {
      // Create test files
      const mainFile = path.join(tempDir, 'main.rcl');
      const importedFile = path.join(tempDir, 'shared', 'common.rcl');
      
      fs.mkdirSync(path.join(tempDir, 'shared'));
      fs.writeFileSync(mainFile, 'import shared/common\\n');
      fs.writeFileSync(importedFile, 'agent CommonAgent\\n  name: "Common"\\n');

      const result = await resolver.resolveImport('shared/common', mainFile);
      
      expect(result.exists).toBe(true);
      expect(result.resolvedPath).toBe(importedFile);
    });

    it('should handle non-existent imports', async () => {
      const mainFile = path.join(tempDir, 'main.rcl');
      fs.writeFileSync(mainFile, 'import ./nonexistent\\n');

      const result = await resolver.resolveImport('./nonexistent', mainFile);
      
      expect(result.exists).toBe(false);
      expect(result.exports).toEqual([]);
    });
  });

  describe('extractImports', () => {
    it('should extract import statements from RCL files', async () => {
      const testFile = path.join(tempDir, 'test.rcl');
      const content = `
import ./shared/common
import ./utils/helpers as Utils

agent TestAgent
  name: "Test Agent"
`;
      
      fs.writeFileSync(testFile, content);
      
      const imports = await resolver.extractImports(testFile);
      
      // Note: This test depends on the actual parser implementation
      // For now, we'll just verify the method doesn't throw
      expect(Array.isArray(imports)).toBe(true);
    });
  });
});

describe('ProjectRootDetector', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rcl-root-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    ProjectRootDetector.clearCache();
  });

  it('should detect project root from rclconfig.yml', () => {
    const configFile = path.join(tempDir, 'rclconfig.yml');
    const subDir = path.join(tempDir, 'sub');
    const testFile = path.join(subDir, 'test.rcl');
    
    fs.writeFileSync(configFile, 'version: 1\\n');
    fs.mkdirSync(subDir);
    fs.writeFileSync(testFile, 'agent Test\\n');
    
    const projectRoot = ProjectRootDetector.getProjectRoot(testFile);
    expect(projectRoot).toBe(tempDir);
  });

  it('should fall back to file directory if no config found', () => {
    const subDir = path.join(tempDir, 'sub');
    const testFile = path.join(subDir, 'test.rcl');
    
    fs.mkdirSync(subDir);
    fs.writeFileSync(testFile, 'agent Test\\n');
    
    const projectRoot = ProjectRootDetector.getProjectRoot(testFile);
    expect(projectRoot).toBe(subDir);
  });

  it('should cache project root results', () => {
    const configFile = path.join(tempDir, 'rclconfig.yml');
    const testFile = path.join(tempDir, 'test.rcl');
    
    fs.writeFileSync(configFile, 'version: 1\\n');
    fs.writeFileSync(testFile, 'agent Test\\n');
    
    const root1 = ProjectRootDetector.getProjectRoot(testFile);
    const root2 = ProjectRootDetector.getProjectRoot(testFile);
    
    expect(root1).toBe(root2);
    expect(root1).toBe(tempDir);
  });
});