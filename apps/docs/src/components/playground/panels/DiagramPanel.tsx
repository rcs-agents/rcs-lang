import { useEffect, useRef, useState } from 'react';

export interface DiagramPanelProps {
	ast: any;
}

export function DiagramPanel({ ast }: DiagramPanelProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const diagramRef = useRef<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [isInitializing, setIsInitializing] = useState(false);
	const [flowCount, setFlowCount] = useState(0);

	useEffect(() => {
		// Cleanup on unmount
		return () => {
			if (diagramRef.current) {
				diagramRef.current.dispose();
				diagramRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		if (!ast || !containerRef.current || typeof window === 'undefined') {
			return;
		}

		async function initializeDiagram() {
			setIsInitializing(true);
			try {
				// Dynamically import to avoid SSR issues
				const [{ RCLWebDiagram }, { astToDiagramFlows }] = await Promise.all([
					import('@rcs-lang/diagram/web'),
					import('../utils/ast-to-diagram'),
				]);

				// Convert AST to flow models
				const flows = astToDiagramFlows(ast);
				setFlowCount(flows.length);

				if (flows.length === 0) {
					setError(null);
					setIsInitializing(false);
					return;
				}

				// Initialize or update diagram
				if (!diagramRef.current) {
					diagramRef.current = new RCLWebDiagram('diagram-container', {
						enableZoom: true,
						enablePan: true,
						enableNodeDrag: false,
						showPropertyPanel: false,
						autoLayout: true,
						layoutAlgorithm: 'layered',
						layoutDirection: 'DOWN',
						edgeRouting: 'ORTHOGONAL',
					});

					diagramRef.current.initialize();
				}

				// Update with the first flow
				const firstFlow = flows[0];
				diagramRef.current.updateModel({
					flows: {
						[firstFlow.id]: firstFlow,
					},
					activeFlow: firstFlow.id,
				});

				setError(null);
			} catch (err) {
				console.error('Failed to render diagram:', err);
				setError(err instanceof Error ? err.message : 'Failed to render diagram');
			} finally {
				setIsInitializing(false);
			}
		}

		initializeDiagram();
	}, [ast]);

	if (!ast) {
		return (
			<div className="panel-empty">
				<p>No diagram available. Parse valid RCL code to see the flow visualization.</p>
			</div>
		);
	}

	if (isInitializing) {
		return (
			<div className="panel-empty">
				<p>Loading diagram...</p>
			</div>
		);
	}

	if (flowCount === 0 && !isInitializing) {
		return (
			<div className="panel-empty">
				<p>No flows found. Add flow sections to your agent to see the diagram.</p>
				<p style={{ fontSize: '0.9em', opacity: 0.7, marginTop: '0.5rem' }}>
					Example: Add a <code>flow</code> section with <code>on</code> handlers to visualize state
					transitions.
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="panel-empty" style={{ color: '#f85c5c' }}>
				<p>Error rendering diagram:</p>
				<p style={{ fontSize: '0.9em', opacity: 0.8 }}>{error}</p>
			</div>
		);
	}

	return (
		<div className="diagram-panel" style={{ width: '100%', height: '100%', position: 'relative' }}>
			<div
				id="diagram-container"
				ref={containerRef}
				style={{ width: '100%', height: '100%', minHeight: '400px' }}
			/>
		</div>
	);
}
