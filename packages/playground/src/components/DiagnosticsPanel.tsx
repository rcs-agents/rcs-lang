import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Info, X } from 'lucide-react';
import type { Diagnostic } from './panels/ErrorsPanel';

export interface DiagnosticsPanelProps {
	diagnostics: Diagnostic[];
	onErrorClick?: (diagnostic: Diagnostic) => void;
}

/**
 * Collapsible diagnostics panel shown at the bottom of the playground.
 * Displays errors, warnings, and info messages from compilation.
 */
export function DiagnosticsPanel({ diagnostics, onErrorClick }: DiagnosticsPanelProps) {
	const [isExpanded, setIsExpanded] = useState(true);

	const errors = diagnostics.filter((d) => d.severity === 'error');
	const warnings = diagnostics.filter((d) => d.severity === 'warning');
	const infos = diagnostics.filter((d) => d.severity === 'info');

	const hasIssues = diagnostics.length > 0;

	if (!hasIssues) {
		return null;
	}

	return (
		<div className={`diagnostics-panel ${isExpanded ? 'diagnostics-panel--expanded' : ''}`}>
			<button
				className="diagnostics-panel-header"
				onClick={() => setIsExpanded(!isExpanded)}
				type="button"
			>
				<div className="diagnostics-panel-summary">
					{errors.length > 0 && (
						<span className="diagnostics-count diagnostics-count--error">
							<X size={12} />
							{errors.length} {errors.length === 1 ? 'error' : 'errors'}
						</span>
					)}
					{warnings.length > 0 && (
						<span className="diagnostics-count diagnostics-count--warning">
							<AlertTriangle size={12} />
							{warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'}
						</span>
					)}
					{infos.length > 0 && (
						<span className="diagnostics-count diagnostics-count--info">
							<Info size={12} />
							{infos.length} info
						</span>
					)}
				</div>
				<span className="diagnostics-panel-toggle">
					{isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
				</span>
			</button>

			{isExpanded && (
				<div className="diagnostics-panel-content">
					{errors.map((diagnostic, index) => (
						<div
							key={`error-${index}`}
							className="diagnostics-item diagnostics-item--error"
							onClick={() => onErrorClick?.(diagnostic)}
							style={{ cursor: onErrorClick ? 'pointer' : 'default' }}
						>
							<X size={14} className="diagnostics-item-icon" />
							<span className="diagnostics-item-location">
								[Ln {diagnostic.range.start.line + 1}, Col {diagnostic.range.start.character + 1}]
							</span>
							<span className="diagnostics-item-message">{diagnostic.message}</span>
						</div>
					))}
					{warnings.map((diagnostic, index) => (
						<div
							key={`warning-${index}`}
							className="diagnostics-item diagnostics-item--warning"
							onClick={() => onErrorClick?.(diagnostic)}
							style={{ cursor: onErrorClick ? 'pointer' : 'default' }}
						>
							<AlertTriangle size={14} className="diagnostics-item-icon" />
							<span className="diagnostics-item-location">
								[Ln {diagnostic.range.start.line + 1}, Col {diagnostic.range.start.character + 1}]
							</span>
							<span className="diagnostics-item-message">{diagnostic.message}</span>
						</div>
					))}
					{infos.map((diagnostic, index) => (
						<div
							key={`info-${index}`}
							className="diagnostics-item diagnostics-item--info"
							onClick={() => onErrorClick?.(diagnostic)}
							style={{ cursor: onErrorClick ? 'pointer' : 'default' }}
						>
							<Info size={14} className="diagnostics-item-icon" />
							<span className="diagnostics-item-location">
								[Ln {diagnostic.range.start.line + 1}, Col {diagnostic.range.start.character + 1}]
							</span>
							<span className="diagnostics-item-message">{diagnostic.message}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
