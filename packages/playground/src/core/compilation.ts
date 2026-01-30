/**
 * Core compilation logic for the RCL Playground
 */

import type { Agent } from '@rcs-lang/csm';
import type { AgentBundle } from '@rcs-lang/types';
import type { CompilationResult, Diagnostic } from './types';

/**
 * Compile RCL source code to AST, CSM JSON, and JavaScript
 *
 * @param source - The RCL source code to compile
 * @returns Compilation result with AST, outputs, and diagnostics
 */
export async function compileSource(source: string): Promise<CompilationResult> {
	const startTime = performance.now();
	const diagnostics: Diagnostic[] = [];

	try {
		// Dynamically import parser, compiler, and filesystem to avoid SSR issues
		const { parse } = await import('@rcs-lang/parser');
		const { RCLCompiler } = await import('@rcs-lang/compiler');
		const { MemoryFileSystem } = await import('@rcs-lang/file-system/browser');

		// Parse the source code
		const parseResult = await parse(source);
		const parseTime = performance.now() - startTime;

		// Convert parse errors to diagnostics
		if (parseResult.errors && parseResult.errors.length > 0) {
			for (const error of parseResult.errors) {
				diagnostics.push({
					message: error.message || 'Unknown parse error',
					severity: 'error',
					range: {
						start: { line: error.line || 1, character: error.column || 0 },
						end: { line: error.line || 1, character: (error.column || 0) + 1 },
					},
				});
			}
			return { success: false, diagnostics, parseTime };
		}

		const ast = parseResult.ast;

		// Extract messages from AST for preview mode (even if compilation fails)
		let extractedMessages: any[] | undefined;
		if (ast) {
			const { extractMessages } = await import('@rcs-lang/compiler');
			const extractionResult = extractMessages(ast);
			extractedMessages = extractionResult.messages;
		}

		// Try to compile to bundle, CSM, and JavaScript
		let bundle: AgentBundle | undefined;
		let csm: Agent | undefined;
		let jsCode = '';

		if (ast) {
			try {
				const memoryFs = new MemoryFileSystem();
				const compiler = new RCLCompiler({ fileSystem: memoryFs });

				// Compile to get full output
				const compileResult = await compiler.compile({
					source,
					uri: 'playground://input.rcl',
					ast,
				});

				if (compileResult.success && compileResult.value.success) {
					const output = compileResult.value.output;

					// Extract bundle and CSM from output
					bundle = output?.bundle;
					csm = (output?.csm as unknown as Agent) || undefined;

					// Generate JavaScript
					const jsResult = await compiler.compileToJavaScript({
						source,
						uri: 'playground://input.rcl',
						ast,
					});

					if (jsResult.success) {
						jsCode = jsResult.value;
					}
				} else if (compileResult.success && compileResult.value.diagnostics) {
					// Add compilation diagnostics
					for (const d of compileResult.value.diagnostics) {
						diagnostics.push({
							message: d.message,
							severity: d.severity as 'error' | 'warning' | 'info',
							range: d.range || {
								start: { line: 0, character: 0 },
								end: { line: 0, character: 1 },
							},
						});
					}
				}
			} catch (compileError) {
				console.warn('Compilation error:', compileError);
				diagnostics.push({
					message: `Compilation error: ${compileError instanceof Error ? compileError.message : 'Unknown error'}`,
					severity: 'warning',
					range: {
						start: { line: 0, character: 0 },
						end: { line: 0, character: 1 },
					},
				});
			}
		}

		return {
			success: diagnostics.filter((d) => d.severity === 'error').length === 0,
			ast,
			bundle,
			csm,
			jsCode,
			diagnostics,
			parseTime,
			extractedMessages,
		};
	} catch (error) {
		const parseTime = performance.now() - startTime;
		diagnostics.push({
			message: error instanceof Error ? error.message : 'Unknown compilation error',
			severity: 'error',
			range: {
				start: { line: 1, character: 0 },
				end: { line: 1, character: 1 },
			},
		});
		return { success: false, diagnostics, parseTime };
	}
}
