export class Toolbar {
  private container: HTMLElement | null = null;
  private onAction: ((action: string, data?: any) => void) | null = null;

  constructor() {
    console.log('🔧 Toolbar initialized');
  }

  initialize() {
    this.container = document.getElementById('toolbar-container');
    if (!this.container) {
      // Create toolbar if it doesn't exist
      this.createToolbar();
    }
    this.render();
  }

  private createToolbar() {
    const header = document.querySelector('.ide-header');
    if (!header) {
      console.error('IDE header not found');
      return;
    }

    this.container = document.createElement('div');
    this.container.id = 'toolbar-container';
    this.container.className = 'toolbar';
    header.appendChild(this.container);
  }

  private render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="toolbar-group">
        <button class="toolbar-btn" data-action="format" title="Format Code">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2h12v2H2V2zm0 5h8v2H2V7zm0 5h12v2H2v-2z"/>
          </svg>
          Format
        </button>
        <button class="toolbar-btn" data-action="compile" title="Compile">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.5 1l-3 3v8l3 3h7l3-3V4l-3-3h-7zm0 1h7l2 2v8l-2 2h-7l-2-2V4l2-2zm2 3l2 2-2 2V7H3V6h3.5V3l3 3-3 3z"/>
          </svg>
          Compile
        </button>
      </div>
      <div class="toolbar-group layout-controls">
        <label class="toolbar-label">Layout:</label>
        <select class="toolbar-select" id="layout-algorithm" data-action="layout-algorithm" title="Layout Algorithm">
          <option value="layered">Hierarchical</option>
          <option value="force">Force-Directed</option>
          <option value="stress">Stress-Based</option>
          <option value="mrtree">Tree</option>
          <option value="radial">Radial</option>
          <option value="disco">Disconnected</option>
        </select>
        <select class="toolbar-select" id="layout-direction" data-action="layout-direction" title="Layout Direction">
          <option value="DOWN">Top to Bottom</option>
          <option value="UP">Bottom to Top</option>
          <option value="RIGHT">Left to Right</option>
          <option value="LEFT">Right to Left</option>
        </select>
        <button class="toolbar-btn toggle-btn" data-action="toggle-auto-layout" title="Toggle Auto Layout">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM7 4v4l3 2 1-1-2.5-1.5V4H7z"/>
          </svg>
          Auto
        </button>
        <button class="toolbar-btn" data-action="manual-layout" title="Manual Layout">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 3h2v2H3V3zm0 4h2v2H3V7zm0 4h2v2H3v-2zm4-8h2v2H7V3zm0 4h2v2H7V7zm0 4h2v2H7v-2zm4-8h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2z"/>
          </svg>
          Manual
        </button>
      </div>
      <div class="toolbar-group connector-controls">
        <label class="toolbar-label">Connectors:</label>
        <select class="toolbar-select" id="edge-routing" data-action="edge-routing" title="Connector Style">
          <option value="ORTHOGONAL">Orthogonal (90°)</option>
          <option value="SPLINES">Curved (Organic)</option>
          <option value="STRAIGHT">Straight Lines</option>
        </select>
        <select class="toolbar-select" id="edge-spacing" data-action="edge-spacing" title="Connector Spacing">
          <option value="auto">Auto Spacing</option>
          <option value="tight">Tight Spacing</option>
          <option value="loose">Loose Spacing</option>
        </select>
        <button class="toolbar-btn toggle-btn" data-action="toggle-waypoint-edit" title="Edit Waypoints (W)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM3 3l10 10M13 3L3 13"/>
          </svg>
          Edit
        </button>
      </div>
      <div class="toolbar-group">
        <button class="toolbar-btn" data-action="copy-js" title="Copy JavaScript">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2v10h8V4.5L9.5 2H4zm1 1h4v3h3v5H5V3zm9 1v9a1 1 0 0 1-1 1H5v1h9V4h-1z"/>
          </svg>
          Copy JS
        </button>
        <button class="toolbar-btn" data-action="copy-json" title="Copy JSON">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2v10h8V4.5L9.5 2H4zm1 1h4v3h3v5H5V3zm9 1v9a1 1 0 0 1-1 1H5v1h9V4h-1z"/>
          </svg>
          Copy JSON
        </button>
        <button class="toolbar-btn" data-action="download-js" title="Download JavaScript">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.5 1v7.5L5 6v1.5l3 3 3-3V6l-2.5 2.5V1h-1zM2 10v4h12v-4h-1v3H3v-3H2z"/>
          </svg>
          Download JS
        </button>
        <button class="toolbar-btn" data-action="download-json" title="Download JSON">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.5 1v7.5L5 6v1.5l3 3 3-3V6l-2.5 2.5V1h-1zM2 10v4h12v-4h-1v3H3v-3H2z"/>
          </svg>
          Download JSON
        </button>
      </div>
      <div class="toolbar-group">
        <button class="toolbar-btn" data-action="help" title="Help">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1a6 6 0 1 1 0 12A6 6 0 0 1 8 2zm0 2a2 2 0 0 0-2 2h1a1 1 0 0 1 1-1 1 1 0 0 1 0 2c-.55 0-1 .45-1 1v1h1v-.5c0-.28.22-.5.5-.5H8a2 2 0 0 0 0-4zm-.5 6v1h1v-1h-1z"/>
          </svg>
        </button>
      </div>
    `;

    // Add styles
    this.addStyles();

    // Attach event listeners
    this.attachListeners();
  }

  private addStyles() {
    if (document.getElementById('toolbar-styles')) return;

    const style = document.createElement('style');
    style.id = 'toolbar-styles';
    style.textContent = `
      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 16px;
        background: #2d2d30;
        border-bottom: 1px solid #3e3e42;
        flex-shrink: 0;
      }

      .toolbar-group {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .toolbar-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        background: transparent;
        border: 1px solid transparent;
        color: #cccccc;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .toolbar-btn:hover {
        background: #3e3e42;
        border-color: #464647;
      }

      .toolbar-btn:active {
        background: #45494e;
      }

      .toolbar-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .toolbar-btn svg {
        width: 16px;
        height: 16px;
      }

      .toolbar-label {
        color: #cccccc;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        margin-right: 8px;
      }

      .toolbar-select {
        padding: 4px 8px;
        background: #3c3c3c;
        border: 1px solid #464647;
        color: #cccccc;
        font-size: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        border-radius: 4px;
        cursor: pointer;
        min-width: 120px;
      }

      .toolbar-select:hover {
        background: #464647;
      }

      .toolbar-select:focus {
        outline: none;
        border-color: #007acc;
        background: #464647;
      }

      .layout-controls {
        border-left: 1px solid #3e3e42;
        border-right: 1px solid #3e3e42;
        padding-left: 12px;
        padding-right: 12px;
        margin-left: 8px;
        margin-right: 8px;
      }

      .connector-controls {
        border-right: 1px solid #3e3e42;
        padding-right: 12px;
        margin-right: 8px;
      }

      .toggle-btn.active {
        background: #007acc !important;
        border-color: #007acc !important;
      }

      /* Update IDE layout to include toolbar */
      .ide-container {
        grid-template-rows: auto 1fr !important;
      }

      .ide-main {
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
  }

  private attachListeners() {
    if (!this.container) return;

    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('.toolbar-btn') as HTMLElement;
      if (!button) return;

      const action = button.dataset.action;
      if (action && this.onAction) {
        this.onAction(action);
      }
    });

    // Handle select elements
    this.container.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      if (target.tagName === 'SELECT') {
        const action = target.dataset.action;
        if (action && this.onAction) {
          this.onAction(action, target.value);
        }
      }
    });
  }

  setActionHandler(handler: (action: string, data?: any) => void) {
    this.onAction = handler;
  }

  setButtonState(action: string, enabled: boolean) {
    if (!this.container) return;

    const button = this.container.querySelector(`[data-action="${action}"]`) as HTMLButtonElement;
    if (button) {
      button.disabled = !enabled;
    }
  }

  setSelectValue(action: string, value: string) {
    if (!this.container) return;

    const select = this.container.querySelector(`[data-action="${action}"]`) as HTMLSelectElement;
    if (select) {
      select.value = value;
    }
  }

  toggleButtonActive(action: string, active: boolean) {
    if (!this.container) return;

    const button = this.container.querySelector(`[data-action="${action}"]`) as HTMLButtonElement;
    if (button) {
      if (active) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    }
  }
}
