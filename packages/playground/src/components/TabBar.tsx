import { Tabs } from '@ark-ui/react/tabs';
import { TreePine, GitBranch, Braces, FileCode2, Smartphone, User, MessageSquare } from 'lucide-react';
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type TabId = 'ast' | 'diagram' | 'agent-json' | 'messages-json' | 'csm-json' | 'javascript' | 'simulator';

export interface Tab {
	id: TabId;
	label: string;
	badge?: number;
}

export interface TabBarProps {
	tabs: Tab[];
	activeTab: TabId;
	onTabChange: (tabId: TabId) => void;
	className?: string;
}

const tabIcons: Record<TabId, ReactNode> = {
	ast: <TreePine size={14} />,
	diagram: <GitBranch size={14} />,
	'agent-json': <User size={14} />,
	'messages-json': <MessageSquare size={14} />,
	'csm-json': <Braces size={14} />,
	javascript: <FileCode2 size={14} />,
	simulator: <Smartphone size={14} />,
};

export function TabBar({ tabs, activeTab, onTabChange, className }: TabBarProps) {
	return (
		<Tabs.Root
			value={activeTab}
			onValueChange={({ value }) => onTabChange(value as TabId)}
			className={twMerge('tabs-root', className)}
		>
			<Tabs.List className="tabs-list">
				{tabs.map((tab) => (
					<Tabs.Trigger key={tab.id} value={tab.id} className="tabs-trigger">
						{tabIcons[tab.id]}
						<span>{tab.label}</span>
						{tab.badge !== undefined && tab.badge > 0 && (
							<span className="tabs-badge">{tab.badge}</span>
						)}
					</Tabs.Trigger>
				))}
				<Tabs.Indicator className="tabs-indicator" />
			</Tabs.List>
		</Tabs.Root>
	);
}
