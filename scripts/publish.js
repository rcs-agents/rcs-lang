#!/usr/bin/env bun

import { $ } from 'bun';
import { resolve } from 'path';
import { writeFileSync, existsSync, readFileSync, readdirSync } from 'fs';
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

// Function to check version consistency
function checkVersionConsistency(packages) {
  const versions = packages.map(pkg => pkg.version);
  const uniqueVersions = [...new Set(versions)];
  
  if (uniqueVersions.length > 1) {
    console.error('❌ Version mismatch detected!');
    console.error('Found multiple versions across packages:');
    uniqueVersions.forEach(v => {
      const pkgs = packages.filter(p => p.version === v).map(p => p.name);
      console.error(`   ${v}: ${pkgs.join(', ')}`);
    });
    console.error('\nPlease run "bun run version:bump" to align all package versions.');
    process.exit(1);
  }
  
  console.log(`✅ All packages are at version ${uniqueVersions[0]}\n`);
}

// Discover all packages in the packages directory
function discoverPackages() {
  const packagesDir = resolve(ROOT_DIR, 'packages');
  const packages = [];
  
  if (!existsSync(packagesDir)) {
    console.warn('⚠️  packages directory not found');
    return packages;
  }
  
  const entries = readdirSync(packagesDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const packageJsonPath = resolve(packagesDir, entry.name, 'package.json');
      
      if (existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
          
          // Only include packages that are not private
          if (!packageJson.private) {
            packages.push({
              name: packageJson.name,
              path: `packages/${entry.name}`,
              version: packageJson.version,
              dependencies: packageJson.dependencies || {},
              packageJson
            });
          }
        } catch (error) {
          console.warn(`⚠️  Failed to read package.json for ${entry.name}:`, error.message);
        }
      }
    }
  }
  
  return packages;
}

// Sort packages by dependency order (topological sort)
function sortPackagesByDependencies(packages) {
  const sorted = [];
  const visiting = new Set();
  const visited = new Set();
  
  function visit(pkg) {
    if (visited.has(pkg.name)) return;
    if (visiting.has(pkg.name)) {
      // Circular dependency - just add it anyway
      console.warn(`⚠️  Circular dependency detected involving ${pkg.name}`);
      return;
    }
    
    visiting.add(pkg.name);
    
    // Visit dependencies first
    for (const depName of Object.keys(pkg.dependencies)) {
      if (depName.startsWith('@rcs-lang/')) {
        const depPkg = packages.find(p => p.name === depName);
        if (depPkg) {
          visit(depPkg);
        }
      }
    }
    
    visiting.delete(pkg.name);
    visited.add(pkg.name);
    sorted.push(pkg);
  }
  
  // Visit all packages
  for (const pkg of packages) {
    visit(pkg);
  }
  
  return sorted;
}

const discoveredPackages = discoverPackages();
const PACKAGES = sortPackagesByDependencies(discoveredPackages);

if (PACKAGES.length === 0) {
  console.error('❌ No packages found to publish');
  process.exit(1);
}

console.log(`📋 Found ${PACKAGES.length} packages to publish:`);
for (const pkg of PACKAGES) {
  console.log(`   • ${pkg.name}@${pkg.version} (${pkg.path})`);
}

console.log('');

// Check version consistency before proceeding
checkVersionConsistency(PACKAGES);

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