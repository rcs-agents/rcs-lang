/**
 * Converts RCL AST to diagram flow model
 * This utility extracts flow sections from the AST and converts them into
 * the RCLFlowModel format expected by the @rcs-lang/diagram library
 */

import type { RCLFlowModel, RCLNode, RCLEdge } from '@rcs-lang/diagram';

interface ASTSection {
	type: string;
	sectionType: string;
	identifier?: { value: string };
	body?: any[];
	[key: string]: any;
}

interface ASTFile {
	type: 'RclFile';
	sections: ASTSection[];
}

/**
 * Convert AST to diagram flow models
 */
export function astToDiagramFlows(ast: ASTFile): RCLFlowModel[] {
	if (!ast || ast.type !== 'RclFile' || !ast.sections) {
		return [];
	}

	const flows: RCLFlowModel[] = [];

	// Find all flow sections in the AST
	for (const section of ast.sections) {
		if (section.sectionType === 'agent' && section.body) {
			// Extract flows from agent section
			for (const agentChild of section.body) {
				if (agentChild.sectionType === 'flow') {
					const flow = convertFlowSection(agentChild);
					if (flow) {
						flows.push(flow);
					}
				}
			}
		} else if (section.sectionType === 'flow') {
			// Standalone flow
			const flow = convertFlowSection(section);
			if (flow) {
				flows.push(flow);
			}
		}
	}

	return flows;
}

/**
 * Convert a single flow section to RCLFlowModel
 */
function convertFlowSection(flowSection: ASTSection): RCLFlowModel | null {
	if (!flowSection.identifier?.value || !flowSection.body) {
		return null;
	}

	const flowId = flowSection.identifier.value;
	const nodes: RCLNode[] = [];
	const edges: RCLEdge[] = [];
	let nodeIdCounter = 0;

	// Track state names to node IDs
	const stateToNodeId = new Map<string, string>();

	// Find the start state
	let startStateName: string | undefined;
	for (const item of flowSection.body) {
		if (item.type === 'Attribute' && item.key === 'start') {
			if (item.value?.value) {
				startStateName = item.value.value;
			}
			break;
		}
	}

	// Create start node
	if (startStateName) {
		const startNodeId = `start-${nodeIdCounter++}`;
		nodes.push({
			id: startNodeId,
			type: 'start',
			position: { x: 0, y: 0 },
			data: {
				label: ':start',
			},
		});
		stateToNodeId.set(':start', startNodeId);

		// Create edge from start to initial state
		const initialNodeId = getOrCreateStateNode(
			startStateName,
			nodes,
			stateToNodeId,
			nodeIdCounter
		);
		if (initialNodeId) {
			edges.push({
				id: `edge-${startNodeId}-${initialNodeId}`,
				source: startNodeId,
				target: initialNodeId,
				data: {},
			});
		}
	}

	// Process state handlers (on sections)
	for (const item of flowSection.body) {
		if (item.sectionType === 'on' && item.identifier?.value) {
			const stateName = item.identifier.value;

			// Create or get the state node
			const stateNodeId = getOrCreateStateNode(stateName, nodes, stateToNodeId, nodeIdCounter);

			if (stateNodeId && item.body) {
				// Process state body for transitions
				for (const bodyItem of item.body) {
					if (bodyItem.type === 'MatchBlock') {
						// Handle match blocks
						processMatchBlock(
							bodyItem,
							stateNodeId,
							nodes,
							edges,
							stateToNodeId,
							nodeIdCounter
						);
					} else if (bodyItem.type === 'SimpleTransition') {
						// Handle simple transitions
						processSimpleTransition(
							bodyItem,
							stateNodeId,
							nodes,
							edges,
							stateToNodeId,
							nodeIdCounter
						);
					}
				}
			}
		}
	}

	return {
		id: flowId,
		nodes,
		edges,
	};
}

/**
 * Get or create a state node
 */
function getOrCreateStateNode(
	stateName: string,
	nodes: RCLNode[],
	stateToNodeId: Map<string, string>,
	nodeIdCounter: number
): string | null {
	if (!stateName) return null;

	// Check if it's a special state
	if (stateName === ':end') {
		if (!stateToNodeId.has(':end')) {
			const endNodeId = `end-${nodeIdCounter}`;
			nodes.push({
				id: endNodeId,
				type: 'end',
				position: { x: 0, y: 0 },
				data: {
					label: ':end',
				},
			});
			stateToNodeId.set(':end', endNodeId);
			return endNodeId;
		}
		return stateToNodeId.get(':end') || null;
	}

	// Regular state
	if (stateToNodeId.has(stateName)) {
		return stateToNodeId.get(stateName) || null;
	}

	// Create new message node
	const nodeId = `message-${stateName}-${nodeIdCounter}`;
	nodes.push({
		id: nodeId,
		type: 'message',
		position: { x: 0, y: 0 },
		data: {
			label: stateName,
		},
	});
	stateToNodeId.set(stateName, nodeId);
	return nodeId;
}

/**
 * Process a match block to create edges
 */
function processMatchBlock(
	matchBlock: any,
	sourceNodeId: string,
	nodes: RCLNode[],
	edges: RCLEdge[],
	stateToNodeId: Map<string, string>,
	nodeIdCounter: number
): void {
	if (!matchBlock.cases || !Array.isArray(matchBlock.cases)) {
		return;
	}

	for (const matchCase of matchBlock.cases) {
		if (!matchCase.consequence) continue;

		// Get the label for the edge (the match value)
		let label = '';
		if (matchCase.value?.type === 'StringLiteral') {
			label = matchCase.value.value;
		} else if (matchCase.value?.type === 'Atom' && matchCase.value.value === 'default') {
			label = ':default';
		}

		// Extract target state from consequence
		const targetState = extractTargetState(matchCase.consequence);
		if (targetState) {
			const targetNodeId = getOrCreateStateNode(
				targetState,
				nodes,
				stateToNodeId,
				nodeIdCounter
			);
			if (targetNodeId) {
				edges.push({
					id: `edge-${sourceNodeId}-${targetNodeId}-${edges.length}`,
					source: sourceNodeId,
					target: targetNodeId,
					data: {
						label,
					},
				});
			}
		}
	}
}

/**
 * Process a simple transition
 */
function processSimpleTransition(
	transition: any,
	sourceNodeId: string,
	nodes: RCLNode[],
	edges: RCLEdge[],
	stateToNodeId: Map<string, string>,
	nodeIdCounter: number
): void {
	const targetState = extractTargetState(transition);
	if (targetState) {
		const targetNodeId = getOrCreateStateNode(targetState, nodes, stateToNodeId, nodeIdCounter);
		if (targetNodeId) {
			edges.push({
				id: `edge-${sourceNodeId}-${targetNodeId}`,
				source: sourceNodeId,
				target: targetNodeId,
				data: {},
			});
		}
	}
}

/**
 * Extract target state from various AST node types
 */
function extractTargetState(node: any): string | null {
	if (!node) return null;

	// Direct identifier
	if (node.type === 'Identifier') {
		return node.value;
	}

	// Contextualized value
	if (node.type === 'ContextualizedValue' && node.value?.type === 'Identifier') {
		return node.value.value;
	}

	// State reference
	if (node.type === 'StateReference' && node.target?.value) {
		return node.target.value;
	}

	// Transition with target
	if (node.target) {
		if (typeof node.target === 'string') {
			return node.target;
		}
		if (node.target.value) {
			return node.target.value;
		}
	}

	return null;
}
