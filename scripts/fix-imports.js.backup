#!/usr/bin/env bun

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';

const packagesDir = join(process.cwd(), 'packages');
const appsDir = join(process.cwd(), 'apps');
const libsDir = join(process.cwd(), 'libs');

async function* walkDir(dir) {
  const files = await readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const path = join(dir, file.name);
    if (file.isDirectory()) {
      if (file.name === 'node_modules' || file.name === 'dist' || file.name === 'build') continue;
      yield* walkDir(path);
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
      yield path;
    }
  }
}

async function fixImports(filePath) {
  let content = await readFile(filePath, 'utf8');
  let modified = false;

  // Fix relative imports and exports that don't have .js extension
  const importExportRegex = /((?:import|export)\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)?(?:\s*,\s*(?:\{[^}]*\}|\w+))?\s+from\s+['"])(\.\.?\/[^'"]+)(?<!\.js)(['"])/g;
  
  content = content.replace(importExportRegex, (match, prefix, path, suffix) => {
    // Skip if it's already a .js file or if it's importing a directory (package)
    if (path.endsWith('.json') || path.includes('node_modules')) {
      return match;
    }
    
    // Check if the path might be a directory (no file extension)
    const hasExtension = /\.\w+$/.test(path);
    if (!hasExtension || path.endsWith('.ts') || path.endsWith('.tsx')) {
      modified = true;
      // Remove .ts or .tsx if present and add .js
      const cleanPath = path.replace(/\.(ts|tsx)$/, '');
      return `${prefix}${cleanPath}.js${suffix}`;
    }
    
    return match;
  });

  // Fix export statements without from clause
  const exportRegex = /export\s*\{[^}]*\}\s+from\s+['"](\.\/?[^'"]+)(?<!\.js)['"]/g;
  content = content.replace(exportRegex, (match, path) => {
    if (path.endsWith('.json') || path.includes('node_modules')) {
      return match;
    }
    modified = true;
    const cleanPath = path.replace(/\.(ts|tsx)$/, '');
    return match.replace(path, `${cleanPath}.js`);
  });

  // Fix re-exports (export * from)
  const reExportRegex = /export\s*\*\s+(?:as\s+\w+\s+)?from\s+['"](\.\/?[^'"]+)(?<!\.js)['"]/g;
  content = content.replace(reExportRegex, (match, path) => {
    if (path.endsWith('.json') || path.includes('node_modules')) {
      return match;
    }
    modified = true;
    const cleanPath = path.replace(/\.(ts|tsx)$/, '');
    return match.replace(path, `${cleanPath}.js`);
  });

  if (modified) {
    await writeFile(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
  }
}

async function main() {
  console.log('Fixing imports to use .js extensions...\n');

  for (const baseDir of [packagesDir, appsDir, libsDir]) {
    try {
      for await (const file of walkDir(baseDir)) {
        await fixImports(file);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`Error processing ${baseDir}:`, error);
      }
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);