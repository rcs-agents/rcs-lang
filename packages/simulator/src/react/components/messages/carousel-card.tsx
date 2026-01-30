import { CardContent } from './card-content.js'
import { OuterSuggestions } from './suggestions/Suggestions.js'
import type { ThreadEntry } from '../../../core/types.js'

interface CarouselCardProps {
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

// Helper to check if message has a CarouselCard
const hasRichCardCarousel = (message: ThreadEntry): boolean => {
  if (!hasRichCard(message)) return false
  if (!('agentMessage' in message)) return false
  const contentMessage = (message as any).agentMessage.contentMessage
  // @ts-ignore
  if (!('richCard' in contentMessage)) return false
  // @ts-ignore
  return !!(contentMessage.richCard && 'carouselCard' in contentMessage.richCard)
}

export function CarouselCard(props: CarouselCardProps) {
  if (!hasRichCardCarousel(props.message)) {
    return null
  }

  const agentMessage = (props.message as any).agentMessage
  if (!agentMessage || !agentMessage.contentMessage) return null

  const contentMessage = agentMessage.contentMessage
  // @ts-ignore
  if (!('richCard' in contentMessage) || !contentMessage.richCard || !('carouselCard' in contentMessage.richCard)) {
    return null
  }
  // @ts-ignore
  if (!('cardContents' in contentMessage.richCard.carouselCard)) {
    return null
  }

  // @ts-ignore
  const { cardContents } = contentMessage.richCard.carouselCard

  if (!cardContents || cardContents.length === 0) {
    return null
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginLeft: '-0.5rem',
        marginRight: '-0.5rem',
      }}
    >
      <div
        style={{
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',
          scrollbarWidth: 'none',
          display: 'flex',
          alignItems: 'stretch',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          gap: '0.5rem',
        }}
      >
        {cardContents.map((cardContent: any, index: number) => (
          <div
            key={index}
            style={{
              minWidth: '15rem',
              width: '16.25rem',
              flexShrink: '0',
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
        ))}
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
