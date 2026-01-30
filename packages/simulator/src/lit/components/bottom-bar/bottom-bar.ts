import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('rbx-bottom-bar')
export class BottomBar extends LitElement {
  @property({ type: Boolean })
  isAndroid = true

  @property({ type: Boolean })
  isDarkMode = false

  @property({ type: Boolean })
  isPortrait = true

  @property()
  onSendMessage?: (text: string) => void

  @state()
  private isInputActive = false

  @state()
  private userMessage = ''

  @state()
  private textareaRef?: HTMLTextAreaElement

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

    .bottom-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.5rem 0.5rem 1rem 0.5rem;
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .bottom-bar.light {
      background-color: white;
      color: #6b7280;
    }

    .bottom-bar.dark {
      background-color: #030712;
      color: #9ca3af;
    }

    .bottom-bar.android {
      color: black;
    }

    .bottom-bar.android.dark {
      color: white;
    }

    .plus-button {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 0.5rem;
    }

    .plus-button.light {
      background-color: #e5e7eb;
    }

    .plus-button.dark {
      background-color: #27272a;
    }

    .input-container {
      flex-grow: 1;
      border-radius: 1.5rem;
      display: flex;
      cursor: pointer;
    }

    .input-container.android {
      border-radius: 1.5rem;
      align-items: flex-end;
      padding: 0.75rem;
    }

    .input-container.android.light {
      background-color: #f3f4f6;
      color: black;
    }

    .input-container.android.dark {
      background-color: #27272a;
      color: white;
    }

    .input-container.ios {
      border-radius: 2rem;
      justify-content: space-between;
      align-items: center;
      padding: 0.25rem 0.25rem 0.25rem 0.75rem;
      margin-right: 0.5rem;
      border: 1px solid #d1d5db;
    }

    .input-container.ios.dark {
      border-color: #27272a;
    }

    .circle-plus-icon {
      width: 1.5rem;
      height: 1.5rem;
      margin-right: 0.75rem;
      opacity: 0.7;
    }

    .input-area {
      flex-grow: 1;
      display: flex;
      align-items: center;
    }

    .textarea {
      width: 100%;
      border: 0;
      padding: 0;
      margin: 0;
      outline: none;
      background-color: transparent;
      color: inherit;
      resize: none;
      font-family: inherit;
      font-size: inherit;
    }

    .action-button {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-button.ios.active {
      color: white;
    }

    .action-button.ios.active.light {
      background-color: #22c55e;
    }

    .action-button.ios.active.dark {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .send-button {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .send-button.android.active {
      color: white;
    }

    .send-button.android.active.light {
      background-color: #1e40af;
    }

    .send-button.android.active.dark {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .send-button.android.inactive.light {
      background-color: #f3f4f6;
    }

    .send-button.android.inactive.dark {
      background-color: #27272a;
    }

    .icon {
      opacity: 0.7;
    }
  `

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('isInputActive') && this.isInputActive && this.textareaRef) {
      setTimeout(() => {
        this.textareaRef?.focus()
      }, 0)
    }
    if (changedProperties.has('isAndroid')) {
      this.updateHostClasses()
    }
  }

  private getPlaceholder(): string {
    return this.isAndroid ? 'RCS message' : 'Text Message • RCS'
  }

  private activateInput() {
    this.isInputActive = true
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement
    this.userMessage = target.value
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      this.sendMessage()
    }
    if (e.key === 'Escape') {
      this.isInputActive = false
    }
  }

  private sendMessage() {
    if (!this.userMessage.trim() || !this.onSendMessage) return

    this.onSendMessage(this.userMessage)
    this.userMessage = ''
    this.isInputActive = false
  }

  private renderPlusIcon() {
    return html`
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
      </svg>
    `
  }

  private renderCirclePlusIcon() {
    return html`
      <svg class="circle-plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 12h8"/>
        <path d="M12 8v8"/>
      </svg>
    `
  }

  private renderMicIcon() {
    return html`
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" x2="12" y1="19" y2="23"/>
        <line x1="8" x2="16" y1="23" y2="23"/>
      </svg>
    `
  }

  private renderArrowUpIcon() {
    return html`
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    `
  }

  private renderAudioLinesIcon() {
    return html`
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M2 10v3"/>
        <path d="M6 6v11"/>
        <path d="M10 3v18"/>
        <path d="M14 8v7"/>
        <path d="M18 5v13"/>
        <path d="M22 10v3"/>
      </svg>
    `
  }

  private renderSendHorizontalIcon() {
    return html`
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M7 11l12-2-12-2v4"/>
        <path d="M7 13l12 2-12 2v-4"/>
      </svg>
    `
  }

  connectedCallback() {
    super.connectedCallback()
    this.updateHostClasses()
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
    const bottomBarClass = `bottom-bar ${this.isDarkMode ? 'dark' : 'light'} ${this.isAndroid ? 'android' : 'ios'}`
    const plusButtonClass = `plus-button ${this.isDarkMode ? 'dark' : 'light'}`
    const inputContainerClass = `input-container ${this.isAndroid ? 'android' : 'ios'} ${
      this.isDarkMode ? 'dark' : 'light'
    }`
    const actionButtonClass = `action-button ios ${this.isInputActive ? 'active' : ''} ${
      this.isDarkMode ? 'dark' : 'light'
    }`
    const sendButtonClass = `send-button android ${this.isInputActive ? 'active' : 'inactive'} ${
      this.isDarkMode ? 'dark' : 'light'
    }`

    return html`
      <div class="${bottomBarClass}">
        ${
          !this.isAndroid
            ? html`
          <div class="${plusButtonClass}">
            ${this.renderPlusIcon()}
          </div>
        `
            : ''
        }

        <div class="${inputContainerClass}" @click=${this.activateInput}>
          ${this.isAndroid ? this.renderCirclePlusIcon() : ''}

          ${
            this.isInputActive
              ? html`
            <div class="input-area">
              <textarea
                class="textarea"
                .value=${this.userMessage}
                @input=${this.handleInput}
                @keydown=${this.handleKeyDown}
                placeholder="${this.getPlaceholder()}"
                ${(el: HTMLTextAreaElement) => {
                  this.textareaRef = el
                }}
              ></textarea>
            </div>
          `
              : html`
            <div>${this.getPlaceholder()}</div>
          `
          }

          ${
            !this.isAndroid
              ? html`
            <div class="${actionButtonClass}" @click=${this.isInputActive ? this.sendMessage : undefined}>
              ${this.isInputActive ? this.renderArrowUpIcon() : this.renderMicIcon()}
            </div>
          `
              : ''
          }
        </div>

        ${
          this.isAndroid
            ? html`
          <div class="${sendButtonClass}" @click=${this.isInputActive ? this.sendMessage : undefined}>
            ${this.isInputActive ? this.renderSendHorizontalIcon() : this.renderAudioLinesIcon()}
          </div>
        `
            : ''
        }
      </div>
    `
  }
}
