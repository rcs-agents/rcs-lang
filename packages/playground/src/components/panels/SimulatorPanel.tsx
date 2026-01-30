/**
 * Simulator panel component for the RCL Playground
 * Displays an interactive CSM-powered phone simulator with optional dev tools
 */

import type { Agent } from '@rcs-lang/csm';
import { Splitter } from '@ark-ui/react/splitter';
import { Simulator } from '@rcs-lang/simulator/react';
import type { UserInput } from '@rcs-lang/simulator/react';
import type { ExtractedMessage, AgentContentMessage } from '@rcs-lang/types';
import ReactJson from '@microlink/react-json-view';

/**
 * Props for the SimulatorPanel component
 */
export interface SimulatorPanelProps {
	/** CSM agent definition from compilation */
	csm: Agent | null | undefined;
	/** Messages collection from compilation */
	messages?: { messages?: Record<string, AgentContentMessage> };
	/** Extracted messages for preview mode when compilation fails */
	extractedMessages?: ExtractedMessage[];
	/** Optional agent display name override */
	agentName?: string;
	/** Optional agent icon URL */
	agentIconUrl?: string;
	/** Whether there are compilation errors */
	hasErrors?: boolean;
	/** Whether dev tools panel should be visible */
	devToolsVisible?: boolean;
}

/**
 * Dev tools panel showing compilation data passed to the simulator
 */
function SimulatorDevTools({
	csm,
	messages,
	extractedMessages,
	hasErrors,
}: {
	csm: Agent | null | undefined;
	messages?: { messages?: Record<string, AgentContentMessage> };
	extractedMessages?: ExtractedMessage[];
	hasErrors?: boolean;
}) {
	const devState = {
		mode: csm && !hasErrors ? 'interactive' : extractedMessages?.length ? 'preview' : 'none',
		hasCSM: !!(csm && !hasErrors),
		hasErrors: !!hasErrors,
		csm: csm || null,
		messages: messages?.messages || {},
		extractedMessages: extractedMessages || [],
	};

	return (
		<div className="simulator-dev-tools">
			<div className="simulator-dev-tools-header">
				<h4>Simulator Data</h4>
			</div>
			<div className="simulator-dev-tools-content">
				<ReactJson
					src={devState}
					name={false}
					theme="ashes"
					iconStyle="triangle"
					indentWidth={2}
					collapsed={2}
					collapseStringsAfterLength={40}
					groupArraysAfterLength={20}
					displayDataTypes={false}
					displayObjectSize={true}
					enableClipboard={true}
					quotesOnKeys={false}
					sortKeys={false}
					style={{
						fontSize: '1rem',
						lineHeight: '1.6rem',
						padding: '1rem',
						height: '100%'
					}}
				/>
			</div>
		</div>
	);
}

/**
 * SimulatorPanel component
 * Renders a phone simulator with optional dev tools panel
 */
export function SimulatorPanel({
	csm,
	messages,
	extractedMessages,
	agentName,
	agentIconUrl,
	hasErrors,
	devToolsVisible = false,
}: SimulatorPanelProps) {
	// Determine which mode to use
	const hasCSM = csm && !hasErrors;
	const hasPreviewMessages = extractedMessages && extractedMessages.length > 0;
	const showPreviewMode = !hasCSM && hasPreviewMessages;
	const showErrorBanner = !hasCSM && !hasPreviewMessages;

	return (
		<div className="simulator-panel">
			{showPreviewMode && (
				<div className="simulator-preview-banner">
					<span className="simulator-preview-icon">👁</span>
					<span>Preview mode: Displaying extracted messages</span>
				</div>
			)}
			{showErrorBanner && (
				<div className="simulator-error-banner">
					<span className="simulator-error-icon">!</span>
					<span>Fix errors in the code to preview messages</span>
				</div>
			)}
			{devToolsVisible ? (
				<Splitter.Root
					className="simulator-panel-content with-dev-tools"
					defaultSize={[
						{ id: 'simulator', size: 60 },
						{ id: 'devtools', size: 40 },
					]}
				>
					<Splitter.Panel id="simulator" className="simulator-panel-main">
						<Simulator
							csm={hasCSM ? csm : undefined}
							messages={messages?.messages}
							previewMessages={showPreviewMode ? extractedMessages : undefined}
							agentName={agentName}
							agentIconUrl={agentIconUrl}
							onUserInteraction={(input: UserInput) => {
								console.log('User interaction:', input);
							}}
						/>
					</Splitter.Panel>
					<Splitter.ResizeTrigger id="simulator:devtools" className="splitter-trigger" />
					<Splitter.Panel id="devtools" className="simulator-dev-tools-panel">
						<SimulatorDevTools
							csm={csm}
							messages={messages}
							extractedMessages={extractedMessages}
							hasErrors={hasErrors}
						/>
					</Splitter.Panel>
				</Splitter.Root>
			) : (
				<div className="simulator-panel-content">
					<div className="simulator-panel-main">
						<Simulator
							csm={hasCSM ? csm : undefined}
							messages={messages?.messages}
							previewMessages={showPreviewMode ? extractedMessages : undefined}
							agentName={agentName}
							agentIconUrl={agentIconUrl}
							onUserInteraction={(input: UserInput) => {
								console.log('User interaction:', input);
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
