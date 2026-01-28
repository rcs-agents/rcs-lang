export interface DiagramPanelProps {
	ast: any;
}

export function DiagramPanel({ ast }: DiagramPanelProps) {
	// TODO: Integrate @rcs-lang/diagram library
	// This is a placeholder for now

	if (!ast) {
		return (
			<div className="panel-empty">
				<p>No diagram available. Parse valid RCL code to see the flow visualization.</p>
			</div>
		);
	}

	// Check if there are any flows in the AST
	const hasFlows =
		ast &&
		ast.sections &&
		Array.isArray(ast.sections) &&
		ast.sections.some((s: any) => s.type === 'flow');

	if (!hasFlows) {
		return (
			<div className="panel-empty">
				<p>No flows found. Add flow sections to your agent to see the diagram.</p>
			</div>
		);
	}

	return (
		<div className="diagram-panel">
			<div className="panel-empty">
				<p>Diagram visualization coming soon...</p>
				<p style={{ fontSize: '0.9em', opacity: 0.7 }}>
					This will display an interactive Sprotty-based flow diagram.
				</p>
			</div>
		</div>
	);
}
