import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export interface BusinessCard {
  id: string
  header?: {
    logo?: string
    brandName: string
    subtitle?: string
    eyebrow?: string
  }
  media?: {
    imageUrl?: string
    altText?: string
    type?: 'image' | 'video'
  }
  content: {
    title: string
    description?: string
    features?: string[]
    pricing?: {
      amount: string
      currency?: string
      period?: string
    }
  }
  actions?: Array<{
    text: string
    type: 'reply' | 'action' | 'view'
    postbackData?: string
    openUrlAction?: { url: string }
    dialAction?: { phoneNumber: string }
  }>
}

@customElement('rbx-card-business')
export class CardBusiness extends LitElement {
  @property({ type: Object })
  card!: BusinessCard

  @property({ type: String })
  size: 'small' | 'medium' | 'large' = 'medium'

  @property({ type: Boolean })
  isAndroid = true

  @property({ type: Boolean })
  isDarkMode = false

  @property()
  onAction?: (action: any, card: BusinessCard) => void

  static styles = css`
    :host {
      display: block;
      font-family: var(--font-family-sf-pro-display, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    }

    :host(.android) {
      font-family: 'Roboto', 'Segoe UI', system-ui, sans-serif;
    }

    .business-card {
      background-color: white;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      max-width: 100%;
    }

    .business-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .business-card.dark {
      background-color: #374151;
      color: #f9fafb;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .business-card.dark:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .business-card.small {
      max-width: 280px;
    }

    .business-card.medium {
      max-width: 360px;
    }

    .business-card.large {
      max-width: 480px;
    }

    .card-header {
      padding: 1rem 1rem 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .card-header.small {
      padding: 0.75rem 0.75rem 0.375rem;
      gap: 0.5rem;
    }

    .header-logo {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.375rem;
      object-fit: cover;
      background-color: #f3f4f6;
    }

    .header-logo.small {
      width: 2rem;
      height: 2rem;
    }

    .header-logo.dark {
      background-color: #4b5563;
    }

    .header-content {
      flex: 1;
      min-width: 0;
    }

    .header-eyebrow {
      font-size: 0.75rem;
      color: #6b7280;
      margin: 0 0 0.125rem 0;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .header-eyebrow.dark {
      color: #9ca3af;
    }

    .header-brand {
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0;
      color: #111827;
    }

    .header-brand.medium {
      font-size: 1rem;
    }

    .header-brand.large {
      font-size: 1.125rem;
    }

    .header-brand.dark {
      color: #f9fafb;
    }

    .header-subtitle {
      font-size: 0.75rem;
      color: #6b7280;
      margin: 0.125rem 0 0 0;
    }

    .header-subtitle.dark {
      color: #9ca3af;
    }

    .card-media {
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
      background-color: #f3f4f6;
      display: block;
    }

    .card-media.dark {
      background-color: #4b5563;
    }

    .card-content {
      padding: 1rem;
    }

    .card-content.small {
      padding: 0.75rem;
    }

    .content-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
    }

    .content-title.small {
      font-size: 1rem;
    }

    .content-title.large {
      font-size: 1.25rem;
    }

    .content-title.dark {
      color: #f9fafb;
    }

    .content-description {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 0.75rem 0;
      line-height: 1.5;
    }

    .content-description.dark {
      color: #d1d5db;
    }

    .content-features {
      list-style: none;
      padding: 0;
      margin: 0 0 0.75rem 0;
    }

    .content-feature {
      font-size: 0.8125rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
      padding-left: 1rem;
      position: relative;
    }

    .content-feature::before {
      content: '•';
      color: #059669;
      font-weight: bold;
      position: absolute;
      left: 0;
    }

    .content-feature.dark {
      color: #d1d5db;
    }

    .content-pricing {
      font-size: 1.25rem;
      font-weight: 700;
      color: #059669;
      margin: 0.75rem 0;
    }

    .content-pricing.small {
      font-size: 1.125rem;
    }

    .content-pricing.dark {
      color: #34d399;
    }

    .pricing-period {
      font-size: 0.75rem;
      font-weight: 500;
      color: #6b7280;
    }

    .pricing-period.dark {
      color: #9ca3af;
    }

    .card-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0 1rem 1rem;
    }

    .card-actions.small {
      padding: 0 0.75rem 0.75rem;
      gap: 0.375rem;
    }

    .card-action {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      background: none;
      width: 100%;
    }

    .card-action.small {
      padding: 0.625rem 0.75rem;
      font-size: 0.8125rem;
    }

    .card-action.reply {
      background-color: #f3f4f6;
      color: #374151;
      border-color: #d1d5db;
    }

    .card-action.reply:hover {
      background-color: #e5e7eb;
    }

    .card-action.reply.dark {
      background-color: #4b5563;
      color: #f9fafb;
      border-color: #6b7280;
    }

    .card-action.reply.dark:hover {
      background-color: #6b7280;
    }

    .card-action.action {
      background-color: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .card-action.action:hover {
      background-color: #2563eb;
      border-color: #2563eb;
    }

    .card-action.view {
      background-color: transparent;
      color: #3b82f6;
      border-color: #3b82f6;
    }

    .card-action.view:hover {
      background-color: #eff6ff;
    }

    .card-action.view.dark {
      color: #60a5fa;
      border-color: #60a5fa;
    }

    .card-action.view.dark:hover {
      background-color: #1e3a8a;
    }

    /* Android specific styles */
    :host(.android) .business-card {
      border-radius: 0.5rem;
    }

    :host(.android) .card-action {
      border-radius: 0.375rem;
    }

    :host(.android) .header-logo {
      border-radius: 0.25rem;
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

  private handleActionClick(action: any) {
    this.onAction?.(action, this.card)
  }

  private renderHeader() {
    if (!this.card.header) return null

    return html`
      <div class="card-header ${this.size}">
        ${
          this.card.header.logo
            ? html`
          <img 
            class="header-logo ${this.size} ${this.isDarkMode ? 'dark' : ''}"
            src="${this.card.header.logo}"
            alt="${this.card.header.brandName} logo"
          />
        `
            : ''
        }
        <div class="header-content">
          ${
            this.card.header.eyebrow
              ? html`
            <p class="header-eyebrow ${this.isDarkMode ? 'dark' : ''}">${this.card.header.eyebrow}</p>
          `
              : ''
          }
          <h3 class="header-brand ${this.size} ${this.isDarkMode ? 'dark' : ''}">${this.card.header.brandName}</h3>
          ${
            this.card.header.subtitle
              ? html`
            <p class="header-subtitle ${this.isDarkMode ? 'dark' : ''}">${this.card.header.subtitle}</p>
          `
              : ''
          }
        </div>
      </div>
    `
  }

  private renderMedia() {
    if (!this.card.media?.imageUrl) return null

    return html`
      <img
        class="card-media ${this.isDarkMode ? 'dark' : ''}"
        src="${this.card.media.imageUrl}"
        alt="${this.card.media.altText || this.card.content.title}"
        loading="lazy"
      />
    `
  }

  private renderContent() {
    return html`
      <div class="card-content ${this.size}">
        <h2 class="content-title ${this.size} ${this.isDarkMode ? 'dark' : ''}">${this.card.content.title}</h2>
        
        ${
          this.card.content.description
            ? html`
          <p class="content-description ${this.isDarkMode ? 'dark' : ''}">${this.card.content.description}</p>
        `
            : ''
        }

        ${
          this.card.content.features?.length
            ? html`
          <ul class="content-features">
            ${this.card.content.features.map(
              (feature) =>
                html`
              <li class="content-feature ${this.isDarkMode ? 'dark' : ''}">${feature}</li>
            `
            )}
          </ul>
        `
            : ''
        }

        ${
          this.card.content.pricing
            ? html`
          <div class="content-pricing ${this.size} ${this.isDarkMode ? 'dark' : ''}">
            ${this.card.content.pricing.currency || '$'}${this.card.content.pricing.amount}
            ${
              this.card.content.pricing.period
                ? html`
              <span class="pricing-period ${this.isDarkMode ? 'dark' : ''}">${this.card.content.pricing.period}</span>
            `
                : ''
            }
          </div>
        `
            : ''
        }
      </div>
    `
  }

  private renderActions() {
    if (!this.card.actions?.length) return null

    return html`
      <div class="card-actions ${this.size}">
        ${this.card.actions.map(
          (action) =>
            html`
          <button
            class="card-action ${this.size} ${action.type} ${this.isDarkMode ? 'dark' : ''}"
            @click=${() => this.handleActionClick(action)}
          >
            ${action.text}
          </button>
        `
        )}
      </div>
    `
  }

  render() {
    if (!this.card) return null

    const cardClass = `business-card ${this.size} ${this.isDarkMode ? 'dark' : ''}`

    return html`
      <div class="${cardClass}">
        ${this.renderHeader()}
        ${this.renderMedia()}
        ${this.renderContent()}
        ${this.renderActions()}
      </div>
    `
  }
}
