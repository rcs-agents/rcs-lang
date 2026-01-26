#!/usr/bin/env node

const { execSync } = require('node:child_process');
const path = require('node:path');

const packages = [
  'libs/core',
  'libs/file-system',
  'libs/validation',
  'packages/parser',
  'packages/parser',
  'packages/compiler',
  'apps/cli',
  'apps/extension/server',
];

const rootDir = __dirname;

console.log('🔨 Building RCL monorepo packages...');

for (const pkg of packages) {
  const fullPath = path.join(rootDir, pkg);
  console.log(`📦 Building ${pkg}...`);

  try {
    execSync('bun run build', {
      cwd: fullPath,
      stdio: 'inherit',
      timeout: 60000,
    });
    console.log(`✅ ${pkg} built successfully`);
  } catch (error) {
    console.error(`❌ Failed to build ${pkg}:`, error.message);
    process.exit(1);
  }
}

console.log('🎉 All packages built successfully!');
