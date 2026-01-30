/** @jsxImportSource react */

import { Copy } from 'lucide-react'
import { OuterSuggestions } from './suggestions/Suggestions'
import type { ThreadEntry } from '../../../core/types.js'

interface TextProps {
  message: ThreadEntry
  nextMessage: ThreadEntry
  previousMessage: ThreadEntry
  isAndroid: boolean
  isDarkMode: boolean
  isPortrait: boolean
  onSendMessage: (payload: any) => void
}

// Helper to check if message has text content
const hasText = (message: ThreadEntry): boolean => {
  if (!message) {
    return false
  }
  return (
    'agentMessage' in message && !!(message as any).agentMessage?.contentMessage && 'text' in (message as any).agentMessage.contentMessage
  )
}

export function Text(props: TextProps) {
  if (!hasText(props.message)) {
    return null
  }

  // Safe access since we've checked with hasText
  if (!('agentMessage' in props.message)) {
    return null
  }

  const contentMessage = (props.message as any).agentMessage.contentMessage
  // Additional check to ensure text property exists
  if (!('text' in contentMessage)) {
    return null
  }

  // Now contentMessage is known to have a text property
  const { text, suggestions = [] } = contentMessage as { text: string; suggestions?: any[] }

  // OTP
  if ('agentMessage' in props.message && (props.message as any).agentMessage.messageTrafficType === 'AUTHENTICATION') {
    const parts = text.split(' ')
    const code = parts[parts.length - 2]

    return (
      <div
        style={{
          border: props.isDarkMode ? '1px solid #27272a' : '1px solid #9ca3af',
          backgroundColor: props.isDarkMode ? '#27272a' : 'white',
          color: props.isDarkMode ? 'white' : '#374151',
          padding: '0.5rem 1rem',
          borderRadius: '1.5rem',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'flex-end',
          display: 'inline-flex',
          float: 'right',
        }}
      >
        <Copy style={{ width: '1rem', height: '1rem' }} />
        Copy "{code}"
      </div>
    )
  }

  const getMessageStyles = (): { [key: string]: any } => {
    const baseStyles: { [key: string]: any } = {
      color: props.isDarkMode ? 'white' : '#374151',
      backgroundColor: props.isDarkMode ? '#27272a' : '#f3f4f6',
      padding: '0.5rem 1rem',
      borderRadius: '1.5rem',
      maxWidth: '20.625rem',
    }

    if (hasText(props.previousMessage)) {
      baseStyles['borderRadius'] = '0.25rem 0.25rem 0.25rem 1.5rem'
      baseStyles['marginTop'] = '-0.25rem'
    }

    if (hasText(props.nextMessage)) {
      baseStyles['borderRadius'] = '1.5rem 0.25rem 0.25rem 1.5rem'
    }

    if (hasText(props.previousMessage) && hasText(props.nextMessage)) {
      baseStyles['borderRadius'] = '0.25rem 0.25rem 0.25rem 1.5rem'
    }

    if (!props.isAndroid) {
      // Add iOS bubble styles here if needed
    }

    return baseStyles
  }

  return (
    <div>
      <div style={getMessageStyles()}>
        <p>{text}</p>
      </div>

      {(!props.isAndroid || (props.isAndroid && !props.nextMessage)) && (
        <OuterSuggestions
          suggestions={suggestions}
          isAndroid={props.isAndroid}
          isDarkMode={props.isDarkMode}
          isPortrait={props.isPortrait}
          onSendMessage={props.onSendMessage}
        />
      )}
    </div>
  )
}
