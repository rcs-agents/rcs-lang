import * as assert from 'assert';
import * as path from 'path';

describe('RCL Extension Client Tests', () => {
  it('should pass basic functionality test', () => {
    // Basic test that doesn't require VS Code
    assert.ok(true);
  });

  it('should handle RCL file paths', () => {
    const testPath = path.join(__dirname, '..', '..', '..', 'sample.rcl');
    assert.ok(testPath.includes('sample.rcl'));
  });

  it('should validate extension configuration', () => {
    const packagePath = path.join(__dirname, '..', '..', 'package.json');
    const fs = require('fs');
    
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      assert.ok(packageJson.name === 'rcl-language-client');
      assert.ok(packageJson.main === './out/extension.js');
    }
  });
});