/**
 * @fileoverview RCXBuilder Service for Diagram to Agent Conversion
 *
 * This service handles the core conversion from visual diagram nodes/edges to executable Agent format.
 * It extracts messages from nodes, builds CSM states and transitions, and packages everything
 * into a unified RCXBundle structure.
 *
 * @module RCXBuilder
 */

import type {
  Agent,
  AgentId,
  Context,
  Flow,
  FlowId,
  FlowTarget,
  Machine,
  MachineId,
  Metadata,
  SetOperation,
  State,
  StateId,
  StateTarget,
  TerminalTarget,
  Transition,
} from '@rcs-lang/csm'
import type { AgentContentMessage } from '@rcs-lang/types'
import type {
  ReactFlowDiagramData,
  ReactFlowEdge,
  ReactFlowEdgeData,
  ReactFlowNode,
  ReactFlowNodeData,
} from './diagram.js'
import type {
  DiagramEdge,
  DiagramNode,
  EdgeData,
  MessageCategory,
  NodeData,
  Position,
  RCXAgentConfig,
  RCXAssetsManifest,
  RCXBundle,
  RCXConversationStateMachine,
  RCXDiagramDefinition,
  RCXManifest,
  RCXMessage,
  RCXMessagesCollection,
} from './types.js'

/**
 * Configuration options for the RCXBuilder
 */
export interface RCXBuilderOptions {
  /** Bundle identifier */
  bundleId?: string
  /** Agent name */
  name?: string
  /** Agent description */
  description?: string
  /** Bundle version */
  version?: string
  /** Default locale */
  locale?: string
  /** Enable validation during build */
  enableValidation?: boolean
}

/**
 * Result of the agent building process
 */
export interface BuildResult {
  /** Whether the build was successful */
  success: boolean
  /** Built RCX bundle (if successful) */
  bundle?: RCXBundle
  /** Error message (if failed) */
  error?: string
  /** Validation warnings */
  warnings?: string[]
}

/**
 * Result of the agent import process
 */
export interface ImportResult {
  /** Whether the import was successful */
  success: boolean
  /** Imported ReactFlow diagram data (if successful) */
  diagramData?: ReactFlowDiagramData
  /** Error message (if failed) */
  error?: string
  /** Import warnings */
  warnings?: string[]
}

/**
 * RCXBuilder class for converting visual diagrams to executable Agent format
 */
export class RCXBuilder {
  private options: Required<RCXBuilderOptions>

  constructor(options: RCXBuilderOptions = {}) {
    this.options = {
      bundleId: options.bundleId || this.generateBundleId(),
      name: options.name || 'Untitled Agent',
      description: options.description || 'Agent generated from diagram',
      version: options.version || '1.0.0',
      locale: options.locale || 'en-US',
      enableValidation: options.enableValidation ?? true,
    }
  }

  /**
   * Main method to convert ReactFlow diagram to RCXBundle
   */
  public buildBundle(diagramData: ReactFlowDiagramData): BuildResult {
    try {
      const warnings: string[] = []

      // Step 1: Extract and validate diagram data
      const { nodes, edges } = diagramData
      if (!nodes || nodes.length === 0) {
        return {
          success: false,
          error: 'No nodes found in diagram data',
        }
      }

      // Step 2: Convert ReactFlow nodes/edges to RCX diagram format
      const rcxDiagram = this.convertToRCXDiagram(diagramData)

      // Step 3: Extract messages from nodes
      const messagesCollection = this.extractMessages(nodes)

      // Step 4: Build CSM states and transitions
      const csm = this.buildCSM(nodes, edges)

      // Step 5: Create agent configuration
      const agentConfig = this.createAgentConfig()

      // Step 6: Create assets manifest (empty for now)
      const assetsManifest = this.createAssetsManifest()

      // Step 7: Create manifest
      const manifest = this.createManifest()

      // Step 8: Package into unified bundle
      const bundle: RCXBundle = {
        manifest,
        agent: agentConfig,
        csm,
        messages: messagesCollection,
        diagram: rcxDiagram,
        assets: assetsManifest,
      }

      // Step 9: Validate if enabled
      if (this.options.enableValidation) {
        const validationResult = this.validateBundle(bundle)
        warnings.push(...validationResult.warnings)

        if (!validationResult.valid) {
          return {
            success: false,
            error: `Bundle validation failed: ${validationResult.error}`,
            warnings,
          }
        }
      }

      return {
        success: true,
        bundle,
        warnings,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Main method to convert RCXBundle back to ReactFlow diagram format
   */
  public importBundle(bundle: RCXBundle): ImportResult {
    try {
      const warnings: string[] = []

      // Step 1: Validate bundle structure - only diagram is absolutely required
      if (!bundle || !bundle.diagram) {
        return {
          success: false,
          error: 'Invalid bundle: missing diagram data',
        }
      }

      // Step 2: Validate bundle if enabled
      if (this.options.enableValidation) {
        const validationResult = this.validateBundle(bundle)
        warnings.push(...validationResult.warnings)

        if (!validationResult.valid) {
          return {
            success: false,
            error: `Bundle validation failed: ${validationResult.error}`,
            warnings,
          }
        }
      }

      // Step 3: Convert RCX diagram to ReactFlow format
      const diagramData = this.convertRCXDiagramToReactFlow(bundle.diagram)

      // Step 4: Enrich nodes with message data
      this.enrichNodesWithMessages(diagramData.nodes, bundle.messages)

      // Step 5: Enrich edges with CSM transition data
      this.enrichEdgesWithCSMData(diagramData.edges, bundle.csm)

      // Step 6: Apply asset references if available
      this.applyAssetReferences(diagramData.nodes, bundle.assets)

      return {
        success: true,
        diagramData,
        warnings,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during import',
      }
    }
  }

  /**
   * Convert ReactFlow diagram data to RCX diagram format
   */
  private convertToRCXDiagram(diagramData: ReactFlowDiagramData): RCXDiagramDefinition {
    return {
      $schema: 'https://schemas.rcs-lang.org/rcx/diagram.schema.json',
      version: '1.0.0',
      nodes: diagramData.nodes.map((node) => this.convertReactFlowNodeToRCX(node)),
      edges: diagramData.edges.map((edge) => this.convertReactFlowEdgeToRCX(edge)),
      viewport: diagramData.viewport
        ? {
            x: diagramData.viewport.x,
            y: diagramData.viewport.y,
            zoom: diagramData.viewport.zoom,
          }
        : undefined,
      metadata: {
        name: this.options.name,
        description: 'Diagram generated from ReactFlow',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      settings: {
        layout: {
          direction: 'TB',
          autoLayout: false,
        },
        grid: {
          enabled: true,
          size: 20,
          snapToGrid: true,
        },
        interaction: {
          nodesDraggable: true,
          nodesConnectable: true,
          elementsSelectable: true,
        },
      },
    }
  }

  /**
   * Convert ReactFlow node to RCX diagram node
   */
  private convertReactFlowNodeToRCX(reactFlowNode: ReactFlowNode): DiagramNode {
    const nodeType = this.mapReactFlowNodeTypeToRCX(reactFlowNode.type)

    return {
      id: reactFlowNode.id,
      type: nodeType,
      position: reactFlowNode.position,
      data: this.convertReactFlowNodeDataToRCX(reactFlowNode.data, nodeType),
      style: reactFlowNode.style
        ? {
            width: reactFlowNode.width,
            height: reactFlowNode.height,
            ...reactFlowNode.style,
          }
        : undefined,
      selected: reactFlowNode.selected,
      dragging: reactFlowNode.dragging,
      hidden: reactFlowNode.hidden,
    }
  }

  /**
   * Convert ReactFlow edge to RCX diagram edge
   */
  private convertReactFlowEdgeToRCX(reactFlowEdge: ReactFlowEdge): DiagramEdge {
    return {
      id: reactFlowEdge.id,
      source: reactFlowEdge.source,
      target: reactFlowEdge.target,
      sourceHandle: reactFlowEdge.sourceHandle,
      targetHandle: reactFlowEdge.targetHandle,
      type: this.mapReactFlowEdgeTypeToRCX(reactFlowEdge.type),
      data: this.convertReactFlowEdgeDataToRCX(reactFlowEdge.data),
      style: reactFlowEdge.style,
      animated: reactFlowEdge.animated,
      selected: reactFlowEdge.selectable,
      hidden: reactFlowEdge.hidden,
    }
  }

  /**
   * Map ReactFlow node types to RCX node types
   */
  private mapReactFlowNodeTypeToRCX(reactFlowType: string): DiagramNode['type'] {
    const typeMap: Record<string, DiagramNode['type']> = {
      experience: 'flow',
      journey: 'flow',
      flow: 'flow',
      message: 'textMessage',
      start: 'flow',
      end: 'terminator',
    }

    return typeMap[reactFlowType] || 'flow'
  }

  /**
   * Map ReactFlow edge types to RCX edge types
   */
  private mapReactFlowEdgeTypeToRCX(reactFlowType?: string): DiagramEdge['type'] {
    const typeMap: Record<string, DiagramEdge['type']> = {
      transition: 'default',
      flowInvocation: 'default',
      error: 'default',
      default: 'default',
    }

    return typeMap[reactFlowType || 'default'] || 'default'
  }

  /**
   * Check if a value is a valid JSON value
   */
  private isJsonValue(value: unknown): value is import('@rcs-lang/csm').Context[string] {
    return (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      (Array.isArray(value) && value.every((v) => this.isJsonValue(v))) ||
      (typeof value === 'object' && value !== null && Object.values(value).every((v) => this.isJsonValue(v)))
    )
  }

  /**
   * Convert ReactFlow node data to RCX node data
   */
  private convertReactFlowNodeDataToRCX(reactFlowData: ReactFlowNodeData, nodeType: DiagramNode['type']): NodeData {
    return {
      label: reactFlowData.label || reactFlowData.name,
      description: reactFlowData.description,
      messageId: reactFlowData.messageId,
      stateId: reactFlowData.flowId || reactFlowData.experienceId,
      flowId: reactFlowData.flowId,
    }
  }

  /**
   * Convert ReactFlow edge data to RCX edge data
   */
  private convertReactFlowEdgeDataToRCX(reactFlowData?: ReactFlowEdgeData): EdgeData {
    if (!reactFlowData) return {}

    return {
      label: reactFlowData.label || reactFlowData.suggestionText,
      condition: reactFlowData.condition?.expression || reactFlowData.conditionExpression,
      priority: reactFlowData.priority === 'high' ? 1 : reactFlowData.priority === 'low' ? 3 : 2,
    }
  }

  /**
   * Extract messages from diagram nodes
   */
  private extractMessages(nodes: ReactFlowNode[]): RCXMessagesCollection {
    const messages: Record<string, RCXMessage> = {}

    for (const node of nodes) {
      if (this.isMessageNode(node)) {
        // Use node.id directly without msg_ prefix for consistency with tests
        const messageId = node.data.messageId || node.id
        const message = this.createMessageFromNode(node, messageId)
        messages[messageId] = message
      }
    }

    return {
      $schema: 'https://schemas.rcs-lang.org/rcx/messages.schema.json',
      version: '1.0.0',
      messages,
      localization: {
        defaultLocale: this.options.locale,
        supportedLocales: [this.options.locale],
        fallbackLocale: 'en-US',
      },
    }
  }

  /**
   * Check if a node represents a message
   */
  private isMessageNode(node: ReactFlowNode): boolean {
    return (
      node.type === 'textMessage' ||
      node.type === 'richCardMessage' ||
      node.type === 'carouselMessage' ||
      node.type === 'otpMessage' ||
      node.type === 'pdfMessage' ||
      (node.data.text !== undefined && typeof node.data.text === 'string' && node.data.text.length > 0) ||
      node.data.messageType !== undefined
    )
  }

  /**
   * Create an RCX message from a diagram node
   */
  private createMessageFromNode(node: ReactFlowNode, messageId: string): RCXMessage {
    // Extract text from standardized DiagramNodeData structure
    const messageText =
      node.data.text ||
      node.data.title ||
      node.data.cards?.[0]?.title ||
      node.data.label ||
      node.data.name ||
      'Message content'

    const baseMessage: AgentContentMessage = {
      text: messageText,
      // Note: fallback property handled by RCX extensions
    }

    // Add suggestions if available
    if (node.data.suggestions && node.data.suggestions.length > 0) {
      baseMessage.suggestions = node.data.suggestions.map((suggestion) => ({
        reply: {
          text: suggestion.text,
          postbackData: suggestion.id as any, // Cast to PostbackData branded type
        },
      }))
    }

    return {
      ...baseMessage,
      rcxExtensions: {
        metadata: {
          id: messageId,
          name: node.data.name || node.data.label,
          description: node.data.description,
          category: this.inferMessageCategory(node),
          locale: this.options.locale,
        },
        personalization: {
          enableVariableSubstitution: true,
          variables: [],
        },
        timing: {
          delay: 0,
          typingIndicator: {
            enabled: true,
            duration: 1000,
          },
        },
        analytics: {
          trackDelivery: true,
          trackReads: true,
          trackInteractions: true,
        },
      },
    }
  }

  /**
   * Infer message category from node data
   */
  private inferMessageCategory(node: ReactFlowNode): MessageCategory {
    const text = node.data.text?.toLowerCase() || ''
    const name = node.data.name?.toLowerCase() || ''

    if (text.includes('hello') || text.includes('welcome') || name.includes('welcome')) {
      return 'greeting'
    }
    if (text.includes('?') || name.includes('question')) {
      return 'question'
    }
    if (text.includes('error') || text.includes('sorry') || name.includes('error')) {
      return 'error'
    }
    if (text.includes('confirm') || name.includes('confirm')) {
      return 'confirmation'
    }
    if (text.includes('goodbye') || text.includes('bye') || name.includes('closure')) {
      return 'closure'
    }

    return 'response'
  }

  /**
   * Build CSM (Conversation State Machine) from nodes and edges
   */
  private buildCSM(nodes: ReactFlowNode[], edges: ReactFlowEdge[]): RCXConversationStateMachine {
    const agentId: AgentId = `agent_${this.options.bundleId}`
    const machineId: MachineId = `machine_${this.options.bundleId}`
    const flowId: FlowId = `flow_main`

    // Find start node - use first flow node or the first node
    const startNode =
      nodes.find(
        (node) =>
          node.type === 'flow' ||
          node.data.name?.toLowerCase().includes('start') ||
          node.data.label?.toLowerCase().includes('start')
      ) || nodes[0]

    // Create states from nodes and organize transitions
    const statesMap = new Map<StateId, State>()
    const stateTransitions = new Map<StateId, Transition[]>()

    // Initialize states - exclude nodes that are marked as terminal/end nodes by name
    for (const node of nodes) {
      const isEndNode =
        node.data.name?.toLowerCase().includes('end') ||
        node.data.label?.toLowerCase().includes('end') ||
        node.data.name?.toLowerCase().includes('terminal')
      if (!isEndNode) {
        const stateId = node.id as StateId
        stateTransitions.set(stateId, [])
      }
    }

    // Create transitions from edges and group by source state
    for (const edge of edges) {
      const transition = this.createTransitionFromEdge(edge, nodes)
      if (transition) {
        const sourceStateId = edge.source as StateId
        const existingTransitions = stateTransitions.get(sourceStateId) || []
        existingTransitions.push(transition)
        stateTransitions.set(sourceStateId, existingTransitions)
      }
    }

    // Create states with their transitions
    for (const node of nodes) {
      const isEndNode =
        node.data.name?.toLowerCase().includes('end') ||
        node.data.label?.toLowerCase().includes('end') ||
        node.data.name?.toLowerCase().includes('terminal')
      if (!isEndNode) {
        const state = this.createStateFromNode(node, stateTransitions.get(node.id as StateId) || [])
        statesMap.set(state.id, state)
      }
    }

    // Build flow
    const flow: Flow = {
      id: flowId,
      initial: startNode.id,
      states: statesMap,
      meta: {
        name: 'Main Flow',
        description: 'Primary conversation flow',
      },
    }

    // Build machine
    const machine: Machine = {
      id: machineId,
      initialFlow: flowId,
      flows: new Map([[flowId, flow]]),
      meta: {
        name: 'Main Machine',
        description: 'Primary conversation machine',
      },
    }

    // Build agent
    const agent: Agent = {
      id: agentId,
      machine: machine,
      meta: {
        name: this.options.name,
        description: this.options.description,
        version: this.options.version,
      },
    }

    // Convert CSM to serializable format for RCXBundle
    const serializableCSM: RCXConversationStateMachine = {
      ...agent,
      // Convert Maps to plain objects for serialization
      flows: Array.from(agent.machine.flows.entries()).map(([flowId, flow]) => ({
        id: flowId,
        initial: flow.initial,
        states: Array.from(flow.states.entries()).map(([stateId, state]) => ({
          id: stateId,
          transitions: state.transitions,
          meta: state.meta,
        })),
        meta: flow.meta,
      })),
      rcxExtensions: {
        validation: {
          strict: true,
          validateMessages: true,
          validateTransitions: true,
          allowUnreachableStates: false,
        },
        execution: {
          timeout: 30000,
          maxDepth: 10,
          enableDebug: false,
          enableTracing: true,
        },
        analytics: {
          trackTransitions: true,
          trackMessages: true,
          trackContext: true,
        },
        security: {
          enableInputSanitization: true,
          enableOutputSanitization: true,
          enableRateLimiting: true,
          maxMessagesPerMinute: 60,
        },
        performance: {
          enableCaching: true,
          cacheTimeout: 300000,
          enablePreloading: false,
          maxConcurrentSessions: 100,
        },
      },
    }

    return serializableCSM
  }

  /**
   * Create a CSM state from a diagram node
   */
  private createStateFromNode(node: ReactFlowNode, transitions: Transition[] = []): State {
    const stateId: StateId = node.id as StateId
    // Use node.id directly without msg_ prefix for consistency
    const messageId = node.data.messageId || (this.isMessageNode(node) ? node.id : undefined)

    return {
      id: stateId,
      transitions,
      meta: {
        name: node.data.name || node.data.label,
        description: node.data.description,
        messageId,
        transient: node.type === 'flow' && !messageId,
      },
    }
  }

  /**
   * Create a CSM transition from a diagram edge
   */
  private createTransitionFromEdge(edge: ReactFlowEdge, nodes: ReactFlowNode[]): Transition | null {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    const targetNode = nodes.find((n) => n.id === edge.target)

    if (!sourceNode || !targetNode) {
      return null
    }

    // Determine target type based on target node
    let target: StateTarget | FlowTarget | TerminalTarget

    const isEndNode =
      targetNode.data.name?.toLowerCase().includes('end') ||
      targetNode.data.label?.toLowerCase().includes('end') ||
      targetNode.data.name?.toLowerCase().includes('terminal')
    if (isEndNode) {
      target = {
        type: 'terminal',
      }
    } else if (targetNode.data.flowId && targetNode.data.flowId !== edge.source) {
      target = {
        type: 'flow',
        flowId: targetNode.data.flowId,
      }
    } else {
      target = {
        type: 'state',
        stateId: edge.target,
      }
    }

    const transition: Transition = {
      id: edge.id,
      pattern: edge.data?.suggestionText || edge.data?.label || 'user_input',
      target,
      meta: {
        name: edge.data?.label,
        description: `Transition from ${sourceNode.data.name || sourceNode.id} to ${
          targetNode.data.name || targetNode.id
        }`,
      },
      condition:
        edge.data?.condition && typeof edge.data.condition === 'string'
          ? {
              type: 'code',
              expression: edge.data.condition,
            }
          : undefined,
      operations: [],
    }

    // Add context operations if specified
    if (edge.data?.variables) {
      const operations: SetOperation[] = []
      for (const [key, value] of Object.entries(edge.data.variables)) {
        if (this.isJsonValue(value)) {
          const operation: SetOperation = {
            type: 'set',
            variable: key,
            value,
          }
          operations.push(operation)
        }
      }
      // Create new transition with operations since operations is readonly
      return {
        ...transition,
        operations,
      }
    }

    return transition
  }

  /**
   * Create agent configuration
   */
  private createAgentConfig(): RCXAgentConfig {
    return {
      displayName: this.options.name,
      description: this.options.description,
      logoUri: 'https://example.com/logo.png' as any, // Cast to Url branded type
      heroUri: 'https://example.com/hero.png' as any, // Cast to Url branded type
      phoneNumbers: [],
      emails: [],
      privacy: {
        uri: 'https://example.com/privacy' as any,
        label: 'Privacy Policy',
      },
      termsConditions: {
        uri: 'https://example.com/terms' as any,
        label: 'Terms and Conditions',
      },
      color: '#1976d2' as any, // Cast to HexColor branded type
      billingConfig: {
        billingCategory: 'CONVERSATIONAL',
      },
      hostingRegion: 'NORTH_AMERICA',
      rcxExtensions: {
        capabilities: {
          supportsFallback: true,
          supportsFileUpload: false,
          supportsLocationSharing: false,
          maxSessionDuration: 3600,
          sessionTimeout: 1800,
        },
        brandConfiguration: {
          theme: {
            primaryColor: '#1976d2',
            secondaryColor: '#dc004e',
            backgroundColor: '#ffffff',
            textColor: '#000000',
          },
        },
        configuration: {
          defaultLanguage: this.options.locale.split('-')[0],
          supportedLanguages: [this.options.locale.split('-')[0]],
          timezone: 'UTC',
          fallbackBehavior: {
            strategy: 'escalate',
            maxRetries: 3,
          },
        },
      },
    }
  }

  /**
   * Create assets manifest
   */
  private createAssetsManifest(): RCXAssetsManifest {
    return {
      $schema: 'https://schemas.rcs-lang.org/rcx/assets.schema.json',
      version: '1.0.0',
      assets: {},
      optimization: {
        images: {
          quality: 85,
          formats: ['webp', 'jpeg', 'png'],
        },
        compression: {
          enabled: true,
          algorithm: 'gzip',
          level: 6,
        },
      },
    }
  }

  /**
   * Create bundle manifest
   */
  private createManifest(): RCXManifest {
    const timestamp = new Date().toISOString()

    return {
      $schema: 'https://schemas.rcs-lang.org/rcx/manifest.schema.json',
      rcxVersion: '1.0.0',
      bundleId: this.options.bundleId,
      name: this.options.name,
      description: this.options.description,
      version: this.options.version,
      createdAt: timestamp,
      updatedAt: timestamp,
      agent: 'agent.json',
      csm: 'csm.json',
      messages: 'messages.json',
      diagram: 'diagram.json',
      assets: 'assets.json',
      metadata: {
        author: 'RCX Agent Engine',
        organization: 'RCX Platform',
        license: 'MIT',
        tags: ['generated', 'diagram'],
        categories: ['customer-service'],
        locale: this.options.locale,
        supportedLocales: [this.options.locale],
      },
    }
  }

  /**
   * Validate the built bundle
   */
  private validateBundle(bundle: RCXBundle): { valid: boolean; error?: string; warnings: string[] } {
    const warnings: string[] = []

    // Basic validation checks
    if (!bundle.manifest?.bundleId) {
      return { valid: false, error: 'Bundle ID is required', warnings: [] }
    }

    if (!bundle.agent?.displayName) {
      warnings.push('Agent display name is missing')
    }

    if (!bundle.csm?.id) {
      warnings.push('CSM agent ID is missing')
    }

    if (!bundle.messages?.messages || Object.keys(bundle.messages.messages).length === 0) {
      warnings.push('No messages found in bundle')
    }

    if (bundle.diagram.nodes.length === 0) {
      return { valid: false, error: 'Diagram must contain at least one node', warnings: [] }
    }

    // Check for orphaned nodes (nodes with no connections)
    const connectedNodes = new Set([
      ...bundle.diagram.edges.map((e) => e.source),
      ...bundle.diagram.edges.map((e) => e.target),
    ])

    const orphanedNodes = bundle.diagram.nodes.filter(
      (node) => !connectedNodes.has(node.id) && bundle.diagram.nodes.length > 1
    )

    if (orphanedNodes.length > 0) {
      warnings.push(`Found ${orphanedNodes.length} orphaned nodes: ${orphanedNodes.map((n) => n.id).join(', ')}`)
    }

    return { valid: true, warnings }
  }

  /**
   * Convert RCX diagram to ReactFlow diagram data
   */
  private convertRCXDiagramToReactFlow(rcxDiagram: RCXDiagramDefinition): ReactFlowDiagramData {
    return {
      nodes: rcxDiagram.nodes.map((node) => this.convertRCXNodeToReactFlow(node)),
      edges: rcxDiagram.edges.map((edge) => this.convertRCXEdgeToReactFlow(edge)),
      viewport: rcxDiagram.viewport
        ? {
            x: rcxDiagram.viewport.x ?? 0,
            y: rcxDiagram.viewport.y ?? 0,
            zoom: rcxDiagram.viewport.zoom ?? 1,
          }
        : {
            x: 0,
            y: 0,
            zoom: 1,
          },
    }
  }

  /**
   * Convert RCX diagram node to ReactFlow node
   */
  private convertRCXNodeToReactFlow(rcxNode: DiagramNode): ReactFlowNode {
    const reactFlowType = this.mapRCXNodeTypeToReactFlow(rcxNode.type)

    return {
      id: rcxNode.id,
      type: reactFlowType,
      position: rcxNode.position,
      data: this.convertRCXNodeDataToReactFlow(rcxNode.data ?? {}, rcxNode.type),
      style: rcxNode.style
        ? {
            ...rcxNode.style,
            width: rcxNode.style.width,
            height: rcxNode.style.height,
          }
        : undefined,
      width: rcxNode.style?.width,
      height: rcxNode.style?.height,
      selected: rcxNode.selected || false,
      dragging: rcxNode.dragging || false,
      hidden: rcxNode.hidden || false,
    }
  }

  /**
   * Convert RCX diagram edge to ReactFlow edge
   */
  private convertRCXEdgeToReactFlow(rcxEdge: DiagramEdge): ReactFlowEdge {
    return {
      id: rcxEdge.id,
      source: rcxEdge.source,
      target: rcxEdge.target,
      sourceHandle: rcxEdge.sourceHandle,
      targetHandle: rcxEdge.targetHandle,
      type: this.mapRCXEdgeTypeToReactFlow(rcxEdge.type),
      data: this.convertRCXEdgeDataToReactFlow(rcxEdge.data ?? {}),
      style: rcxEdge.style,
      animated: rcxEdge.animated || false,
      selectable: rcxEdge.selected || true,
      hidden: rcxEdge.hidden || false,
    }
  }

  /**
   * Map RCX node types to ReactFlow node types
   */
  private mapRCXNodeTypeToReactFlow(rcxType: DiagramNode['type']): ReactFlowNode['type'] {
    const typeMap: Record<string, ReactFlowNode['type']> = {
      flow: 'flow',
      textMessage: 'textMessage',
      richCard: 'richCardMessage',
      carousel: 'carouselMessage',
      otp: 'otpMessage',
      pdf: 'pdfMessage',
      condition: 'flow',
      delay: 'flow',
      webhook: 'flow',
      escalation: 'flow',
      subflow: 'flow',
    }

    const mappedType = typeMap[rcxType]
    if (!mappedType) {
      throw new Error(`Invalid RCX node type: '${rcxType}'. Valid types are: ${Object.keys(typeMap).join(', ')}`)
    }
    return mappedType
  }

  /**
   * Map RCX edge types to ReactFlow edge types
   */
  private mapRCXEdgeTypeToReactFlow(rcxType: DiagramEdge['type']): ReactFlowEdge['type'] {
    // Simplified mapping - just return 'transition' for all RCX edge types
    return 'transition'
  }

  /**
   * Convert RCX node data to ReactFlow node data
   */
  private convertRCXNodeDataToReactFlow(rcxData: NodeData, nodeType: DiagramNode['type']): ReactFlowNodeData {
    return {
      label: rcxData.label,
      name: rcxData.label,
      description: rcxData.description,
      messageId: rcxData.messageId,
      flowId: rcxData.flowId,
      experienceId: rcxData.stateId,
      // Initialize other fields as needed
      text: '', // Will be enriched from messages
      suggestions: [], // Will be enriched from messages
      messageType: this.mapNodeTypeToMessageType(nodeType),
    }
  }

  /**
   * Convert RCX edge data to ReactFlow edge data
   */
  private convertRCXEdgeDataToReactFlow(rcxData: EdgeData): ReactFlowEdgeData {
    return {
      label: rcxData.label,
      suggestionText: rcxData.label,
      condition: rcxData.condition
        ? {
            type: 'custom' as const,
            expression: rcxData.condition,
          }
        : undefined,
      conditionExpression: rcxData.condition,
      priority: rcxData.priority === 1 ? 'high' : rcxData.priority === 3 ? 'low' : 'normal',
    }
  }

  /**
   * Map node type to message type
   */
  private mapNodeTypeToMessageType(nodeType: DiagramNode['type']): ReactFlowNodeData['messageType'] {
    const messageTypeMap: Record<DiagramNode['type'], ReactFlowNodeData['messageType']> = {
      textMessage: 'text',
      richCard: 'richCard',
      carousel: 'carousel',
      otp: undefined,
      pdf: undefined,
      flow: undefined,
      condition: undefined,
      delay: undefined,
      webhook: undefined,
      escalation: undefined,
      terminator: undefined,
      subflow: undefined,
    }

    return messageTypeMap[nodeType]
  }

  /**
   * Enrich ReactFlow nodes with message data from bundle
   */
  private enrichNodesWithMessages(nodes: ReactFlowNode[], messages: RCXMessagesCollection): void {
    for (const node of nodes) {
      // Try to find message by messageId or by node.id
      const messageId = node.data.messageId || node.id
      if (messages.messages[messageId]) {
        const message = messages.messages[messageId]

        // Add message content
        node.data.text = message.text || ''

        // Add suggestions if available
        if (message.suggestions) {
          node.data.suggestions = message.suggestions.map((suggestion, index) => {
            if ('reply' in suggestion) {
              return {
                id: suggestion.reply.postbackData || `suggestion_${index}`,
                text: suggestion.reply.text,
                type: 'reply' as const,
              }
            } else if ('action' in suggestion) {
              return {
                id: suggestion.action.postbackData || `suggestion_${index}`,
                text: suggestion.action.text,
                type: 'action' as const,
              }
            } else {
              return {
                id: `suggestion_${index}`,
                text: `Option ${index + 1}`,
                type: 'reply' as const,
              }
            }
          })
        }

        // Add metadata from RCX extensions
        if (message.rcxExtensions?.metadata) {
          const metadata = message.rcxExtensions.metadata
          node.data.name = metadata.name || node.data.name
          node.data.description = metadata.description || node.data.description
        }
      }
    }
  }

  /**
   * Enrich ReactFlow edges with CSM transition data
   */
  private enrichEdgesWithCSMData(edges: ReactFlowEdge[], csm: RCXConversationStateMachine): void {
    // Handle missing CSM data gracefully
    if (!csm || !csm.machine) {
      return
    }

    // Create a map of state transitions for quick lookup
    const transitionsMap = new Map<string, Transition[]>()

    if (csm.machine?.flows) {
      for (const flow of csm.machine.flows.values()) {
        for (const state of flow.states.values()) {
          transitionsMap.set(state.id, [...state.transitions])
        }
      }
    }

    // Enrich edges with transition data
    for (const edge of edges) {
      const sourceTransitions = transitionsMap.get(edge.source)
      if (sourceTransitions) {
        const transition = sourceTransitions.find((t) => t.id === edge.id)
        if (transition) {
          // Add pattern as suggestion text
          edge.data = edge.data || {}
          edge.data.suggestionText = transition.pattern
          edge.data.label = transition.meta?.name || transition.pattern

          // Add condition if available
          if (
            transition.condition &&
            typeof transition.condition === 'object' &&
            'expression' in transition.condition
          ) {
            edge.data.conditionExpression = transition.condition.expression
          }

          // Add variables from operations
          if (transition.operations && transition.operations.length > 0) {
            const variables: Record<string, any> = {}
            for (const operation of transition.operations ?? []) {
              if (operation.type === 'set') {
                variables[operation.variable] = operation.value
              }
            }
            if (Object.keys(variables).length > 0) {
              edge.data.variables = variables
            }
          }
        }
      }
    }
  }

  /**
   * Apply asset references to nodes
   */
  private applyAssetReferences(nodes: ReactFlowNode[], assets: RCXAssetsManifest): void {
    // For each node, check if it references any assets
    for (const node of nodes) {
      const messageId = node.data.messageId
      if (messageId && assets.assets[messageId]) {
        const assetRef = assets.assets[messageId]

        // Get asset URL from storage
        const url = assetRef.storage.url
        const path = assetRef.storage.path
        const assetLocation = url || path

        if (assetRef.type === 'image' && assetLocation) {
          // Extend the node data type for asset properties
          ;(node.data as any).imageUrl = assetLocation
        } else if (assetRef.type === 'document' && assetLocation) {
          ;(node.data as any).fileUrl = assetLocation
          const assetName = assetRef.metadata?.name || assetRef.metadata?.filename || assetRef.id
          ;(node.data as any).fileName = assetName
        }
      }
    }
  }

  /**
   * Generate a unique bundle ID
   */
  private generateBundleId(): string {
    return `bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Convenience function to create an RCXBuilder instance and build a bundle
 */
export function buildAgentBundle(diagramData: ReactFlowDiagramData, options?: RCXBuilderOptions): BuildResult {
  const builder = new RCXBuilder(options)
  return builder.buildBundle(diagramData)
}

/**
 * Convenience function to create an RCXBuilder instance and import a bundle
 */
export function importAgentBundle(bundle: RCXBundle, options?: RCXBuilderOptions): ImportResult {
  const builder = new RCXBuilder(options)
  return builder.importBundle(bundle)
}
