// Re-export canonical RBM types from @rcs-lang/types (when available)
// For now, we'll define minimal types for the component library

export interface AgentInfo {
  iconUrl: string
  brandName: string
}

export interface DeviceProps {
  agent: AgentInfo
  isPortrait: boolean
  isDarkMode: boolean
  isAndroid: boolean
  thread: Thread
}

// Thread types - simplified from the original
export type Thread = ThreadEntry[]
export type ThreadEntry = { agentEvent: AgentEvent } | { agentMessage: AgentMessage } | { userMessage: UserMessage }

export interface AgentEvent {
  eventType: string
  timestamp: string
  [key: string]: any
}

export interface AgentMessage {
  messageId: string
  sendTime: string
  text?: string
  richCard?: RichCard
  suggestions?: Suggestion[]
  [key: string]: any
}

export interface UserMessage {
  senderPhoneNumber: string
  messageId: string
  sendTime: string
  agentId: string
  text?: string
  suggestionResponse?: SuggestionResponse
}

export interface SuggestionResponse {
  postbackData: string
  text: string
  type: 'UNKNOWN' | 'ACTION' | 'REPLY'
}

export interface UserInput {
  text: string
  postbackData?: string
}

export interface RichCard {
  standaloneCard?: StandaloneCard
  carouselCard?: CarouselCard
}

export interface StandaloneCard {
  cardContent: CardContent
  cardOrientation?: 'VERTICAL' | 'HORIZONTAL'
}

export interface CarouselCard {
  cardWidth: 'SMALL' | 'MEDIUM'
  cardContents: CardContent[]
}

export interface CardContent {
  title?: string
  description?: string
  media?: {
    height: 'SHORT' | 'MEDIUM' | 'TALL'
    contentInfo: {
      fileUrl: string
      altText?: string
      mimeType?: string
    }
  }
  suggestions?: Suggestion[]
}

export interface Suggestion {
  reply?: SuggestedReply
  action?: SuggestedAction
}

export interface SuggestedReply {
  text: string
  postbackData: string
}

export interface SuggestedAction {
  text: string
  postbackData: string
  openUrlAction?: {
    url: string
  }
  dialAction?: {
    phoneNumber: string
  }
  viewLocationAction?: {
    query: string
  }
  createCalendarEventAction?: {
    startTime: string
    endTime: string
    title: string
  }
}
