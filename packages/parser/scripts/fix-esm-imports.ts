#!/usr/bin/env bun
/**
 * Fix ESM imports in generated ANTLR files by adding .js extensions.
 * This is required because:
 * 1. package.json has "type": "module" (ESM mode)
 * 2. Node.js ESM requires explicit .js extensions
 * 3. ANTLR generates imports without extensions
 * 4. TypeScript moduleResolution: "bundler" doesn't add them
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const GENERATED_DIR = join(import.meta.dir, '../dist/generated');

async function fixImportsInFile(filePath: string): Promise<void> {
	const content = await readFile(filePath, 'utf-8');

	// Fix relative imports by adding .js extension
	// Matches: import ... from "../Something" or "./Something"
	const fixedContent = content.replace(
		/from\s+["'](\.\.[\/\\][^"']+|\.\/[^"']+)["']/g,
		(match, path) => {
			// Don't add .js if it's already there or if it ends with .json
			if (path.endsWith('.js') || path.endsWith('.json')) {
				return match;
			}
			return `from "${path}.js"`;
		},
	);

	if (fixedContent !== content) {
		await writeFile(filePath, fixedContent, 'utf-8');
		console.log(`Fixed imports in: ${filePath}`);
	}
}

async function main(): Promise<void> {
	try {
		const files = await readdir(GENERATED_DIR);
		const jsFiles = files.filter((f) => f.endsWith('.js'));

		console.log(`Fixing ESM imports in ${jsFiles.length} generated files...`);

		await Promise.all(jsFiles.map((file) => fixImportsInFile(join(GENERATED_DIR, file))));

		console.log('✓ All imports fixed');
	} catch (error) {
		console.error('Error fixing imports:', error);
		process.exit(1);
	}
}

main();
