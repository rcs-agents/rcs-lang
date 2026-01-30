export interface StatusBarProps {
	parseTime?: number;
	errorCount: number;
	warningCount: number;
	line?: number;
	column?: number;
	showLogsToggle?: boolean;
	logsVisible?: boolean;
	onToggleLogs?: () => void;
	logCount?: number;
}

export function StatusBar({
	parseTime,
	errorCount,
	warningCount,
	line,
	column,
	showLogsToggle = false,
	logsVisible = false,
	onToggleLogs,
	logCount = 0,
}: StatusBarProps) {
	return (
		<div className="status-bar">
			<div className="status-item">
				{errorCount > 0 && (
					<span className="status-errors">
						✕ {errorCount} {errorCount === 1 ? 'error' : 'errors'}
					</span>
				)}
				{warningCount > 0 && (
					<span className="status-warnings">
						⚠ {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
					</span>
				)}
				{errorCount === 0 && warningCount === 0 && <span className="status-ok">✓ No issues</span>}

				{showLogsToggle && onToggleLogs && (
					<button className="toolbar-button logs-toggle" onClick={onToggleLogs} type="button">
						{logsVisible ? '▼' : '▶'} Logs {logCount > 0 && `(${logCount})`}
					</button>
				)}
			</div>

			<div className="status-right">
				{parseTime !== undefined && (
					<div className="status-item">Parse time: {parseTime.toFixed(2)}ms</div>
				)}
				{line !== undefined && column !== undefined && (
					<div className="status-item">
						Ln {line}, Col {column}
					</div>
				)}
			</div>
		</div>
	);
}
