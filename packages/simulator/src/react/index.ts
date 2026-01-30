// ===========================================
// Main exports
// ===========================================

// Unified Simulator component
export { Simulator } from './components/simulator.js'
export type { SimulatorProps } from './components/simulator.js'

// Hook for advanced usage
export { useSimulator } from './use-simulator.js'
export type { UseSimulatorProps, SimulatorApi } from './use-simulator.js'

// Controls component (for custom layouts)
export { SimulatorControls } from './components/simulator-controls.js'
export type { SimulatorControlsProps } from './components/simulator-controls.js'

// Preview controls component (for preview mode navigation)
export { PreviewControls } from './components/PreviewControls.js'
export type { PreviewControlsProps } from './components/PreviewControls.js'

// ===========================================
// Re-export core types
// ===========================================

export type {
  Thread,
  ThreadEntry,
  UserMessage,
  UserInput,
  DisplaySettings,
  AgentInfo,
  SimulatorMode,
} from '../core/types.js'

// Engine exports (for advanced usage)
export { SimulatorEngine } from '../core/simulator-engine.js'
export type {
  SimulatorEngineState,
  SimulatorEngineConfig,
  SimulatorEngineCallbacks,
} from '../core/simulator-engine.js'

// Service exports (for framework-agnostic usage)
export { SimulatorService } from '../core/simulator-service.js'
export type {
  SimulatorServiceState,
  SimulatorServiceOptions,
} from '../core/simulator-service.js'
