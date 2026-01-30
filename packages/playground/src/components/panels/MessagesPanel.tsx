import { useState } from 'react';
import type { MessagesCollection } from '@rcs-lang/types';
import { CodeViewer } from '../CodeViewer';

export interface MessagesPanelProps {
	messages: MessagesCollection | undefined;
}

export function MessagesPanel({ messages }: MessagesPanelProps) {
	const [copied, setCopied] = useState(false);

	if (!messages) {
		return (
			<div className="panel-empty">
				<p>No messages available. Successfully compile the code to see the output.</p>
			</div>
		);
	}

	const jsonString = JSON.stringify(messages, null, 2);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(jsonString);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	return (
		<div className="code-viewer-panel">
			<div className="code-viewer-panel-header">
				<h3>Messages Collection</h3>
				<button
					className="copy-button"
					onClick={handleCopy}
					title="Copy to clipboard"
					type="button"
				>
					{copied ? 'Copied' : 'Copy'}
				</button>
			</div>
			<div className="code-viewer-content">
				<CodeViewer value={jsonString} language="json" theme="dark" />
			</div>
		</div>
	);
}
