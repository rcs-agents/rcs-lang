import { useEffect, useRef } from 'react'

import { CarouselCard } from '../messages/carousel-card'
import { ContentInfo } from '../messages/content-info'
import { StandaloneCard } from '../messages/standalone-card'
import { Text } from '../messages/Text'
import { UserText } from '../messages/user-text'
import type { AgentMessage, Thread, ThreadEntry, UserMessage } from '../../../core/types.js'

const hasAgentMessage = (message: ThreadEntry): message is { agentMessage: AgentMessage } => {
  return 'agentMessage' in message
}

const hasUserMessage = (message: ThreadEntry): message is { userMessage: UserMessage } => {
  return 'userMessage' in message
}

type ChatProps = {
  thread: Thread
  isAndroid: boolean
  isDarkMode: boolean
  isPortrait: boolean
  onSendMessage: (payload: any) => void
}

export const Chat = (props: ChatProps) => {
  // Create a derived signal to track messages in reverse order (newest first)
  // This way, when we add a new message at the beginning of the array, it shows at the top
  const messages = [...props.thread].reverse()

  // Reference to the messages container element
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Effect to scroll to the bottom of the messages container when new messages are added
  // Track both the thread length and the container reference for reactivity
  useEffect(() => {
    if (messagesContainerRef.current) {
      // Use a small timeout to ensure DOM is fully updated before scrolling
      setTimeout(() => {
        if (messagesContainerRef.current) {
          (messagesContainerRef.current as any).scrollTop = (messagesContainerRef.current as any).scrollHeight
        }
      }, 10)
    }
  }, [props.thread])

  return (
    <div
      style={{
        paddingBottom: '2rem',
        height: 'calc(100% - 8rem)',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        scrollBehavior: 'smooth',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        paddingLeft: props.isAndroid ? '0.5rem' : '1rem',
        paddingRight: props.isAndroid ? '0.5rem' : '1rem',
        fontSize: props.isAndroid ? 'inherit' : '1rem',
      }}
      ref={messagesContainerRef}
    >
      {messages.map((message, index) => {
        const nextMessage = messages[index + 1]
        const previousMessage = messages[index - 1]

        return (
          <div key={index}>
            {hasAgentMessage(message) && (
              <>
                <StandaloneCard
                  message={message}
                  nextMessage={nextMessage as ThreadEntry}
                  isAndroid={props.isAndroid}
                  isDarkMode={props.isDarkMode}
                  isPortrait={props.isPortrait}
                  onSendMessage={props.onSendMessage}
                />

                <CarouselCard
                  message={message}
                  nextMessage={nextMessage as ThreadEntry}
                  isAndroid={props.isAndroid}
                  isDarkMode={props.isDarkMode}
                  isPortrait={props.isPortrait}
                  onSendMessage={props.onSendMessage}
                />

                <Text
                  message={message}
                  nextMessage={nextMessage as ThreadEntry}
                  previousMessage={previousMessage as ThreadEntry}
                  isAndroid={props.isAndroid}
                  isDarkMode={props.isDarkMode}
                  isPortrait={props.isPortrait}
                  onSendMessage={props.onSendMessage}
                />

                <ContentInfo
                  message={message}
                  nextMessage={nextMessage as ThreadEntry}
                  isAndroid={props.isAndroid}
                  isDarkMode={props.isDarkMode}
                  isPortrait={props.isPortrait}
                  onSendMessage={props.onSendMessage}
                />
              </>
            )}

            {hasUserMessage(message) && (
              <UserText
                message={message}
                nextMessage={nextMessage as ThreadEntry}
                previousMessage={previousMessage as ThreadEntry}
                isAndroid={props.isAndroid}
                isDarkMode={props.isDarkMode}
                isPortrait={props.isPortrait}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
