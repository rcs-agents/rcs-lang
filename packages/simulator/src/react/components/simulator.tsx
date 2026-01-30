import React, { useCallback } from 'react'
import type { Agent } from '@rcs-lang/csm'
import type { RCXBundle } from '@rcs-lang/rcx'
import type { AgentContentMessage, DisplaySettings, ExtractedMessage, Thread, UserInput } from '../../core/types.js'
import { useSimulator, type UseSimulatorProps } from '../use-simulator.js'
import { Device } from './device/device.js'
import { SimulatorControls } from './simulator-controls.js'
import { PreviewControls } from './PreviewControls.js'

export interface SimulatorProps {
  /** RCX bundle (preferred - includes CSM and messages) */
  bundle?: RCXBundle
  /** CSM agent definition for interactive mode */
  csm?: Agent
  /** Messages collection to pair with CSM */
  messages?: Record<string, AgentContentMessage>
  /** Extracted messages for preview mode */
  previewMessages?: ExtractedMessage[]
  /** Static thread data for display-only mode */
  thread?: Thread
  /** Agent display name (overrides CSM/bundle name) */
  agentName?: string
  /** Agent icon URL */
  agentIconUrl?: string
  /** Whether the simulator is visible */
  isVisible?: boolean
  /** Whether to show the control buttons (orientation, theme, platform) */
  showControls?: boolean
  /** Initial display settings */
  initialDisplaySettings?: Partial<DisplaySettings>
  /** Callback when user sends a message or taps a suggestion */
  onUserInteraction?: (input: UserInput) => void
}

/**
 * Unified RCS Simulator component.
 *
 * Supports three modes:
 * - **Interactive**: Pass a `bundle` or `csm` prop to enable live conversation with CSM agent
 * - **Preview**: Pass `previewMessages` to step through extracted messages from RCL source
 * - **Static**: Pass a `thread` prop to display a pre-recorded conversation
 *
 * @example Interactive mode with RCX bundle
 * ```tsx
 * <Simulator
 *   bundle={rcxBundle}
 *   agentName="Coffee Bot"
 *   onUserInteraction={(input) => console.log(input)}
 * />
 * ```
 *
 * @example Interactive mode with CSM
 * ```tsx
 * <Simulator
 *   csm={compiledCsmAgent}
 *   messages={messagesMap}
 *   agentName="Coffee Bot"
 *   onUserInteraction={(input) => console.log(input)}
 * />
 * ```
 *
 * @example Preview mode
 * ```tsx
 * <Simulator
 *   previewMessages={extractedMessages}
 *   agentName="Preview Agent"
 * />
 * ```
 *
 * @example Static mode
 * ```tsx
 * <Simulator
 *   thread={conversationHistory}
 *   agentName="Demo Agent"
 * />
 * ```
 */
export const Simulator: React.FC<SimulatorProps> = ({
  bundle,
  csm,
  messages,
  previewMessages,
  thread,
  agentName,
  agentIconUrl = '/rbx-logo.svg',
  isVisible = true,
  showControls = true,
  initialDisplaySettings,
  onUserInteraction,
}) => {
  const api = useSimulator({
    bundle,
    csm,
    messages,
    previewMessages,
    thread,
    agentName,
    agentIconUrl,
    initialDisplaySettings,
    onUserInteraction,
  })

  const handleSendMessage = useCallback(
    (input: unknown) => {
      let text = ''
      let postbackData = ''

      if (typeof input === 'string') {
        text = input
      } else if (input && typeof input === 'object') {
        const obj = input as Record<string, any>
        if (obj.reply) {
          text = obj.reply.text || ''
          postbackData = obj.reply.postbackData || ''
        } else if (obj.action) {
          text = obj.action.text || ''
          postbackData = obj.action.postbackData || ''
        }
      }

      api.sendMessage({ text, postbackData })
    },
    [api]
  )

  if (!isVisible) return null

  // Show loading state in interactive mode
  if (api.mode === 'interactive' && !api.isReady) {
    return (
      <div className="simulator" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Loading simulator...</p>
          {api.error && (
            <p style={{ color: 'red', fontSize: '14px' }}>
              Error: {api.error.message}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="simulator" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {showControls && (
        <SimulatorControls
          displaySettings={api.displaySettings}
          onToggleOrientation={api.toggleOrientation}
          onToggleTheme={api.toggleTheme}
          onTogglePlatform={api.togglePlatform}
        />
      )}

      {api.mode === 'preview' && (
        <PreviewControls
          currentIndex={api.previewIndex}
          totalMessages={api.previewTotal}
          onPrevious={api.previewPrevious}
          onNext={api.previewNext}
        />
      )}

      <Device
        thread={api.thread}
        onSendMessage={handleSendMessage}
        isPortrait={api.displaySettings.isPortrait}
        isDarkMode={api.displaySettings.isDarkMode}
        isAndroid={api.displaySettings.isAndroid}
        agent={api.agent}
      />
    </div>
  )
}
