#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const ROOT_DIR = '/work/rcs/rcl';
const VERSION = '0.3.4';

// Package order based on dependencies
const PACKAGES = [
  'ast',           // No deps
  'core',          // Depends on ast
  'file-system',   // Depends on core, ast
  'validation',    // Depends on core, ast
  'parser',        // Depends on core, ast
  'compiler',      // Depends on core, ast, parser, validation, file-system
  'csm',           // No internal deps
  'language-service', // Depends on core, ast, parser, compiler, validation, file-system
  'cli'            // Depends on compiler, core, file-system, parser
];

function updatePackageDeps(packageName) {
  const pkgPath = join(ROOT_DIR, 'packages', packageName, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  
  // Update dependencies
  ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
    if (pkg[depType]) {
      Object.keys(pkg[depType]).forEach(dep => {
        if (dep.startsWith('@rcs-lang/') && pkg[depType][dep] === 'workspace:*') {
          pkg[depType][dep] = `^${VERSION}`;
        }
      });
    }
  });
  
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function publishPackage(packageName) {
  try {
    const pkgDir = join(ROOT_DIR, 'packages', packageName);
    process.chdir(pkgDir);
    
    // Check if already published
    try {
      execSync(`npm view @rcs-lang/${packageName}@${VERSION} version`, { stdio: 'pipe' });
      console.log(`✅ @rcs-lang/${packageName}@${VERSION} already published`);
      return true;
    } catch (e) {
      // Not published yet, continue
    }
    
    console.log(`📦 Publishing @rcs-lang/${packageName}...`);
    execSync('npm publish --access public', { stdio: 'inherit' });
    console.log(`✅ Published @rcs-lang/${packageName}@${VERSION}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to publish @rcs-lang/${packageName}:`, error.message);
    return false;
  }
}

// Main
console.log(`🚀 Publishing RCL packages v${VERSION}...\n`);

for (const pkg of PACKAGES) {
  updatePackageDeps(pkg);
  if (!publishPackage(pkg)) {
    console.error('\n❌ Publishing failed. Aborting.');
    process.exit(1);
  }
}

console.log('\n✨ All packages published successfully!');