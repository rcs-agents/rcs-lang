export type TabId = 'ast' | 'errors' | 'diagram' | 'rbx-json' | 'javascript';

export interface Tab {
	id: TabId;
	label: string;
	badge?: number;
}

export interface TabBarProps {
	tabs: Tab[];
	activeTab: TabId;
	onTabChange: (tabId: TabId) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
	return (
		<div className="tab-bar">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					className={`tab ${activeTab === tab.id ? 'active' : ''}`}
					onClick={() => onTabChange(tab.id)}
					type="button"
				>
					{tab.label}
					{tab.badge !== undefined && tab.badge > 0 && (
						<span className="tab-badge">{tab.badge}</span>
					)}
				</button>
			))}
		</div>
	);
}
