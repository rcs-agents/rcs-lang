#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';

const ROOT_DIR = resolve(import.meta.dir, '..');
const VERSION_TYPE = process.argv[2] || 'patch'; // patch, minor, major

// Read current version from root package.json
const rootPkgPath = join(ROOT_DIR, 'package.json');
const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf8'));
const currentVersion = rootPkg.version;

console.log(`Current version: ${currentVersion}`);

// Calculate new version
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

console.log(`New version: ${newVersion}`);

// Update all package.json files
const packages = [
  'package.json',
  'packages/ast/package.json',
  'packages/compiler/package.json',
  'packages/csm/package.json',
  'packages/language-service/package.json',
  'packages/parser/package.json',
  'packages/cli/package.json',
  'libs/core/package.json',
  'libs/file-system/package.json',
  'libs/validation/package.json',
  'libs/diagram/package.json',
];

packages.forEach(pkgPath => {
  const fullPath = join(ROOT_DIR, pkgPath);
  try {
    const pkg = JSON.parse(readFileSync(fullPath, 'utf8'));
    pkg.version = newVersion;
    writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`✅ Updated ${pkgPath}`);
  } catch (err) {
    console.error(`❌ Failed to update ${pkgPath}:`, err.message);
  }
});

console.log('\n✨ Version bump complete!');
console.log(`All packages updated to version ${newVersion}`);