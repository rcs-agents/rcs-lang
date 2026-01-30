/**
 * @rcs-lang/rcx - RBX (RCX) Bundle Format and Tools
 *
 * This package provides the specifications and tools for working with the RCX format,
 * which is the standard bundle format for RCS conversational agents.
 *
 * It includes:
 * - Type definitions for the RCX Bundle (RCXBundle, RCXManifest, etc.)
 * - Diagram definitions compatible with React Flow
 * - RCXBuilder service for converting visual diagrams to executable agents
 */

// Export all types
export * from './types.js'
export * from './diagram.js'

// Export Builder service and helper functions
export {
  RCXBuilder,
  type RCXBuilderOptions,
  type BuildResult,
  type ImportResult,
  buildAgentBundle,
  importAgentBundle,
} from './builder.js'
