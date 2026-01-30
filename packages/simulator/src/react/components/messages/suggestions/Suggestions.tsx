/** @jsxImportSource react */

import type { SuggestedAction, SuggestedReply, Suggestion } from '@rcs-lang/types'
import { CalendarPlus, Globe, LocateFixed, MapPin, Phone } from 'lucide-react'

type OuterSuggestionsProps = {
  suggestions: Suggestion[]
  isAndroid: boolean
  isDarkMode: boolean
  isPortrait: boolean
  onSendMessage: (payload: any) => void
}

export function OuterSuggestions(props: OuterSuggestionsProps) {
  if (props.suggestions.length === 0) {
    return null
  }

  const chooser = (isAndroid: boolean) => (isAndroid ? OuterSuggestionsAndroid(props) : OuterSuggestionsIOS(props))

  return chooser(props.isAndroid)
}

function OuterSuggestionsAndroid(props: OuterSuggestionsProps) {
  return (
    <ul
      style={{
        marginTop: '0.75rem',
        marginLeft: '-0.5rem',
        marginRight: '-0.5rem',
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
        display: 'flex',
        alignItems: 'stretch',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollBehavior: 'smooth',
        gap: '0.5rem',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        listStyle: 'none',
      }}
    >
      {props.suggestions.map((suggestion, idx) => (
        <li key={idx}>
          <button
            style={{
              paddingLeft: '0.75rem',
              paddingRight: '0.75rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              border: props.isDarkMode ? '1px solid #27272a' : '1px solid #d1d5db',
              borderRadius: '9999px',
              backgroundColor: props.isDarkMode ? '#27272a' : 'white',
              color: props.isDarkMode ? 'white' : 'black',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) =>
              ((e.target as any).style.backgroundColor = props.isDarkMode ? '#3f3f46' : '#f3f4f6')
            }
            onMouseLeave={(e) =>
              ((e.target as any).style.backgroundColor = props.isDarkMode ? '#27272a' : 'white')
            }
            data-index={idx}
            onClick={() =>
              props.onSendMessage({
                reply: 'reply' in suggestion ? suggestion.reply : undefined,
                action: 'action' in suggestion ? suggestion.action : undefined,
                postbackData:
                  'reply' in suggestion
                    ? suggestion.reply.postbackData
                    : 'action' in suggestion
                      ? suggestion.action.postbackData
                      : '',
              })
            }
          >
            <SuggestionComponent
              suggestion={suggestion}
              isInner={false}
              isAndroid={props.isAndroid}
              isDarkMode={props.isDarkMode}
              isPortrait={props.isPortrait}
              onSendMessage={props.onSendMessage}
            />
          </button>
        </li>
      ))}
    </ul>
  )
}

function OuterSuggestionsIOS(props: OuterSuggestionsProps) {
  return (
    <ul
      style={{
        backgroundColor: props.isDarkMode ? '#27272a' : '#f3f4f6',
        color: props.isDarkMode ? 'white' : '#374151',
        borderRadius: '1.5rem 0.25rem 1.5rem 1.5rem',
        paddingTop: '0',
        paddingBottom: '0',
        marginTop: '0.5rem',
      }}
    >
      {props.suggestions.map((suggestion, idx) => (
        <li
          key={idx}
          style={{
            borderBottom: props.isDarkMode ? '1px solid #27272a' : '1px solid #d1d5db',
            marginRight: '-1rem',
            ...(idx === props.suggestions.length - 1 ? { borderBottom: 'none' } : {}),
          }}
        >
          <button
            style={{
              color: '#3b82f6',
              paddingTop: idx === 0 ? '0' : '0.625rem',
              paddingBottom: idx === props.suggestions.length - 1 ? '0' : '0.625rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            data-index={idx}
            onClick={() =>
              props.onSendMessage({
                reply: 'reply' in suggestion ? suggestion.reply : undefined,
                action: 'action' in suggestion ? suggestion.action : undefined,
                postbackData:
                  'reply' in suggestion
                    ? suggestion.reply.postbackData
                    : 'action' in suggestion
                      ? suggestion.action.postbackData
                      : '',
              })
            }
          >
            {'reply' in suggestion ? suggestion.reply.text : ''}
            {'action' in suggestion ? suggestion.action.text : ''}
          </button>
        </li>
      ))}
    </ul>
  )
}

type InnerSuggestionsProps = {
  suggestions: Suggestion[]
  isAndroid: boolean
  isDarkMode: boolean
  isPortrait: boolean
  onSendMessage: (payload: any) => void
}

export function InnerSuggestions(props: InnerSuggestionsProps) {
  if (props.suggestions.length === 0) {
    return null
  }

  return (
    <div
      style={{
        marginTop: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        fontSize: '15px',
      }}
    >
      {props.suggestions.map((suggestion, idx) => {
        // Determine button class based on position
        const isFirst = idx === 0
        const isLast = idx === props.suggestions.length - 1
        const isSingle = props.suggestions.length === 1

        let borderRadius = '0.125rem' // Default: no rounded corners

        if (isSingle) {
          borderRadius = '1rem' // Single element: fully rounded
        } else if (isFirst) {
          borderRadius = '1rem 1rem 0.125rem 0.125rem' // First element: top rounded
        } else if (isLast) {
          borderRadius = '0.125rem 0.125rem 1rem 1rem' // Last element: bottom rounded
        }

        return (
          <button
            key={idx}
            style={{
              width: '100%',
              paddingTop: '0.375rem',
              paddingBottom: '0.375rem',
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
              height: '3.5rem',
              color: props.isDarkMode ? 'white' : '#374151',
              backgroundColor: props.isDarkMode ? '#030712' : 'white',
              borderRadius: borderRadius,
              border: 'none',
              cursor: 'pointer',
            }}
            data-index={idx}
            onClick={() =>
              props.onSendMessage({
                reply: 'reply' in suggestion ? suggestion.reply : undefined,
                action: 'action' in suggestion ? suggestion.action : undefined,
                postbackData:
                  'reply' in suggestion
                    ? suggestion.reply.postbackData
                    : 'action' in suggestion
                      ? suggestion.action.postbackData
                      : '',
              })
            }
          >
            <SuggestionComponent
              suggestion={suggestion}
              format="vertical"
              isInner={true}
              isAndroid={props.isAndroid}
              isDarkMode={props.isDarkMode}
              isPortrait={props.isPortrait}
              onSendMessage={props.onSendMessage}
            />
          </button>
        )
      })}
    </div>
  )
}

type SuggestionProps = {
  suggestion: Suggestion
  format?: 'vertical' | 'horizontal'
  isInner: boolean
  isAndroid: boolean
  isDarkMode: boolean
  isPortrait: boolean
  onSendMessage: (payload: any) => void
}

function SuggestionComponent(props: SuggestionProps) {
  return (
    <div>
      {'reply' in props.suggestion ? (
        <RenderReply
          reply={props.suggestion.reply}
          format={props.format}
          isAndroid={props.isAndroid}
          isDarkMode={props.isDarkMode}
          isPortrait={props.isPortrait}
          onSendMessage={props.onSendMessage}
        />
      ) : undefined}
      {'action' in props.suggestion ? (
        <RenderAction
          action={props.suggestion.action}
          format={props.format}
          isAndroid={props.isAndroid}
          isDarkMode={props.isDarkMode}
          isPortrait={props.isPortrait}
          onSendMessage={props.onSendMessage}
        />
      ) : undefined}
    </div>
  )
}

type RenderReplyProps = {
  reply: SuggestedReply
  format?: 'vertical' | 'horizontal'
  isAndroid: boolean
  isDarkMode: boolean
  isPortrait: boolean
  onSendMessage: (payload: any) => void
}

function RenderReply(props: RenderReplyProps) {
  return (
    <div
      style={{
        display: 'flex',
        whiteSpace: 'nowrap',
        alignItems: 'center',
      }}
    >
      {props.reply.text}
    </div>
  )
}

type RenderActionProps = {
  action: SuggestedAction
  format?: 'vertical' | 'horizontal'
  isAndroid: boolean
  isDarkMode: boolean
  isPortrait: boolean
  onSendMessage: (payload: any) => void
}

function RenderAction(props: RenderActionProps) {
  const iconSize = props.format === 'vertical' ? '1.5rem' : '1rem'

  return (
    <div
      style={{
        display: 'flex',
        whiteSpace: 'nowrap',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          ...(props.format === 'vertical'
            ? {
                // backgroundColor: props.isDarkMode ? '#27272a' : '#f3f4f6',
                borderRadius: '50%',
                marginRight: '1rem',
                padding: '0.5rem',
                marginLeft: '0.5rem',
              }
            : {
                marginRight: '0.25rem',
              }),
        }}
      >
        {'dialAction' in props.action && props.isAndroid ? (
          <Phone style={{ width: iconSize, height: iconSize }} />
        ) : undefined}
        {'viewLocationAction' in props.action && props.isAndroid ? (
          <MapPin style={{ width: iconSize, height: iconSize }} />
        ) : undefined}
        {'createCalendarEventAction' in props.action && props.isAndroid ? (
          <CalendarPlus style={{ width: iconSize, height: iconSize }} />
        ) : undefined}
        {'openUrlAction' in props.action && props.isAndroid ? (
          <Globe style={{ width: iconSize, height: iconSize }} />
        ) : undefined}
        {'shareLocationAction' in props.action && props.isAndroid ? (
          <LocateFixed style={{ width: iconSize, height: iconSize }} />
        ) : undefined}
      </div>
      {props.action.text}
    </div>
  )
}
