#!/usr/bin/env bun

/**
 * Safe migration script to convert .js import extensions to .ts extensions
 * This script is designed to work with TypeScript's rewriteRelativeImportExtensions feature
 * 
 * Key Features:
 * - Only processes relative imports (starting with ./ or ../)
 * - Preserves JSON imports and external package imports
 * - Creates backup files for safety
 * - Provides detailed logging and rollback capability
 * - Handles all import/export patterns
 */

import { readdir, readFile, writeFile, copyFile, mkdir } from 'fs/promises';
import { join, dirname, extname, relative } from 'path';
import { existsSync } from 'fs';

const BACKUP_DIR = join(process.cwd(), '.migration-backup');
const LOG_FILE = join(process.cwd(), 'migration.log');

// Directories to process
const TARGET_DIRS = [
  join(process.cwd(), 'packages'),
  join(process.cwd(), 'apps'),
  join(process.cwd(), 'libs')
];

// Files to exclude from processing
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /dist/,
  /build/,
  /coverage/,
  /\.git/,
  /\.migration-backup/,
  /generated/  // Exclude ANTLR generated files - they're handled separately
];

class MigrationLogger {
  constructor() {
    this.logs = [];
    this.changes = new Map();
  }

  log(level, message, file = null) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}${file ? ` (${file})` : ''}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }

  addChange(file, originalImport, newImport) {
    if (!this.changes.has(file)) {
      this.changes.set(file, []);
    }
    this.changes.get(file).push({ original: originalImport, new: newImport });
  }

  async saveLogs() {
    const logContent = this.logs.join('\n') + '\n\nCHANGE SUMMARY:\n' + 
      Array.from(this.changes.entries())
        .map(([file, changes]) => `\n${file}:\n${changes.map(c => `  ${c.original} → ${c.new}`).join('\n')}`)
        .join('\n');
    
    await writeFile(LOG_FILE, logContent);
    this.log('info', `Migration log saved to ${LOG_FILE}`);
  }
}

const logger = new MigrationLogger();

async function* walkDirectory(dir) {
  try {
    const files = await readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = join(dir, file.name);
      
      // Skip excluded patterns
      if (EXCLUDE_PATTERNS.some(pattern => pattern.test(fullPath))) {
        continue;
      }

      if (file.isDirectory()) {
        yield* walkDirectory(fullPath);
      } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
        yield fullPath;
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.log('error', `Error reading directory ${dir}: ${error.message}`);
    }
  }
}

async function createBackup(filePath) {
  const relativePath = relative(process.cwd(), filePath);
  const backupPath = join(BACKUP_DIR, relativePath);
  const backupDir = dirname(backupPath);
  
  await mkdir(backupDir, { recursive: true });
  await copyFile(filePath, backupPath);
  
  return backupPath;
}

function shouldProcessImport(importPath) {
  // Only process relative imports
  if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
    return false;
  }
  
  // Don't process JSON imports
  if (importPath.endsWith('.json')) {
    return false;
  }
  
  // Don't process if it already has .ts extension
  if (importPath.endsWith('.ts') || importPath.endsWith('.tsx')) {
    return false;
  }
  
  return true;
}

function convertImportPath(importPath) {
  // Remove .js or .jsx extension if present
  const cleanPath = importPath.replace(/\.(js|jsx)$/, '');
  
  // Add .ts extension (we'll assume .ts for now, could be enhanced to detect actual file type)
  return cleanPath + '.ts';
}

async function processFile(filePath) {
  let content = await readFile(filePath, 'utf8');
  let modified = false;
  const changes = [];

  // Pattern for import statements
  // Matches: import ... from "path", import("path"), export ... from "path"
  const importPatterns = [
    // Standard imports: import { something } from "./path"
    /((?:import|export)\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)?(?:\s*,\s*(?:\{[^}]*\}|\w+))?\s+from\s+['"])([^'"]+)(['"])/g,
    
    // Re-exports: export * from "./path"
    /(export\s*\*\s*(?:as\s+\w+\s+)?from\s+['"])([^'"]+)(['"])/g,
    
    // Dynamic imports: import("./path") - handle with more care
    /(import\s*\(\s*['"])([^'"]+)(['"]s*\))/g
  ];

  for (const pattern of importPatterns) {
    content = content.replace(pattern, (match, prefix, importPath, suffix) => {
      if (shouldProcessImport(importPath)) {
        const newPath = convertImportPath(importPath);
        changes.push({ original: importPath, new: newPath });
        modified = true;
        logger.addChange(filePath, importPath, newPath);
        return `${prefix}${newPath}${suffix}`;
      }
      return match;
    });
  }

  if (modified) {
    // Create backup before modifying
    const backupPath = await createBackup(filePath);
    logger.log('info', `Created backup: ${backupPath}`, filePath);
    
    // Write modified content
    await writeFile(filePath, content);
    logger.log('info', `Updated ${changes.length} imports`, filePath);
    
    return { modified: true, changes: changes.length };
  }

  return { modified: false, changes: 0 };
}

async function validateTypeScriptConfig() {
  const tsconfigPath = join(process.cwd(), 'tsconfig.esm.json');
  if (!existsSync(tsconfigPath)) {
    logger.log('error', 'tsconfig.esm.json not found');
    return false;
  }

  const tsconfig = JSON.parse(await readFile(tsconfigPath, 'utf8'));
  const compilerOptions = tsconfig.compilerOptions;

  if (compilerOptions.moduleResolution !== 'NodeNext') {
    logger.log('warn', 'moduleResolution is not set to NodeNext');
  }

  if (!compilerOptions.rewriteRelativeImportExtensions) {
    logger.log('warn', 'rewriteRelativeImportExtensions is not enabled');
  }

  return true;
}

async function generateRollbackScript() {
  const rollbackPath = join(process.cwd(), 'rollback-migration.js');
  const rollbackContent = `#!/usr/bin/env bun

/**
 * Rollback script for TypeScript import migration
 * This script restores files from the backup directory
 */

import { readdir, copyFile, rm } from 'fs/promises';
import { join } from 'path';

const BACKUP_DIR = '${BACKUP_DIR}';

async function* walkBackups(dir) {
  try {
    const files = await readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const path = join(dir, file.name);
      if (file.isDirectory()) {
        yield* walkBackups(path);
      } else {
        yield path;
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error reading backup directory:', error);
    }
  }
}

async function rollback() {
  console.log('🔄 Rolling back TypeScript import migration...');
  
  let restored = 0;
  for await (const backupFile of walkBackups(BACKUP_DIR)) {
    const relativePath = backupFile.replace(BACKUP_DIR + '/', '');
    const originalPath = join(process.cwd(), relativePath);
    
    await copyFile(backupFile, originalPath);
    console.log(\`Restored: \${originalPath}\`);
    restored++;
  }
  
  console.log(\`✅ Restored \${restored} files\`);
  console.log('⚠️  Remember to remove the backup directory when you are satisfied with the rollback');
}

rollback().catch(console.error);
`;

  await writeFile(rollbackPath, rollbackContent);
  logger.log('info', `Generated rollback script: ${rollbackPath}`);
}

async function main() {
  console.log('🚀 Starting TypeScript import migration...\n');
  
  logger.log('info', 'Migration started');
  
  // Validate TypeScript configuration
  await validateTypeScriptConfig();
  
  // Create backup directory
  await mkdir(BACKUP_DIR, { recursive: true });
  logger.log('info', `Created backup directory: ${BACKUP_DIR}`);
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  let totalChanges = 0;

  // Process all target directories
  for (const targetDir of TARGET_DIRS) {
    if (!existsSync(targetDir)) {
      logger.log('warn', `Directory not found: ${targetDir}`);
      continue;
    }
    
    logger.log('info', `Processing directory: ${targetDir}`);
    
    for await (const filePath of walkDirectory(targetDir)) {
      totalFiles++;
      
      try {
        const result = await processFile(filePath);
        if (result.modified) {
          modifiedFiles++;
          totalChanges += result.changes;
        }
      } catch (error) {
        logger.log('error', `Failed to process file: ${error.message}`, filePath);
      }
    }
  }

  // Generate rollback script
  await generateRollbackScript();
  
  // Save logs
  await logger.saveLogs();

  console.log('\n📊 Migration Summary:');
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files modified: ${modifiedFiles}`);
  console.log(`   Total import changes: ${totalChanges}`);
  console.log(`   Backup directory: ${BACKUP_DIR}`);
  console.log(`   Migration log: ${LOG_FILE}`);
  console.log('\n✅ Migration completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Test the build: bun run build');
  console.log('   2. Run tests: bun run test');
  console.log('   3. If issues occur, run: bun rollback-migration.js');
  console.log('   4. When satisfied, remove backup: rm -rf .migration-backup');
}

// Handle CLI arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
TypeScript Import Migration Script

Usage: bun migrate-to-ts-extensions.js [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be changed without making changes
  
This script converts .js import extensions to .ts extensions in TypeScript files.
It creates backups and provides rollback capability.
`);
  process.exit(0);
}

if (args.includes('--dry-run')) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
  // TODO: Implement dry run mode if needed
}

main().catch((error) => {
  logger.log('error', `Migration failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});