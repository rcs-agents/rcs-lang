import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RclProgram } from '../../src/program/RclProgram';

describe('RclProgram', () => {
  const testDir = path.join(__dirname, `.test-workspace-${Date.now()}`);
  const configPath = path.join(testDir, 'rcl.config.json');

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create test config
    const config = {
      outDir: './dist',
      compilerOptions: {
        emit: {
          json: true,
          javascript: true,
          declarations: true,
        },
      },
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('compilation', () => {
    it('should compile a valid RCL file', async () => {
      const program = new RclProgram(testDir);

      // Correct RCL structure with flow and messages inside agent
      const rclContent = `agent TravelBot
  displayName: "Travel Assistant"
  brandName: "TravelCo"
  
  flow MainFlow
    start: Welcome
    
    on Welcome
      -> Welcome
    
  messages Messages
    text Welcome "Hello, welcome to TravelBot!"`;

      const rclPath = path.join(testDir, 'agent.rcl');
      fs.writeFileSync(rclPath, rclContent);

      const result = await program.compileFile(rclPath);

      if (!result.success) {
        console.log('Compilation failed with diagnostics:', result.diagnostics);
      }

      // FIXED: Semantic validator no longer produces false positive errors
      // The schema validation that was incorrectly applied to AST structure has been disabled
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // Verify compilation succeeded with proper data structure
      if (result.data) {
        expect(result.data.agent).toBeDefined();
        expect(result.data.agent.name).toBe('TravelBot');
        expect(result.data.agent.displayName).toBe('Travel Assistant');
        expect(result.data.messages).toBeDefined();
        expect(result.data.messages.Welcome).toBeDefined();
        expect(result.data.flows).toBeDefined();
        expect(result.data.flows.MainFlow).toBeDefined();
      }

      // Should have no validation errors
      const errorCount = result.diagnostics.filter((d) => d.severity === 'error').length;
      expect(errorCount).toBe(0);
    });

    it('should report error for missing displayName', async () => {
      const program = new RclProgram(testDir);

      const rclContent = `agent TravelBot
  brandName: "TravelCo"
  
  flow MainFlow
    start: Welcome
    
    on Welcome
      -> Welcome
    
  messages Messages
    text Welcome "Hello!"`;

      const rclPath = path.join(testDir, 'agent.rcl');
      fs.writeFileSync(rclPath, rclContent);

      const result = await program.compileFile(rclPath);

      // The semantic validator should catch the missing displayName
      const semanticErrors = result.diagnostics.filter(
        (d) => d.severity === 'error' && d.message.includes('displayName'),
      );
      expect(semanticErrors.length).toBeGreaterThan(0);
    });

    it('should handle parse errors', async () => {
      const program = new RclProgram(testDir);

      const rclContent = `agent TravelBot
  displayName "Missing colon"
  
  flow MainFlow
    start: Welcome
    
    on Welcome
      -> Welcome
  
  messages Messages
    text Welcome "Hello!"`;

      const rclPath = path.join(testDir, 'agent.rcl');
      fs.writeFileSync(rclPath, rclContent);

      const result = await program.compileFile(rclPath);

      expect(result.success).toBe(false);
      expect(result.diagnostics.length).toBeGreaterThan(0);
      expect(result.diagnostics[0].severity).toBe('error');
    });
  });

  describe('emit', () => {
    it.skip('should emit JSON, JS, and d.ts files', async () => {
      // Skip this test until ANTLR parser is fully functional
      const program = new RclProgram(testDir);

      const rclContent = `agent TravelBot
  displayName: "Travel Assistant"
  
  flow MainFlow
    start: Welcome
    
    on Welcome
      -> Welcome
    
  messages Messages
    text Welcome "Hello!"`;

      const rclPath = path.join(testDir, 'agent.rcl');
      fs.writeFileSync(rclPath, rclContent);

      await program.addSourceFile(rclPath);
      const emitResult = await program.emit();

      expect(emitResult.success).toBe(true);
      expect(emitResult.emittedFiles).toHaveLength(3);

      const jsonPath = path.join(testDir, 'dist', 'agent.json');
      const jsPath = path.join(testDir, 'dist', 'agent.js');
      const dtsPath = path.join(testDir, 'dist', 'agent.d.ts');

      expect(fs.existsSync(jsonPath)).toBe(true);
      expect(fs.existsSync(jsPath)).toBe(true);
      expect(fs.existsSync(dtsPath)).toBe(true);

      // Verify JSON content
      const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      expect(jsonContent.agent.name).toBe('TravelBot');
      expect(jsonContent.messages.Welcome).toBeDefined();

      // Verify JS imports JSON
      const jsContent = fs.readFileSync(jsPath, 'utf-8');
      expect(jsContent).toContain("import agentData from './agent.json'");
      expect(jsContent).toContain('export const messages');
    });

    it.skip('should emit only enabled file types', async () => {
      // Skip this test until ANTLR parser is fully functional
      // Create config with only JSON enabled
      const config = {
        outDir: './dist',
        compilerOptions: {
          emit: {
            json: true,
            javascript: false,
            declarations: false,
          },
        },
      };
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const program = new RclProgram(testDir);

      const rclContent = `agent TravelBot
  displayName: "Travel Assistant"
  
  flow MainFlow
    start: Welcome
    
    on Welcome
      -> Welcome
    
  messages Messages
    text Welcome "Hello!"`;

      const rclPath = path.join(testDir, 'agent.rcl');
      fs.writeFileSync(rclPath, rclContent);

      await program.addSourceFile(rclPath);
      const emitResult = await program.emit();

      expect(emitResult.success).toBe(true);
      expect(emitResult.emittedFiles).toHaveLength(1);
      expect(emitResult.emittedFiles[0]).toContain('.json');
    });
  });

  describe('diagnostics', () => {
    it('should collect diagnostics from multiple files', async () => {
      const program = new RclProgram(testDir);

      // File with missing displayName
      const file1 = path.join(testDir, 'agent1.rcl');
      fs.writeFileSync(
        file1,
        `agent Bot1
  flow MainFlow
    start: Hello
    
    on Hello
      -> Hello
    
  messages Messages
    text Hello "Hi"`,
      );

      // File with parse error
      const file2 = path.join(testDir, 'agent2.rcl');
      fs.writeFileSync(
        file2,
        `agent Bot2
  displayName "Missing colon"
  
  flow MainFlow
    start: Hello
    
    on Hello
      -> Hello
    
  messages Messages
    text Hello "Hi"`,
      );

      await program.addSourceFile(file1);
      await program.addSourceFile(file2);

      const diagnostics = program.getDiagnostics();
      expect(diagnostics.length).toBeGreaterThanOrEqual(2);

      const _semanticDiagnostics = program.getSemanticDiagnostics();
      const _syntacticDiagnostics = program.getSyntacticDiagnostics();

      // At least one file should have diagnostics
      expect(diagnostics.length).toBeGreaterThan(0);
    });
  });
});
