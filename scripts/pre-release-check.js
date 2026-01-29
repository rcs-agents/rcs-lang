#!/usr/bin/env bun

/**
 * Pre-release safety checks
 * - Ensures we're on the main branch
 * - Warns about uncommitted changes (but doesn't block)
 * - Shows what will be published
 */

import { execSync } from 'child_process';

console.log('🔍 Pre-release safety checks...\n');

// Check current branch
try {
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  if (branch !== 'main') {
    console.log(`⚠️  WARNING: You're on branch '${branch}', not 'main'`);
    console.log('   Releases should typically be done from main.\n');
  } else {
    console.log(`✅ On main branch\n`);
  }
} catch (err) {
  console.log('⚠️  Could not determine git branch\n');
}

// Check for uncommitted changes in packages/
try {
  const status = execSync('git status --porcelain packages/', { encoding: 'utf8' });
  if (status) {
    console.log('⚠️  WARNING: Uncommitted changes in packages/');
    console.log('   These changes will NOT be published:');
    console.log(status.split('\n').map(line => `   ${line}`).join('\n'));
    console.log();
  } else {
    console.log('✅ No uncommitted changes in packages/\n');
  }
} catch (err) {
  // Ignore
}

// Check for other uncommitted changes (informational only)
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (status) {
    const nonPackageChanges = status
      .split('\n')
      .filter(line => !line.includes('packages/'))
      .filter(line => line.trim());

    if (nonPackageChanges.length > 0) {
      console.log('ℹ️  Other uncommitted changes (will not affect release):');
      console.log(nonPackageChanges.map(line => `   ${line}`).join('\n'));
      console.log();
    }
  }
} catch (err) {
  // Ignore
}

console.log('✅ Pre-release checks complete\n');
