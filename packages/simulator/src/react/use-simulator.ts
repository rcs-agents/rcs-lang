import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import type { Agent } from '@rcs-lang/csm'
import type { RCXBundle } from '@rcs-lang/rcx'
import {
  SimulatorService,
  type SimulatorServiceOptions,
  type SimulatorServiceState,
} from '../core/simulator-service.js'
import type { AgentContentMessage, AgentInfo, DisplaySettings, ExtractedMessage, Thread, UserInput } from '../core/types.js'

/** Props for creating a simulator */
export interface UseSimulatorProps {
  /** RCX bundle (preferred - includes CSM and messages) */
  bundle?: RCXBundle
  /** CSM agent definition for interactive mode */
  csm?: Agent
  /** Messages collection to pair with CSM */
  messages?: Record<string, AgentContentMessage>
  /** Extracted messages for preview mode */
  previewMessages?: ExtractedMessage[]
  /** Static thread data for display-only mode */
  thread?: Thread
  /** Agent display name (overrides CSM/bundle name) */
  agentName?: string
  /** Agent icon URL */
  agentIconUrl?: string
  /** Initial display settings */
  initialDisplaySettings?: Partial<DisplaySettings>
  /** Callback when user sends a message or taps a suggestion */
  onUserInteraction?: (input: UserInput) => void
}

/** API returned by useSimulator */
export interface SimulatorApi extends SimulatorServiceState {
  // Actions
  sendMessage: (input: UserInput) => void
  setDisplaySettings: (settings: Partial<DisplaySettings>) => void
  toggleOrientation: () => void
  toggleTheme: () => void
  togglePlatform: () => void
  setThread: (thread: Thread) => void
  setAgentInfo: (agent: Partial<AgentInfo>) => void
  loadAgent: (csm: Agent, options?: { agentName?: string }) => Promise<{ success: boolean; errors: string[] }>
  // Preview mode navigation
  previewNext: () => void
  previewPrevious: () => void
  previewIndex: number
  previewTotal: number
  // Service access
  service: SimulatorService
}

/**
 * React hook for managing simulator state.
 * Uses useSyncExternalStore for efficient React integration.
 */
export function useSimulator(props: UseSimulatorProps): SimulatorApi {
  const {
    bundle,
    csm,
    messages,
    previewMessages,
    thread,
    agentName,
    agentIconUrl,
    initialDisplaySettings,
    onUserInteraction,
  } = props

  // Create service once
  const serviceRef = useRef<SimulatorService | null>(null)
  if (!serviceRef.current) {
    serviceRef.current = new SimulatorService({
      bundle,
      csm,
      messages,
      previewMessages,
      thread,
      agentName,
      agentIconUrl,
      displaySettings: initialDisplaySettings,
    })
  }

  const service = serviceRef.current

  // Subscribe to state changes
  const state = useSyncExternalStore(
    service.subscribe,
    service.getSnapshot,
    service.getSnapshot // Server snapshot (same as client for this use case)
  )

  // Handle CSM changes - reload agent if csm prop changes
  const previousCsmRef = useRef(csm)
  useEffect(() => {
    if (csm && csm !== previousCsmRef.current) {
      previousCsmRef.current = csm
      service.loadAgent(csm, { agentName })
    }
  }, [csm, agentName, service])

  // Handle thread changes in static mode
  useEffect(() => {
    if (state.mode === 'static' && thread) {
      service.setThread(thread)
    }
  }, [thread, state.mode, service])

  // Wrap sendMessage to also call onUserInteraction
  const sendMessage = useCallback(
    (input: UserInput) => {
      service.sendMessage(input)
      onUserInteraction?.(input)
    },
    [service, onUserInteraction]
  )

  // Memoize action methods
  const setDisplaySettings = useCallback(
    (settings: Partial<DisplaySettings>) => service.setDisplaySettings(settings),
    [service]
  )

  const toggleOrientation = useCallback(() => service.toggleOrientation(), [service])
  const toggleTheme = useCallback(() => service.toggleTheme(), [service])
  const togglePlatform = useCallback(() => service.togglePlatform(), [service])

  const setThread = useCallback((t: Thread) => service.setThread(t), [service])
  const setAgentInfo = useCallback(
    (agent: Partial<AgentInfo>) => service.setAgentInfo(agent),
    [service]
  )

  const loadAgent = useCallback(
    (newCsm: Agent, options?: { agentName?: string }) => service.loadAgent(newCsm, options),
    [service]
  )

  const previewNext = useCallback(() => service.previewNext(), [service])
  const previewPrevious = useCallback(() => service.previewPrevious(), [service])

  // Get preview state
  const previewState = service.getPreviewState()

  return {
    // State
    ...state,
    // Actions
    sendMessage,
    setDisplaySettings,
    toggleOrientation,
    toggleTheme,
    togglePlatform,
    setThread,
    setAgentInfo,
    loadAgent,
    // Preview mode navigation
    previewNext,
    previewPrevious,
    previewIndex: previewState.index,
    previewTotal: previewState.total,
    // Service access
    service,
  }
}
