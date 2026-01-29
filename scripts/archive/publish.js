#!/usr/bin/env bun

import { $ } from 'bun';
import { resolve, join } from 'path';
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';

const ROOT_DIR = resolve(import.meta.dir, '..');
const isDryRun = process.argv.includes('--dry-run');

// Parse version increment type from command line arguments
const getVersionType = () => {
  if (process.argv.includes('--major')) return 'major';
  if (process.argv.includes('--minor')) return 'minor';
  if (process.argv.includes('--patch')) return 'patch';
  return 'patch'; // default
};

const versionType = getVersionType();

console.log(`🚀 Publishing RCL packages${isDryRun ? ' (DRY RUN)' : ''}...\n`);

// Get the highest published version of all @rcs-lang packages
function getHighestPublishedVersion() {
  console.log('🔍 Finding @rcs-lang packages...');
  
  // Get all packages from local packages/ directory (more reliable than npm search)
  const localPackages = [];
  try {
    const packagesDir = join(ROOT_DIR, 'packages');
    const dirs = readdirSync(packagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const dir of dirs) {
      const packagePath = join(packagesDir, dir, 'package.json');
      try {
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
        if (packageJson.name && packageJson.name.startsWith('@rcs-lang/') && !packageJson.private) {
          localPackages.push(packageJson.name);
        }
      } catch (err) {
        // Skip invalid package.json files
      }
    }
  } catch (err) {
    console.warn('⚠️ Failed to read local packages, using fallback list');
  }
  
  // Fallback list if local discovery fails
  const fallbackPackages = [
    '@rcs-lang/ast',
    '@rcs-lang/compiler', 
    '@rcs-lang/csm',
    '@rcs-lang/language-service',
    '@rcs-lang/parser',
    '@rcs-lang/cli',
    '@rcs-lang/core',
    '@rcs-lang/file-system',
    '@rcs-lang/validation'
  ];
  
  const packagesToCheck = localPackages.length > 0 ? localPackages : fallbackPackages;
  let highestVersion = '0.0.0';
  
  console.log(`Checking ${packagesToCheck.length} packages for latest versions...`);
  
  for (const pkgName of packagesToCheck) {
    try {
      // Query each package individually to get the actual latest version (not stale search data)
      const version = execSync(`npm view ${pkgName} version`, { encoding: 'utf8' }).trim();
      
      if (compareVersions(version, highestVersion) > 0) {
        highestVersion = version;
      }
      console.log(`📦 ${pkgName}: ${version}`);
    } catch (err) {
      console.log(`📦 ${pkgName}: not found`);
    }
  }
  
  return highestVersion;
}

// Compare semver versions (returns -1, 0, or 1)
function compareVersions(a, b) {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (partsA[i] > partsB[i]) return 1;
    if (partsA[i] < partsB[i]) return -1;
  }
  return 0;
}

// Discover all packages in packages/ directory
function discoverPackages() {
  const packagesDir = join(ROOT_DIR, 'packages');
  const packages = [];
  
  try {
    const dirs = readdirSync(packagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .filter(dirent => !dirent.name.includes('node_modules'))
      .map(dirent => dirent.name);
    
    for (const dir of dirs) {
      const packagePath = join(packagesDir, dir, 'package.json');
      try {
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
        
        if (!packageJson.name) {
          console.log(`⚠️ Skipping ${dir}: no package name`);
          continue;
        }
        
        if (packageJson.private === true) {
          console.log(`🔒 Skipping private package: ${packageJson.name}`);
          continue;
        }
        
        packages.push({
          name: packageJson.name,
          path: `packages/${dir}`,
          packageJson
        });
        console.log(`📦 Discovered: ${packageJson.name}`);
      } catch (err) {
        console.log(`⚠️ Skipping ${dir}: invalid package.json`);
      }
    }
  } catch (err) {
    console.error('❌ Failed to discover packages:', err.message);
    process.exit(1);
  }
  
  return packages;
}

console.log('🔍 Finding highest published version...');
const highestPublished = getHighestPublishedVersion();
const [major, minor, patch] = highestPublished.split('.').map(Number);

let newVersion;
switch (versionType) {
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

console.log(`\n📈 Highest published version: ${highestPublished}`);
console.log(`🔧 Version increment type: ${versionType}`);
console.log(`🚀 New version: ${newVersion}\n`);

const PACKAGES = discoverPackages();
console.log(`\n🎯 Found ${PACKAGES.length} packages to publish\n`);

// Function to update @rcs-lang dependencies in a package.json
function updateRcsLangDependencies(pkgPath, targetVersion, useWorkspace = false) {
  const packageJson = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies'];
  let updated = false;
  
  depTypes.forEach(depType => {
    if (packageJson[depType]) {
      Object.keys(packageJson[depType]).forEach(dep => {
        if (dep.startsWith('@rcs-lang/')) {
          const oldVersion = packageJson[depType][dep];
          const newVersionSpec = useWorkspace ? 'workspace:*' : `^${targetVersion}`;
          if (oldVersion !== newVersionSpec) {
            packageJson[depType][dep] = newVersionSpec;
            updated = true;
          }
        }
      });
    }
  });
  
  if (updated) {
    writeFileSync(pkgPath, JSON.stringify(packageJson, null, 2) + '\n');
  }
  
  return updated;
}

// Discover all package.json files in the monorepo
function discoverAllPackageJsons() {
  const packages = [];
  const searchDirs = ['apps', 'libs', 'packages'];
  
  // Add root package.json
  packages.push('package.json');
  
  searchDirs.forEach(searchDir => {
    const dirPath = join(ROOT_DIR, searchDir);
    try {
      const dirs = readdirSync(dirPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      dirs.forEach(dir => {
        const packagePath = `${searchDir}/${dir}/package.json`;
        const fullPath = join(ROOT_DIR, packagePath);
        try {
          // Check if package.json exists
          readFileSync(fullPath, 'utf8');
          packages.push(packagePath);
        } catch (err) {
          // Skip if package.json doesn't exist
        }
      });
    } catch (err) {
      // Skip if directory doesn't exist
    }
  });
  
  return packages;
}

// Update all package versions and dependencies
function updateAllPackageVersions(targetVersion, useWorkspace = false) {
  console.log(`\n📝 ${useWorkspace ? 'Restoring workspace dependencies' : 'Updating package versions and dependencies'}...\n`);
  
  const allPackages = discoverAllPackageJsons();

  allPackages.forEach(pkgPath => {
    const fullPath = join(ROOT_DIR, pkgPath);
    try {
      const pkg = JSON.parse(readFileSync(fullPath, 'utf8'));
      
      // Update version for @rcs-lang packages only (but not when restoring workspace deps)
      if (!useWorkspace && pkg.name && pkg.name.startsWith('@rcs-lang/')) {
        pkg.version = targetVersion;
        console.log(`✅ ${pkgPath}: version updated to ${targetVersion}`);
      }
      
      // Update @rcs-lang dependencies in all packages
      const depsUpdated = updateRcsLangDependencies(fullPath, targetVersion, useWorkspace);
      if (depsUpdated) {
        console.log(`✅ ${pkgPath}: dependencies ${useWorkspace ? 'restored to workspace:*' : `updated to ^${targetVersion}`}`);
      }
      
      // Write the package.json with version updates if not useWorkspace
      if (!useWorkspace && pkg.name && pkg.name.startsWith('@rcs-lang/')) {
        writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + '\n');
      }
    } catch (err) {
      console.error(`❌ Failed to update ${pkgPath}:`, err.message);
    }
  });
}

async function publishPackage(pkg) {
  console.log(`\n📦 Publishing ${pkg.name}...`);
  
  const packageDir = resolve(ROOT_DIR, pkg.path);
  const packageJsonPath = join(packageDir, 'package.json');
  
  // Create backup of original package.json
  const originalContent = readFileSync(packageJsonPath, 'utf8');
  const backupPath = packageJsonPath + '.backup';
  writeFileSync(backupPath, originalContent);
  
  try {
    // Replace workspace:* dependencies with actual versions before publishing
    updateRcsLangDependencies(packageJsonPath, newVersion, false);
    
    process.chdir(packageDir);
    
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
    // Always restore original package.json
    writeFileSync(packageJsonPath, originalContent);
    try {
      // Clean up backup file
      unlinkSync(backupPath);
    } catch (err) {
      // Ignore cleanup errors
    }
  }
}

async function main() {
  try {
    // Step 0: Build and test everything BEFORE updating versions
    if (!isDryRun) {
      console.log('🏗️ Building and testing packages...\n');
      try {
        process.chdir(ROOT_DIR);
        await $`bun run build`;
        await $`bun run test`;
        console.log('✅ Build and tests completed successfully!\n');
      } catch (error) {
        console.error('❌ Build or tests failed:', error.message);
        console.error('Please fix build/test issues before publishing.');
        process.exit(1);
      }
    } else {
      console.log('⏭️ Skipping build and test for dry run\n');
    }
    
    // Step 1: Update all package versions and dependencies
    updateAllPackageVersions(newVersion, false);
    
    // Step 2: Publish packages
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
      // Still restore workspace dependencies even if publish failed
      updateAllPackageVersions(newVersion, true);
      process.exit(1);
    } else {
      console.log(`\n✨ All packages published successfully!`);
    }
    
    // Step 3: Restore workspace dependencies
    updateAllPackageVersions(newVersion, true);
    
  } catch (error) {
    console.error('❌ Publish script failed:', error.message);
    // Try to restore workspace dependencies even on error
    try {
      updateAllPackageVersions(newVersion, true);
    } catch (restoreError) {
      console.error('❌ Failed to restore workspace dependencies:', restoreError.message);
    }
    process.exit(1);
  }
}

main().catch(console.error);