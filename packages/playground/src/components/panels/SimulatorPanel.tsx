/**
 * Simulator panel component for the RCL Playground
 * Displays an interactive CSM-powered phone simulator
 */

import type { Agent } from '@rcs-lang/csm';
import { Simulator } from '@rcs-lang/simulator/react';
import type { UserInput } from '@rcs-lang/simulator/react';
import type { ExtractedMessage } from '@rcs-lang/types';

/**
 * Props for the SimulatorPanel component
 */
export interface SimulatorPanelProps {
	/** CSM agent definition from compilation */
	csm: Agent | null | undefined;
	/** Extracted messages for preview mode when compilation fails */
	extractedMessages?: ExtractedMessage[];
	/** Optional agent display name override */
	agentName?: string;
	/** Optional agent icon URL */
	agentIconUrl?: string;
	/** Whether there are compilation errors */
	hasErrors?: boolean;
}

/**
 * SimulatorPanel component
 * Renders a phone simulator, always showing the device frame even when there are errors
 */
export function SimulatorPanel({ csm, extractedMessages, agentName, agentIconUrl, hasErrors }: SimulatorPanelProps) {
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
			<Simulator
				csm={hasCSM ? csm : undefined}
				previewMessages={showPreviewMode ? extractedMessages : undefined}
				agentName={agentName}
				agentIconUrl={agentIconUrl}
				onUserInteraction={(input: UserInput) => {
					console.log('User interaction:', input);
				}}
			/>
		</div>
	);
}
