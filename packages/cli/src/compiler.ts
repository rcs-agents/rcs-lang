import fs from 'fs-extra';
import path from 'node:path';
import { RCLParser } from './utils/parserWrapper';
import { MessageNormalizer } from './normalizers/messageNormalizer';
import { FlowCompiler } from './compilers/flowCompiler';
import { AgentExtractor } from './extractors/agentExtractor';
import { OutputGenerator } from './generators/outputGenerator';

export interface CompileOptions {
  output?: string;
  format: 'js' | 'json';
  pretty?: boolean;
}

export interface CompiledOutput {
  messages: Record<string, unknown>;
  flows: Record<string, unknown>;
  agent: unknown;
}

export async function compileRCL(inputPath: string, options: CompileOptions): Promise<void> {
  // Read the RCL file
  const content = await fs.readFile(inputPath, 'utf-8');

  // Parse the RCL file
  const parser = new RCLParser();
  const document = await parser.parseDocument(content, inputPath);

  if (!document.ast) {
    throw new Error('Failed to parse RCL file - no AST generated');
  }

  // Extract components
  const messageNormalizer = new MessageNormalizer();
  const flowCompiler = new FlowCompiler();
  const agentExtractor = new AgentExtractor();

  // Process the AST
  console.log('[DEBUG] Processing AST...');
  console.log('[DEBUG] AST root type:', document.ast.type);
  console.log('[DEBUG] AST children count:', document.ast.children?.length || 0);
  
  // Add more detailed AST debugging
  if (document.ast.children) {
    console.log('[DEBUG] AST children types:', document.ast.children.map(c => c.type));
    document.ast.children.forEach((child, idx) => {
      console.log(`[DEBUG] Child ${idx}: type=${child.type}, text=${child.text?.substring(0, 50)}...`);
      if (child.children) {
        console.log(`[DEBUG]   - has ${child.children.length} children`);
      }
    });
  }
  
  const messages = messageNormalizer.extractAndNormalize(document.ast);
  console.log('[DEBUG] Extracted messages:', Object.keys(messages).length);
  
  const flows = flowCompiler.compileFlows(document.ast);
  console.log('[DEBUG] Compiled flows:', Object.keys(flows).length);
  
  const agent = agentExtractor.extractAgentConfig(document.ast);
  console.log('[DEBUG] Extracted agent:', agent?.name || 'none');

  const output: CompiledOutput = {
    messages,
    flows,
    agent,
  };

  // Generate output
  const outputGenerator = new OutputGenerator();
  const outputPath = options.output || generateOutputPath(inputPath, options.format);

  await outputGenerator.generate(output, outputPath, options);
}

function generateOutputPath(inputPath: string, format: string): string {
  const parsed = path.parse(inputPath);
  const extension = format === 'js' ? '.js' : '.json';
  return path.join(parsed.dir, `${parsed.name}${extension}`);
}
