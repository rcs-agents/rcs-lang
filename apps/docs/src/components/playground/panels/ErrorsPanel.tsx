export interface Diagnostic {
	message: string;
	severity: 'error' | 'warning' | 'info';
	range: {
		start: { line: number; character: number };
		end: { line: number; character: number };
	};
}

export interface ErrorsPanelProps {
	diagnostics: Diagnostic[];
	onErrorClick?: (diagnostic: Diagnostic) => void;
}

export function ErrorsPanel({ diagnostics, onErrorClick }: ErrorsPanelProps) {
	if (diagnostics.length === 0) {
		return (
			<div className="panel-empty">
				<p>✓ No errors or warnings</p>
			</div>
		);
	}

	const errors = diagnostics.filter((d) => d.severity === 'error');
	const warnings = diagnostics.filter((d) => d.severity === 'warning');
	const infos = diagnostics.filter((d) => d.severity === 'info');

	return (
		<div className="errors-panel">
			{errors.length > 0 && (
				<div className="diagnostic-group">
					<h3 className="diagnostic-group-title">
						<span className="error-icon">✕</span> Errors ({errors.length})
					</h3>
					<ul className="diagnostic-list">
						{errors.map((diagnostic, index) => (
							<li
								key={index}
								className="diagnostic-item error"
								onClick={() => onErrorClick?.(diagnostic)}
								style={{ cursor: onErrorClick ? 'pointer' : 'default' }}
							>
								<div className="diagnostic-location">
									Line {diagnostic.range.start.line + 1}, Column{' '}
									{diagnostic.range.start.character + 1}
								</div>
								<div className="diagnostic-message">{diagnostic.message}</div>
							</li>
						))}
					</ul>
				</div>
			)}

			{warnings.length > 0 && (
				<div className="diagnostic-group">
					<h3 className="diagnostic-group-title">
						<span className="warning-icon">⚠</span> Warnings ({warnings.length})
					</h3>
					<ul className="diagnostic-list">
						{warnings.map((diagnostic, index) => (
							<li
								key={index}
								className="diagnostic-item warning"
								onClick={() => onErrorClick?.(diagnostic)}
								style={{ cursor: onErrorClick ? 'pointer' : 'default' }}
							>
								<div className="diagnostic-location">
									Line {diagnostic.range.start.line + 1}, Column{' '}
									{diagnostic.range.start.character + 1}
								</div>
								<div className="diagnostic-message">{diagnostic.message}</div>
							</li>
						))}
					</ul>
				</div>
			)}

			{infos.length > 0 && (
				<div className="diagnostic-group">
					<h3 className="diagnostic-group-title">
						<span className="info-icon">ℹ</span> Info ({infos.length})
					</h3>
					<ul className="diagnostic-list">
						{infos.map((diagnostic, index) => (
							<li
								key={index}
								className="diagnostic-item info"
								onClick={() => onErrorClick?.(diagnostic)}
								style={{ cursor: onErrorClick ? 'pointer' : 'default' }}
							>
								<div className="diagnostic-location">
									Line {diagnostic.range.start.line + 1}, Column{' '}
									{diagnostic.range.start.character + 1}
								</div>
								<div className="diagnostic-message">{diagnostic.message}</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
