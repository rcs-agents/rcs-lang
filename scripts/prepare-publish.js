#!/usr/bin/env bun

import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { resolve, join } from 'path';

const ROOT_DIR = resolve(import.meta.dir, '..');

/**
 * Get all workspace packages and their versions
 */
function getWorkspacePackages() {
  const packages = {};
  const packagePaths = [
    'packages/ast/package.json',
    'packages/compiler/package.json',
    'packages/csm/package.json',
    'packages/language-service/package.json',
    'packages/parser/package.json',
    'packages/cli/package.json',
  ];

  packagePaths.forEach(pkgPath => {
    try {
      const fullPath = join(ROOT_DIR, pkgPath);
      const pkg = JSON.parse(readFileSync(fullPath, 'utf8'));
      packages[pkg.name] = pkg.version;
    } catch (err) {
      // Skip if package doesn't exist
    }
  });

  return packages;
}

/**
 * Replace workspace:* dependencies with actual version numbers
 * This is needed because npm doesn't understand workspace protocol
 */
function replaceWorkspaceDependencies(packagePath) {
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
  const workspaceVersions = getWorkspacePackages();
  let modified = false;

  // Helper function to replace workspace protocol
  const replaceWorkspace = (deps) => {
    if (!deps) return;
    Object.keys(deps).forEach(dep => {
      if (deps[dep] === 'workspace:*' || deps[dep] === 'workspace:^') {
        const version = workspaceVersions[dep];
        if (version) {
          deps[dep] = `^${version}`;
          modified = true;
        }
      }
    });
  };

  // Check all dependency types
  replaceWorkspace(pkg.dependencies);
  replaceWorkspace(pkg.devDependencies);
  replaceWorkspace(pkg.peerDependencies);
  
  // Remove private field for publishing
  if (pkg.private) {
    delete pkg.private;
    modified = true;
  }

  if (modified) {
    // Create backup
    const backupPath = packagePath + '.backup';
    writeFileSync(backupPath, readFileSync(packagePath, 'utf8'));
    
    // Write updated package.json
    writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
    
    return backupPath;
  }
  
  return null;
}

/**
 * Restore package.json from backup
 */
function restorePackageJson(packagePath, backupPath) {
  if (backupPath) {
    writeFileSync(packagePath, readFileSync(backupPath, 'utf8'));
    // Remove backup file
    try {
      unlinkSync(backupPath);
    } catch (err) {
      // Ignore errors
    }
  }
}

export { replaceWorkspaceDependencies, restorePackageJson };

// If run directly, process all packages
if (import.meta.main) {
  const packages = [
    'packages/ast/package.json',
    'packages/compiler/package.json',
    'packages/csm/package.json',
    'packages/language-service/package.json',
    'packages/parser/package.json',
    'packages/cli/package.json',
  ];

  console.log('Preparing packages for publish...\n');
  
  const backups = [];
  
  packages.forEach(pkgPath => {
    const fullPath = join(ROOT_DIR, pkgPath);
    try {
      const backup = replaceWorkspaceDependencies(fullPath);
      if (backup) {
        backups.push({ path: fullPath, backup });
        console.log(`✅ Updated ${pkgPath}`);
      } else {
        console.log(`⏭️  Skipped ${pkgPath} (no workspace dependencies)`);
      }
    } catch (err) {
      console.error(`❌ Failed to update ${pkgPath}:`, err.message);
    }
  });
  
  console.log('\n✨ Packages prepared for publishing!');
  console.log('Backups created:', backups.length);
}