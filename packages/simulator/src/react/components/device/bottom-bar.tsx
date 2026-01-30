/** @jsxImportSource react */

import { ArrowUp, AudioLines, Mic, Plus, PlusCircle, SendHorizontal } from 'lucide-react'
import { type CSSProperties, useEffect, useRef, useState } from 'react'

interface BottomBarProps {
  isAndroid: boolean
  isDarkMode: boolean
  isPortrait: boolean
  onSendMessage: (text: string) => void
}

export const BottomBar = (props: BottomBarProps) => {
  const [isInputActive, setIsInputActive] = useState(false)
  const [userMessage, setUserMessage] = useState('')

  // Reference to the textarea element
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Effect to focus the textarea when isInputActive becomes true
  useEffect(() => {
    if (isInputActive && textareaRef.current) {
      // Focus the textarea after a small delay to ensure it's rendered
      setTimeout(() => (textareaRef.current as any)?.focus(), 0)
    }
  }, [isInputActive])

  // Function to send message and reset input
  const sendMessage = () => {
    if (!userMessage.trim()) return
    props.onSendMessage(userMessage)
    setUserMessage('')
    setIsInputActive(false)
  }

  const placeholder = (isAndroid: boolean) => (isAndroid ? 'RCS message' : 'Text Message ∙ RCS')

  return (
    <div
      style={
        {
          position: 'absolute',
          backgroundColor: props.isDarkMode ? '#030712' : 'white',
          paddingBottom: '1rem',
          paddingTop: '0.5rem',
          bottom: '0',
          left: '0',
          right: '0',
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0.5rem',
          color: props.isAndroid ? (props.isDarkMode ? 'white' : 'black') : props.isDarkMode ? '#9ca3af' : '#6b7280',
        } as CSSProperties
      }
    >
      {!props.isAndroid && (
        <div
          style={
            {
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              cursor: 'pointer',
              backgroundColor: props.isDarkMode ? '#27272a' : '#e5e7eb',
              marginLeft: '0.5rem',
              marginRight: '0.5rem',
            } as CSSProperties
          }
        >
          <Plus
            style={{
              width: '1.75rem',
              height: '1.75rem',
              marginLeft: '0.625rem',
              marginTop: '0.625rem',
              opacity: props.isDarkMode ? '1' : '0.7',
            }}
          />
        </div>
      )}

      <div
        style={{
          flexGrow: '1',
          borderRadius: props.isAndroid ? '1.5rem' : '2rem',
          display: 'flex',
          cursor: 'pointer',
          ...(props.isAndroid
            ? {
                backgroundColor: props.isDarkMode ? '#27272a' : '#f3f4f6',
                color: props.isDarkMode ? 'white' : 'black',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                paddingLeft: '0.75rem',
                paddingRight: '0.75rem',
                alignItems: 'flex-end',
              }
            : {
                border: props.isDarkMode ? '1px solid #27272a' : '1px solid #d1d5db',
                paddingTop: '0.25rem',
                paddingBottom: '0.25rem',
                paddingLeft: '0.75rem',
                paddingRight: '0.25rem',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginRight: '0.5rem',
              }),
        }}
        id="message-input"
        onClick={() => setIsInputActive(true)}
      >
        {props.isAndroid && (
          <PlusCircle
            style={{
              width: '1.5rem',
              height: '1.5rem',
              marginRight: '0.75rem',
              opacity: props.isDarkMode ? '1' : '0.7',
            }}
          />
        )}

        {isInputActive ? (
          <div style={{ flexGrow: '1', display: 'flex', alignItems: 'center' }}>
            <textarea
              ref={textareaRef}
              style={{
                width: '100%',
                border: '0',
                padding: '0',
                margin: '0',
                outline: 'none',
                backgroundColor: 'transparent',
                color: 'inherit',
                resize: 'none',
              }}
              value={userMessage}
              onChange={(e) => setUserMessage((e.target as any).value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
                if (e.key === 'Escape') {
                  setIsInputActive(false)
                }
              }}
              placeholder={placeholder(props.isAndroid)}
              aria-label="Type a message"
              rows={1}
            />
          </div>
        ) : (
          <div>{placeholder(props.isAndroid)}</div>
        )}

        {/* IOS */}
        {!props.isAndroid && (
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              cursor: 'pointer',
              ...(isInputActive
                ? {
                    backgroundColor: props.isDarkMode ? '#dbeafe' : '#22c55e',
                    color: props.isDarkMode ? '#1e40af' : 'white',
                  }
                : {}),
            }}
          >
            {!isInputActive ? (
              <Mic
                style={{
                  width: '2rem',
                  height: '2rem',
                  opacity: '0.7',
                  paddingLeft: '0.5rem',
                  paddingTop: '0.5rem',
                  borderRadius: '50%',
                }}
              />
            ) : (
              <ArrowUp
                style={{
                  width: '2rem',
                  height: '2rem',
                  opacity: '0.7',
                  paddingLeft: '0.5rem',
                  paddingTop: '0.5rem',
                  borderRadius: '50%',
                }}
                onClick={sendMessage}
              />
            )}
          </div>
        )}
      </div>

      {/* ANDROID */}
      {props.isAndroid && (
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            cursor: 'pointer',
            ...(isInputActive
              ? {
                  backgroundColor: props.isDarkMode ? '#dbeafe' : '#1e40af',
                  color: props.isDarkMode ? '#1e40af' : 'white',
                }
              : {
                  backgroundColor: props.isDarkMode ? '#27272a' : '#f3f4f6',
                }),
          }}
        >
          {!isInputActive ? (
            <AudioLines
              style={{
                width: '2.25rem',
                height: '2.25rem',
                opacity: '0.7',
                paddingLeft: '0.75rem',
                paddingTop: '0.75rem',
              }}
            />
          ) : (
            <SendHorizontal
              style={{
                width: '2.25rem',
                height: '2.25rem',
                opacity: '0.7',
                paddingLeft: '0.75rem',
                paddingTop: '0.75rem',
              }}
              onClick={sendMessage}
            />
          )}
        </div>
      )}
    </div>
  )
}
