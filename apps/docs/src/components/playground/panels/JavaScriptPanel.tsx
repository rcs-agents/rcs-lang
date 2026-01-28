import { useState } from 'react';
import { useShiki } from '../hooks/useShiki';

export interface JavaScriptPanelProps {
	code: string;
}

export function JavaScriptPanel({ code }: JavaScriptPanelProps) {
	const [copied, setCopied] = useState(false);

	if (!code) {
		return (
			<div className="panel-empty">
				<p>No JavaScript output available. Successfully compile the code to see the output.</p>
			</div>
		);
	}

	const highlighted = useShiki(code, 'javascript');

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	return (
		<div className="javascript-panel">
			<div className="javascript-panel-header">
				<h3>Generated JavaScript (CSM Runtime)</h3>
				<button
					className="copy-button"
					onClick={handleCopy}
					title="Copy to clipboard"
					type="button"
				>
					{copied ? '✓ Copied' : '📋 Copy'}
				</button>
			</div>
			<div
				className="javascript-content shiki-container"
				dangerouslySetInnerHTML={{ __html: highlighted }}
			/>
		</div>
	);
}
