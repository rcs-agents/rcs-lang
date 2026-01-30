import type {
  AgentContentMessage,
  AgentBundle,
  ExtractedMessage
} from '@rcs-lang/types'
export * from '@rcs-lang/types'

export interface SuggestionResponse {
    postbackData: string
    text: string
    type: 'UNKNOWN' | 'ACTION' | 'REPLY'
}

export interface UserMessage {
  senderPhoneNumber: string
  messageId: string
  sendTime: string
  agentId: string
  text?: string
  suggestionResponse?: SuggestionResponse
}

/**
 * Extended AgentMessage type for simulator use.
 * Adds messageId field that the official type uses 'name' for.
 */
export interface AgentMessage {
  messageId: string
  sendTime: string
  contentMessage: AgentContentMessage
  name?: string
}

export type ThreadEntry =
  | { agentMessage: AgentMessage; userMessage?: never }
  | { userMessage: UserMessage; agentMessage?: never }
  | { agentEvent: any; agentMessage?: never; userMessage?: never }

export type Thread = ThreadEntry[]

/** Display settings for the simulator device */
export interface DisplaySettings {
  isPortrait: boolean
  isDarkMode: boolean
  isAndroid: boolean
}

/** Agent branding information */
export interface AgentInfo {
  brandName: string
  iconUrl: string
}

/** User input from the simulator */
export interface UserInput {
  text: string
  postbackData?: string
}

/** Simulator operating mode */
export type SimulatorMode = 'interactive' | 'static' | 'preview'

/** Message resolver function */
export type MessageResolver = (messageId: string) => AgentContentMessage | undefined

/**
 * Simulator data source options
 *
 * Supports multiple ways to provide data to the simulator:
 * - AgentBundle: Minimal runtime bundle with agent config + messages
 * - RCXBundle: Full deployment bundle (extends AgentBundle)
 * - Standalone messages: Just the messages without agent config
 * - Preview messages: Extracted messages for preview mode
 */
export interface SimulatorDataSource {
  /** Agent runtime bundle (agent config + messages) */
  bundle?: AgentBundle
  /** RCX bundle (preferred for full functionality - includes CSM, diagram, etc.) */
  rcxBundle?: import('@rcs-lang/rcx').RCXBundle
  /** CSM agent definition (state machine) */
  csm?: import('@rcs-lang/csm').Agent
  /** Standalone messages collection */
  messages?: Record<string, AgentContentMessage>
  /** Extracted messages for preview mode */
  previewMessages?: ExtractedMessage[]
}
