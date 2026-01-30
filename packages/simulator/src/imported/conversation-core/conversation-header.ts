import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export interface ConversationHeaderConfig {
  logo?: string
  brandName: string
  isVerified?: boolean
  subtitle?: string
  eyebrow?: string
  showBackButton?: boolean
  showMenuButton?: boolean
}

@customElement('rbx-conversation-header')
export class ConversationHeader extends LitElement {
  @property({ type: Object })
  config!: ConversationHeaderConfig

  @property({ type: Boolean })
  isAndroid = true

  @property({ type: Boolean })
  isDarkMode = false

  @property()
  onBackClick?: () => void

  @property()
  onMenuClick?: () => void

  static styles = css`
    :host {
      display: block;
      font-family: var(--font-family-sf-pro-display, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    }

    :host(.android) {
      font-family: 'Roboto', 'Segoe UI', system-ui, sans-serif;
    }

    .header-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background-color: white;
      border-bottom: 1px solid #e5e7eb;
      min-height: 3.5rem;
    }

    .header-container.dark {
      background-color: #1f2937;
      border-bottom-color: #374151;
      color: #f9fafb;
    }

    .header-action {
      background: none;
      border: none;
      padding: 0.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
      color: #6b7280;
    }

    .header-action:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    .header-action.dark {
      color: #9ca3af;
    }

    .header-action.dark:hover {
      background-color: #374151;
      color: #f9fafb;
    }

    .header-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      min-width: 0;
    }

    .brand-logo {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.5rem;
      object-fit: cover;
      background-color: #f3f4f6;
      flex-shrink: 0;
    }

    .brand-logo.dark {
      background-color: #4b5563;
    }

    .brand-content {
      flex: 1;
      min-width: 0;
    }

    .brand-eyebrow {
      font-size: 0.75rem;
      color: #6b7280;
      margin: 0 0 0.125rem 0;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .brand-eyebrow.dark {
      color: #9ca3af;
    }

    .brand-name-wrapper {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-bottom: 0.125rem;
    }

    .brand-name {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
      color: #111827;
      truncate: true;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .brand-name.dark {
      color: #f9fafb;
    }

    .verified-badge {
      width: 1rem;
      height: 1rem;
      color: #3b82f6;
      flex-shrink: 0;
    }

    .verified-badge.dark {
      color: #60a5fa;
    }

    .brand-subtitle {
      font-size: 0.75rem;
      color: #6b7280;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .brand-subtitle.dark {
      color: #9ca3af;
    }

    /* Android specific styles */
    :host(.android) .header-container {
      padding: 0.5rem 1rem;
      min-height: 3rem;
    }

    :host(.android) .brand-logo {
      border-radius: 0.375rem;
      width: 2.25rem;
      height: 2.25rem;
    }

    :host(.android) .brand-name {
      font-size: 0.9375rem;
    }

    :host(.android) .brand-subtitle {
      font-size: 0.6875rem;
    }

    :host(.android) .header-action {
      border-radius: 0.375rem;
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

  private renderBackButton() {
    if (!this.config.showBackButton) return null

    return html`
      <button 
        class="header-action ${this.isDarkMode ? 'dark' : ''}"
        @click=${this.onBackClick}
        aria-label="Back"
      >
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
    `
  }

  private renderMenuButton() {
    if (!this.config.showMenuButton) return null

    return html`
      <button 
        class="header-action ${this.isDarkMode ? 'dark' : ''}"
        @click=${this.onMenuClick}
        aria-label="Menu"
      >
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="12" cy="5" r="1"/>
          <circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
    `
  }

  private renderVerifiedBadge() {
    if (!this.config.isVerified) return null

    return html`
      <svg 
        class="verified-badge ${this.isDarkMode ? 'dark' : ''}" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        aria-label="Verified business"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    `
  }

  render() {
    if (!this.config) return null

    return html`
      <div class="header-container ${this.isDarkMode ? 'dark' : ''}">
        ${this.renderBackButton()}
        
        <div class="brand-section">
          ${
            this.config.logo
              ? html`
            <img 
              class="brand-logo ${this.isDarkMode ? 'dark' : ''}"
              src="${this.config.logo}"
              alt="${this.config.brandName} logo"
            />
          `
              : ''
          }
          
          <div class="brand-content">
            ${
              this.config.eyebrow
                ? html`
              <p class="brand-eyebrow ${this.isDarkMode ? 'dark' : ''}">${this.config.eyebrow}</p>
            `
                : ''
            }
            
            <div class="brand-name-wrapper">
              <h1 class="brand-name ${this.isDarkMode ? 'dark' : ''}">${this.config.brandName}</h1>
              ${this.renderVerifiedBadge()}
            </div>
            
            ${
              this.config.subtitle
                ? html`
              <p class="brand-subtitle ${this.isDarkMode ? 'dark' : ''}">${this.config.subtitle}</p>
            `
                : ''
            }
          </div>
        </div>

        ${this.renderMenuButton()}
      </div>
    `
  }
}
