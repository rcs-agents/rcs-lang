#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const DOCS_ROOT = path.resolve(PACKAGE_ROOT, '../../apps/docs');
const TYPEDOC_OUT = path.join(PACKAGE_ROOT, 'docs-markdown');
const DOCS_TARGET = path.join(DOCS_ROOT, 'src/content/docs/api/types');

async function generateDocs() {
  console.log('📚 Generating TypeDoc documentation for @rcs-lang/types...');
  
  // Create TypeDoc config for markdown output
  const typeDocConfig = {
    entryPoints: ['src/index.ts'],
    out: 'docs-markdown',
    readme: 'README.md',
    name: '@rcs-lang/types',
    includeVersion: true,
    categorizeByGroup: true,
    sort: ['source-order'],
    plugin: ['typedoc-plugin-markdown'],
    hideBreadcrumbs: true,
    hideInPageTOC: true,
    publicPath: '/api/types/',
  };
  
  // Write temporary TypeDoc config
  const configPath = path.join(PACKAGE_ROOT, 'typedoc-markdown.json');
  await fs.writeFile(configPath, JSON.stringify(typeDocConfig, null, 2));
  
  try {
    // Generate markdown docs
    console.log('  ⚙️  Running TypeDoc...');
    execSync('npx typedoc --options typedoc-markdown.json', {
      cwd: PACKAGE_ROOT,
      stdio: 'inherit'
    });
    
    // Ensure target directory exists
    await fs.mkdir(DOCS_TARGET, { recursive: true });
    
    // Copy generated docs to the docs app
    console.log('  📁 Copying to docs app...');
    await copyDirectory(TYPEDOC_OUT, DOCS_TARGET);
    
    // Clean up
    await fs.rm(TYPEDOC_OUT, { recursive: true, force: true });
    await fs.unlink(configPath);
    
    console.log('✅ Documentation generated successfully!');
    console.log(`   Location: ${DOCS_TARGET}`);
  } catch (error) {
    console.error('❌ Error generating documentation:', error);
    // Clean up on error
    await fs.rm(TYPEDOC_OUT, { recursive: true, force: true }).catch(() => {});
    await fs.unlink(configPath).catch(() => {});
    process.exit(1);
  }
}

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      // Transform markdown files for Astro
      if (entry.name.endsWith('.md')) {
        let content = await fs.readFile(srcPath, 'utf-8');
        
        // Add frontmatter if missing
        if (!content.startsWith('---')) {
          const title = path.basename(entry.name, '.md').replace(/-/g, ' ');
          content = `---\ntitle: "${title}"\n---\n\n${content}`;
        }
        
        await fs.writeFile(destPath, content);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
}

// Run the script
generateDocs();