import * as fs from 'node:fs';
import * as path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { parseRCL } from '../src/compiler';

describe('Parse Command', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const simpleRcl = path.join(fixturesDir, 'simple.rcl');

  beforeAll(() => {
    // Ensure test file exists
    expect(fs.existsSync(simpleRcl)).toBe(true);
  });

  it('should parse an RCL file and output AST', async () => {
    // Capture console output
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string) => logs.push(msg);

    try {
      await parseRCL(simpleRcl, { pretty: true });
    } finally {
      console.log = originalLog;
    }

    // Check that output was produced
    expect(logs.length).toBeGreaterThan(0);

    // Find the JSON output (should be before the success message)
    const jsonOutput = logs.find((log) => log.startsWith('{') || log.startsWith('['));
    expect(jsonOutput).toBeDefined();

    // Verify it's valid JSON
    const ast = JSON.parse(jsonOutput!);
    expect(ast).toBeDefined();
    expect(ast.type).toBeDefined(); // AST should have a type property
  });

  it('should handle non-existent files gracefully', async () => {
    const nonExistentFile = path.join(fixturesDir, 'does-not-exist.rcl');

    await expect(parseRCL(nonExistentFile, {})).rejects.toThrow('not found');
  });

  it('should output compact JSON when pretty is false', async () => {
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string) => logs.push(msg);

    try {
      await parseRCL(simpleRcl, { pretty: false });
    } finally {
      console.log = originalLog;
    }

    // Find the JSON output
    const jsonOutput = logs.find((log) => log.startsWith('{') || log.startsWith('['));
    expect(jsonOutput).toBeDefined();

    // Compact JSON should not have newlines
    expect(jsonOutput).not.toContain('\n');
  });
});
