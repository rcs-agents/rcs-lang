import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { AgentInfo, Thread, UserInput } from '../../types/index.js'
import { SimulatorEngine, type SimulatorEngineCallbacks } from '../../../core/simulator-engine.js'
import '../device/device.js'

@customElement('rbx-simulator-app')
export class SimulatorApp extends LitElement {
  @property({ type: Object })
  agent!: AgentInfo

  @property({ type: Array })
  initialThread: Thread = []

  @property()
  onSendMessage?: (payload: any) => void

  @state()
  private isOpen = true

  @state()
  private isPortrait = true

  @state()
  private isLightMode = true

  @state()
  private isAndroid = true

  @state()
  private thread: Thread = []

  static styles = css`
    :host {
      display: block;
    }

    .trigger-button {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      z-index: 50;
      border-radius: 50%;
      width: 3.5rem;
      height: 3.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      background-color: #2563eb;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      transition: box-shadow 0.3s ease;
      outline: none;
    }

    .trigger-button:hover {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .settings-panel {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      z-index: 50;
    }

    .card {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      transition: all 0.3s ease;
      background-color: white;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 1rem;
    }

    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
    }

    .close-button {
      height: 2rem;
      width: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      background-color: transparent;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s ease;
      color: #6b7280;
      outline: none;
    }

    .close-button:hover {
      background-color: #f3f4f6;
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .controls {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .control-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .control-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .control-icon {
      color: #6b7280;
      width: 1rem;
      height: 1rem;
      display: flex;
      align-items: center;
    }

    .control-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .switch {
      width: 2.75rem;
      height: 1.5rem;
      background-color: #d1d5db;
      border-radius: 0.75rem;
      position: relative;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .switch.checked {
      background-color: #3b82f6;
    }

    .switch::before {
      content: '';
      position: absolute;
      top: 0.125rem;
      left: 0.125rem;
      width: 1.25rem;
      height: 1.25rem;
      background-color: white;
      border-radius: 50%;
      transition: transform 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .switch.checked::before {
      transform: translateX(1.25rem);
    }
  `

  @property({ attribute: false })
  engine?: SimulatorEngine;

  private _engineCallbacks: SimulatorEngineCallbacks = {
    onThreadChange: (newThread) => {
      this.thread = newThread
    },
    onStateChange: () => {
      // Thread is already updated via onThreadChange
    },
  }

  connectedCallback() {
    super.connectedCallback()
    this.thread = [...this.initialThread]
    this._subscribeToEngine()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    // No unsubscribe needed - callbacks are replaced on engine
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('engine')) {
      this._subscribeToEngine()
    }
  }

  private _subscribeToEngine() {
    if (!this.engine) return

    // Set callbacks on the engine
    this.engine.setCallbacks(this._engineCallbacks)

    // Initial sync from engine state
    if (this.engine.isReady()) {
      this.thread = this.engine.getThread()
    }
  }

  private toggleModal() {
    this.isOpen = !this.isOpen
  }

  private toggleOrientation() {
    this.isPortrait = !this.isPortrait
  }

  private toggleTheme() {
    this.isLightMode = !this.isLightMode
  }

  private togglePlatform() {
    this.isAndroid = !this.isAndroid
  }

  private sendUserMessage = (input: any) => {
    let isAction = false
    let isReply = false

    if (typeof input === 'object' && 'reply' in input) {
      isReply = true
    }

    if (typeof input === 'object' && 'action' in input) {
      isAction = true
    }

    // If engine is present, delegate to it
    if (this.engine) {
      let text = '';
      let postback = '';

      if (isAction) {
        text = input.action.text;
        postback = input.action.postbackData;
      } else if (isReply) {
        text = input.reply.text;
        postback = input.reply.postbackData;
      } else {
        text = typeof input === 'string' ? input.trim() : '';
      }

      const userInput: UserInput = { text, postbackData: postback };
      this.engine.sendMessage(userInput);
      return;
    }

    // Legacy / standalone behavior
    // Create a new message object with the required base fields
    const baseUserMessage = {
      senderPhoneNumber: '+1234567890',
      messageId: Date.now().toString(),
      sendTime: new Date().toISOString(),
      agentId: 'user',
    }

    // Create the appropriate user message type based on the input
    let newMessage
    if (isAction) {
      newMessage = {
        userMessage: {
          ...baseUserMessage,
          suggestionResponse: {
            postbackData: input.postbackData || '',
            text: input.action.text,
            type: 'ACTION' as const,
          },
        },
      }
    } else if (isReply) {
      newMessage = {
        userMessage: {
          ...baseUserMessage,
          suggestionResponse: {
            postbackData: input.postbackData || '',
            text: input.reply.text,
            type: 'REPLY' as const,
          },
        },
      }
    } else {
      newMessage = {
        userMessage: {
          ...baseUserMessage,
          text: input.trim(),
        },
      }
    }

    if (this.onSendMessage) {
      this.onSendMessage(newMessage)
    }

    // Add the message to the beginning of the thread
    this.thread = [newMessage, ...this.thread]
  }

  private renderSmartphoneIcon() {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        style="height: 1.5rem; width: 1.5rem;"
      >
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </svg>
    `
  }

  private renderCloseIcon() {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 6 6 18" />
        <path d="M6 6 18 18" />
      </svg>
    `
  }

  private renderOrientationIcon() {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        ${
          this.isPortrait
            ? html`<rect width="16" height="20" x="4" y="2" rx="2" ry="2" />`
            : html`<rect width="20" height="16" x="2" y="4" rx="2" ry="2" />`
        }
      </svg>
    `
  }

  private renderThemeIcon() {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        ${
          this.isLightMode
            ? html`
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="M4.93 4.93l1.41 1.41" />
              <path d="M17.66 17.66l1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="M6.34 17.66l-1.41 1.41" />
              <path d="M19.07 4.93l-1.41 1.41" />
            `
            : html`
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            `
        }
      </svg>
    `
  }

  private renderPlatformIcon() {
    if (this.isAndroid) {
      // Google Android icon
      return html`
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4486.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4486.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1529-.5703.416.416 0 00-.5703.1529l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1938 1.0989L4.7839 5.4467a.416.416 0 00-.5703-.1529.416.416 0 00-.1529.5703l1.9973 3.4592C2.61 10.2718.8995 12.8447.8995 15.7995c0 .1873.0164.3695.0473.5476h22.106c.0309-.178.0473-.3603.0473-.5476-.0001-2.9548-1.7106-5.5277-5.1505-6.4581"/>
        </svg>
      `
    } else {
      // Apple icon
      return html`
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"/>
          <path d="M15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
        </svg>
      `
    }
  }

  render() {
    if (!this.isOpen) {
      return html`
        <button
          class="trigger-button"
          @click=${this.toggleModal}
          aria-label="Open mobile preview settings"
        >
          ${this.renderSmartphoneIcon()}
        </button>
      `
    }

    return html`
      <div class="settings-panel">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Mobile Preview</h2>
            <button
              class="close-button"
              @click=${this.toggleModal}
              aria-label="Close settings panel"
            >
              ${this.renderCloseIcon()}
            </button>
          </div>

          <div class="card-content">
            <div class="controls">
              <!-- Portrait/Landscape Toggle -->
              <div class="control-row">
                <div class="control-label">
                  <div class="control-icon">
                    ${this.renderOrientationIcon()}
                  </div>
                  <span class="control-text">
                    ${this.isPortrait ? 'Portrait' : 'Landscape'}
                  </span>
                </div>
                <div
                  class="switch ${!this.isPortrait ? 'checked' : ''}"
                  @click=${this.toggleOrientation}
                  role="switch"
                  aria-checked=${!this.isPortrait}
                  aria-label="Toggle orientation"
                ></div>
              </div>

              <!-- Light/Dark Mode Toggle -->
              <div class="control-row">
                <div class="control-label">
                  <div class="control-icon">
                    ${this.renderThemeIcon()}
                  </div>
                  <span class="control-text">
                    ${this.isLightMode ? 'Light' : 'Dark'} Mode
                  </span>
                </div>
                <div
                  class="switch ${!this.isLightMode ? 'checked' : ''}"
                  @click=${this.toggleTheme}
                  role="switch"
                  aria-checked=${!this.isLightMode}
                  aria-label="Toggle theme"
                ></div>
              </div>

              <!-- Android/iOS Toggle -->
              <div class="control-row">
                <div class="control-label">
                  <div class="control-icon">
                    ${this.renderPlatformIcon()}
                  </div>
                  <span class="control-text">
                    ${this.isAndroid ? 'Android' : 'iOS'}
                  </span>
                </div>
                <div
                  class="switch ${!this.isAndroid ? 'checked' : ''}"
                  @click=${this.togglePlatform}
                  role="switch"
                  aria-checked=${!this.isAndroid}
                  aria-label="Toggle platform"
                ></div>
              </div>
            </div>

            <rbx-device
              .agent=${this.agent}
              .isPortrait=${this.isPortrait}
              .isDarkMode=${!this.isLightMode}
              .isAndroid=${this.isAndroid}
              .thread=${this.thread}
              .onSendMessage=${this.sendUserMessage}
            ></rbx-device>
          </div>
        </div>
      </div>
    `
  }
}
