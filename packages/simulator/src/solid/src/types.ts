// export type ThreadEntry2 = {
//   // "delayIsTypingEvent"?: number // In seconds (optional)
//   // "delayMessage"?: number // In seconds (optional)
//   // "sendIsTypingEvent"?: boolean
//   // "sendReadEvent"?: boolean
//   "agentEvent": AgentEvent
//   "agentMessage": AgentMessage
//   "userMessage": UserMessage
// }

export type Thread = ThreadEntry[]
export type ThreadEntry = (
  { "agentEvent": AgentEvent } |
  { "agentMessage": AgentMessage } |
  { "userMessage": UserMessage }
)

// ----- Agent Message ----- 
export type AgentMessage = {
  contentMessage: AgentContentMessage,
  messageTrafficType: MessageTrafficType
} & ({
  expireTime?: string
} | {
  ttl?: string
})

export type MessageTrafficType = 'MESSAGE_TRAFFIC_TYPE_UNSPECIFIED' | 'AUTHENTICATION' | 'TRANSACTION' | 'PROMOTION' | 'SERVICEREQUEST' | 'ACKNOWLEDGEMENT'

export type AgentContentMessage = {
  // Maximum of 11 suggestions
  "suggestions"?: Suggestion[],
} & OneOfAgentContentMessageFields

export type Suggestion = {
  "reply": SuggestedReply
} | {
  "action": SuggestedAction
}

// Maximum 2048 characters
type Postbackdata = string

export type SuggestedReply = {
  "text": string,
  "postbackData": Postbackdata
}

export type SuggestedAction = {
  // Maximum length of 200 characters
  "text": string,
  "postbackData": Postbackdata,
  // Maximum length of 2048 characters
  "fallbackUrl": string,
} & OneOfAction

type OneOfAction = {
  "dialAction": DialAction
} | {
  "viewLocationAction": ViewLocationAction
} | {
  "createCalendarEventAction": CreateCalendarEventAction
} | {
  "openUrlAction": OpenUrlAction
} | {
  "shareLocationAction": ShareLocationAction
} | {
  "composeAction": ComposeAction
}

type DialAction = {
  "phoneNumber": string
}

type ViewLocationAction = {
  "latLong"?: LatLng,
  "label"?: string,
  "query"?: string
}

type CreateCalendarEventAction = {
  "startTime": string,
  "endTime": string,
  "title": string,
  "description": string
}

type OpenUrlAction = {
  "url": string,
  "application": 'OPEN_URL_APPLICATION_UNSPECIFIED' | 'BROWSER' | 'WEBVIEW',
  "webviewViewMode"?: 'WEBVIEW_VIEW_MODE_UNSPECIFIED' | 'FULL' | 'HALF' | 'TALL',
  "description": string
}

type ShareLocationAction = {}

type ComposeAction = {
  "composeTextMessage": {
    "phoneNumber": string,
    "text": string
  }
} | {
  "composeRecordingMessage": {
    "phoneNumber": string,
    "type": 'COMPOSE_RECORDING_ACTION_TYPE_UNSPECIFIED' | 'ACTION_TYPE_AUDIO' | 'ACTION_TYPE_VIDEO'
  }
}

type OneOfAgentContentMessageFields = {
  "text": string
} | {
  "uploadedRbmFile": UploadedRbmFile
} | {
  "richCard": RichCard
} | {
  "contentInfo": ContentInfo
}

type UploadedRbmFile = {
  "fileName": string
  "thumbnailName": string
}

export type RichCard = {
  carouselCard: CarouselCard
} | {
  standaloneCard: StandaloneCard
}

export type CarouselCard = {
  "cardWidth": 'CARD_WIDTH_UNSPECIFIED' | 'SMALL' | 'MEDIUM',
  "cardContents": CardContent[]
}

export type CardContent = {
  "title": string,
  "description": string,
  "media": Media,
  // Maximum of 4 suggestions
  "suggestions": Suggestion[]
}

type Media = {
  height: 'HEIGHT_UNSPECIFIED' | 'SHORT' | 'MEDIUM' | 'TALL'
} & ({
  "uploadedRbmFile": UploadedRbmFile
} | {
  "contentInfo": ContentInfo
})

export type StandaloneCard = {
  "cardOrientation": 'CARD_ORIENTATION_UNSPECIFIED' | 'VERTICAL' | 'HORIZONTAL',
  "thumbnailImageAlignment": 'THUMBNAIL_IMAGE_ALIGNMENT_UNSPECIFIED' | 'LEFT' | 'RIGHT',
  "cardContent": CardContent
}

type ContentInfo = {
  "fileUrl": string,
  "thumbnailUrl"?: string,
  "forceRefresh": boolean
}

export type File = {
  "fileUrl"?: string
  "thumbnailUrl"?: string
  "agentId": string
}

// ----- Agent Event ----- 
export type AgentEvent = {
  "eventType": 'TYPE_UNSPECIFIED' | 'IS_TYPING' | 'READ',
  // The ID of the user message that the agent event pertains to.
  // This field is only applicable for agent events of type READ.
  "messageId": string
}

// ----- User Message ----- 
export type UserMessage = {
  "senderPhoneNumber": string,
  "messageId": string,
  "sendTime": string,
  "agentId": string,
} & (
    { text: string } |
    { userFile: UserFile } |
    { location: LatLng } |
    { suggestionResponse: SuggestionResponse }
  )

export type UserFile = {
  "category": FileCategory
  "thumbnail"?: FileInfo,
  "payload": FileInfo
}

type FileCategory = 'FILE_CATEGORY_UNSPECIFIED' | 'IMAGE' | 'VIDEO' | 'AUDIO'

type FileInfo = {
  "mimeType": string
  "fileSizeBytes": number
  "fileName": string
  "fileUri": string
}

export type SuggestionResponse = {
  "postbackData": string,
  "text": string,
  "type": SuggestionResponseType
}

type SuggestionResponseType = 'UNKNOWN' | 'ACTION' | 'REPLY'

// ----- Shared Types ----- 
type LatLng = {
  "latitude": number,
  "longitude": number
}
