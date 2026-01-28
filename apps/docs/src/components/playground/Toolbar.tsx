import { useState } from 'react';
import { examples, type Example } from './examples';

export interface ToolbarProps {
	onSelectExample: (example: Example) => void;
	onShare: () => void;
}

export function Toolbar({ onSelectExample, onShare }: ToolbarProps) {
	const [isExamplesOpen, setIsExamplesOpen] = useState(false);

	const examplesByCategory = {
		basic: examples.filter((e) => e.category === 'basic'),
		flows: examples.filter((e) => e.category === 'flows'),
		messages: examples.filter((e) => e.category === 'messages'),
		full: examples.filter((e) => e.category === 'full'),
	};

	const handleSelectExample = (example: Example) => {
		onSelectExample(example);
		setIsExamplesOpen(false);
	};

	return (
		<div className="toolbar">
			<div className="toolbar-left">
				<div className="dropdown">
					<button
						className="toolbar-button"
						onClick={() => setIsExamplesOpen(!isExamplesOpen)}
						type="button"
					>
						Examples ▼
					</button>
					{isExamplesOpen && (
						<div className="dropdown-menu">
							<div className="dropdown-category">
								<div className="dropdown-category-title">Basic</div>
								{examplesByCategory.basic.map((example) => (
									<button
										key={example.name}
										className="dropdown-item"
										onClick={() => handleSelectExample(example)}
										type="button"
									>
										<div className="dropdown-item-name">{example.name}</div>
										<div className="dropdown-item-description">{example.description}</div>
									</button>
								))}
							</div>

							<div className="dropdown-category">
								<div className="dropdown-category-title">Flows</div>
								{examplesByCategory.flows.map((example) => (
									<button
										key={example.name}
										className="dropdown-item"
										onClick={() => handleSelectExample(example)}
										type="button"
									>
										<div className="dropdown-item-name">{example.name}</div>
										<div className="dropdown-item-description">{example.description}</div>
									</button>
								))}
							</div>

							<div className="dropdown-category">
								<div className="dropdown-category-title">Messages</div>
								{examplesByCategory.messages.map((example) => (
									<button
										key={example.name}
										className="dropdown-item"
										onClick={() => handleSelectExample(example)}
										type="button"
									>
										<div className="dropdown-item-name">{example.name}</div>
										<div className="dropdown-item-description">{example.description}</div>
									</button>
								))}
							</div>

							<div className="dropdown-category">
								<div className="dropdown-category-title">Full Agents</div>
								{examplesByCategory.full.map((example) => (
									<button
										key={example.name}
										className="dropdown-item"
										onClick={() => handleSelectExample(example)}
										type="button"
									>
										<div className="dropdown-item-name">{example.name}</div>
										<div className="dropdown-item-description">{example.description}</div>
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="toolbar-right">
				<button className="toolbar-button" onClick={onShare} title="Share code via URL" type="button">
					🔗 Share
				</button>
			</div>
		</div>
	);
}
