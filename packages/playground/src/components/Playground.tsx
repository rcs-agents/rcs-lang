import { useCallback, useEffect, useState } from 'react';
import { Splitter } from '@ark-ui/react/splitter';
import { Editor } from './Editor';
import { Toolbar } from './Toolbar';
import { TabBar, type TabId } from './TabBar';
import { StatusBar } from './StatusBar';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { AstPanel } from './panels/AstPanel';
import { AgentPanel } from './panels/AgentPanel';
import { MessagesPanel } from './panels/MessagesPanel';
import { CsmJsonPanel } from './panels/CsmJsonPanel';
import { JavaScriptPanel } from './panels/JavaScriptPanel';
import { SimulatorPanel } from './panels/SimulatorPanel';
import { SendControls } from './messaging/SendControls';
import { SettingsDialog } from './messaging/SettingsDialog';
import { LoggingPanel } from './messaging/LoggingPanel';
import { examples } from '../examples';
import { debounce } from '../utils/debounce';
import { getSourceFromUrl, updateUrlWithSource } from '../utils/url-encoding';
import { compileSource } from '../core/compilation';
import { useSettings } from '../hooks/useSettings';
import { useMessaging } from '../hooks/useMessaging';
import type { PlaygroundConfig, CompilationResult, Example } from '../core/types';
import type { TestSettings } from '../hooks/useSettings';
import '../styles/index.css';

export interface PlaygroundProps extends Partial<PlaygroundConfig> {
	className?: string;
}

export function Playground({
	mode = 'docs',
	showDevTools: showDevToolsProp,
	enableMessaging = false,
	initialSource: initialSourceProp,
	examples: examplesProp,
	// apiConfig is available for future use with custom API endpoints
	apiConfig: _apiConfig,
	agent,
	onCompile,
	className = '',
}: PlaygroundProps = {}) {
	// Determine defaults based on mode
	// In docs mode, dev tools are hidden by default
	const showDevTools = showDevToolsProp ?? false;
	const availableExamples = examplesProp || examples;

	// Initialize with URL source, prop source, or first example
	const initialSource = initialSourceProp || getSourceFromUrl() || availableExamples[0]?.code || '';
	const [source, setSource] = useState(initialSource);
	const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
	const [activeTab, setActiveTab] = useState<TabId>('simulator');
	const [isLoading, setIsLoading] = useState(false);
	const [devToolsVisible, setDevToolsVisible] = useState(showDevTools);

	// Settings and messaging hooks (only used when enableMessaging is true)
	const { settings, saveSettings, clearSettings } = useSettings();
	const { logs, isLogsVisible, clearLogs, toggleLogsVisibility, sendPlayback, inviteTester } = useMessaging();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isSending, setIsSending] = useState(false);

	// Debounced compile function
	const compile = useCallback(
		debounce(async (code: string) => {
			if (!code.trim()) {
				setCompilationResult(null);
				return;
			}

			setIsLoading(true);

			try {
				const result = await compileSource(code);
				setCompilationResult(result);

				// Call onCompile callback if provided
				if (onCompile) {
					onCompile(result);
				}
			} catch (error) {
				console.error('Compilation error:', error);
				const errorResult: CompilationResult = {
					success: false,
					diagnostics: [
						{
							message: error instanceof Error ? error.message : 'Unknown compilation error',
							severity: 'error',
							range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
						},
					],
					parseTime: 0,
				};
				setCompilationResult(errorResult);

				if (onCompile) {
					onCompile(errorResult);
				}
			} finally {
				setIsLoading(false);
			}
		}, 500),
		[onCompile],
	);

	// Compile when source changes
	useEffect(() => {
		compile(source);
	}, [source, compile]);

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

	const handleSend = async () => {
		if (!enableMessaging || !compilationResult?.csm) {
			return;
		}

		setIsSending(true);

		try {
			const result = await sendPlayback({
				playback: compilationResult.csm,
				recipientPhoneNumber: settings.recipientPhoneNumbers,
				agentType: settings.agentType,
				agentId: settings.agentId,
				serviceAccountKey: settings.serviceAccountKey,
			});

			if (!result.success) {
				console.error('Failed to send playback:', result.error);
			}
		} catch (error) {
			console.error('Error sending playback:', error);
		} finally {
			setIsSending(false);
		}
	};

	const handleInviteTester = async (msisdn: string) => {
		const result = await inviteTester({
			msisdn,
			agentType: settings.agentType,
			agentId: settings.agentId,
			serviceAccountKey: settings.serviceAccountKey,
		});

		if (!result.success) {
			console.error('Failed to invite tester:', result.error);
		}
	};

	const handleSaveSettings = (newSettings: TestSettings) => {
		saveSettings(newSettings);
	};

	const errorCount = compilationResult?.diagnostics.filter((d) => d.severity === 'error').length || 0;
	const warningCount = compilationResult?.diagnostics.filter((d) => d.severity === 'warning').length || 0;
	const hasErrors = errorCount > 0;

	// Build tabs array: Simulator, Agent, Messages, CSM, and optionally JavaScript, AST (dev tools)
	const tabs: Array<{ id: TabId; label: string; badge?: number }> = [
		{ id: 'simulator' as TabId, label: 'Simulator' },
		{ id: 'agent-json' as TabId, label: 'Agent' },
		{ id: 'messages-json' as TabId, label: 'Messages' },
		{ id: 'csm-json' as TabId, label: 'CSM' },
	];

	// Add dev tools tabs when visible
	if (devToolsVisible) {
		tabs.push(
			{ id: 'javascript' as TabId, label: 'JavaScript' },
			{ id: 'ast' as TabId, label: 'AST' },
		);
	}

	// Use dark theme by default for the beautiful Catppuccin Mocha theme
	const theme = 'dark';

	const playgroundClassName = `playground playground--${mode} ${className}`.trim();

	return (
		<div className={playgroundClassName}>
			<Toolbar
				onSelectExample={handleSelectExample}
				onShare={handleShare}
				examples={availableExamples}
				devMode={devToolsVisible}
				onDevModeChange={setDevToolsVisible}
			/>

			<Splitter.Root
				className="playground-content"
				defaultSize={[
					{ id: 'editor', size: 50 },
					{ id: 'output', size: 50 },
				]}
			>
				<Splitter.Panel id="editor" className="editor-pane">
					<Editor
						value={source}
						onChange={handleSourceChange}
						diagnostics={compilationResult?.diagnostics}
						theme={theme}
					/>

					{/* Messaging controls for maker mode */}
					{enableMessaging && mode === 'maker' && (
						<div className="messaging-controls">
							<SendControls
								recipientPhoneNumber={settings.recipientPhoneNumbers}
								onRecipientChange={(phoneNumbers) => saveSettings({ recipientPhoneNumbers: phoneNumbers })}
								onSend={handleSend}
								onOpenSettings={() => setIsSettingsOpen(true)}
								isLoading={isSending}
								disabled={!compilationResult?.success || !compilationResult?.csm}
							/>
						</div>
					)}
				</Splitter.Panel>

				<Splitter.ResizeTrigger id="editor:output" className="splitter-trigger" />

				<Splitter.Panel id="output" className="output-pane">
					<div className="output-pane-header">
						<TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
					</div>

					<div className="panel-container">
						{isLoading && (
							<div className="panel-loading">
								<p>Compiling...</p>
							</div>
						)}

						{!isLoading && activeTab === 'simulator' && (
							<SimulatorPanel
								csm={compilationResult?.csm}
								messages={compilationResult?.bundle?.messages}
								extractedMessages={compilationResult?.extractedMessages}
								agentName={agent?.name}
								agentIconUrl={agent?.iconUrl}
								hasErrors={hasErrors}
								devToolsVisible={devToolsVisible}
							/>
						)}

						{!isLoading && activeTab === 'agent-json' && (
							<AgentPanel agent={compilationResult?.bundle?.agent} />
						)}

						{!isLoading && activeTab === 'messages-json' && (
							<MessagesPanel messages={compilationResult?.bundle?.messages} />
						)}

						{!isLoading && activeTab === 'csm-json' && (
							<CsmJsonPanel json={compilationResult?.csm} />
						)}

						{!isLoading && activeTab === 'javascript' && devToolsVisible && (
							<JavaScriptPanel code={compilationResult?.jsCode || ''} />
						)}

						{!isLoading && activeTab === 'ast' && devToolsVisible && (
							<AstPanel ast={compilationResult?.ast} />
						)}
					</div>
				</Splitter.Panel>
			</Splitter.Root>

			{/* Diagnostics panel at the bottom (replaces Errors tab) */}
			<DiagnosticsPanel diagnostics={compilationResult?.diagnostics || []} />

			{/* Logging panel for messaging */}
			{enableMessaging && isLogsVisible && (
				<div className="logging-panel-wrapper">
					<LoggingPanel logs={logs} isVisible={isLogsVisible} onClear={clearLogs} />
				</div>
			)}

			<StatusBar
				parseTime={compilationResult?.parseTime}
				errorCount={errorCount}
				warningCount={warningCount}
				showLogsToggle={enableMessaging}
				logsVisible={isLogsVisible}
				onToggleLogs={toggleLogsVisibility}
				logCount={logs.length}
			/>

			{/* Settings dialog for messaging */}
			{enableMessaging && (
				<SettingsDialog
					open={isSettingsOpen}
					onOpenChange={setIsSettingsOpen}
					settings={settings}
					onSave={handleSaveSettings}
					onClear={clearSettings}
					onInviteTester={handleInviteTester}
				/>
			)}
		</div>
	);
}
