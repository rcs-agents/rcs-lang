// Import canonical types from @rcs-lang/types
import type {
  AgentContentMessage as RcsAgentContentMessage,
  CardContent as RcsCardContent,
  CarouselCard as RcsCarouselCard,
  MessageTrafficType as RcsMessageTrafficType,
  RichCard as RcsRichCard,
  StandaloneCard as RcsStandaloneCard,
  SuggestedAction as RcsSuggestedAction,
  SuggestedReply as RcsSuggestedReply,
  Suggestion as RcsSuggestion,
} from '@rcs-lang/types'

// Shared types (exact copy from simulator)
export type Thread = ThreadEntry[]
export type ThreadEntry = { agentEvent: AgentEvent } | { agentMessage: AgentMessage } | { userMessage: UserMessage }

// ----- Agent Message -----
export type AgentMessage = {
  contentMessage: AgentContentMessage
  messageTrafficType: MessageTrafficType
} & (
  | {
      expireTime?: string
    }
  | {
      ttl?: string
    }
)

// Use canonical types from @rcs-lang/types
export type MessageTrafficType = RcsMessageTrafficType
export type AgentContentMessage = RcsAgentContentMessage
export type Suggestion = RcsSuggestion
export type SuggestedReply = RcsSuggestedReply
export type SuggestedAction = RcsSuggestedAction
export type RichCard = RcsRichCard
export type CarouselCard = RcsCarouselCard
export type CardContent = RcsCardContent
export type StandaloneCard = RcsStandaloneCard

// Note: OneOfAction and action types now come from @rcs-lang/types through SuggestedAction

// Unused type definitions removed
// OneOfAgentContentMessageFields, UploadedRbmFile, Media types were not being used

// RichCard, CarouselCard, CardContent, StandaloneCard now come from @rcs-lang/types

type ContentInfo = {
  fileUrl: string
  thumbnailUrl?: string
  forceRefresh: boolean
}

export type File = {
  fileUrl?: string
  thumbnailUrl?: string
  agentId: string
}

// ----- Agent Event -----
export type AgentEvent = {
  eventType: 'TYPE_UNSPECIFIED' | 'IS_TYPING' | 'READ'
  timestamp: string
  // The ID of the user message that the agent event pertains to.
  // This field is only applicable for agent events of type READ.
  messageId: string
}

// ----- User Message -----
export type UserMessage = {
  senderPhoneNumber: string
  messageId: string
  sendTime: string
  agentId: string
} & ({ text: string } | { userFile: UserFile } | { location: LatLng } | { suggestionResponse: SuggestionResponse })

export type UserFile = {
  category: FileCategory
  thumbnail?: FileInfo
  payload: FileInfo
}

type FileCategory = 'FILE_CATEGORY_UNSPECIFIED' | 'IMAGE' | 'VIDEO' | 'AUDIO'

type FileInfo = {
  mimeType: string
  fileSizeBytes: number
  fileName: string
  fileUri: string
}

export type SuggestionResponse = {
  postbackData: string
  text: string
  type: SuggestionResponseType
}

type SuggestionResponseType = 'UNKNOWN' | 'ACTION' | 'REPLY'

// ----- Shared Types -----
type LatLng = {
  latitude: number
  longitude: number
}
