#!/usr/bin/env bun

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const ROOT_DIR = resolve(import.meta.dir, '..');
const VERSION_TYPE = process.argv[2] || 'patch'; // patch, minor, major

// Function to compare semantic versions
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }
  return 0;
}

// Function to discover all packages dynamically
function discoverAllPackages() {
  const packagePaths = ['package.json']; // Start with root
  
  // Discover packages in packages/ directory
  const packagesDir = join(ROOT_DIR, 'packages');
  if (existsSync(packagesDir)) {
    const entries = readdirSync(packagesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const pkgJsonPath = join('packages', entry.name, 'package.json');
        if (existsSync(join(ROOT_DIR, pkgJsonPath))) {
          packagePaths.push(pkgJsonPath);
        }
      }
    }
  }
  
  // Discover packages in libs/ directory
  const libsDir = join(ROOT_DIR, 'libs');
  if (existsSync(libsDir)) {
    const entries = readdirSync(libsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const pkgJsonPath = join('libs', entry.name, 'package.json');
        if (existsSync(join(ROOT_DIR, pkgJsonPath))) {
          packagePaths.push(pkgJsonPath);
        }
      }
    }
  }
  
  return packagePaths;
}

// Find the highest version across all packages
function findHighestVersion(packagePaths) {
  let highestVersion = '0.0.0';
  
  for (const pkgPath of packagePaths) {
    try {
      const fullPath = join(ROOT_DIR, pkgPath);
      const pkg = JSON.parse(readFileSync(fullPath, 'utf8'));
      if (pkg.version && compareVersions(pkg.version, highestVersion) > 0) {
        highestVersion = pkg.version;
      }
    } catch (err) {
      console.warn(`⚠️  Could not read version from ${pkgPath}`);
    }
  }
  
  return highestVersion;
}

// Main logic
const packages = discoverAllPackages();
console.log(`📦 Found ${packages.length} packages`);

// Find the highest version
const currentVersion = findHighestVersion(packages);
console.log(`📌 Highest current version: ${currentVersion}`);

// Calculate new version based on the highest version
const [major, minor, patch] = currentVersion.split('.').map(Number);
let newVersion;

switch (VERSION_TYPE) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`🚀 New version: ${newVersion}`);
console.log('');

// Update all package.json files
let successCount = 0;
let failCount = 0;

packages.forEach(pkgPath => {
  const fullPath = join(ROOT_DIR, pkgPath);
  try {
    const pkg = JSON.parse(readFileSync(fullPath, 'utf8'));
    const oldVersion = pkg.version || 'none';
    pkg.version = newVersion;
    writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`✅ Updated ${pkgPath} (${oldVersion} → ${newVersion})`);
    successCount++;
  } catch (err) {
    console.error(`❌ Failed to update ${pkgPath}:`, err.message);
    failCount++;
  }
});

console.log('');
console.log('📊 Summary:');
console.log(`   ✅ Successfully updated: ${successCount} packages`);
if (failCount > 0) {
  console.log(`   ❌ Failed to update: ${failCount} packages`);
}
console.log('');
console.log(`✨ Version bump complete! All packages set to ${newVersion}`);