/** @jsxImportSource react */

import { CheckCheck } from 'lucide-react'
import type { SuggestionResponse, ThreadEntry, UserMessage } from '../../../core/types.js'

type UserMessageProps = {
  message: ThreadEntry
  nextMessage: ThreadEntry
  previousMessage: ThreadEntry
  isAndroid: boolean
  isDarkMode: boolean
  isPortrait: boolean
}

// Type guard to narrow UserMessage to the text variant
const hasText = (message: ThreadEntry): message is { userMessage: UserMessage & { text: string } } => {
  if (!message) {
    return false
  }

  return 'userMessage' in message && 'text' in (message as any).userMessage
}

const hasSuggestionResponse = (
  message: ThreadEntry
): message is { userMessage: UserMessage & { suggestionResponse: SuggestionResponse } } => {
  if (!message) {
    return false
  }

  return 'userMessage' in message && 'suggestionResponse' in (message as any).userMessage
}

export const UserText = (props: UserMessageProps) => {
  if (!hasText(props.message) && !hasSuggestionResponse(props.message)) {
    return null
  }

  const getBorderRadius = () => {
    let borderRadius = '1.5rem 0.25rem 1.5rem 1.5rem' // Default

    if (hasUserMessage(props.previousMessage)) {
      borderRadius = '0.25rem 0.25rem 1.5rem 1.5rem' // Top rounded less
    }

    if (hasUserMessage(props.nextMessage)) {
      borderRadius = '1.5rem 0.25rem 0.25rem 1.5rem' // Bottom rounded less
    }

    if (hasUserMessage(props.previousMessage) && hasUserMessage(props.nextMessage)) {
      borderRadius = '0.25rem 0.25rem 0.25rem 1.5rem' // Both rounded less
    }

    return borderRadius
  }

  const getMarginTop = () => {
    return hasUserMessage(props.previousMessage) ? '-0.25rem' : '0'
  }

  const hasUserMessage = (message: ThreadEntry): boolean => {
    return message && 'userMessage' in message
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        float: 'right',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        paddingRight: '0.5rem',
        paddingLeft: '1rem',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderRadius: getBorderRadius(),
        lineHeight: '1.25rem',
        maxWidth: '320px',
        backgroundColor: props.isAndroid ? '#1e40af' : '#007aff',
        color: props.isAndroid ? '#f9fafb' : 'white',
        fontSize: props.isAndroid ? '0.875rem' : 'inherit',
        marginTop: getMarginTop(),
      }}
    >
      <div>
        {hasText(props.message) ? (props.message as any).userMessage.text : (props.message as any).userMessage.suggestionResponse.text}
      </div>
      {props.isAndroid && (
        <div
          style={{
            padding: '2px',
            marginLeft: '8px',
            borderRadius: '50%',
            border: '1px solid #F9FAFB',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <CheckCheck style={{ width: '10px', height: '10px' }} />
        </div>
      )}
    </div>
  )
}
