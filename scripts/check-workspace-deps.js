#!/usr/bin/env bun

/**
 * Verification script to ensure all internal dependencies use workspace:*
 * Run this before publishing to catch any hard-coded versions.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = import.meta.dir.replace('/scripts', '');
const errors = [];

// Find all package.json files
function findAllPackages() {
  const packages = [];
  const dirs = ['packages', 'apps', 'libs'];

  for (const dir of dirs) {
    try {
      const dirPath = join(ROOT_DIR, dir);
      const entries = readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pkgPath = join(dirPath, entry.name, 'package.json');
          try {
            readFileSync(pkgPath);
            packages.push(pkgPath);
          } catch {}
        }
      }
    } catch {}
  }

  return packages;
}

// Check for hard-coded @rcs-lang versions
function checkPackage(pkgPath) {
  const content = readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(content);

  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies'];
  const issues = [];

  for (const depType of depTypes) {
    if (pkg[depType]) {
      for (const [name, version] of Object.entries(pkg[depType])) {
        if (name.startsWith('@rcs-lang/') && version !== 'workspace:*') {
          issues.push(`${depType}.${name}: ${version} (should be workspace:*)`);
        }
      }
    }
  }

  return issues;
}

console.log('🔍 Checking workspace dependencies...\n');

const packages = findAllPackages();
let totalIssues = 0;

for (const pkgPath of packages) {
  const issues = checkPackage(pkgPath);
  if (issues.length > 0) {
    const relativePath = pkgPath.replace(ROOT_DIR + '/', '');
    console.log(`❌ ${relativePath}`);
    for (const issue of issues) {
      console.log(`   ${issue}`);
    }
    console.log('');
    totalIssues += issues.length;
  }
}

if (totalIssues === 0) {
  console.log('✅ All internal dependencies use workspace:*');
  process.exit(0);
} else {
  console.log(`❌ Found ${totalIssues} hard-coded version(s)`);
  console.log('\nAll @rcs-lang/* dependencies must use "workspace:*"');
  console.log('Please fix the above issues manually.');
  process.exit(1);
}
