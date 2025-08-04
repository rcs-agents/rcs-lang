#!/usr/bin/env bun

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const generatedDir = join(process.cwd(), 'packages/parser/src/generated');

async function fixAntlrImports() {
  console.log('Fixing ANTLR generated imports...\n');
  
  try {
    const files = await readdir(generatedDir);
    
    for (const file of files) {
      if (!file.endsWith('.ts')) continue;
      
      const filePath = join(generatedDir, file);
      let content = await readFile(filePath, 'utf8');
      let modified = false;
      
      // Fix imports from other generated files - change .js to .ts
      const importRegex = /from\s+['"](\.\/[^'"]+)\.js['"]/g;
      content = content.replace(importRegex, (match, path) => {
        modified = true;
        return `from "${path}.ts"`;
      });
      
      // Add import for RclLexerBase if needed (this was in the old fix-imports task)
      if (file === 'RclLexer.ts' && !content.includes('import { RclLexerBase }')) {
        content = 'import { RclLexerBase } from "../RclLexerBase.ts";\n' + content;
        modified = true;
      }
      
      if (modified) {
        await writeFile(filePath, content);
        console.log(`Fixed imports in: ${file}`);
      }
    }
    
    console.log('\nANTLR imports fixed!');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Generated directory not found. Run build-grammar first.');
    } else {
      throw error;
    }
  }
}

fixAntlrImports().catch(console.error);