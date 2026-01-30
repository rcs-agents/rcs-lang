/**
 * @rcs-lang/playground
 *
 * Interactive playground component for the RCL (Rich Communication Language).
 * Provides a Monaco editor with RCL syntax highlighting, compilation,
 * diagram visualization, and simulation capabilities.
 *
 * @packageDocumentation
 */

export { Playground } from './components/Playground';
export type { PlaygroundProps } from './components/Playground';
export type { PlaygroundTheme } from './types';

// Export individual components for advanced usage
export { Editor } from './components/Editor';
export { CodeViewer } from './components/CodeViewer';
export { Toolbar } from './components/Toolbar';
export { TabBar } from './components/TabBar';
export { StatusBar } from './components/StatusBar';

// Export panel components
export { AstPanel } from './components/panels/AstPanel';
export { AgentPanel } from './components/panels/AgentPanel';
export { MessagesPanel } from './components/panels/MessagesPanel';
export { ErrorsPanel } from './components/panels/ErrorsPanel';
export { CsmJsonPanel } from './components/panels/CsmJsonPanel';
export { JavaScriptPanel } from './components/panels/JavaScriptPanel';
export { SimulatorPanel } from './components/panels/SimulatorPanel';
export { DiagnosticsPanel } from './components/DiagnosticsPanel';

// Export types
export type { TabId, Tab, TabBarProps } from './components/TabBar';
export type { ToolbarProps } from './components/Toolbar';
export type { Diagnostic, ErrorsPanelProps } from './components/panels/ErrorsPanel';
export type { DiagnosticsPanelProps } from './components/DiagnosticsPanel';
export type { EditorProps } from './components/Editor';
export type { CodeViewerProps } from './components/CodeViewer';
export type { SimulatorPanelProps } from './components/panels/SimulatorPanel';

// Export examples
export {
	examples,
	makerExamples,
	getExamplesByCategory,
	getExampleByName,
	getMakerExamplesByCategory,
	getMakerExampleByName,
	getAllExamples,
	getExampleFromAnySource,
} from './examples';
export type { Example } from './examples';

// Export core types and modules
export type {
	PlaygroundConfig,
	CompilationResult,
	ApiConfig,
	AgentConfig
} from './core/types';
export type { TabId as CoreTabId } from './core/types';
export { compileSource } from './core/compilation';

// Export utilities
export { debounce } from './utils/debounce';
export {
	encodeSource,
	decodeSource,
	getSourceFromUrl,
	updateUrlWithSource
} from './utils/url-encoding';

// Export hooks
export { useShiki } from './hooks/useShiki';
export { useSettings } from './hooks/useSettings';
export { useMessaging } from './hooks/useMessaging';

// Export messaging components
export {
	Button,
	SendControls,
	SettingsDialog,
	LoggingPanel
} from './components/messaging';

// Export messaging types
export type {
	ButtonProps,
	SendControlsProps,
	SettingsDialogProps,
	LoggingPanelProps
} from './components/messaging';
export type { TestSettings } from './hooks/useSettings';
export type {
	LogEntry,
	SendPlaybackParams,
	InviteTesterParams
} from './hooks/useMessaging';

// Re-export validation utilities
export { isValidPhoneNumber, cleanPhoneNumbers } from './hooks/useSettings';
