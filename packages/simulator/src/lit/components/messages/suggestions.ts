import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Suggestion } from '../../types/index.js'

@customElement('rbx-suggestions')
export class Suggestions extends LitElement {
  @property({ type: Array })
  suggestions: Suggestion[] = []

  @property({ type: Boolean })
  isAndroid = true

  @property({ type: Boolean })
  isDarkMode = false

  @property({ type: Boolean })
  isPortrait = true

  @property({ type: Boolean })
  isOuter = true

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

    .suggestions-android {
      margin-top: 0.75rem;
      margin-left: -0.5rem;
      margin-right: -0.5rem;
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      display: flex;
      align-items: stretch;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-behavior: smooth;
      gap: 0.5rem;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      list-style: none;
    }

    .suggestions-ios {
      background-color: #f3f4f6;
      color: #374151;
      border-radius: 1.5rem 0.25rem 1.5rem 1.5rem;
      padding-top: 0;
      padding-bottom: 0;
      margin-top: 0.5rem;
      list-style: none;
    }

    .suggestions-ios.dark {
      background-color: #27272a;
      color: white;
    }

    .suggestion-button-android {
      padding: 0.5rem 0.75rem;
      border-radius: 9999px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      border: 1px solid #d1d5db;
      background-color: white;
      color: black;
      white-space: nowrap;
    }

    .suggestion-button-android.dark {
      border-color: #27272a;
      background-color: #27272a;
      color: white;
    }

    .suggestion-button-android:hover {
      background-color: #f3f4f6;
    }

    .suggestion-button-android.dark:hover {
      background-color: #3f3f46;
    }

    .suggestion-button-ios {
      color: #3b82f6;
      background: none;
      border: none;
      cursor: pointer;
      width: 100%;
      text-align: left;
      padding: 0.625rem 1rem;
    }

    .suggestion-item-ios {
      border-bottom: 1px solid #d1d5db;
      margin-right: -1rem;
    }

    .suggestion-item-ios.dark {
      border-bottom-color: #27272a;
    }

    .suggestion-item-ios:last-child {
      border-bottom: none;
    }

    .suggestion-item-ios:first-child .suggestion-button-ios {
      padding-top: 0;
    }

    .suggestion-item-ios:last-child .suggestion-button-ios {
      padding-bottom: 0;
    }

    .inner-suggestions {
      margin-top: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 15px;
    }

    .inner-suggestion-button {
      width: 100%;
      padding: 0.375rem 0.25rem;
      height: 3.5rem;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .inner-suggestion-button.light {
      color: #374151;
      background-color: white;
    }

    .inner-suggestion-button.dark {
      color: white;
      background-color: #030712;
    }

    .action-content {
      display: flex;
      white-space: nowrap;
      align-items: center;
    }

    .action-icon-container {
      background-color: #f3f4f6;
      border-radius: 50%;
      padding: 0.5rem;
      margin-right: 1rem;
      margin-left: 0.5rem;
    }

    .action-icon-container.dark {
      background-color: #374151;
    }

    .action-icon {
      width: 1.5rem;
      height: 1.5rem;
    }

    .action-icon-small {
      width: 1rem;
      height: 1rem;
      margin-right: 0.25rem;
    }
  `

  private handleSuggestionClick(suggestion: Suggestion) {
    if (!this.onSendMessage) return

    this.onSendMessage({
      reply: 'reply' in suggestion ? suggestion.reply : undefined,
      action: 'action' in suggestion ? suggestion.action : undefined,
    })
  }

  private renderPhoneIcon(size = '1.5rem') {
    return html`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    `
  }

  private renderGlobeIcon(size = '1.5rem') {
    return html`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        <path d="M2 12h20"/>
      </svg>
    `
  }

  private renderMapPinIcon(size = '1.5rem') {
    return html`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    `
  }

  private renderCalendarIcon(size = '1.5rem') {
    return html`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 2v4"/>
        <path d="M16 2v4"/>
        <rect width="18" height="18" x="3" y="4" rx="2"/>
        <path d="M3 10h18"/>
        <path d="M10 16h4"/>
      </svg>
    `
  }

  private renderLocationIcon(size = '1.5rem') {
    return html`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    `
  }

  private renderActionIcon(action: any, size = '1.5rem') {
    if ('dialAction' in action && this.isAndroid) {
      return this.renderPhoneIcon(size)
    }
    if ('viewLocationAction' in action && this.isAndroid) {
      return this.renderMapPinIcon(size)
    }
    if ('createCalendarEventAction' in action && this.isAndroid) {
      return this.renderCalendarIcon(size)
    }
    if ('openUrlAction' in action && this.isAndroid) {
      return this.renderGlobeIcon(size)
    }
    if ('shareLocationAction' in action && this.isAndroid) {
      return this.renderLocationIcon(size)
    }
    return null
  }

  private renderAndroidSuggestions() {
    return html`
      <ul class="suggestions-android">
        ${this.suggestions.map(
          (suggestion) =>
            html`
          <li>
            <button
              class="suggestion-button-android ${this.isDarkMode ? 'dark' : ''}"
              @click=${() => this.handleSuggestionClick(suggestion)}
            >
              ${this.renderSuggestionContent(suggestion, false)}
            </button>
          </li>
        `
        )}
      </ul>
    `
  }

  private renderIOSSuggestions() {
    return html`
      <ul class="suggestions-ios ${this.isDarkMode ? 'dark' : ''}">
        ${this.suggestions.map(
          (suggestion) =>
            html`
          <li class="suggestion-item-ios ${this.isDarkMode ? 'dark' : ''}">
            <button
              class="suggestion-button-ios"
              @click=${() => this.handleSuggestionClick(suggestion)}
            >
              ${'reply' in suggestion ? suggestion.reply?.text : ''}
              ${'action' in suggestion ? suggestion.action?.text : ''}
            </button>
          </li>
        `
        )}
      </ul>
    `
  }

  private renderInnerSuggestions() {
    return html`
      <div class="inner-suggestions">
        ${this.suggestions.map((suggestion, idx) => {
          const isFirst = idx === 0
          const isLast = idx === this.suggestions.length - 1
          const isSingle = this.suggestions.length === 1

          let borderRadius = '0.125rem'
          if (isSingle) {
            borderRadius = '1rem'
          } else if (isFirst) {
            borderRadius = '1rem 1rem 0.125rem 0.125rem'
          } else if (isLast) {
            borderRadius = '0.125rem 0.125rem 1rem 1rem'
          }

          return html`
            <button
              class="inner-suggestion-button ${this.isDarkMode ? 'dark' : 'light'}"
              style="border-radius: ${borderRadius}"
              @click=${() => this.handleSuggestionClick(suggestion)}
            >
              ${this.renderSuggestionContent(suggestion, true)}
            </button>
          `
        })}
      </div>
    `
  }

  private renderSuggestionContent(suggestion: Suggestion, isVertical: boolean) {
    if ('reply' in suggestion) {
      return html`
        <div class="action-content">
          ${suggestion.reply?.text}
        </div>
      `
    }

    if ('action' in suggestion) {
      const iconSize = isVertical ? '1.5rem' : '1rem'
      const icon = this.renderActionIcon(suggestion.action, iconSize)

      return html`
        <div class="action-content">
          ${
            icon && isVertical
              ? html`
            <div class="action-icon-container ${this.isDarkMode ? 'dark' : ''}">
              ${icon}
            </div>
          `
              : ''
          }
          ${
            icon && !isVertical
              ? html`
            <span style="margin-right: 0.25rem;">${icon}</span>
          `
              : ''
          }
          ${suggestion.action?.text}
        </div>
      `
    }

    return null
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
    if (this.suggestions.length === 0) return null

    if (!this.isOuter) {
      return this.renderInnerSuggestions()
    }

    return this.isAndroid ? this.renderAndroidSuggestions() : this.renderIOSSuggestions()
  }
}
