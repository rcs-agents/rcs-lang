import {
  type Agent,
  ConversationalAgent,
  type ProcessResult,
  type StateChangeEvent,
  validateAgentDefinition,
} from '@rcs-lang/csm'
import type { RCXBundle } from '@rcs-lang/rcx'
import { MessageResolutionService } from './message-resolution.js'
import type { AgentContentMessage, AgentMessage, ExtractedMessage, SimulatorMode, Thread, ThreadEntry, UserInput } from './types.js'

export interface SimulatorEngineState {
  currentState: string
  currentMachine: string
  context: Record<string, any>
  history: Array<{
    timestamp: string
    fromState: string
    toState: string
    userInput?: string
    agentMessage?: AgentMessage
  }>
  hasError: boolean
  errorMessage?: string
  metadata: {
    agentId: string
    name: string
    createdAt: string
    lastUpdated: string
  }
}

export interface SimulatorEngineConfig {
  debugMode?: boolean
  maxHistorySize?: number
  transitionTimeout?: number
  enableValidation?: boolean
}

export interface SimulatorEngineCallbacks {
  onStateChange?: (state: SimulatorEngineState) => void
  onMessageSent?: (message: AgentMessage) => void
  onMessageReceived?: (input: UserInput) => void
  onError?: (error: Error) => void
  onLoaded?: (state: SimulatorEngineState) => void
  onThreadChange?: (thread: Thread) => void
}

/**
 * Core engine for driving the RCS simulator.
 * Manages conversation state and transitions.
 */
export class SimulatorEngine {
  private agent: ConversationalAgent | null = null
  private agentDefinition: Agent | null = null
  private runtimeState: SimulatorEngineState | null = null
  private config: Required<SimulatorEngineConfig>
  private callbacks: SimulatorEngineCallbacks
  private thread: Thread = []
  private messageResolver: MessageResolutionService
  private mode: SimulatorMode = 'interactive'
  private previewMessages: ExtractedMessage[] = []
  private previewIndex: number = 0

  constructor(config: SimulatorEngineConfig = {}, callbacks: SimulatorEngineCallbacks = {}) {
    this.config = {
      debugMode: config.debugMode ?? false,
      maxHistorySize: config.maxHistorySize ?? 50,
      transitionTimeout: config.transitionTimeout ?? 5000,
      enableValidation: config.enableValidation ?? true,
    }
    this.callbacks = callbacks
    this.messageResolver = new MessageResolutionService()
  }

  /**
   * Update callbacks after construction
   */
  setCallbacks(callbacks: SimulatorEngineCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * Load CSM agent definition
   */
  async loadAgent(agentDefinition: Agent, options: {
    agentId?: string
    agentName?: string
    messages?: Record<string, AgentContentMessage>
  } = {}): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
      if (this.config.enableValidation) {
        const isValid = validateAgentDefinition(agentDefinition)
        if (!isValid) {
          return { success: false, errors: ['Invalid agent definition'] }
        }
      }

      this.agentDefinition = agentDefinition

      if (options.messages) {
        this.messageResolver.loadFromCollection(options.messages)
      }

      const agentConfig: any = {
        id: options.agentId || agentDefinition.id,
        definition: agentDefinition,
        onStateChange: this.handleInternalStateChange.bind(this),
        onError: this.handleError.bind(this),
        debug: this.config.debugMode,
      }

      this.agent = new ConversationalAgent(agentConfig)
      this.agent.addMachine(agentDefinition.machine as any)

      await this.initializeRuntimeState(
        options.agentId || agentDefinition.id,
        options.agentName || agentDefinition.meta?.name || 'Untitled Agent'
      )

      this.callbacks.onLoaded?.(this.runtimeState!)
      return { success: true, errors }

    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      return { success: false, errors: [msg] }
    }
  }

  /**
   * Load an RCX bundle containing CSM and messages
   */
  async loadBundle(bundle: RCXBundle, options: {
    agentId?: string
    agentName?: string
  } = {}): Promise<{ success: boolean; errors: string[] }> {
    this.messageResolver.loadFromBundle(bundle)

    // Extract CSM agent from bundle
    const csm = bundle.csm
    if (!csm) {
      return { success: false, errors: ['Bundle does not contain a CSM definition'] }
    }

    return this.loadAgent(csm, {
      agentId: options.agentId || bundle.manifest.bundleId,
      agentName: options.agentName || bundle.manifest.name,
    })
  }

  /**
   * Send a user message to the engine.
   */
  async sendMessage(input: UserInput): Promise<void> {
    if (!this.agent || !this.runtimeState) {
      this.handleError(new Error('Agent not loaded'))
      return
    }

    const { text, postbackData } = input
    const startState = this.runtimeState.currentState

    // Add user message to thread
    const userEntry: ThreadEntry = {
      userMessage: {
        text,
        senderPhoneNumber: 'user',
        messageId: Date.now().toString(),
        sendTime: new Date().toISOString(),
        agentId: 'user'
      }
    }
    this.thread = [...this.thread, userEntry]
    this.callbacks.onMessageReceived?.(input)
    this.callbacks.onThreadChange?.(this.thread)

    try {
      const result = await this.agent.processInput(text) // TODO use postback if available?

      // Generate response
      const response = await this.generateResponseMessage(result)

      this.updateRuntimeStateFromResult(result, text, startState, response)

      if (response) {
        // Construct full AgentMessage
        const agentMsg: AgentMessage = {
          messageId: Date.now().toString(),
          sendTime: new Date().toISOString(),
          contentMessage: {
            text: response.type === 'text' ? response.content : undefined,
            richCard: response.type === 'richCard' || response.type === 'carousel' ? { /* TODO: better mapping */ } as any : undefined
          }
        }

        // Better mapping logic for text/card
        if (response.type === 'text') {
          agentMsg.contentMessage.text = response.content
          agentMsg.contentMessage.suggestions = response.suggestions?.map((s: any) => ({
            reply: { text: s.text, postbackData: s.action }
          }))
        }

        // Add agent message to thread
        const agentEntry: ThreadEntry = { agentMessage: agentMsg }
        this.thread = [...this.thread, agentEntry]

        this.callbacks.onMessageSent?.(agentMsg)
        this.callbacks.onThreadChange?.(this.thread)
      }

      this.callbacks.onStateChange?.(this.runtimeState!)

    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * Get current state
   */
  getState(): SimulatorEngineState {
    if (!this.runtimeState) throw new Error('Not initialized')
    return { ...this.runtimeState }
  }

  /**
   * Get current thread
   */
  getThread(): Thread {
    return [...this.thread]
  }

  /**
   * Check if engine is ready
   */
  isReady(): boolean {
    return this.agent !== null && this.runtimeState !== null
  }

  /**
   * Load extracted messages for preview mode
   */
  loadPreviewMessages(messages: ExtractedMessage[]): void {
    this.previewMessages = [...messages].sort((a, b) => a.order - b.order)
    this.previewIndex = 0
    this.mode = 'preview'

    // Show first message in thread
    if (this.previewMessages.length > 0) {
      this.showPreviewMessage(0)
    }
  }

  /**
   * Navigate to next preview message
   */
  previewNext(): void {
    if (this.mode !== 'preview') return
    if (this.previewIndex < this.previewMessages.length - 1) {
      this.previewIndex++
      this.showPreviewMessage(this.previewIndex)
    }
  }

  /**
   * Navigate to previous preview message
   */
  previewPrevious(): void {
    if (this.mode !== 'preview') return
    if (this.previewIndex > 0) {
      this.previewIndex--
      this.showPreviewMessage(this.previewIndex)
    }
  }

  /**
   * Get current preview state
   */
  getPreviewState(): { index: number; total: number } {
    return {
      index: this.previewIndex,
      total: this.previewMessages.length,
    }
  }

  /**
   * Get current mode
   */
  getMode(): SimulatorMode {
    return this.mode
  }

  // Private helpers

  private async initializeRuntimeState(agentId: string, agentName: string) {
    if (!this.agent) return
    const initialState = this.agent.getCurrentState()

    this.runtimeState = {
      currentState: initialState.state,
      currentMachine: initialState.machine,
      context: this.agent.getContext() || {},
      history: [],
      hasError: false,
      metadata: {
        agentId,
        name: agentName,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      }
    }

    // Reset thread and send initial message
    this.thread = []
    await this.sendInitialMessage()
  }

  /**
   * Send the initial message for the starting state
   */
  private async sendInitialMessage(): Promise<void> {
    if (!this.runtimeState) return

    // Generate the message for the initial state
    const response = await this.generateResponseMessage({} as ProcessResult)

    if (response) {
      const agentMsg: AgentMessage = {
        messageId: Date.now().toString(),
        sendTime: new Date().toISOString(),
        contentMessage: {
          text: response.type === 'text' ? response.content : undefined,
          richCard: response.type === 'richCard' || response.type === 'carousel' ? { /* TODO: better mapping */ } as any : undefined
        }
      }

      if (response.type === 'text') {
        agentMsg.contentMessage.text = response.content
        agentMsg.contentMessage.suggestions = response.suggestions?.map((s: any) => ({
          reply: { text: s.text, postbackData: s.action }
        }))
      }

      const agentEntry: ThreadEntry = { agentMessage: agentMsg }
      this.thread = [agentEntry]

      this.callbacks.onMessageSent?.(agentMsg)
      this.callbacks.onThreadChange?.(this.thread)
    }
  }

  private updateRuntimeStateFromResult(result: ProcessResult, userInput: string, previousState: string, response?: any) {
    if (!this.runtimeState || !this.agent) return

    const currentState = this.agent.getCurrentState()
    const context = this.agent.getContext() || {}

    // Add to history
    this.runtimeState.history.push({
      timestamp: new Date().toISOString(),
      fromState: previousState,
      toState: currentState.state,
      userInput,
    })

    // Trim history if needed
    if (this.runtimeState.history.length > this.config.maxHistorySize) {
      this.runtimeState.history = this.runtimeState.history.slice(-this.config.maxHistorySize)
    }

    this.runtimeState.currentState = currentState.state
    this.runtimeState.currentMachine = currentState.machine
    this.runtimeState.context = context
    this.runtimeState.metadata.lastUpdated = new Date().toISOString()
  }

  private handleInternalStateChange(event: StateChangeEvent) {
    // internal hook for CSM state changes
  }

  private handleError(error: any) {
    const err = error instanceof Error ? error : new Error(String(error))
    if (this.runtimeState) {
      this.runtimeState.hasError = true
      this.runtimeState.errorMessage = err.message
    }
    this.callbacks.onError?.(err)
  }

  private showPreviewMessage(index: number): void {
    const message = this.previewMessages[index]
    if (!message) return

    // Build thread with messages up to current index
    const thread: Thread = []
    for (let i = 0; i <= index; i++) {
      const msg = this.previewMessages[i]
      thread.push({
        agentMessage: {
          messageId: msg.id,
          sendTime: new Date().toISOString(),
          contentMessage: msg.content,
        }
      })
    }

    this.thread = thread
    this.callbacks.onThreadChange?.(this.thread)
  }

  // Message generation logic (simplified port from CSMRuntimeService)
  private async generateResponseMessage(result: ProcessResult) {
    if (!this.agentDefinition || !this.runtimeState) return undefined

    // Access definition to find message
    const flow = (this.agentDefinition.machine.flows as any).get
      ? (this.agentDefinition.machine.flows as any).get(this.runtimeState.currentMachine)
      : (this.agentDefinition.machine.flows as any)[this.runtimeState.currentMachine]
    const stateDef = flow?.states?.get
      ? flow.states.get(this.runtimeState.currentState)
      : flow?.states?.[this.runtimeState.currentState]

    // First try to get messageId from state metadata
    const messageId = (stateDef as any)?.meta?.custom?.rbx?.messageId ||
                      (stateDef as any)?.meta?.messageId

    if (messageId) {
      const resolvedMessage = this.messageResolver.resolveMessage(messageId)
      if (resolvedMessage) {
        const content = resolvedMessage.text || 'Rich Content'
        const processedContent = this.applyContextSubstitution(content, this.runtimeState.context)

        const suggestions = resolvedMessage.suggestions?.map((s: any) => ({
          text: s.reply?.text || s.action?.text || 'Option',
          action: s.reply?.postbackData || s.action?.postbackData || ''
        }))

        return {
          type: resolvedMessage.richCard ? 'richCard' : 'text',
          content: processedContent,
          suggestions
        }
      }
    }

    // Fall back to legacy embedded format
    if (!(stateDef as any)?.meta?.custom?.rbx?.messageDefinition) return undefined

    const rbxMsg = (stateDef as any).meta.custom.rbx.messageDefinition
    const content = rbxMsg.contentMessage?.text || 'Rich Content (preview not fully implemented)'

    // TODO: proper context substitution
    const processedContent = this.applyContextSubstitution(content, this.runtimeState.context)

    const suggestions = rbxMsg.suggestions?.map((s: any) => ({
      text: s.reply?.text || s.action?.text || 'Option',
      action: s.reply?.postbackData || s.action?.postbackData || ''
    }))

    return {
      type: rbxMsg.contentMessage?.richCard ? 'richCard' : 'text',
      content: processedContent,
      suggestions
    }
  }

  private applyContextSubstitution(text: string, context: Record<string, any>): string {
    let result = text || ''
    const variablePattern = /\{\{([^}]+)\}\}/g
    result = result.replace(variablePattern, (match, variable) => {
      const value = context[variable.trim()]
      return value !== undefined ? String(value) : match
    })
    return result
  }
}

// Re-export for backward compatibility
export type SimulatorState = SimulatorEngineState
export type SimulatorConfig = SimulatorEngineConfig
