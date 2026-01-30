import type { Agent } from '@rcs-lang/csm'
import type { RCXBundle } from '@rcs-lang/rcx'
import { SimulatorEngine, type SimulatorEngineConfig } from './simulator-engine.js'
import type { AgentContentMessage, AgentInfo, DisplaySettings, ExtractedMessage, SimulatorMode, Thread, UserInput } from './types.js'

/** State managed by SimulatorService */
export interface SimulatorServiceState {
  thread: Thread
  displaySettings: DisplaySettings
  agent: AgentInfo
  mode: SimulatorMode
  isReady: boolean
  error?: Error
}

/** Options for creating a SimulatorService */
export interface SimulatorServiceOptions {
  /** RCX bundle (preferred - includes CSM and messages) */
  bundle?: RCXBundle
  /** CSM agent definition for interactive mode */
  csm?: Agent
  /** Messages collection to pair with CSM */
  messages?: Record<string, AgentContentMessage>
  /** Extracted messages for preview mode */
  previewMessages?: ExtractedMessage[]
  /** Initial thread for static mode or seeding interactive mode */
  thread?: Thread
  /** Agent display name */
  agentName?: string
  /** Agent icon URL */
  agentIconUrl?: string
  /** Initial display settings */
  displaySettings?: Partial<DisplaySettings>
  /** Engine configuration */
  engineConfig?: SimulatorEngineConfig
}

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  isPortrait: true,
  isDarkMode: false,
  isAndroid: true,
}

const DEFAULT_AGENT_INFO: AgentInfo = {
  brandName: 'Agent',
  iconUrl: '/rbx-logo.svg',
}

/**
 * Framework-agnostic service for managing simulator state.
 * Compatible with useSyncExternalStore pattern.
 */
export class SimulatorService {
  private state: SimulatorServiceState
  private engine: SimulatorEngine | null = null
  private listeners = new Set<() => void>()

  constructor(options: SimulatorServiceOptions) {
    // Determine mode based on provided data sources
    let mode: SimulatorMode
    if (options.previewMessages && options.previewMessages.length > 0) {
      mode = 'preview'
    } else if (options.bundle || options.csm) {
      mode = 'interactive'
    } else {
      mode = 'static'
    }

    this.state = {
      thread: options.thread ?? [],
      displaySettings: { ...DEFAULT_DISPLAY_SETTINGS, ...options.displaySettings },
      agent: {
        brandName: options.agentName ?? options.bundle?.manifest.name ?? options.csm?.meta?.name ?? DEFAULT_AGENT_INFO.brandName,
        iconUrl: options.agentIconUrl ?? DEFAULT_AGENT_INFO.iconUrl,
      },
      mode,
      isReady: mode === 'static', // Static mode is immediately ready
      error: undefined,
    }

    // Initialize based on mode
    if (options.bundle) {
      this.initializeFromBundle(options.bundle, options.engineConfig)
    } else if (options.csm) {
      this.initializeEngine(options.csm, options.engineConfig, options.messages)
    } else if (options.previewMessages && options.previewMessages.length > 0) {
      this.initializePreviewMode(options.previewMessages, options.engineConfig)
    }
  }

  // ============================================
  // Observable pattern (useSyncExternalStore)
  // ============================================

  /**
   * Subscribe to state changes.
   * Returns an unsubscribe function.
   */
  subscribe = (onStoreChange: () => void): (() => void) => {
    this.listeners.add(onStoreChange)
    return () => {
      this.listeners.delete(onStoreChange)
    }
  }

  /**
   * Get current state snapshot.
   * Returns the same reference if state hasn't changed.
   */
  getSnapshot = (): SimulatorServiceState => {
    return this.state
  }

  // ============================================
  // Actions
  // ============================================

  /**
   * Send a message (interactive mode) or notify about user interaction (static mode)
   */
  sendMessage(input: UserInput): void {
    if (this.state.mode === 'interactive' && this.engine) {
      this.engine.sendMessage(input)
    }
    // In static mode, the consumer handles input via onUserInteraction prop
  }

  /**
   * Update display settings
   */
  setDisplaySettings(settings: Partial<DisplaySettings>): void {
    this.updateState({
      displaySettings: { ...this.state.displaySettings, ...settings },
    })
  }

  /**
   * Toggle portrait/landscape orientation
   */
  toggleOrientation(): void {
    this.setDisplaySettings({ isPortrait: !this.state.displaySettings.isPortrait })
  }

  /**
   * Toggle light/dark theme
   */
  toggleTheme(): void {
    this.setDisplaySettings({ isDarkMode: !this.state.displaySettings.isDarkMode })
  }

  /**
   * Toggle Android/iOS platform
   */
  togglePlatform(): void {
    this.setDisplaySettings({ isAndroid: !this.state.displaySettings.isAndroid })
  }

  /**
   * Replace the thread (useful for static mode or resetting)
   */
  setThread(thread: Thread): void {
    this.updateState({ thread })
  }

  /**
   * Update agent info
   */
  setAgentInfo(agent: Partial<AgentInfo>): void {
    this.updateState({
      agent: { ...this.state.agent, ...agent },
    })
  }

  /**
   * Load a new CSM agent (switches to interactive mode)
   */
  async loadAgent(csm: Agent, options?: { agentName?: string; messages?: Record<string, AgentContentMessage> }): Promise<{ success: boolean; errors: string[] }> {
    // Update mode and reset state
    this.updateState({
      mode: 'interactive',
      isReady: false,
      error: undefined,
      thread: [],
      agent: {
        ...this.state.agent,
        brandName: options?.agentName ?? csm.meta?.name ?? this.state.agent.brandName,
      },
    })

    return this.initializeEngine(csm, undefined, options?.messages)
  }

  /**
   * Load an RCX bundle (switches to interactive mode)
   */
  async loadBundle(bundle: RCXBundle, options?: { agentName?: string }): Promise<{ success: boolean; errors: string[] }> {
    this.updateState({
      mode: 'interactive',
      isReady: false,
      error: undefined,
      thread: [],
      agent: {
        ...this.state.agent,
        brandName: options?.agentName ?? bundle.manifest.name ?? this.state.agent.brandName,
      },
    })

    return this.initializeFromBundle(bundle)
  }

  /**
   * Navigate to next message in preview mode
   */
  previewNext(): void {
    if (this.state.mode !== 'preview' || !this.engine) return
    this.engine.previewNext()
  }

  /**
   * Navigate to previous message in preview mode
   */
  previewPrevious(): void {
    if (this.state.mode !== 'preview' || !this.engine) return
    this.engine.previewPrevious()
  }

  /**
   * Get preview state
   */
  getPreviewState(): { index: number; total: number } {
    if (!this.engine) return { index: 0, total: 0 }
    return this.engine.getPreviewState()
  }

  /**
   * Get the underlying engine (for advanced usage)
   */
  getEngine(): SimulatorEngine | null {
    return this.engine
  }

  // ============================================
  // Private methods
  // ============================================

  private async initializeFromBundle(
    bundle: RCXBundle,
    config?: SimulatorEngineConfig
  ): Promise<{ success: boolean; errors: string[] }> {
    this.engine = new SimulatorEngine(
      { debugMode: true, ...config },
      {
        onThreadChange: (thread) => {
          this.updateState({ thread })
        },
        onError: (error) => {
          this.updateState({ error, isReady: false })
        },
        onLoaded: () => {
          this.updateState({ isReady: true, error: undefined })
        },
      }
    )

    const result = await this.engine.loadBundle(bundle, {
      agentId: bundle.manifest.bundleId,
      agentName: this.state.agent.brandName,
    })

    if (!result.success) {
      this.updateState({
        error: new Error(result.errors.join(', ')),
        isReady: false,
      })
    }

    return result
  }

  private initializePreviewMode(
    messages: ExtractedMessage[],
    config?: SimulatorEngineConfig
  ): void {
    this.engine = new SimulatorEngine(
      { debugMode: true, ...config },
      {
        onThreadChange: (thread) => {
          this.updateState({ thread })
        },
        onError: (error) => {
          this.updateState({ error })
        },
      }
    )

    this.engine.loadPreviewMessages(messages)
    this.updateState({ isReady: true })
  }

  private async initializeEngine(
    csm: Agent,
    config?: SimulatorEngineConfig,
    messages?: Record<string, AgentContentMessage>
  ): Promise<{ success: boolean; errors: string[] }> {
    this.engine = new SimulatorEngine(
      { debugMode: true, ...config },
      {
        onThreadChange: (thread) => {
          this.updateState({ thread })
        },
        onError: (error) => {
          this.updateState({ error, isReady: false })
        },
        onLoaded: () => {
          this.updateState({ isReady: true, error: undefined })
        },
      }
    )

    const result = await this.engine.loadAgent(csm, {
      agentId: csm.id,
      agentName: this.state.agent.brandName,
      messages,
    })

    if (!result.success) {
      this.updateState({
        error: new Error(result.errors.join(', ')),
        isReady: false,
      })
    }

    return result
  }

  private updateState(partial: Partial<SimulatorServiceState>): void {
    this.state = { ...this.state, ...partial }
    this.notifyListeners()
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener()
    }
  }
}
