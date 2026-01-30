/**
 * ReactFlow types shared between frontend and backend applications
 * Extracted from apps/backend/src/types/diagram.types.ts
 */

// ===== REACTFLOW TYPES =====

export type DiagramNodeType =
  | 'flow'
  | 'textMessage'
  | 'richCardMessage'
  | 'carouselMessage'
  | 'otpMessage'
  | 'pdfMessage'
  | TemplateNodeType

export enum DiagramNodeTypes {
  // Used for flows and journeys
  flow = 'flow',
  textMessage = 'textMessage',
  richCardMessage = 'richCardMessage',
  carouselMessage = 'carouselMessage',
  otpMessage = 'otpMessage',
  pdfMessage = 'pdfMessage',
}

/**
 * Template/Diagram organizational node types
 * Used for high-level diagram organization and CSM mapping
 */
export enum TemplateNodeTypes {
  experience = 'experience',
  journey = 'journey',
  flow = 'flow',
  message = 'message',
  start = 'start',
  end = 'end',
  group = 'group',
}

export type TemplateNodeType = 'experience' | 'journey' | 'flow' | 'message' | 'start' | 'end' | 'group'

/**
 * Standardized diagram node data structure following RBM/RCS specifications
 * This interface should be used consistently across:
 * - Diagram editor node creation
 * - Database seed files and templates
 * - CSM/RCS conversion services
 * - API responses and serialization
 */
export interface DiagramNodeData {
  // Common fields
  name?: string
  label?: string
  description?: string

  // Type-specific data
  experienceId?: string
  flowId?: string
  messageId?: string
  templateId?: string

  // Experience node data
  status?: 'draft' | 'published' | 'archived' | 'active' | 'completed'

  // Journey node data
  goalDescription?: string
  messageCount?: number

  // Flow node data
  triggerType?: 'user_input' | 'suggestion' | 'time_based' | 'condition'
  conditions?: string[]

  // Message node data (following RBM specification)
  text?: string
  messageType?: 'text' | 'richCard' | 'carousel' | 'otp' | 'pdf'

  // RBM-compliant suggestion structure
  suggestions?: Array<{
    id: string
    type: 'reply' | 'action'
    text: string
    postbackData?: string
  }>

  // Rich card data (following RBM standaloneCard structure)
  title?: string
  subtitle?: string
  media?: {
    fileUrl: string
    thumbnailUrl?: string
    height?: 'SHORT' | 'MEDIUM' | 'TALL'
    altText?: string
  }

  // Carousel data (following RBM carouselCard structure)
  cards?: Array<{
    title?: string
    subtitle?: string
    description?: string
    media?: {
      fileUrl: string
      thumbnailUrl?: string
      height?: 'SHORT' | 'MEDIUM' | 'TALL'
      altText?: string
    }
    suggestions?: Array<{
      id: string
      type: 'reply' | 'action'
      text: string
      postbackData?: string
    }>
  }>

  // PDF message data
  fileName?: string
  fileUrl?: string

  // OTP message data
  otpLength?: number
  expiryMinutes?: number

  // RBM message timing
  ttl?: string // Duration string like "3.5s"
  expireTime?: string // RFC 3339 timestamp

  // Content preview
  preview?: string

  // Visual states
  isCollapsed?: boolean
  hasErrors?: boolean
  isTemplate?: boolean

  // UI state
  showPreview?: boolean

  // AI creation metadata
  createdByAI?: boolean
  aiRequestId?: string
  aiPrompt?: string
  aiCreatedAt?: number
  aiModel?: string

  // Test-specific properties
  sessionId?: string | number
  content?: string
  value?: number
  customField?: string
  batchIndex?: number
  creator?: string

  // General metadata
  metadata?: Record<string, unknown>

  // CSM mapping specific properties
  definition?: any // For flow and message definitions
  journeyId?: string // For journey node mapping
}

/**
 * Type aliases for backward compatibility and specific use cases
 */
export type ReactFlowNodeData = DiagramNodeData // Backward compatibility
export type MessageNodeData = DiagramNodeData // For message-specific contexts

/**
 * Specific message type interfaces for type safety
 */
export interface TextMessageData extends DiagramNodeData {
  messageType: 'text'
  text: string
}

export interface RichCardMessageData extends DiagramNodeData {
  messageType: 'richCard'
  title: string
  text?: string
  subtitle?: string
  media?: {
    fileUrl: string
    thumbnailUrl?: string
    height?: 'SHORT' | 'MEDIUM' | 'TALL'
    altText?: string
  }
}

export interface CarouselMessageData extends DiagramNodeData {
  messageType: 'carousel'
  cards: Array<{
    title?: string
    subtitle?: string
    description?: string
    media?: {
      fileUrl: string
      thumbnailUrl?: string
      height?: 'SHORT' | 'MEDIUM' | 'TALL'
      altText?: string
    }
    suggestions?: Array<{
      id: string
      type: 'reply' | 'action'
      text: string
      postbackData?: string
    }>
  }>
}

export interface OtpMessageData extends DiagramNodeData {
  messageType: 'otp'
  text: string
  otpLength: number
  expiryMinutes?: number
}

export interface PdfMessageData extends DiagramNodeData {
  messageType: 'pdf'
  text: string
  fileName: string
  fileUrl: string
}

export interface FlowNodeData extends DiagramNodeData {
  name: string
  goalDescription?: string
  triggerType?: 'user_input' | 'suggestion' | 'time_based' | 'condition'
  conditions?: string[]
}

/**
 * ReactFlow edge data structure matching the diagram app implementation
 * Based on DiagramEdgeData from apps/diagram/src/types.ts
 */
export interface ReactFlowEdgeData {
  // Transition data
  suggestionId?: string
  suggestionText?: string
  condition?: {
    type: 'always' | 'equals' | 'contains' | 'regex' | 'custom'
    field?: string
    value?: unknown
    expression?: string
  }

  // Flow invocation data
  isFlowInvocation?: boolean
  flowId?: string

  // Visual styling
  color?: string
  label?: string

  // Color routing and complexity
  complexity?: 'simple' | 'moderate' | 'complex' | 'extreme'
  strategy?: unknown
  suggestionType?: string

  // Validation state
  hasErrors?: boolean
  isSelected?: boolean

  // UI state
  isHighlighted?: boolean

  // Advanced routing configuration
  routingPattern?: 'direct' | 'conditional' | 'suggestion' | 'timeout' | 'fallback'
  conditionExpression?: string // JavaScript-like expression for conditional routing
  timeoutSeconds?: number // Timeout duration for timeout routing
  priority?: 'high' | 'normal' | 'low' // Priority for evaluation order
  contextOperations?: string // Operations to execute when edge is traversed

  // Advanced routing options
  variables?: Record<string, unknown> // Variables to set when traversing
  metadata?: Record<string, unknown> // Additional metadata for routing

  // AI creation metadata
  createdByAI?: boolean
  aiRequestId?: string
  aiPrompt?: string
  aiCreatedAt?: number
  aiModel?: string

  // Visual routing classification (used by CSM mapping)
  routingType?: 'success' | 'error' | 'conditional' | 'default'

  // Additional visual properties used by CSM mapping
  style?: 'solid' | 'dashed' | 'dotted'
  animated?: boolean
}

/**
 * ReactFlow node with custom data - matches DiagramNode from diagram app
 */
export interface ReactFlowNode {
  id: string
  type: DiagramNodeType | string
  position: { x: number; y: number }
  data: DiagramNodeData
  width?: number
  height?: number
  selected?: boolean
  dragging?: boolean
  dragHandle?: string
  style?: Record<string, unknown>
  className?: string
  sourcePosition?: string
  targetPosition?: string
  hidden?: boolean
  deletable?: boolean
  selectable?: boolean
  connectable?: boolean
  dragable?: boolean
  focusable?: boolean
  metadata?: Record<string, unknown> // For test compatibility
}

/**
 * ReactFlow edge with custom data - matches DiagramEdge from diagram app
 */
export interface ReactFlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  type?: 'default' | 'transition' | 'flowInvocation' | 'error'
  data?: ReactFlowEdgeData
  animated?: boolean
  hidden?: boolean
  deletable?: boolean
  selectable?: boolean
  focusable?: boolean
  style?: Record<string, unknown>
  className?: string
  label?: string
  labelStyle?: Record<string, unknown>
  labelShowBg?: boolean
  labelBgStyle?: Record<string, unknown>
  labelBgPadding?: number[]
  labelBgBorderRadius?: number
  markerStart?: string
  markerEnd?: string
  metadata?: Record<string, unknown> // For test compatibility
}

/**
 * Complete ReactFlow diagram data structure
 * This represents the full diagramData field stored in the database
 */
export interface ReactFlowDiagramData {
  nodes: ReactFlowNode[]
  edges: ReactFlowEdge[]
  viewport?: {
    x: number
    y: number
    zoom: number
  }
  // Additional ReactFlow state that might be stored
  connectionLineStyle?: Record<string, any>
  defaultEdgeOptions?: Record<string, any>
  nodesDraggable?: boolean
  nodesConnectable?: boolean
  nodesFocusable?: boolean
  edgesFocusable?: boolean
  elementsSelectable?: boolean
  selectNodesOnDrag?: boolean
}

/**
 * Canvas settings for diagram display and interaction
 */
export interface CanvasSettings {
  // Viewport settings
  viewport?: {
    x: number
    y: number
    zoom: number
  }

  // Grid settings
  gridEnabled?: boolean
  gridSize?: number
  gridColor?: string

  // Snap settings
  snapToGrid?: boolean
  snapGridSize?: number

  // Mini map settings
  minimapEnabled?: boolean
  minimapPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

  // Controls settings
  controlsEnabled?: boolean

  // Background settings
  backgroundVariant?: 'dots' | 'lines' | 'cross'
  backgroundColor?: string

  // Node settings
  nodesDraggable?: boolean
  nodesConnectable?: boolean
  nodesFocusable?: boolean

  // Edge settings
  edgesFocusable?: boolean
  elementsSelectable?: boolean
  selectNodesOnDrag?: boolean

  // Pan settings
  panOnScroll?: boolean
  panOnScrollSpeed?: number
  panOnScrollMode?: 'free' | 'vertical' | 'horizontal'

  // Zoom settings
  zoomOnScroll?: boolean
  zoomOnPinch?: boolean
  zoomOnDoubleClick?: boolean
  minZoom?: number
  maxZoom?: number

  // Connection settings
  connectionMode?: 'strict' | 'loose'
  connectionRadius?: number

  // Selection settings
  multiSelectionKeyCode?: string
  selectionKeyCode?: string
  deleteKeyCode?: string

  // Animation settings
  animationDuration?: number

  // Custom settings
  theme?: 'light' | 'dark' | 'auto'
  customStyles?: Record<string, any>
}
