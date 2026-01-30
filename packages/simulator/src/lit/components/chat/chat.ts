import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { Thread, ThreadEntry } from '../../types/index.js'
import '../messages/text-message.js'
import '../messages/user-text-message.js'
import '../messages/standalone-card.js'

@customElement('rbx-chat')
export class Chat extends LitElement {
  @property({ type: Array })
  thread: Thread = []

  @property({ type: Boolean })
  isAndroid = true

  @property({ type: Boolean })
  isDarkMode = false

  @property({ type: Boolean })
  isPortrait = true

  @property()
  onSendMessage?: (payload: any) => void

  @state()
  private messagesContainerRef?: HTMLDivElement

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

    .chat-container {
      padding-bottom: 2rem;
      height: calc(100% - 8rem);
      position: relative;
      overflow-x: hidden;
      overflow-y: auto;
      scroll-behavior: smooth;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .chat-container.android {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      font-size: inherit;
    }

    .chat-container.ios {
      padding-left: 1rem;
      padding-right: 1rem;
      font-size: 1rem;
    }

    .message-wrapper {
      display: flex;
      flex-direction: column;
    }
  `

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('thread') && this.messagesContainerRef) {
      // Scroll to bottom when new messages are added
      setTimeout(() => {
        if (this.messagesContainerRef) {
          this.messagesContainerRef.scrollTop = this.messagesContainerRef.scrollHeight
        }
      }, 10)
    }
    if (changedProperties.has('isAndroid')) {
      this.updateHostClasses()
    }
  }

  private getReversedThread(): ThreadEntry[] {
    return [...this.thread].reverse()
  }

  private hasAgentMessage(message: ThreadEntry): boolean {
    return 'agentMessage' in message
  }

  private hasUserMessage(message: ThreadEntry): boolean {
    return 'userMessage' in message
  }

  private getNextMessage(index: number, messages: ThreadEntry[]): ThreadEntry | undefined {
    return messages[index + 1]
  }

  private getPreviousMessage(index: number, messages: ThreadEntry[]): ThreadEntry | undefined {
    return messages[index - 1]
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
    const messages = this.getReversedThread()
    const containerClass = `chat-container ${this.isAndroid ? 'android' : 'ios'}`

    return html`
      <div
        class="${containerClass}"
        ${(el: HTMLDivElement) => {
          this.messagesContainerRef = el
        }}
      >
        ${messages.map((message, index) => {
          const nextMessage = this.getNextMessage(index, messages)
          const previousMessage = this.getPreviousMessage(index, messages)

          return html`
            <div class="message-wrapper">
              ${
                this.hasAgentMessage(message)
                  ? html`
                <rbx-standalone-card
                  .message=${message}
                  .nextMessage=${nextMessage}
                  .isAndroid=${this.isAndroid}
                  .isDarkMode=${this.isDarkMode}
                  .isPortrait=${this.isPortrait}
                  .onSendMessage=${this.onSendMessage}
                ></rbx-standalone-card>

                <rbx-text-message
                  .message=${message}
                  .nextMessage=${nextMessage}
                  .previousMessage=${previousMessage}
                  .isAndroid=${this.isAndroid}
                  .isDarkMode=${this.isDarkMode}
                  .isPortrait=${this.isPortrait}
                  .onSendMessage=${this.onSendMessage}
                ></rbx-text-message>
              `
                  : ''
              }

              ${
                this.hasUserMessage(message)
                  ? html`
                <rbx-user-text-message
                  .message=${message}
                  .nextMessage=${nextMessage}
                  .previousMessage=${previousMessage}
                  .isAndroid=${this.isAndroid}
                  .isDarkMode=${this.isDarkMode}
                ></rbx-user-text-message>
              `
                  : ''
              }
            </div>
          `
        })}
      </div>
    `
  }
}
