import * as fs from 'fs-extra';
import * as path from 'path';
import { RCLParser } from './parser/rclParser';
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
  messages: Record<string, any>;
  flows: Record<string, any>;
  agent: any;
}

export async function compileRCL(inputPath: string, options: CompileOptions): Promise<void> {
  // Read the RCL file
  const content = await fs.readFile(inputPath, 'utf-8');
  
  // Parse the RCL file
  const parser = new RCLParser();
  const document = parser.parseDocument(content, inputPath);
  
  if (!document.ast) {
    throw new Error('Failed to parse RCL file - no AST generated');
  }

  // Extract components
  const messageNormalizer = new MessageNormalizer();
  const flowCompiler = new FlowCompiler();
  const agentExtractor = new AgentExtractor();
  
  // Process the AST
  const messages = messageNormalizer.extractAndNormalize(document.ast);
  const flows = flowCompiler.compileFlows(document.ast);
  const agent = agentExtractor.extractAgentConfig(document.ast);
  
  const output: CompiledOutput = {
    messages,
    flows,
    agent
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