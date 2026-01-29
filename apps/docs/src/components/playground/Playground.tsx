import { useCallback, useEffect, useState } from 'react';
import { Editor } from './Editor';
import { Toolbar } from './Toolbar';
import { TabBar, type TabId } from './TabBar';
import { StatusBar } from './StatusBar';
import { ErrorsPanel, type Diagnostic } from './panels/ErrorsPanel';
import { AstPanel } from './panels/AstPanel';
import { DiagramPanel } from './panels/DiagramPanel';
import { RbxJsonPanel } from './panels/RbxJsonPanel';
import { JavaScriptPanel } from './panels/JavaScriptPanel';
import { examples, type Example } from './examples';
import { debounce } from './utils/debounce';
import { getSourceFromUrl, updateUrlWithSource } from './utils/url-encoding';
import './Playground.css';

interface ParseResult {
	ast: any;
	diagnostics: Diagnostic[];
	parseTime: number;
	rbxJson?: any;
	javascript?: string;
}

export function Playground() {
	// Initialize with URL source or first example
	const initialSource = getSourceFromUrl() || examples[0].code;
	const [source, setSource] = useState(initialSource);
	const [parseResult, setParseResult] = useState<ParseResult | null>(null);
	const [activeTab, setActiveTab] = useState<TabId>('ast');
	const [isLoading, setIsLoading] = useState(false);

	// Debounced parse function
	const parseSource = useCallback(
		debounce(async (code: string) => {
			if (!code.trim()) {
				setParseResult(null);
				return;
			}

			setIsLoading(true);
			const startTime = performance.now();

			try {
				// Dynamically import parser, compiler, and filesystem to avoid SSR issues
				const { parse } = await import('@rcs-lang/parser');
				const { RCLCompiler } = await import('@rcs-lang/compiler');
				const { MemoryFileSystem } = await import('@rcs-lang/file-system/browser');

				const result = await parse(code);
				const parseTime = performance.now() - startTime;

				// Convert errors to diagnostics
				const diagnostics: Diagnostic[] = (result.errors || []).map((err: any) => ({
					message: err.message || 'Unknown error',
					severity: 'error' as const,
					range: {
						start: {
							line: err.line || 0,
							character: err.column || 0,
						},
						end: {
							line: err.line || 0,
							character: (err.column || 0) + 1,
						},
					},
				}));

				// Compile to RBX JSON and JavaScript if AST is valid
				let rbxJson = null;
				let javascript = '';

				if (result.ast && !result.errors?.length) {
					try {
						const memoryFs = new MemoryFileSystem();
						const compiler = new RCLCompiler({ fileSystem: memoryFs });

						// Compile to get output
						const compileResult = await compiler.compile({
							source: code,
							uri: 'playground://input.rcl',
							ast: result.ast,
						});

						if (compileResult.success && compileResult.value.success) {
							rbxJson = compileResult.value.output;

							// Generate JavaScript
							const jsResult = await compiler.compileToJavaScript({
								source: code,
								uri: 'playground://input.rcl',
								ast: result.ast,
							});

							if (jsResult.success) {
								javascript = jsResult.value;
							}
						} else if (compileResult.success && compileResult.value.diagnostics) {
							// Add compilation diagnostics
							compileResult.value.diagnostics.forEach((d) => {
								diagnostics.push({
									message: d.message,
									severity: d.severity as 'error' | 'warning' | 'info',
									range: d.range || {
										start: { line: 0, character: 0 },
										end: { line: 0, character: 1 },
									},
								});
							});
						}
					} catch (compileError) {
						console.warn('Compilation error:', compileError);
						// Don't fail the whole parse if compilation fails
						diagnostics.push({
							message: `Compilation error: ${compileError instanceof Error ? compileError.message : 'Unknown error'}`,
							severity: 'warning',
							range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
						});
					}
				}

				setParseResult({
					ast: result.ast,
					diagnostics,
					parseTime,
					rbxJson,
					javascript,
				});
			} catch (error) {
				console.error('Parse error:', error);
				setParseResult({
					ast: null,
					diagnostics: [
						{
							message: error instanceof Error ? error.message : 'Unknown parse error',
							severity: 'error',
							range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
						},
					],
					parseTime: performance.now() - startTime,
				});
			} finally {
				setIsLoading(false);
			}
		}, 500),
		[],
	);

	// Parse when source changes
	useEffect(() => {
		parseSource(source);
	}, [source, parseSource]);

	const handleSourceChange = (newSource: string) => {
		setSource(newSource);
	};

	const handleSelectExample = (example: Example) => {
		setSource(example.code);
		updateUrlWithSource(example.code);
	};

	const handleShare = async () => {
		updateUrlWithSource(source);
		try {
			await navigator.clipboard.writeText(window.location.href);
			alert('Share URL copied to clipboard!');
		} catch (err) {
			alert(`Share URL: ${window.location.href}`);
		}
	};

	const errorCount = parseResult?.diagnostics.filter((d) => d.severity === 'error').length || 0;
	const warningCount = parseResult?.diagnostics.filter((d) => d.severity === 'warning').length || 0;

	const tabs = [
		{ id: 'ast' as TabId, label: 'AST' },
		{ id: 'errors' as TabId, label: 'Errors', badge: errorCount + warningCount },
		{ id: 'diagram' as TabId, label: 'Diagram' },
		{ id: 'rbx-json' as TabId, label: 'RBX JSON' },
		{ id: 'javascript' as TabId, label: 'JavaScript' },
	];

	// Detect theme (simplified - in a real app, sync with Starlight theme)
	const theme = 'light'; // TODO: Detect actual theme

	return (
		<div className="playground">
			<Toolbar onSelectExample={handleSelectExample} onShare={handleShare} />

			<div className="playground-content">
				<div className="editor-pane">
					<Editor
						value={source}
						onChange={handleSourceChange}
						diagnostics={parseResult?.diagnostics}
						theme={theme}
					/>
				</div>

				<div className="output-pane">
					<TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

					<div className="panel-container">
						{isLoading && (
							<div className="panel-loading">
								<p>Parsing...</p>
							</div>
						)}

						{!isLoading && activeTab === 'ast' && <AstPanel ast={parseResult?.ast} />}

						{!isLoading && activeTab === 'errors' && (
							<ErrorsPanel diagnostics={parseResult?.diagnostics || []} />
						)}

						{!isLoading && activeTab === 'diagram' && <DiagramPanel ast={parseResult?.ast} />}

						{!isLoading && activeTab === 'rbx-json' && (
							<RbxJsonPanel json={parseResult?.rbxJson} />
						)}

						{!isLoading && activeTab === 'javascript' && (
							<JavaScriptPanel code={parseResult?.javascript || ''} />
						)}
					</div>
				</div>
			</div>

			<StatusBar
				parseTime={parseResult?.parseTime}
				errorCount={errorCount}
				warningCount={warningCount}
			/>
		</div>
	);
}
