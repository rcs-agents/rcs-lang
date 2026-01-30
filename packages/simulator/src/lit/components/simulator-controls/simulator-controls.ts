import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export interface ControlsConfig {
  showLabels?: boolean
  showIcons?: boolean
  orientation?: 'vertical' | 'horizontal'
  togglePosition?: 'left' | 'right' | 'middle'
}

@customElement('rbx-simulator-controls')
export class SimulatorControls extends LitElement {
  @property({ type: Boolean })
  isPortrait = true

  @property({ type: Boolean })
  isLightMode = true

  @property({ type: Boolean })
  isAndroid = true

  @property({ type: Boolean })
  showLabels = true

  @property({ type: Boolean })
  showIcons = true

  @property({ type: String })
  orientation: 'vertical' | 'horizontal' = 'horizontal'

  @property({ type: String })
  togglePosition: 'left' | 'right' | 'middle' = 'right'

  @property({ type: Boolean })
  fixedWidthLabels = false

  @property()
  onOrientationChange?: (isPortrait: boolean) => void

  @property()
  onThemeChange?: (isLightMode: boolean) => void

  @property()
  onPlatformChange?: (isAndroid: boolean) => void

  static styles = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .controls-container {
      display: flex;
      gap: 1rem;
      padding: 0.75rem;
      background-color: rgba(255, 255, 255, 0.95);
      border-radius: 0.75rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
    }

    .controls-container.vertical {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .controls-container.vertical .control-group.toggle-left {
      align-self: flex-end;
    }
    
    .controls-container.vertical.middle-position {
      align-items: center;
    }

    .controls-container.horizontal {
      flex-direction: row;
      align-items: center;
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .control-group.toggle-left {
      flex-direction: row;
    }

    .control-group.toggle-right {
      flex-direction: row-reverse;
    }

    .control-group.toggle-middle {
      flex-direction: row;
    }

    .control-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      user-select: none;
    }

    .control-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: #6b7280;
    }

    .label-icon-wrapper {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    /* Toggle Switch Styles */
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 3rem;
      height: 1.75rem;
      flex-shrink: 0;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #d1d5db;
      transition: background-color 0.2s;
      border-radius: 1.75rem;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 1.25rem;
      width: 1.25rem;
      left: 0.25rem;
      bottom: 0.25rem;
      background-color: white;
      transition: transform 0.2s;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    input:checked + .toggle-slider:before {
      transform: translateX(1.25rem);
    }

    /* Keep toggle neutral color - it's A/B not on/off */
    input:checked + .toggle-slider {
      background-color: #9ca3af;
    }

    /* Middle position specific styles */
    .control-group.toggle-middle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .middle-label-left,
    .middle-label-right {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: #6b7280;
    }
    
    .fixed-width-labels .middle-label-left {
      width: 67px;
      justify-content: flex-start;
      flex-direction: row-reverse;
    }
    
    .fixed-width-labels .middle-label-right {
      width: 86px;
      justify-content: flex-start;
    }

    .middle-label-left {
      opacity: 1;
      transition: opacity 0.2s;
    }

    .middle-label-right {
      opacity: 0.5;
      transition: opacity 0.2s;
    }

    .control-group.toggle-middle:has(input:checked) .middle-label-left {
      opacity: 0.5;
    }
    
    .control-group.toggle-middle:has(input:checked) .middle-label-right {
      opacity: 1;
    }
  `

  private handleOrientationToggle() {
    this.isPortrait = !this.isPortrait
    this.onOrientationChange?.(this.isPortrait)
  }

  private handleThemeToggle() {
    this.isLightMode = !this.isLightMode
    this.onThemeChange?.(this.isLightMode)
  }

  private handlePlatformToggle() {
    this.isAndroid = !this.isAndroid
    this.onPlatformChange?.(this.isAndroid)
  }

  private renderIcon(type: 'portrait' | 'landscape' | 'light' | 'dark' | 'ios' | 'android') {
    if (!this.showIcons) return null

    const icons = {
      portrait: html`
        <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        </svg>
      `,
      landscape: html`
        <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/>
        </svg>
      `,
      light: html`
        <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
      `,
      dark: html`
        <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      `,
      ios: html`
        <svg class="control-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
        </svg>
      `,
      android: html`
        <svg class="control-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.6 9.48L19.44 3.3C19.5 3.12 19.39 2.94 19.21 2.88C19.03 2.82 18.85 2.93 18.79 3.11L16.92 9.34C15.37 8.66 13.59 8.25 11.67 8.25C9.75 8.25 7.97 8.66 6.42 9.34L4.55 3.11C4.49 2.93 4.31 2.82 4.13 2.88C3.95 2.94 3.84 3.12 3.9 3.3L5.74 9.48C2.34 11.35 0 14.62 0 18.35H23.34C23.34 14.62 21 11.35 17.6 9.48ZM6.67 14.62C6 14.62 5.46 14.08 5.46 13.41C5.46 12.74 6 12.2 6.67 12.2C7.34 12.2 7.88 12.74 7.88 13.41C7.88 14.08 7.34 14.62 6.67 14.62ZM16.67 14.62C16 14.62 15.46 14.08 15.46 13.41C15.46 12.74 16 12.2 16.67 12.2C17.34 12.2 17.88 12.74 17.88 13.41C17.88 14.08 17.34 14.62 16.67 14.62Z"/>
        </svg>
      `,
    }

    return icons[type]
  }

  private renderToggleControl(
    label: string,
    checked: boolean,
    onChange: () => void,
    leftIcon: 'portrait' | 'landscape' | 'light' | 'dark' | 'ios' | 'android',
    rightIcon: 'portrait' | 'landscape' | 'light' | 'dark' | 'ios' | 'android',
    leftLabel?: string,
    rightLabel?: string
  ) {
    const showLabel = this.showLabels && this.togglePosition !== 'middle'
    const isMiddle = this.togglePosition === 'middle'

    return html`
      <div class="control-group toggle-${this.togglePosition}">
        ${
          showLabel
            ? html`
          <div class="label-icon-wrapper">
            ${this.renderIcon(checked ? rightIcon : leftIcon)}
            <span class="control-label">${label}</span>
          </div>
        `
            : ''
        }
        
        ${
          isMiddle
            ? html`
          <div class="middle-label-left">
            ${this.renderIcon(leftIcon)}
            ${this.showLabels ? html`<span>${leftLabel}</span>` : ''}
          </div>
        `
            : ''
        }
        
        <label class="toggle-switch">
          <input
            type="checkbox"
            .checked=${checked}
            @change=${onChange}
          />
          <span class="toggle-slider"></span>
        </label>

        ${
          isMiddle
            ? html`
          <div class="middle-label-right">
            ${this.renderIcon(rightIcon)}
            ${this.showLabels ? html`<span>${rightLabel}</span>` : ''}
          </div>
        `
            : ''
        }
      </div>
    `
  }

  render() {
    const isVerticalMiddle = this.orientation === 'vertical' && this.togglePosition === 'middle'
    const fixedWidthClass = this.fixedWidthLabels ? 'fixed-width-labels' : ''
    return html`
      <div class="controls-container ${this.orientation} ${
        isVerticalMiddle ? 'middle-position' : ''
      } ${fixedWidthClass}">
        ${this.renderToggleControl(
          'Orientation',
          !this.isPortrait,
          this.handleOrientationToggle.bind(this),
          'portrait',
          'landscape',
          'Portrait',
          'Landscape'
        )}
        
        ${this.renderToggleControl(
          'Theme',
          !this.isLightMode,
          this.handleThemeToggle.bind(this),
          'light',
          'dark',
          'Light',
          'Dark'
        )}
        
        ${this.renderToggleControl(
          'Platform',
          !this.isAndroid,
          this.handlePlatformToggle.bind(this),
          'android',
          'ios',
          'Android',
          'iOS'
        )}
      </div>
    `
  }
}
