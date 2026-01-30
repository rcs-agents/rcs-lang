import { useState, useEffect } from 'react';
import { type LogEntry } from '../../hooks/useMessaging';

export interface LoggingPanelProps {
	logs: LogEntry[];
	isVisible: boolean;
	onClear: () => void;
}

export function LoggingPanel({ logs, isVisible, onClear }: LoggingPanelProps) {
	const [expandedLog, setExpandedLog] = useState<string | null>(null);

	// Auto-expand the first log when logs are visible
	useEffect(() => {
		if (isVisible && logs.length > 0 && expandedLog === null) {
			setExpandedLog(logs[0].id);
		}
	}, [isVisible, logs, expandedLog]);

	const toggleExpand = (id: string) => {
		setExpandedLog((prev) => (prev === id ? null : id));
	};

	const formatTimestamp = (timestamp: number) => {
		return new Date(timestamp).toLocaleString();
	};

	if (!isVisible) {
		return null;
	}

	return (
		<div className="bg-gray-50 rounded border p-4 flex flex-col h-full m-4 mt-0">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-lg font-semibold text-gray-700">Request Logs</h2>

				<div className="space-x-2">
					<button
						onClick={onClear}
						className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
						title="Clear all logs"
					>
						Clear
					</button>
				</div>
			</div>

			<div className="space-y-4 overflow-auto flex-grow">
				{logs.length === 0 ? (
					<p className="text-gray-500 text-center py-4 mb-8">No logs yet</p>
				) : (
					logs.map((log) => (
						<div
							key={log.id}
							className={`border rounded-lg overflow-hidden ${
								log.success ? 'border-green-200' : 'border-red-200'
							}`}
						>
							<div
								className={`flex justify-between items-center p-3 cursor-pointer ${
									log.success ? 'bg-green-50' : 'bg-red-50'
								}`}
								onClick={() => toggleExpand(log.id)}
							>
								<div>
									<span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded mr-2">
										{log.method}
									</span>
									<span className="font-mono text-sm">{log.url}</span>
								</div>
								<div className="flex items-center">
									<span className="text-xs text-gray-500 mr-2">{formatTimestamp(log.timestamp)}</span>
									<span
										className={`px-2 py-1 rounded text-xs ${
											log.success
												? 'bg-green-200 text-green-800'
												: 'bg-red-200 text-red-800'
										}`}
									>
										{log.status}
									</span>
								</div>
							</div>

							{expandedLog === log.id && (
								<div className="p-4 bg-white border-t">
									<div className="mb-4">
										<h3 className="text-sm font-semibold mb-2">Request</h3>
										<pre className="bg-gray-50 p-3 rounded overflow-x-auto text-xs">
											{JSON.stringify(log.requestBody, null, 2)}
										</pre>
									</div>
									<div>
										<h3 className="text-sm font-semibold mb-2">Response</h3>
										<pre className="bg-gray-50 p-3 rounded overflow-x-auto text-xs">
											{JSON.stringify(log.responseBody, null, 2)}
										</pre>
									</div>
								</div>
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
}
