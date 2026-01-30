import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Suggestion, ThreadEntry } from '../../types/index.js'
import './suggestions.js'

@customElement('rbx-text-message')
export class TextMessage extends LitElement {
  @property({ type: Object })
  message!: ThreadEntry

  @property({ type: Object })
  nextMessage?: ThreadEntry

  @property({ type: Object })
  previousMessage?: ThreadEntry

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

    .text-container {
      display: flex;
      flex-direction: column;
    }

    .text-bubble {
      padding: 0.5rem 1rem;
      border-radius: 1.5rem;
      max-width: 20.625rem;
      display: inline-block;
    }

    .text-bubble.light {
      background-color: #f3f4f6;
      color: #374151;
    }

    .text-bubble.dark {
      background-color: #27272a;
      color: white;
    }

    .text-bubble.grouped-top {
      border-radius: 0.25rem 0.25rem 0.25rem 1.5rem;
      margin-top: -0.25rem;
    }

    .text-bubble.grouped-bottom {
      border-radius: 1.5rem 0.25rem 0.25rem 1.5rem;
    }

    .text-bubble.grouped-middle {
      border-radius: 0.25rem 0.25rem 0.25rem 1.5rem;
    }

    .otp-container {
      border: 1px solid #9ca3af;
      padding: 0.5rem 1rem;
      border-radius: 1.5rem;
      align-items: center;
      gap: 0.5rem;
      justify-content: flex-end;
      display: inline-flex;
      float: right;
      cursor: pointer;
    }

    .otp-container.dark {
      border-color: #27272a;
      background-color: #27272a;
      color: white;
    }

    .otp-container.light {
      background-color: white;
      color: #374151;
    }

    .copy-icon {
      width: 1rem;
      height: 1rem;
    }

    p {
      margin: 0;
      line-height: 1.4;
    }
  `

  private hasText(): boolean {
    if (!this.message || !('agentMessage' in this.message)) return false

    const contentMessage = this.message.agentMessage.contentMessage
    return contentMessage && 'text' in contentMessage
  }

  private getText(): string {
    if (!this.hasText() || !('agentMessage' in this.message)) return ''

    const contentMessage = this.message.agentMessage.contentMessage
    return (contentMessage as any).text || ''
  }

  private getSuggestions(): Suggestion[] {
    if (!this.hasText() || !('agentMessage' in this.message)) return []

    const contentMessage = this.message.agentMessage.contentMessage
    return (contentMessage as any).suggestions || []
  }

  private isOTP(): boolean {
    if (!('agentMessage' in this.message)) return false
    return this.message.agentMessage.messageTrafficType === 'AUTHENTICATION'
  }

  private getOTPCode(): string {
    const text = this.getText()
    const parts = text.split(' ')
    return parts[parts.length - 2] || ''
  }

  private getBubbleClasses(): string {
    let classes = `text-bubble ${this.isDarkMode ? 'dark' : 'light'}`

    const hasTextPrev = this.previousMessage && this.hasMessageText(this.previousMessage)
    const hasTextNext = this.nextMessage && this.hasMessageText(this.nextMessage)

    if (hasTextPrev && hasTextNext) {
      classes += ' grouped-middle'
    } else if (hasTextPrev) {
      classes += ' grouped-top'
    } else if (hasTextNext) {
      classes += ' grouped-bottom'
    }

    return classes
  }

  private hasMessageText(message: ThreadEntry): boolean {
    if (!message || !('agentMessage' in message)) return false
    const contentMessage = message.agentMessage.contentMessage
    return contentMessage && 'text' in contentMessage
  }

  private renderCopyIcon() {
    return html`
      <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
      </svg>
    `
  }

  private handleCopyOTP() {
    const code = this.getOTPCode()
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code)
    }
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
    if (!this.hasText()) return null

    const text = this.getText()
    const suggestions = this.getSuggestions()

    if (this.isOTP()) {
      const code = this.getOTPCode()
      return html`
        <div class="text-container">
          <div 
            class="otp-container ${this.isDarkMode ? 'dark' : 'light'}"
            @click=${this.handleCopyOTP}
          >
            ${this.renderCopyIcon()}
            Copy "${code}"
          </div>
        </div>
      `
    }

    return html`
      <div class="text-container">
        <div class="${this.getBubbleClasses()}">
          <p>${text}</p>
        </div>

        ${
          !this.isAndroid || (this.isAndroid && !this.nextMessage)
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
