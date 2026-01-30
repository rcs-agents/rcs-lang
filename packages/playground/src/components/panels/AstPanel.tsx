import { useState } from 'react';

export interface AstPanelProps {
	ast: any;
}

interface TreeNodeProps {
	data: any;
	name?: string;
	depth?: number;
}

function TreeNode({ data, name, depth = 0 }: TreeNodeProps) {
	const [isExpanded, setIsExpanded] = useState(depth < 2);

	if (data === null) {
		return (
			<div className="ast-node" style={{ paddingLeft: `${depth * 16}px` }}>
				<span className="ast-key">{name}: </span>
				<span className="ast-value null">null</span>
			</div>
		);
	}

	if (typeof data === 'string') {
		return (
			<div className="ast-node" style={{ paddingLeft: `${depth * 16}px` }}>
				<span className="ast-key">{name}: </span>
				<span className="ast-value string">"{data}"</span>
			</div>
		);
	}

	if (typeof data === 'number' || typeof data === 'boolean') {
		return (
			<div className="ast-node" style={{ paddingLeft: `${depth * 16}px` }}>
				<span className="ast-key">{name}: </span>
				<span className="ast-value primitive">{String(data)}</span>
			</div>
		);
	}

	if (Array.isArray(data)) {
		if (data.length === 0) {
			return (
				<div className="ast-node" style={{ paddingLeft: `${depth * 16}px` }}>
					<span className="ast-key">{name}: </span>
					<span className="ast-value array">[]</span>
				</div>
			);
		}

		return (
			<div className="ast-node">
				<div
					className="ast-node-header"
					style={{ paddingLeft: `${depth * 16}px` }}
					onClick={() => setIsExpanded(!isExpanded)}
				>
					<span className="ast-toggle">{isExpanded ? '▼' : '▶'}</span>
					<span className="ast-key">{name}: </span>
					<span className="ast-type">Array({data.length})</span>
				</div>
				{isExpanded && (
					<div className="ast-children">
						{data.map((item, index) => (
							<TreeNode key={index} data={item} name={`[${index}]`} depth={depth + 1} />
						))}
					</div>
				)}
			</div>
		);
	}

	if (typeof data === 'object') {
		const keys = Object.keys(data);
		const nodeType = data.type || data.kind || 'Object';

		if (keys.length === 0) {
			return (
				<div className="ast-node" style={{ paddingLeft: `${depth * 16}px` }}>
					<span className="ast-key">{name}: </span>
					<span className="ast-value object">{'{}'}</span>
				</div>
			);
		}

		return (
			<div className="ast-node">
				<div
					className="ast-node-header"
					style={{ paddingLeft: `${depth * 16}px` }}
					onClick={() => setIsExpanded(!isExpanded)}
				>
					<span className="ast-toggle">{isExpanded ? '▼' : '▶'}</span>
					<span className="ast-key">{name}: </span>
					<span className="ast-type">{nodeType}</span>
				</div>
				{isExpanded && (
					<div className="ast-children">
						{keys.map((key) => (
							<TreeNode key={key} data={data[key]} name={key} depth={depth + 1} />
						))}
					</div>
				)}
			</div>
		);
	}

	return null;
}

export function AstPanel({ ast }: AstPanelProps) {
	if (!ast) {
		return (
			<div className="panel-empty">
				<p>No AST available. Parse the code to see the syntax tree.</p>
			</div>
		);
	}

	return (
		<div className="ast-panel">
			<TreeNode data={ast} name="root" depth={0} />
		</div>
	);
}
