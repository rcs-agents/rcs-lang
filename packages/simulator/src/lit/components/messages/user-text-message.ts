import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { ThreadEntry } from '../../types/index.js'

@customElement('rbx-user-text-message')
export class UserTextMessage extends LitElement {
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

  @property({ type: String })
  groupPosition: 'single' | 'first' | 'middle' | 'last' = 'single'

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

    .user-message {
      display: inline-flex;
      float: right;
      padding: 0.5rem 0.5rem 0.5rem 1rem;
      justify-content: flex-end;
      align-items: center;
      border-radius: 1.5rem 1.5rem 1.5rem 1.5rem;
      line-height: 1.25rem;
      max-width: 320px;
      margin-bottom: 0.5rem;
    }

    /* Single message or first in group */
    .user-message.first-or-single {
      border-radius: 1.5rem 1.5rem 0.375rem 1.5rem;
    }

    /* Middle message in group */
    .user-message.middle {
      border-radius: 1.5rem 0.375rem 0.375rem 1.5rem;
    }

    /* Last message in group */
    .user-message.last {
      border-radius: 1.5rem 0.375rem 1.5rem 1.5rem;
    }

    .user-message.android {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: #f9fafb;
      font-size: 0.875rem;
    }

    .user-message.ios {
      background-color: #e5e7eb;
      color: #000;
      border-radius: 1.5625rem 1.5625rem 1.5625rem 0.375rem;
      max-width: 255px;
      line-height: 1.5rem;
      word-wrap: break-word;
      padding: 0.625rem 1rem;
    }

    .user-message.ios.first-or-single,
    .user-message.ios.middle,
    .user-message.ios.last {
      border-radius: 1.5625rem 1.5625rem 1.5625rem 0.375rem;
    }

    .check-container {
      margin-left: 8px;
      border-radius: 50%;
      border: 1px solid #f9fafb;
      width: 18px;
      height: 18px;
      min-width: 18px;
      min-height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      flex-shrink: 0;
    }

    .check-icon {
      width: 10px;
      height: 10px;
      flex-shrink: 0;
    }

    .message-text {
      flex: 1;
    }
  `

  private hasText(): boolean {
    if (!this.message || !('userMessage' in this.message)) return false
    return 'text' in this.message.userMessage
  }

  private hasSuggestionResponse(): boolean {
    if (!this.message || !('userMessage' in this.message)) return false
    return 'suggestionResponse' in this.message.userMessage
  }

  private getText(): string {
    if (!('userMessage' in this.message)) return ''

    if (this.hasText()) {
      return (this.message.userMessage as any).text
    } else if (this.hasSuggestionResponse()) {
      return (this.message.userMessage as any).suggestionResponse.text
    }

    return ''
  }

  private renderCheckIcon() {
    return html`
      <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6 7 17l-5-5"/>
        <path d="m22 10-7.5 7.5L13 16"/>
      </svg>
    `
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
    if (!this.hasText() && !this.hasSuggestionResponse()) return null

    const text = this.getText()
    const platformClass = this.isAndroid ? 'android' : 'ios'

    // Determine group position class
    let groupClass = ''
    switch (this.groupPosition) {
      case 'single':
      case 'first':
        groupClass = 'first-or-single'
        break
      case 'middle':
        groupClass = 'middle'
        break
      case 'last':
        groupClass = 'last'
        break
    }

    return html`
      <div class="user-message ${platformClass} ${groupClass}">
        <div class="message-text">${text}</div>
        ${
          this.isAndroid
            ? html`
          <div class="check-container">
            ${this.renderCheckIcon()}
          </div>
        `
            : ''
        }
      </div>
    `
  }
}
