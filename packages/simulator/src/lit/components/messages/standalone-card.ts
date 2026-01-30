import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { ThreadEntry } from '../../types/index.js'
import './card-content.js'
import './suggestions.js'

@customElement('rbx-standalone-card')
export class StandaloneCard extends LitElement {
  @property({ type: Object })
  message!: ThreadEntry

  @property({ type: Object })
  nextMessage?: ThreadEntry

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
    }

    .card-wrapper {
      border-radius: 0.75rem;
      overflow: hidden;
    }

    .card-wrapper.light {
      background-color: #f3f4f6;
    }

    .card-wrapper.dark {
      background-color: #27272a;
    }
  `

  private hasRichCard(): boolean {
    if (!this.message || !('agentMessage' in this.message)) return false

    const contentMessage = this.message.agentMessage.contentMessage
    return contentMessage && 'richCard' in contentMessage
  }

  private hasStandaloneCard(): boolean {
    if (!this.hasRichCard() || !('agentMessage' in this.message)) return false

    const contentMessage = this.message.agentMessage.contentMessage
    if (!('richCard' in contentMessage)) return false

    return 'standaloneCard' in contentMessage.richCard
  }

  private getCardContent() {
    if (!this.hasStandaloneCard() || !('agentMessage' in this.message)) return null

    const contentMessage = this.message.agentMessage.contentMessage
    if (!('richCard' in contentMessage) || !('standaloneCard' in contentMessage.richCard)) return null

    return contentMessage.richCard.standaloneCard.cardContent
  }

  private getSuggestions() {
    if (!('agentMessage' in this.message)) return []

    const contentMessage = this.message.agentMessage.contentMessage
    return (contentMessage as any)?.suggestions || []
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
    if (!this.hasStandaloneCard()) return null

    const cardContent = this.getCardContent()
    if (!cardContent) return null

    const suggestions = this.getSuggestions()
    const wrapperClass = `card-wrapper ${this.isDarkMode ? 'dark' : 'light'}`

    return html`
      <div class="card-container">
        <div class="${wrapperClass}">
          <rbx-card-content
            .cardContent=${cardContent}
            .isAndroid=${this.isAndroid}
            .isDarkMode=${this.isDarkMode}
            .isPortrait=${this.isPortrait}
            .onSendMessage=${this.onSendMessage}
          ></rbx-card-content>
        </div>

        ${
          !this.nextMessage
            ? html`
          <rbx-suggestions
            .suggestions=${suggestions}
            .isAndroid=${this.isAndroid}
            .isDarkMode=${this.isDarkMode}
            .isPortrait=${this.isPortrait}
            .onSendMessage=${this.onSendMessage}
            .isOuter=${true}
          ></rbx-suggestions>
        `
            : ''
        }
      </div>
    `
  }
}
