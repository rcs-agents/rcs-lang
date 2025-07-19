#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

/**
 * Prepare for release by:
 * 1. Updating versions
 * 2. Creating a release commit
 * 3. Pushing to release branch
 */
async function prepareRelease() {
  const args = process.argv.slice(2);
  const versionType = args[0] || 'patch'; // patch, minor, major
  const dryRun = args.includes('--dry-run');
  
  if (!['patch', 'minor', 'major'].includes(versionType)) {
    console.error('Usage: bun scripts/prepare-release.js [patch|minor|major] [--dry-run]');
    process.exit(1);
  }

  console.log(`Preparing ${versionType} release...`);
  
  try {
    // 1. Ensure we're on main branch
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    if (currentBranch !== 'main') {
      console.error('Error: Must be on main branch to prepare release');
      console.error(`Current branch: ${currentBranch}`);
      process.exit(1);
    }
    
    // 2. Ensure working directory is clean
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status) {
      console.error('Error: Working directory is not clean');
      console.error('Please commit or stash your changes first');
      process.exit(1);
    }
    
    // 3. Pull latest changes
    console.log('Pulling latest changes from main...');
    if (!dryRun) {
      execSync('git pull origin main', { stdio: 'inherit' });
    }
    
    // 4. Run version bump script
    console.log(`Bumping ${versionType} version...`);
    if (!dryRun) {
      execSync(`bun scripts/version.js ${versionType}`, { stdio: 'inherit' });
    }
    
    // 5. Get new version
    const rootPkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8'));
    const newVersion = rootPkg.version;
    console.log(`New version: ${newVersion}`);
    
    // 6. Create commit
    console.log('Creating version bump commit...');
    if (!dryRun) {
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "chore: release v${newVersion}"`, { stdio: 'inherit' });
    }
    
    // 7. Push to release branch
    console.log('Pushing to release branch...');
    if (!dryRun) {
      // Push current commit to release branch
      execSync('git push origin HEAD:release', { stdio: 'inherit' });
      
      console.log('');
      console.log(`✅ Release v${newVersion} has been triggered!`);
      console.log('');
      console.log('Next steps:');
      console.log('1. Check GitHub Actions for the release workflow');
      console.log('2. Once complete, the tag will be synced to main');
      console.log('3. Pull main to get the synced tag: git pull origin main --tags');
    } else {
      console.log('');
      console.log('Dry run complete. No changes were made.');
      console.log(`Would have released version: ${newVersion}`);
    }
    
  } catch (error) {
    console.error('Error preparing release:', error.message);
    process.exit(1);
  }
}

prepareRelease();