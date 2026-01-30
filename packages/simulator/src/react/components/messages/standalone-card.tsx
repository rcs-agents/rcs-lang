import { CardContent } from './card-content.js'
import { OuterSuggestions } from './suggestions/Suggestions.js'
import type { ThreadEntry } from '../../../core/types.js'

interface StandaloneCardProps {
  message: ThreadEntry
  nextMessage: ThreadEntry
  isAndroid: boolean
  isDarkMode: boolean
  isPortrait: boolean
  onSendMessage: (payload: any) => void
}

// Helper to check if message is an agent message with richCard
const hasRichCard = (message: ThreadEntry): boolean => {
  if (!message) {
    return false
  }
  return (
    'agentMessage' in message &&
    (message as any).agentMessage?.contentMessage &&
    'richCard' in (message as any).agentMessage.contentMessage
  )
}

// Helper to check if message has a StandaloneCard
const hasRichCardStandalone = (message: ThreadEntry): boolean => {
  if (!hasRichCard(message)) return false
  if (!('agentMessage' in message)) return false
  const contentMessage = (message as any).agentMessage.contentMessage
  // @ts-ignore
  if (!('richCard' in contentMessage)) return false
  // @ts-ignore
  return !!(contentMessage.richCard && 'standaloneCard' in contentMessage.richCard)
}

export function StandaloneCard(props: StandaloneCardProps) {
  if (!hasRichCardStandalone(props.message)) {
    return null
  }

  const agentMessage = (props.message as any).agentMessage
  if (!agentMessage || !agentMessage.contentMessage) return null

  const contentMessage = agentMessage.contentMessage
  // @ts-ignore
  if (!('richCard' in contentMessage) || !contentMessage.richCard || !('standaloneCard' in contentMessage.richCard)) {
    return null
  }

  // @ts-ignore
  if (!('cardContent' in contentMessage.richCard.standaloneCard)) {
    return null
  }

  // @ts-ignore
  const { cardContent } = contentMessage.richCard.standaloneCard

  return (
    <div>
      <div
        style={{
          borderRadius: '0.75rem',
          overflow: 'hidden',
          backgroundColor: props.isDarkMode ? '#27272a' : '#f3f4f6',
        }}
      >
        <CardContent
          cardContent={cardContent}
          isAndroid={props.isAndroid}
          isDarkMode={props.isDarkMode}
          isPortrait={props.isPortrait}
          onSendMessage={props.onSendMessage}
        />
      </div>

      {!props.nextMessage && (
        <OuterSuggestions
          suggestions={contentMessage?.suggestions || []}
          isAndroid={props.isAndroid}
          isDarkMode={props.isDarkMode}
          isPortrait={props.isPortrait}
          onSendMessage={props.onSendMessage}
        />
      )}
    </div>
  )
}
