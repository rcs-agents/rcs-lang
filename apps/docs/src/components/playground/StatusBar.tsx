export interface StatusBarProps {
	parseTime?: number;
	errorCount: number;
	warningCount: number;
	line?: number;
	column?: number;
}

export function StatusBar({ parseTime, errorCount, warningCount, line, column }: StatusBarProps) {
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
