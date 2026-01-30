import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { AgentInfo, Thread } from '../../types/index.js'
import '../chat/chat.js'
import '../bottom-bar/bottom-bar.js'

const scale = 1
const resolutions = {
  // iPhone 16: 460 PPI
  iOS: {
    portrait: { width: 393 * scale, height: 852 * scale },
    landscape: { width: 852 * scale, height: 393 * scale },
  },
  // Pixel 9: 422 PPI | 20:9 aspect ratio. 1080 W x 2424 H
  android: {
    // HACK: Force dimensions to be the same on iOS and Android
    portrait: { width: 393 * scale, height: 852 * scale },
    landscape: { width: 852 * scale, height: 393 * scale },
  },
}

@customElement('rbx-device')
export class Device extends LitElement {
  @property({ type: Object })
  agent!: AgentInfo

  @property({ type: Boolean })
  isPortrait = true

  @property({ type: Boolean })
  isDarkMode = false

  @property({ type: Boolean })
  isAndroid = true

  @property({ type: Array })
  thread: Thread = []

  @property()
  onSendMessage?: (payload: any) => void

  @state()
  private isAnimatingRotation = false

  static styles = css`
    :host {
      display: block;
    }

    .device-container {
      transition: all 0.3s ease-in-out;
      background-color: black;
      padding: 0.5rem;
      transform-origin: center;
    }

    .device-container.animating {
      opacity: 0;
    }

    .screen {
      position: relative;
      width: 100%;
      height: 100%;
      transition: colors 0.3s ease;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .screen.ios {
      font-family: var(--font-family-sf-pro-display);
    }
    
    .screen.android {
      font-family: 'Roboto', 'Segoe UI', system-ui, sans-serif;
    }

    .screen.dark {
      background-color: #030712;
      color: #f3f4f6;
    }

    .screen.light {
      background-color: white;
      color: #111827;
    }

    .screen.android {
      border-radius: 8px;
      font-family: 'Roboto', 'Segoe UI', system-ui, sans-serif;
    }

    .screen.ios {
      border-radius: 16px;
      font-family: var(--font-family-sf-pro-display);
    }

    .device-container.android {
      border-radius: 16px;
    }

    .device-container.ios {
      border-radius: 24px;
    }

    .header {
      padding: 0.75rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header.dark {
      background-color: #27272a;
      color: #e5e7eb;
    }

    .header.light {
      background-color: #f3f4f6;
      color: #1f2937;
    }

    .header-left {
      display: flex;
      align-items: center;
    }

    .header-agent {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-left: 1rem;
    }

    .agent-avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      background-color: #d1d5db;
    }

    .agent-avatar img {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
    }

    .agent-name {
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }


    .home-indicator {
      position: absolute;
      bottom: 0.25rem;
      left: 50%;
      transform: translateX(-50%);
      width: 8rem;
      height: 0.25rem;
      background-color: #9ca3af;
      border-radius: 9999px;
      opacity: 0.6;
    }
  `

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('isPortrait')) {
      this.isAnimatingRotation = true
      setTimeout(() => {
        this.isAnimatingRotation = false
      }, 300)
    }
  }

  private getDimensions() {
    return this.isAndroid
      ? resolutions.android[this.isPortrait ? 'portrait' : 'landscape']
      : resolutions.iOS[this.isPortrait ? 'portrait' : 'landscape']
  }

  private renderArrowLeftIcon() {
    return html`
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    `
  }

  private renderShieldCheckIcon() {
    return html`
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    `
  }

  private renderEllipsisIcon() {
    return html`
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    `
  }

  render() {
    const dimensions = this.getDimensions()
    const deviceClass = `device-container ${this.isAndroid ? 'android' : 'ios'} ${
      this.isAnimatingRotation ? 'animating' : ''
    }`
    const screenClass = `screen ${this.isDarkMode ? 'dark' : 'light'} ${this.isAndroid ? 'android' : 'ios'}`
    const headerClass = `header ${this.isDarkMode ? 'dark' : 'light'}`

    return html`
      <div
        class="${deviceClass}"
        style="width: ${dimensions.width}px; height: ${dimensions.height}px;"
      >
        <div class="${screenClass}">
          <!-- Header -->
          <div class="${headerClass}">
            <div class="header-left">
              ${this.renderArrowLeftIcon()}
              <div class="header-agent">
                <div class="agent-avatar">
                  <img
                    src="${this.agent.iconUrl}"
                    alt="${this.agent.brandName}"
                  />
                </div>
                <p class="agent-name">${this.agent.brandName}</p>
              </div>
            </div>
            <div class="header-right">
              ${this.renderShieldCheckIcon()}
              ${this.renderEllipsisIcon()}
            </div>
          </div>

          <!-- Chat Area -->
          <rbx-chat
            .thread=${this.thread}
            .isAndroid=${this.isAndroid}
            .isDarkMode=${this.isDarkMode}
            .isPortrait=${this.isPortrait}
            .onSendMessage=${this.onSendMessage}
          ></rbx-chat>

          <!-- Bottom Bar -->
          <rbx-bottom-bar
            .isAndroid=${this.isAndroid}
            .isDarkMode=${this.isDarkMode}
            .isPortrait=${this.isPortrait}
            .onSendMessage=${this.onSendMessage}
          ></rbx-bottom-bar>

          <!-- Home Indicator (iOS only, portrait mode) -->
          ${!this.isAndroid && this.isPortrait ? html`<div class="home-indicator"></div>` : ''}
        </div>
      </div>
    `
  }
}
