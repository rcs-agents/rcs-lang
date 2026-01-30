import { InnerSuggestions } from './suggestions/Suggestions.js'
import type { CardContent as CardContentType } from '../../../core/types.js'

interface CardContentProps {
  cardContent: CardContentType
  isAndroid: boolean
  isDarkMode: boolean
  isPortrait: boolean
  onSendMessage: (payload: any) => void
}

export function CardContent(props: CardContentProps) {
  // Determine height based on media height
  const getHeight = () => {
    switch (props.cardContent.media?.height) {
      case 'SHORT':
        return '8rem'
      case 'MEDIUM':
        return '11rem'
      case 'TALL':
        return '15rem'
      default:
        return '8rem'
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Media Section */}
      {props.cardContent.media?.height && (
        <div
          style={{
            backgroundColor: '#e5e7eb',
            borderRadius: '0.5rem 0.5rem 0 0',
            width: '100%',
            height: getHeight(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {'contentInfo' in props.cardContent.media ? (
            <img
              src={props.cardContent.media?.contentInfo?.fileUrl}
              alt="Media"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                fontSize: '0.75rem',
                color: '#6b7280',
              }}
            >
              Media Content
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div
        style={{
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: '1',
        }}
      >
        {/* This div will expand to fill available space, pushing suggestions to bottom */}
        <div
          style={{
            flexGrow: '1',
            marginBottom: '0.5rem',
          }}
        >
          {props.cardContent.title && (
            <p
              style={{
                fontWeight: '600',
                color: props.isDarkMode ? 'white' : '#1f2937',
              }}
            >
              {props.cardContent.title}
            </p>
          )}
          {props.cardContent.description && (
            <p
              style={{
                fontSize: '0.875rem',
                color: props.isDarkMode ? 'white' : '#6b7280',
                marginTop: '0.25rem',
              }}
            >
              {props.cardContent.description}
            </p>
          )}
        </div>

        {/* Suggestions/Actions - always at bottom */}
        <InnerSuggestions
          suggestions={props.cardContent.suggestions || []}
          isAndroid={props.isAndroid}
          isDarkMode={props.isDarkMode}
          isPortrait={props.isPortrait}
          onSendMessage={props.onSendMessage}
        />
      </div>
    </div>
  )
}
