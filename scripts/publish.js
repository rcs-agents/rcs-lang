#!/usr/bin/env bun

import { $ } from 'bun';
import { resolve } from 'path';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { replaceWorkspaceDependencies, restorePackageJson } from './prepare-publish.js';

const ROOT_DIR = resolve(import.meta.dir, '..');
const isDryRun = process.argv.includes('--dry-run');

// Setup npm authentication
const npmToken = process.env.NPM_CONFIG_TOKEN;
if (!npmToken && !isDryRun) {
  console.error('❌ NPM_CONFIG_TOKEN environment variable is not set');
  console.error('Please set NPM_CONFIG_TOKEN in your .env file or environment');
  process.exit(1);
}

// Create or update .npmrc with auth token
if (npmToken) {
  const npmrcPath = resolve(homedir(), '.npmrc');
  const npmrcContent = `//registry.npmjs.org/:_authToken=${npmToken}\n`;
  
  // Append to existing .npmrc or create new one
  if (existsSync(npmrcPath)) {
    const existing = readFileSync(npmrcPath, 'utf8');
    if (!existing.includes('//registry.npmjs.org/:_authToken=')) {
      writeFileSync(npmrcPath, existing + '\n' + npmrcContent);
    }
  } else {
    writeFileSync(npmrcPath, npmrcContent);
  }
}

console.log(`🚀 Publishing RCL packages${isDryRun ? ' (DRY RUN)' : ''}...\n`);

// Packages to publish in order (respecting dependencies)
const PACKAGES = [
  // Packages in dependency order
  { name: '@rcs-lang/ast', path: 'packages/ast' },
  { name: '@rcs-lang/parser', path: 'packages/parser' },
  { name: '@rcs-lang/csm', path: 'packages/csm' },
  { name: '@rcs-lang/compiler', path: 'packages/compiler' },
  { name: '@rcs-lang/language-service', path: 'packages/language-service' },
  { name: '@rcs-lang/cli', path: 'packages/cli' },
];

async function publishPackage(pkg) {
  console.log(`\n📦 Publishing ${pkg.name}...`);
  
  const packageDir = resolve(ROOT_DIR, pkg.path);
  const packageJsonPath = resolve(packageDir, 'package.json');
  
  // Note: While bun publish handles workspace:* dependencies automatically,
  // we still need to remove the "private: true" field from packages
  const backupPath = replaceWorkspaceDependencies(packageJsonPath);
  
  process.chdir(packageDir);
  
  try {
    // Use bun publish which automatically handles workspace:* dependencies
    // --access public is required for scoped packages
    if (isDryRun) {
      await $`bun publish --dry-run --access public`;
    } else {
      await $`bun publish --access public`;
    }
    console.log(`✅ ${pkg.name} published successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to publish ${pkg.name}:`, error.message);
    return false;
  } finally {
    // Always restore the original package.json
    restorePackageJson(packageJsonPath, backupPath);
  }
}

async function main() {
  let failedPackages = [];
  
  for (const pkg of PACKAGES) {
    const success = await publishPackage(pkg);
    if (!success) {
      failedPackages.push(pkg.name);
      if (!isDryRun) {
        // Stop on first failure in real publish
        break;
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (failedPackages.length > 0) {
    console.log(`\n❌ Failed to publish: ${failedPackages.join(', ')}`);
    process.exit(1);
  } else {
    console.log(`\n✨ All packages published successfully!`);
  }
}

main().catch(console.error);