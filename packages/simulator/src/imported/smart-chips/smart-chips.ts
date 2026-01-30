import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export interface SmartReplyChip {
  type: 'reply'
  text: string
  postbackData: string
}

export interface SmartActionChip {
  type: 'action'
  text: string
  postbackData: string
  icon?: string
  action?: {
    dialAction?: { phoneNumber: string }
    openUrlAction?: { url: string }
    shareLocationAction?: {}
    viewLocationAction?: { query: string }
    createCalendarEventAction?: { startTime: string; endTime: string; title: string }
  }
}

export type SmartChip = SmartReplyChip | SmartActionChip

@customElement('rbx-smart-chips')
export class SmartChips extends LitElement {
  @property({ type: Array })
  chips: SmartChip[] = []

  @property({ type: String })
  layout: 'horizontal' | 'vertical' = 'horizontal'

  @property({ type: Boolean })
  isAndroid = true

  @property({ type: Boolean })
  isDarkMode = false

  @property()
  onChipClick?: (chip: SmartChip) => void

  static styles = css`
    :host {
      display: block;
      font-family: var(--font-family-sf-pro-display, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    }

    :host(.android) {
      font-family: 'Roboto', 'Segoe UI', system-ui, sans-serif;
    }

    .chips-container {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .chips-container.vertical {
      flex-direction: column;
    }

    .chips-container.horizontal {
      flex-direction: row;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .chips-container.horizontal::-webkit-scrollbar {
      display: none;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 1rem;
      border-radius: 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      border: 1px solid transparent;
    }

    /* Smart Reply Chips */
    .chip.reply {
      background-color: #f3f4f6;
      color: #374151;
      border-color: #d1d5db;
    }

    .chip.reply:hover {
      background-color: #e5e7eb;
      border-color: #9ca3af;
    }

    .chip.reply.dark {
      background-color: #374151;
      color: #f9fafb;
      border-color: #4b5563;
    }

    .chip.reply.dark:hover {
      background-color: #4b5563;
      border-color: #6b7280;
    }

    /* Smart Action Chips */
    .chip.action {
      background-color: #dbeafe;
      color: #1d4ed8;
      border-color: #93c5fd;
    }

    .chip.action:hover {
      background-color: #bfdbfe;
      border-color: #60a5fa;
    }

    .chip.action.dark {
      background-color: #1e3a8a;
      color: #bfdbfe;
      border-color: #3b82f6;
    }

    .chip.action.dark:hover {
      background-color: #1e40af;
      border-color: #60a5fa;
    }

    .chip-icon {
      width: 1rem;
      height: 1rem;
      fill: currentColor;
    }

    /* Android specific styles */
    .chips-container.android .chip {
      border-radius: 1rem;
      font-size: 0.8125rem;
    }

    .chips-container.android .chip.reply {
      background-color: #f5f5f5;
      color: #212121;
      border-color: #e0e0e0;
    }

    .chips-container.android .chip.action {
      background-color: #e3f2fd;
      color: #1976d2;
      border-color: #bbdefb;
    }
  `

  connectedCallback() {
    super.connectedCallback()
    this.updateHostClasses()
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('isAndroid')) {
      this.updateHostClasses()
    }
  }

  private updateHostClasses() {
    if (this.isAndroid) {
      this.classList.add('android')
      this.classList.remove('ios')
    } else {
      this.classList.add('ios')
      this.classList.remove('android')
    }
  }

  private handleChipClick(chip: SmartChip) {
    this.onChipClick?.(chip)
  }

  private renderIcon(iconName?: string) {
    if (!iconName) return null

    const icons = {
      phone: html`
        <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      `,
      web: html`
        <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      `,
      location: html`
        <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      `,
      calendar: html`
        <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      `,
    }

    return icons[iconName as keyof typeof icons] || null
  }

  render() {
    if (this.chips.length === 0) return null

    const containerClass = `chips-container ${this.layout} ${this.isAndroid ? 'android' : 'ios'}`

    return html`
      <div class="${containerClass}">
        ${this.chips.map((chip) => {
          const chipClass = `chip ${chip.type} ${this.isDarkMode ? 'dark' : ''}`

          return html`
            <button
              class="${chipClass}"
              @click=${() => this.handleChipClick(chip)}
            >
              ${chip.type === 'action' ? this.renderIcon((chip as SmartActionChip).icon) : ''}
              <span>${chip.text}</span>
            </button>
          `
        })}
      </div>
    `
  }
}
