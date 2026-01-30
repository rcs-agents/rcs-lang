import { Menu } from '@ark-ui/react/menu';
import { ChevronDown, Share2 as ShareIcon, FileCode, Workflow, MessageSquare, Bot } from 'lucide-react';
import { examples as defaultExamples, type Example } from '../examples';
import { twMerge } from 'tailwind-merge';

export interface ToolbarProps {
	onSelectExample: (example: Example) => void;
	onShare: () => void;
	examples?: Example[];
	className?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
	basic: <FileCode size={14} />,
	flows: <Workflow size={14} />,
	messages: <MessageSquare size={14} />,
	full: <Bot size={14} />,
};

const categoryLabels: Record<string, string> = {
	basic: 'Basic',
	flows: 'Flows',
	messages: 'Messages',
	full: 'Full Agents',
};

export function Toolbar({ onSelectExample, onShare, examples = defaultExamples, className }: ToolbarProps) {
	const examplesByCategory = {
		basic: examples.filter((e) => e.category === 'basic'),
		flows: examples.filter((e) => e.category === 'flows'),
		messages: examples.filter((e) => e.category === 'messages'),
		full: examples.filter((e) => e.category === 'full'),
	};

	return (
		<div className={twMerge('toolbar', className)}>
			<div className="toolbar-left">
				<Menu.Root>
					<Menu.Trigger className="menu-trigger">
						<FileCode size={16} />
						<span>Examples</span>
						<ChevronDown size={16} className="menu-trigger-icon" />
					</Menu.Trigger>
					<Menu.Positioner>
						<Menu.Content className="menu-content">
							{Object.entries(examplesByCategory).map(
								([category, categoryExamples]) =>
									categoryExamples.length > 0 && (
										<Menu.ItemGroup key={category} className="menu-item-group">
											<Menu.ItemGroupLabel className="menu-item-group-label">
												{categoryIcons[category]}
												<span>{categoryLabels[category] || category}</span>
											</Menu.ItemGroupLabel>
											{categoryExamples.map((example) => (
												<Menu.Item
													key={example.name}
													value={example.name}
													className="menu-item"
													onClick={() => onSelectExample(example)}
												>
													<div className="menu-item-name">{example.name}</div>
													<div className="menu-item-description">{example.description}</div>
												</Menu.Item>
											))}
										</Menu.ItemGroup>
									),
							)}
						</Menu.Content>
					</Menu.Positioner>
				</Menu.Root>
			</div>

			<div className="toolbar-right">
				<button className="btn-outline" onClick={onShare} title="Share code via URL" type="button">
					<ShareIcon size={16} />
					<span>Share</span>
				</button>
			</div>
		</div>
	);
}
