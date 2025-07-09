import * as assert from 'node:assert';
import * as vscode from 'vscode';
import { getBuildHash, getExtensionVersion } from '../utils';

suite('Utils Test Suite', () => {
  test('getBuildHash should return a consistent hash', () => {
    const hash1 = getBuildHash();
    const hash2 = getBuildHash();

    assert.strictEqual(typeof hash1, 'string', 'Build hash should be a string');
    assert.strictEqual(hash1.length, 4, 'Build hash should be 4 characters');
    assert.strictEqual(hash1, hash2, 'Build hash should be cached and consistent');
  });

  test('getBuildHash should return valid characters', () => {
    const hash = getBuildHash();

    // Should only contain alphanumeric characters (git hash or base36)
    assert.ok(
      /^[a-z0-9]{4}$/i.test(hash),
      'Build hash should only contain alphanumeric characters',
    );
  });

  test('getExtensionVersion should return a version string', () => {
    // Mock extension context
    const mockContext = {
      extensionPath:
        vscode.extensions.getExtension('rcl-lang.rcl-language-support')?.extensionPath || __dirname,
      subscriptions: [],
      globalState: {} as any,
      workspaceState: {} as any,
      extensionUri: vscode.Uri.file(__dirname),
      extensionMode: vscode.ExtensionMode.Test,
      storagePath: undefined,
      globalStoragePath: '',
      logPath: '',
      asAbsolutePath: (relativePath: string) => relativePath,
      storageUri: undefined,
      globalStorageUri: vscode.Uri.file(''),
      logUri: vscode.Uri.file(''),
      extension: {} as any,
      secrets: {} as any,
      environmentVariableCollection: {} as any,
    } as vscode.ExtensionContext;

    const version1 = getExtensionVersion(mockContext);
    const version2 = getExtensionVersion(mockContext);

    assert.strictEqual(typeof version1, 'string', 'Version should be a string');
    assert.ok(/^\d+\.\d+\.\d+$/.test(version1), 'Version should follow semver format');
    assert.strictEqual(version1, version2, 'Version should be cached and consistent');
  });

  test('getExtensionVersion should return default version on error', () => {
    // Mock context with invalid path
    const mockContext = {
      extensionPath: '/invalid/path/that/does/not/exist',
      subscriptions: [],
      globalState: {} as any,
      workspaceState: {} as any,
      extensionUri: vscode.Uri.file('/invalid/path'),
      extensionMode: vscode.ExtensionMode.Test,
      storagePath: undefined,
      globalStoragePath: '',
      logPath: '',
      asAbsolutePath: (relativePath: string) => relativePath,
      storageUri: undefined,
      globalStorageUri: vscode.Uri.file(''),
      logUri: vscode.Uri.file(''),
      extension: {} as any,
      secrets: {} as any,
      environmentVariableCollection: {} as any,
    } as vscode.ExtensionContext;

    const version = getExtensionVersion(mockContext);

    assert.strictEqual(version, '0.0.0', 'Should return default version on error');
  });
});
