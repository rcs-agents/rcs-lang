/**
 * Core type definitions for the RCL Playground
 */

import type { Agent } from '@rcs-lang/csm';
import type { AgentBundle, ExtractedMessage } from '@rcs-lang/types';

/**
 * Example code snippet with metadata
 */
export interface Example {
	name: string;
	description: string;
	code: string;
	category: 'basic' | 'flows' | 'messages' | 'full' | 'text' | 'rich-card' | 'carousel' | 'media' | 'otp' | 'webview';
}

/**
 * API endpoints configuration for real RCS messaging
 */
export interface ApiConfig {
	baseUrl: string;
	sendPlayback: string;
	inviteTester: string;
}

/**
 * Agent branding configuration for the simulator
 */
export interface AgentConfig {
	name: string;
	iconUrl: string;
}

/**
 * Configuration options for the playground component
 */
export interface PlaygroundConfig {
	/** Controls default panel visibility and features */
	mode: 'docs' | 'maker';

	/** Show/hide dev tools panel (default: true in docs, false in maker) */
	showDevTools?: boolean;

	/** Enable real RCS message sending (default: false in docs, true in maker) */
	enableMessaging?: boolean;

	/** Initial source code */
	initialSource?: string;

	/** Available examples */
	examples?: Example[];

	/** API endpoints for real messaging */
	apiConfig?: ApiConfig;

	/** Agent branding for simulator */
	agent?: AgentConfig;

	/** Callback when compilation produces output */
	onCompile?: (result: CompilationResult) => void;
}

/**
 * Result of compiling RCL source code
 */
export interface CompilationResult {
	success: boolean;
	ast?: any;
	/** Agent runtime bundle (agent config + messages) */
	bundle?: AgentBundle;
	/** Compiled CSM state machine */
	csm?: Agent;
	jsCode?: string;
	diagnostics: Diagnostic[];
	parseTime: number;
	/** Messages extracted from AST (available even when compilation fails) */
	extractedMessages?: ExtractedMessage[];
}

/**
 * Diagnostic message (error, warning, or info)
 */
export interface Diagnostic {
	message: string;
	severity: 'error' | 'warning' | 'info';
	range: {
		start: { line: number; character: number };
		end: { line: number; character: number };
	};
}

/**
 * Tab identifiers for the playground output panels
 */
export type TabId = 'ast' | 'agent-json' | 'messages-json' | 'csm-json' | 'javascript' | 'simulator';
