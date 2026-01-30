import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { CardContent as CardContentType } from '../../types/index.js'
import './suggestions.js'

@customElement('rbx-card-content')
export class CardContent extends LitElement {
  @property({ type: Object })
  cardContent!: CardContentType

  @property({ type: Boolean })
  isAndroid = true

  @property({ type: Boolean })
  isDarkMode = false

  @property({ type: Boolean })
  isPortrait = true

  @property()
  onSendMessage?: (payload: any) => void

  static styles = css`
    :host {
      display: block;
    }
    
    :host(.ios) {
      font-family: var(--font-family-sf-pro-display, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    }
    
    :host(.android) {
      font-family: 'Roboto', 'Segoe UI', system-ui, sans-serif;
    }

    .card-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .media-section {
      background-color: #e5e7eb;
      border-radius: 0.5rem 0.5rem 0 0;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .media-section.short {
      height: 8rem;
    }

    .media-section.medium {
      height: 11rem;
    }

    .media-section.tall {
      height: 15rem;
    }

    .media-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .media-placeholder {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .content-section {
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .text-content {
      flex-grow: 1;
      margin-bottom: 0.5rem;
    }

    .title {
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }

    .title.light {
      color: #1f2937;
    }

    .title.dark {
      color: white;
    }

    .description {
      font-size: 0.875rem;
      margin: 0;
      margin-top: 0.25rem;
    }

    .description.light {
      color: #6b7280;
    }

    .description.dark {
      color: white;
    }
  `

  private getMediaHeight(): string {
    switch (this.cardContent.media?.height) {
      case 'SHORT':
        return 'short'
      case 'MEDIUM':
        return 'medium'
      case 'TALL':
        return 'tall'
      default:
        return 'short'
    }
  }

  private hasMedia(): boolean {
    return !!this.cardContent.media?.height
  }

  private getMediaUrl(): string {
    return this.cardContent.media?.contentInfo?.fileUrl || ''
  }

  private getAltText(): string {
    return this.cardContent.media?.contentInfo?.altText || 'Media'
  }

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

  render() {
    const mediaHeight = this.getMediaHeight()
    const titleClass = `title ${this.isDarkMode ? 'dark' : 'light'}`
    const descriptionClass = `description ${this.isDarkMode ? 'dark' : 'light'}`

    return html`
      <div class="card-container">
        ${
          this.hasMedia()
            ? html`
          <div class="media-section ${mediaHeight}">
            ${
              this.getMediaUrl()
                ? html`
              <img
                class="media-image"
                src="${this.getMediaUrl()}"
                alt="${this.getAltText()}"
              />
            `
                : html`
              <div class="media-placeholder">Media Content</div>
            `
            }
          </div>
        `
            : ''
        }

        <div class="content-section">
          <div class="text-content">
            ${
              this.cardContent.title
                ? html`
              <p class="${titleClass}">${this.cardContent.title}</p>
            `
                : ''
            }
            
            ${
              this.cardContent.description
                ? html`
              <p class="${descriptionClass}">${this.cardContent.description}</p>
            `
                : ''
            }
          </div>

          <rbx-suggestions
            .suggestions=${this.cardContent.suggestions || []}
            .isAndroid=${this.isAndroid}
            .isDarkMode=${this.isDarkMode}
            .isPortrait=${this.isPortrait}
            .onSendMessage=${this.onSendMessage}
            .isOuter=${false}
          ></rbx-suggestions>
        </div>
      </div>
    `
  }
}
