import { useState } from 'react';

export interface RbxJsonPanelProps {
	json: any;
}

export function RbxJsonPanel({ json }: RbxJsonPanelProps) {
	const [copied, setCopied] = useState(false);

	if (!json) {
		return (
			<div className="panel-empty">
				<p>No RBX JSON output available. Successfully compile the code to see the output.</p>
			</div>
		);
	}

	const jsonString = JSON.stringify(json, null, 2);

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
		<div className="json-panel">
			<div className="json-panel-header">
				<h3>RCS Business Messaging JSON</h3>
				<button
					className="copy-button"
					onClick={handleCopy}
					title="Copy to clipboard"
					type="button"
				>
					{copied ? '✓ Copied' : '📋 Copy'}
				</button>
			</div>
			<pre className="json-content">
				<code>{jsonString}</code>
			</pre>
		</div>
	);
}
