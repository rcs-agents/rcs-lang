export class TabManager {
  private tabs: NodeListOf<Element> | null = null;
  private panels: NodeListOf<Element> | null = null;
  private currentTab = 'flow';
  private changeCallback: ((tabId: string) => void) | null = null;

  constructor() {
    console.log('📋 Tab Manager initialized');
  }

  initialize() {
    this.tabs = document.querySelectorAll('.tab');
    this.panels = document.querySelectorAll('.tab-panel');

    if (!this.tabs || !this.panels) {
      throw new Error('Tabs or panels not found');
    }

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.tabs) return;

    for (const tab of this.tabs) {
      tab.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tabId = target.getAttribute('data-tab');

        if (tabId) {
          this.switchToTab(tabId);
        }
      });
    }
  }

  switchToTab(tabId: string) {
    if (this.currentTab === tabId) return;

    console.log(`🔄 Switching to tab: ${tabId}`);

    // Update tab styles
    if (this.tabs) {
      for (const tab of this.tabs) {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabId) {
          tab.classList.add('active');
        }
      }
    }

    // Update panel visibility
    if (this.panels) {
      for (const panel of this.panels) {
        panel.classList.remove('active');
        if (panel.id === `${tabId}-panel`) {
          panel.classList.add('active');
        }
      }
    }

    this.currentTab = tabId;

    // Notify callback
    if (this.changeCallback) {
      this.changeCallback(tabId);
    }
  }

  onTabChange(callback: (tabId: string) => void) {
    this.changeCallback = callback;
  }

  getCurrentTab(): string {
    return this.currentTab;
  }
}
