import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export interface CarouselCard {
  id: string
  title: string
  description?: string
  media?: {
    imageUrl?: string
    altText?: string
  }
  actions?: Array<{
    text: string
    postbackData: string
    type: 'reply' | 'action'
    openUrlAction?: { url: string }
    dialAction?: { phoneNumber: string }
  }>
}

@customElement('rbx-carousel')
export class Carousel extends LitElement {
  @property({ type: Array })
  cards: CarouselCard[] = []

  @property({ type: String })
  size: 'small' | 'medium' | 'large' = 'medium'

  @property({ type: Boolean })
  isAndroid = true

  @property({ type: Boolean })
  isDarkMode = false

  @property()
  onCardAction?: (action: any, card: CarouselCard) => void

  static styles = css`
    :host {
      display: block;
      font-family: var(--font-family-sf-pro-display, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    }

    :host(.android) {
      font-family: 'Roboto', 'Segoe UI', system-ui, sans-serif;
    }

    .carousel-container {
      display: flex;
      gap: 0.75rem;
      overflow-x: auto;
      padding: 0.25rem;
      scrollbar-width: none;
      -ms-overflow-style: none;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }

    .carousel-container::-webkit-scrollbar {
      display: none;
    }

    .carousel-card {
      flex-shrink: 0;
      border-radius: 0.75rem;
      overflow: hidden;
      background-color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }

    .carousel-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .carousel-card.dark {
      background-color: #374151;
      color: #f9fafb;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .carousel-card.dark:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    /* Card sizes */
    .carousel-card.small {
      width: 160px;
      min-height: 180px;
    }

    .carousel-card.medium {
      width: 240px;
      min-height: 280px;
    }

    .carousel-card.large {
      width: 320px;
      min-height: 360px;
    }

    .card-media {
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
      background-color: #f3f4f6;
    }

    .card-media.dark {
      background-color: #4b5563;
    }

    .card-content {
      padding: 0.875rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex-grow: 1;
    }

    .card-content.small {
      padding: 0.625rem;
      gap: 0.375rem;
    }

    .card-title {
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.25;
      margin: 0;
    }

    .card-title.medium {
      font-size: 1rem;
    }

    .card-title.large {
      font-size: 1.125rem;
    }

    .card-description {
      font-size: 0.75rem;
      line-height: 1.4;
      color: #6b7280;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-description.medium {
      font-size: 0.8125rem;
      -webkit-line-clamp: 3;
    }

    .card-description.large {
      font-size: 0.875rem;
      -webkit-line-clamp: 4;
    }

    .card-description.dark {
      color: #d1d5db;
    }

    .card-actions {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      margin-top: auto;
      padding-top: 0.5rem;
    }

    .card-action {
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      background: none;
      width: 100%;
    }

    .card-action.small {
      padding: 0.375rem 0.5rem;
      font-size: 0.6875rem;
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
      background-color: #dbeafe;
      color: #1d4ed8;
      border-color: #93c5fd;
    }

    .card-action.action:hover {
      background-color: #bfdbfe;
    }

    .card-action.action.dark {
      background-color: #1e3a8a;
      color: #bfdbfe;
      border-color: #3b82f6;
    }

    .card-action.action.dark:hover {
      background-color: #1e40af;
    }

    /* Android specific styles */
    :host(.android) .carousel-card {
      border-radius: 0.5rem;
    }

    :host(.android) .card-action {
      border-radius: 0.375rem;
      font-size: 0.6875rem;
    }

    :host(.android) .card-title {
      font-size: 0.8125rem;
    }

    :host(.android) .card-description {
      font-size: 0.6875rem;
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

  private handleActionClick(action: any, card: CarouselCard) {
    this.onCardAction?.(action, card)
  }

  private renderCardMedia(card: CarouselCard) {
    if (!card.media?.imageUrl) return null

    return html`
      <img
        class="card-media ${this.isDarkMode ? 'dark' : ''}"
        src="${card.media.imageUrl}"
        alt="${card.media.altText || card.title}"
        loading="lazy"
      />
    `
  }

  private renderCardActions(card: CarouselCard) {
    if (!card.actions?.length) return null

    return html`
      <div class="card-actions">
        ${card.actions.map((action) => {
          const actionClass = `card-action ${this.size} ${action.type} ${this.isDarkMode ? 'dark' : ''}`

          return html`
            <button
              class="${actionClass}"
              @click=${() => this.handleActionClick(action, card)}
            >
              ${action.text}
            </button>
          `
        })}
      </div>
    `
  }

  render() {
    if (this.cards.length === 0) return null

    return html`
      <div class="carousel-container">
        ${this.cards.map((card) => {
          const cardClass = `carousel-card ${this.size} ${this.isDarkMode ? 'dark' : ''}`

          return html`
            <div class="${cardClass}">
              ${this.renderCardMedia(card)}
              <div class="card-content ${this.size}">
                <h3 class="card-title ${this.size}">${card.title}</h3>
                ${
                  card.description
                    ? html`
                  <p class="card-description ${this.size} ${this.isDarkMode ? 'dark' : ''}">
                    ${card.description}
                  </p>
                `
                    : ''
                }
                ${this.renderCardActions(card)}
              </div>
            </div>
          `
        })}
      </div>
    `
  }
}
