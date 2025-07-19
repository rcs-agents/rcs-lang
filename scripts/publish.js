#!/usr/bin/env bun

import { $ } from 'bun';
import { resolve } from 'path';

const ROOT_DIR = resolve(import.meta.dir, '..');
const isDryRun = process.argv.includes('--dry-run');

console.log(`🚀 Publishing RCL packages${isDryRun ? ' (DRY RUN)' : ''}...\n`);

// Packages to publish in order (respecting dependencies)
const PACKAGES = [
  { name: '@rcs-lang/ast', path: 'packages/ast' },
  { name: '@rcs-lang/csm', path: 'packages/csm' },
  { name: '@rcs-lang/compiler', path: 'packages/compiler' },
  { name: '@rcs-lang/language-service', path: 'packages/language-service' },
];

async function publishPackage(pkg) {
  console.log(`\n📦 Publishing ${pkg.name}...`);
  
  const packageDir = resolve(ROOT_DIR, pkg.path);
  process.chdir(packageDir);
  
  try {
    if (isDryRun) {
      await $`bunx npm publish --dry-run`;
    } else {
      await $`bunx npm publish --access public`;
    }
    console.log(`✅ ${pkg.name} published successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to publish ${pkg.name}:`, error.message);
    return false;
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