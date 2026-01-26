import * as cp from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ExtensionContext } from 'vscode';

let cachedBuildHash: string | undefined;
let cachedVersion: string | undefined;

/**
 * Get the build hash for the extension.
 * This is cached after the first call to ensure consistency across all webviews.
 */
export function getBuildHash(): string {
  if (cachedBuildHash) {
    return cachedBuildHash;
  }

  try {
    // Try to get git commit hash
    const result = cp.execSync('git rev-parse --short=4 HEAD', { encoding: 'utf8' }).trim();
    cachedBuildHash = result;
    return result;
  } catch {
    // Fallback to a timestamp-based hash if git is not available
    const timestamp = Date.now().toString(36);
    cachedBuildHash = timestamp.substring(timestamp.length - 4);
    return cachedBuildHash;
  }
}

/**
 * Get the extension version from package.json.
 * This is cached after the first call.
 */
export function getExtensionVersion(context: ExtensionContext): string {
  if (cachedVersion) {
    return cachedVersion;
  }

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(context.extensionPath, 'package.json'), 'utf8')
    );
    cachedVersion = packageJson.version || '0.0.0';
    return cachedVersion;
  } catch {
    cachedVersion = '0.0.0';
    return cachedVersion;
  }
}