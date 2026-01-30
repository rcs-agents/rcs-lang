/**
 * @fileoverview TypeScript type definitions for RCXBundle format
 *
 * This module provides TypeScript interfaces that correspond to the JSON schemas
 * for the RCX bundle format - a ZIP-based container for RCS conversational agents.
 *
 * The RCX format includes:
 * - Agent configuration and branding
 * - Conversation State Machine (CSM) definition
 * - Message collections with personalization
 * - Visual diagram representation
 * - Asset management with three-tier storage
 * - Validation rules and results
 *
 * @module rcx-bundle
 */

// Import types from @rcs-lang packages to ensure compatibility
import type { Agent, Machine } from '@rcs-lang/csm'
import type { AgentContentMessage, AgentMessage, RcsBusinessMessagingAgent, AgentBundle } from '@rcs-lang/types'

// =============================================================================
// CORE BUNDLE TYPES
// =============================================================================

/**
 * Root manifest schema for RCX bundle format
 */
export interface RCXManifest {
  /** JSON Schema reference */
  $schema?: string
  /** RCX format version (semantic versioning) */
  rcxVersion: string
  /** Unique identifier for this bundle */
  bundleId: string
  /** Human-readable name for the bundle */
  name?: string
  /** Description of the conversational agent */
  description?: string
  /** Bundle content version (semantic versioning) */
  version?: string
  /** Bundle creation timestamp in ISO 8601 format */
  createdAt?: string
  /** Bundle last modification timestamp in ISO 8601 format */
  updatedAt?: string

  // File references
  /** Relative path to agent configuration file */
  agent: string
  /** Relative path to conversation state machine definition */
  csm: string
  /** Relative path to messages definition file */
  messages: string
  /** Relative path to diagram definition file */
  diagram: string
  /** Relative path to assets manifest file */
  assets: string
  /** Optional relative path to validation results file */
  validation?: string

  /** Additional metadata for the bundle */
  metadata?: BundleMetadata
}

/**
 * Complete RCX bundle containing all components.
 *
 * Extends AgentBundle to provide the runtime agent config and messages,
 * plus adds CSM, diagram, assets, and validation for full deployment.
 *
 * @remarks
 * The `agent` and `messages` fields are inherited from AgentBundle.
 * RCXBundle extends these with RCX-specific types (RCXAgentConfig extends
 * RcsBusinessMessagingAgent, RCXMessagesCollection extends MessagesCollection).
 */
export interface RCXBundle extends AgentBundle {
  /** Bundle manifest */
  manifest: RCXManifest
  /** Agent configuration (extends base agent with RCX extensions) */
  agent: RCXAgentConfig
  /** Conversation State Machine definition */
  csm: RCXConversationStateMachine
  /** Message collections (extends base with RCX features) */
  messages: RCXMessagesCollection
  /** Visual diagram representation */
  diagram: RCXDiagramDefinition
  /** Asset manifest and metadata */
  assets: RCXAssetsManifest
  /** Optional validation results */
  validation?: RCXValidationResults
}

// =============================================================================
// BUNDLE METADATA
// =============================================================================

export interface BundleMetadata {
  /** Bundle author name */
  author?: string
  /** Organization name */
  organization?: string
  /** License identifier */
  license?: string
  /** Tags for categorizing the bundle */
  tags?: string[]
  /** Predefined categories for the agent */
  categories?: BundleCategory[]
  /** Primary locale (language-country format) */
  locale?: string
  /** List of supported locales */
  supportedLocales?: string[]
  /** Custom metadata fields */
  custom?: Record<string, unknown>
}

export type BundleCategory =
  | 'customer-service'
  | 'sales'
  | 'marketing'
  | 'support'
  | 'ecommerce'
  | 'booking'
  | 'information'
  | 'entertainment'
  | 'education'
  | 'other'

// =============================================================================
// AGENT CONFIGURATION
// =============================================================================

/**
 * Agent configuration extending base RCS agent schema with RCX-specific features
 */
export interface RCXAgentConfig extends RcsBusinessMessagingAgent {
  /** RCX-specific extensions to the base agent configuration */
  rcxExtensions?: RCXAgentExtensions
}

export interface RCXAgentExtensions {
  /** Agent capabilities and features */
  capabilities?: AgentCapabilities
  /** Enhanced brand configuration */
  brandConfiguration?: BrandConfiguration
  /** Agent behavior configuration */
  configuration?: AgentConfiguration
  /** External system integrations */
  integrations?: AgentIntegrations
}

export interface AgentCapabilities {
  /** Whether agent supports fallback to human agents */
  supportsFallback?: boolean
  /** Whether agent can receive file uploads */
  supportsFileUpload?: boolean
  /** Whether agent can handle location sharing */
  supportsLocationSharing?: boolean
  /** Maximum session duration in minutes */
  maxSessionDuration?: number
  /** Session timeout in minutes of inactivity */
  sessionTimeout?: number
}

export interface BrandConfiguration {
  /** Visual theme configuration */
  theme?: BrandTheme
  /** Brand asset references */
  assets?: BrandAssets
}

export interface BrandTheme {
  /** Primary brand color in hex format */
  primaryColor?: string
  /** Secondary brand color in hex format */
  secondaryColor?: string
  /** Accent color for highlights */
  accentColor?: string
  /** Primary text color */
  textColor?: string
  /** Background color */
  backgroundColor?: string
}

export interface BrandAssets {
  /** URI or asset reference for logo */
  logoUri?: string
  /** URI or asset reference for hero image */
  heroUri?: string
  /** URI or asset reference for favicon */
  faviconUri?: string
  /** URI or asset reference for brand guidelines */
  brandGuideUri?: string
}

export interface AgentConfiguration {
  /** Default language for the agent */
  defaultLanguage?: string
  /** List of supported languages */
  supportedLanguages?: string[]
  /** Default timezone for the agent */
  timezone?: string
  /** Business hours configuration */
  businessHours?: Record<DayOfWeek, BusinessHours>
  /** Behavior when agent cannot handle request */
  fallbackBehavior?: FallbackBehavior
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface BusinessHours {
  /** Whether the agent is available on this day */
  enabled: boolean
  /** Opening time in HH:MM format */
  open?: string
  /** Closing time in HH:MM format */
  close?: string
}

export interface FallbackBehavior {
  /** Fallback strategy */
  strategy: 'retry' | 'escalate' | 'redirect' | 'terminate'
  /** Maximum number of retry attempts */
  maxRetries?: number
  /** Target for escalation (email, phone, etc.) */
  escalationTarget?: string
  /** URL to redirect user to */
  redirectUrl?: string
}

export interface AgentIntegrations {
  /** Analytics integration configuration */
  analytics?: AnalyticsIntegration
  /** CRM integration configuration */
  crm?: CrmIntegration
  /** Webhook configurations */
  webhooks?: WebhookIntegration[]
}

export interface AnalyticsIntegration {
  /** Whether analytics is enabled */
  enabled?: boolean
  /** Analytics tracking identifier */
  trackingId?: string
  /** List of events to track */
  events?: string[]
}

export interface CrmIntegration {
  /** Whether CRM integration is enabled */
  enabled?: boolean
  /** CRM provider */
  provider?: 'salesforce' | 'hubspot' | 'custom'
  /** CRM API endpoint */
  apiEndpoint?: string
}

export interface WebhookIntegration {
  /** Webhook name */
  name: string
  /** Webhook URL */
  url: string
  /** Events that trigger this webhook */
  events: WebhookEvent[]
  /** Whether webhook is enabled */
  enabled?: boolean
}

export type WebhookEvent = 'message.sent' | 'message.received' | 'session.started' | 'session.ended' | 'error.occurred'

// =============================================================================
// CONVERSATION STATE MACHINE
// =============================================================================

/**
 * Conversation State Machine definition extending @rcs-lang/csm with RCX extensions
 */
export interface RCXConversationStateMachine extends Agent {
  /** Serialized flows for bundle storage */
  flows?: Array<{
    id: string
    initial: string
    states: Array<{
      id: string
      transitions: readonly any[]
      meta?: any
    }>
    meta?: any
  }>
  /** RCX-specific extensions to the base CSM definition */
  rcxExtensions?: CSMExtensions
}

export interface CSMExtensions {
  /** Validation configuration for the state machine */
  validation?: CSMValidation
  /** Execution configuration */
  execution?: CSMExecution
  /** Analytics and tracking configuration */
  analytics?: CSMAnalytics
  /** Security configuration */
  security?: CSMSecurity
  /** Performance optimization settings */
  performance?: CSMPerformance
}

export interface CSMValidation {
  /** Whether to use strict validation */
  strict?: boolean
  /** Whether to validate message references */
  validateMessages?: boolean
  /** Whether to validate all transition targets */
  validateTransitions?: boolean
  /** Whether to allow unreachable states */
  allowUnreachableStates?: boolean
}

export interface CSMExecution {
  /** Default state timeout in milliseconds */
  timeout?: number
  /** Maximum flow invocation depth */
  maxDepth?: number
  /** Whether to enable debug mode */
  enableDebug?: boolean
  /** Whether to enable execution tracing */
  enableTracing?: boolean
}

export interface CSMAnalytics {
  /** Whether to track state transitions */
  trackTransitions?: boolean
  /** Whether to track message sends */
  trackMessages?: boolean
  /** Whether to track context changes */
  trackContext?: boolean
  /** Custom analytics events */
  customEvents?: CustomAnalyticsEvent[]
}

export interface CustomAnalyticsEvent {
  /** Event name */
  name: string
  /** When to trigger the event */
  trigger: 'state.enter' | 'state.exit' | 'transition.taken' | 'message.sent' | 'error.occurred'
  /** Conditions for triggering (JSON Logic) */
  conditions?: Record<string, unknown>
}

export interface CSMSecurity {
  /** Whether to sanitize user input */
  enableInputSanitization?: boolean
  /** Whether to sanitize agent output */
  enableOutputSanitization?: boolean
  /** List of allowed HTML tags in messages */
  allowedHtmlTags?: string[]
  /** Whether to enable rate limiting */
  enableRateLimiting?: boolean
  /** Maximum messages per minute per user */
  maxMessagesPerMinute?: number
}

export interface CSMPerformance {
  /** Whether to enable state caching */
  enableCaching?: boolean
  /** Cache timeout in milliseconds */
  cacheTimeout?: number
  /** Whether to preload next likely states */
  enablePreloading?: boolean
  /** Maximum concurrent sessions */
  maxConcurrentSessions?: number
}

// =============================================================================
// MESSAGES COLLECTION
// =============================================================================

/**
 * Collection of RCS messages with RCX-specific features
 */
export interface RCXMessagesCollection {
  /** JSON Schema reference */
  $schema?: string
  /** Messages definition version */
  version?: string
  /** Map of message IDs to their definitions */
  messages: Record<string, RCXMessage>
  /** Message templates for reuse */
  templates?: Record<string, MessageTemplate>
  /** Localization support */
  localization?: MessageLocalization
}

/**
 * Enhanced message extending base RCS message with RCX features
 */
export interface RCXMessage extends AgentContentMessage {
  /** RCX-specific extensions to the base message */
  rcxExtensions?: MessageExtensions
}

export interface MessageExtensions {
  /** Message metadata */
  metadata?: MessageMetadata
  /** Message variants for A/B testing or localization */
  variants?: Record<string, AgentContentMessage>
  /** Personalization settings */
  personalization?: MessagePersonalization
  /** Message timing and scheduling */
  timing?: MessageTiming
  /** Analytics tracking for the message */
  analytics?: MessageAnalytics
  /** Accessibility features */
  accessibility?: MessageAccessibility
}

export interface MessageMetadata {
  /** Unique message identifier */
  id: string
  /** Human-readable message name */
  name?: string
  /** Message description */
  description?: string
  /** Message category */
  category?: MessageCategory
  /** Tags for organizing messages */
  tags?: string[]
  /** Message locale */
  locale?: string
}

export type MessageCategory =
  | 'greeting'
  | 'question'
  | 'response'
  | 'confirmation'
  | 'error'
  | 'fallback'
  | 'escalation'
  | 'closure'

export interface MessagePersonalization {
  /** Whether to enable variable substitution */
  enableVariableSubstitution?: boolean
  /** List of variables used in the message */
  variables?: MessageVariable[]
  /** Content that changes based on conditions */
  conditionalContent?: ConditionalContent
}

export interface MessageVariable {
  /** Variable name */
  name: string
  /** Variable type */
  type: 'string' | 'number' | 'boolean' | 'date' | 'url'
  /** Whether variable is required */
  required?: boolean
  /** Default value if not provided */
  defaultValue?: unknown
  /** Format string for the variable */
  format?: string
}

export interface ConditionalContent {
  /** Conditional content rules */
  conditions?: ConditionalRule[]
  /** Default content if no conditions match */
  defaultContent?: AgentContentMessage
}

export interface ConditionalRule {
  /** JSON Logic condition */
  condition: Record<string, unknown>
  /** Content to use if condition matches */
  content: AgentContentMessage
}

export interface MessageTiming {
  /** Delay before sending message in milliseconds */
  delay?: number
  /** Typing indicator configuration */
  typingIndicator?: TypingIndicator
  /** Whether to request read receipt */
  readReceipt?: boolean
}

export interface TypingIndicator {
  /** Whether to show typing indicator */
  enabled?: boolean
  /** Duration of typing indicator in milliseconds */
  duration?: number
}

export interface MessageAnalytics {
  /** Whether to track message delivery */
  trackDelivery?: boolean
  /** Whether to track message reads */
  trackReads?: boolean
  /** Whether to track user interactions */
  trackInteractions?: boolean
  /** Custom events to track for this message */
  customEvents?: string[]
}

export interface MessageAccessibility {
  /** Alternative text for images */
  altText?: string
  /** Text optimized for screen readers */
  screenReaderText?: string
  /** Whether message supports high contrast mode */
  highContrast?: boolean
}

export interface MessageTemplate {
  /** Template name */
  name: string
  /** Template description */
  description?: string
  /** Template parameters */
  parameters?: TemplateParameter[]
  /** Message template with placeholders */
  template: AgentContentMessage
}

export interface TemplateParameter {
  /** Parameter name */
  name: string
  /** Parameter type */
  type: 'string' | 'number' | 'boolean' | 'date' | 'url'
  /** Whether parameter is required */
  required?: boolean
  /** Default value */
  defaultValue?: unknown
}

export interface MessageLocalization {
  /** Default locale for messages */
  defaultLocale?: string
  /** List of supported locales */
  supportedLocales?: string[]
  /** Fallback locale if requested locale not available */
  fallbackLocale?: string
}

// =============================================================================
// DIAGRAM DEFINITION
// =============================================================================

/**
 * Visual diagram representation based on React Flow structure
 */
export interface RCXDiagramDefinition {
  /** JSON Schema reference */
  $schema?: string
  /** Diagram format version */
  version?: string
  /** Array of diagram nodes */
  nodes: DiagramNode[]
  /** Array of diagram edges (connections) */
  edges: DiagramEdge[]
  /** Diagram viewport configuration */
  viewport?: Viewport
  /** Diagram metadata */
  metadata?: DiagramMetadata
  /** Diagram display and behavior settings */
  settings?: DiagramSettings
}

export interface DiagramNode {
  /** Unique node identifier */
  id: string
  /** Node type */
  type: NodeType
  /** Node position on canvas */
  position: Position
  /** Node-specific data based on type */
  data?: NodeData
  /** Node styling */
  style?: NodeStyle
  /** Whether node is selected */
  selected?: boolean
  /** Whether node is being dragged */
  dragging?: boolean
  /** ID of parent node for grouped nodes */
  parentNode?: string
  /** Node extent constraint */
  extent?: 'parent'
  /** Whether to expand parent when dragging */
  expandParent?: boolean
  /** Z-index for layering */
  zIndex?: number
  /** Whether node is hidden */
  hidden?: boolean
}

export type NodeType =
  | 'flow'
  | 'textMessage'
  | 'richCard'
  | 'carousel'
  | 'otp'
  | 'pdf'
  | 'condition'
  | 'delay'
  | 'webhook'
  | 'escalation'
  | 'terminator'
  | 'subflow'

export interface NodeData {
  /** Node display label */
  label?: string
  /** Node description */
  description?: string
  /** Associated message ID for message nodes */
  messageId?: string
  /** Associated CSM state ID */
  stateId?: string
  /** Associated CSM flow ID for subflow nodes */
  flowId?: string
  /** Condition configuration for condition nodes */
  condition?: ConditionConfig
  /** Delay configuration for delay nodes */
  delay?: DelayConfig
  /** Webhook configuration for webhook nodes */
  webhook?: WebhookConfig
  /** Escalation configuration for escalation nodes */
  escalation?: EscalationConfig
  /** Additional node-specific data */
  [key: string]: unknown
}

export interface ConditionConfig {
  /** Condition evaluation type */
  type?: 'jsonlogic' | 'code'
  /** Condition expression (JSON Logic or code) */
  expression?: unknown
}

export interface DelayConfig {
  /** Delay duration in milliseconds */
  duration: number
  /** Whether to show typing indicator during delay */
  showTyping?: boolean
}

export interface WebhookConfig {
  /** Webhook URL */
  url: string
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** HTTP headers */
  headers?: Record<string, string>
  /** Timeout in milliseconds */
  timeout?: number
}

export interface EscalationConfig {
  /** Escalation type */
  type: 'human' | 'email' | 'phone' | 'redirect'
  /** Escalation target (email, phone, URL, etc.) */
  target: string
  /** Escalation message */
  message?: string
}

export interface NodeStyle {
  /** Node width in pixels */
  width?: number
  /** Node height in pixels */
  height?: number
  /** Background color */
  backgroundColor?: string
  /** Border color */
  borderColor?: string
  /** Border width in pixels */
  borderWidth?: number
  /** Border style */
  borderStyle?: 'solid' | 'dashed' | 'dotted'
  /** Text color */
  color?: string
  /** Font size in pixels */
  fontSize?: number
  /** Font weight */
  fontWeight?: 'normal' | 'bold' | 'lighter' | 'bolder'
  /** Additional style properties */
  [key: string]: unknown
}

export interface DiagramEdge {
  /** Unique edge identifier */
  id: string
  /** Source node ID */
  source: string
  /** Target node ID */
  target: string
  /** Source handle ID */
  sourceHandle?: string
  /** Target handle ID */
  targetHandle?: string
  /** Edge type */
  type?: 'default' | 'straight' | 'step' | 'smoothstep' | 'bezier' | 'custom'
  /** Edge-specific data */
  data?: EdgeData
  /** Edge styling */
  style?: EdgeStyle
  /** Edge label styling */
  labelStyle?: EdgeLabelStyle
  /** Whether to show label background */
  labelShowBg?: boolean
  /** Label background styling */
  labelBgStyle?: EdgeLabelBgStyle
  /** Whether edge is animated */
  animated?: boolean
  /** Whether edge is selected */
  selected?: boolean
  /** Whether edge is hidden */
  hidden?: boolean
  /** Z-index for layering */
  zIndex?: number
}

export interface EdgeData {
  /** Edge label */
  label?: string
  /** Condition for this edge/transition */
  condition?: string
  /** Edge priority for evaluation order */
  priority?: number
  /** Pattern to match for this transition */
  pattern?: string
  /** Additional edge-specific data */
  [key: string]: unknown
}

export interface EdgeStyle {
  /** Stroke color */
  stroke?: string
  /** Stroke width in pixels */
  strokeWidth?: number
  /** Stroke dash pattern */
  strokeDasharray?: string
  /** Additional style properties */
  [key: string]: unknown
}

export interface EdgeLabelStyle {
  /** Label text color */
  fill?: string
  /** Label font size */
  fontSize?: number
  /** Label font weight */
  fontWeight?: string
  /** Additional label style properties */
  [key: string]: unknown
}

export interface EdgeLabelBgStyle {
  /** Background color */
  fill?: string
  /** Background opacity */
  fillOpacity?: number
  /** Additional background style properties */
  [key: string]: unknown
}

export interface Position {
  /** X coordinate */
  x: number
  /** Y coordinate */
  y: number
}

export interface Viewport {
  /** Viewport X offset */
  x?: number
  /** Viewport Y offset */
  y?: number
  /** Zoom level */
  zoom?: number
}

export interface DiagramMetadata {
  /** Diagram name */
  name?: string
  /** Diagram description */
  description?: string
  /** Diagram author */
  author?: string
  /** Creation timestamp */
  createdAt?: string
  /** Last update timestamp */
  updatedAt?: string
  /** Diagram tags */
  tags?: string[]
}

export interface DiagramSettings {
  /** Layout configuration */
  layout?: LayoutSettings
  /** Grid configuration */
  grid?: GridSettings
  /** Interaction settings */
  interaction?: InteractionSettings
}

export interface LayoutSettings {
  /** Layout direction */
  direction?: 'TB' | 'LR' | 'BT' | 'RL'
  /** Whether to use automatic layout */
  autoLayout?: boolean
  /** Spacing configuration */
  spacing?: LayoutSpacing
}

export interface LayoutSpacing {
  /** Spacing between nodes */
  nodeSpacing?: number
  /** Spacing between ranks/levels */
  rankSpacing?: number
}

export interface GridSettings {
  /** Whether to show grid */
  enabled?: boolean
  /** Grid size in pixels */
  size?: number
  /** Whether to snap nodes to grid */
  snapToGrid?: boolean
}

export interface InteractionSettings {
  /** Whether nodes can be dragged */
  nodesDraggable?: boolean
  /** Whether nodes can be connected */
  nodesConnectable?: boolean
  /** Whether elements can be selected */
  elementsSelectable?: boolean
  /** Key for multi-selection */
  multiSelectionKeyCode?: 'ctrlCmd' | 'shift' | 'alt'
}

// =============================================================================
// ASSETS MANIFEST
// =============================================================================

/**
 * Asset manifest and metadata with three-tier asset handling
 */
export interface RCXAssetsManifest {
  /** JSON Schema reference */
  $schema?: string
  /** Assets manifest version */
  version?: string
  /** Map of asset IDs to their definitions */
  assets: Record<string, RCXAsset>
  /** Asset collections for organization */
  collections?: Record<string, AssetCollection>
  /** Asset optimization settings */
  optimization?: AssetOptimization
}

export interface RCXAsset {
  /** Unique asset identifier */
  id: string
  /** Asset type */
  type: AssetType
  /** Asset storage configuration */
  storage: AssetStorage
  /** Asset metadata */
  metadata?: AssetMetadata
  /** Asset variants (different sizes, formats, etc.) */
  variants?: RCXAssetVariant[]
  /** List of asset IDs this asset depends on */
  dependencies?: string[]
  /** Asset tags for organization and search */
  tags?: string[]
  /** Asset usage information */
  usage?: AssetUsage
  /** Asset validation configuration */
  validation?: AssetValidation
}

export type AssetType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'font'
  | 'icon'
  | 'animation'
  | 'data'
  | 'template'
  | 'other'

export interface AssetStorage {
  /** Asset storage tier */
  tier: AssetStorageTier
  /** Asset path (relative for bundled, absolute URL for referenced) */
  path?: string
  /** External URL for referenced assets */
  url?: string
  /** Base64-encoded data for embedded assets */
  data?: string
  /** MIME type of the asset */
  mimeType?: string
  /** Asset encoding for embedded assets */
  encoding?: 'base64' | 'utf8' | 'binary'
  /** Asset compression information */
  compression?: CompressionInfo
}

export type AssetStorageTier = 'embedded' | 'referenced' | 'bundled'

export interface CompressionInfo {
  /** Compression algorithm used */
  algorithm?: 'gzip' | 'brotli' | 'deflate' | 'none'
  /** Original file size in bytes */
  originalSize?: number
  /** Compressed file size in bytes */
  compressedSize?: number
  /** Compression ratio (0-1) */
  ratio?: number
}

export interface AssetMetadata {
  /** Human-readable asset name */
  name?: string
  /** Asset description */
  description?: string
  /** Original filename */
  filename?: string
  /** File size in bytes */
  size?: number
  /** Asset dimensions (for images/videos) */
  dimensions?: AssetDimensions
  /** Duration in seconds (for audio/video) */
  duration?: number
  /** Asset author/creator */
  author?: string
  /** Asset license */
  license?: string
  /** Copyright information */
  copyright?: string
  /** Asset source or origin */
  source?: string
  /** Alternative text for accessibility */
  altText?: string
  /** Keywords for searching */
  keywords?: string[]
  /** Asset locale/language */
  locale?: string
  /** Asset creation timestamp */
  createdAt?: string
  /** Asset last modification timestamp */
  updatedAt?: string
  /** EXIF data for images */
  exif?: Record<string, unknown>
  /** Custom metadata fields */
  custom?: Record<string, unknown>
}

export interface AssetDimensions {
  /** Width in pixels */
  width?: number
  /** Height in pixels */
  height?: number
  /** Aspect ratio (width/height) */
  aspectRatio?: number
}

export interface RCXAssetVariant {
  /** Variant identifier */
  id: string
  /** Variant type */
  type?: AssetVariantType
  /** Variant storage configuration */
  storage: AssetStorage
  /** Variant-specific metadata */
  metadata?: AssetMetadata
  /** Conditions for using this variant */
  condition?: VariantCondition
}

export type AssetVariantType = 'thumbnail' | 'preview' | 'lowres' | 'hires' | 'compressed' | 'optimized' | 'responsive'

export interface VariantCondition {
  /** CSS media query for responsive variants */
  mediaQuery?: string
  /** User agent pattern */
  userAgent?: string
  /** Connection speed requirement */
  connectionSpeed?: 'slow' | 'fast' | 'any'
  /** Device capability requirement */
  deviceCapability?: 'basic' | 'advanced' | 'any'
}

export interface AssetUsage {
  /** List of entities that reference this asset */
  referencedBy?: AssetReference[]
  /** Whether this asset is critical for operation */
  critical?: boolean
}

export interface AssetReference {
  /** Type of entity referencing this asset */
  type: 'message' | 'agent' | 'diagram' | 'csm'
  /** ID of the referencing entity */
  id: string
  /** Field where asset is referenced */
  field?: string
}

export interface AssetValidation {
  /** Asset checksum for integrity verification */
  checksum?: string
  /** Checksum algorithm */
  checksumAlgorithm?: 'md5' | 'sha1' | 'sha256' | 'sha512'
  /** Whether asset has been virus scanned */
  virusScan?: boolean
  /** Whether content has been validated */
  contentValidation?: boolean
}

export interface AssetCollection {
  /** Collection name */
  name: string
  /** Collection description */
  description?: string
  /** List of asset IDs in this collection */
  assets: string[]
  /** Collection metadata */
  metadata?: Record<string, unknown>
}

export interface AssetOptimization {
  /** Image optimization settings */
  images?: ImageOptimization
  /** Compression settings */
  compression?: CompressionSettings
}

export interface ImageOptimization {
  /** Image quality (1-100) */
  quality?: number
  /** Preferred image formats in order of preference */
  formats?: ('webp' | 'avif' | 'jpeg' | 'png')[]
  /** Responsive breakpoints for image sizing */
  responsiveBreakpoints?: number[]
}

export interface CompressionSettings {
  /** Whether to enable compression */
  enabled?: boolean
  /** Compression algorithm */
  algorithm?: 'gzip' | 'brotli' | 'deflate'
  /** Compression level (1-9) */
  level?: number
}

// =============================================================================
// VALIDATION RESULTS
// =============================================================================

/**
 * Validation rules and results for RCX bundles
 */
export interface RCXValidationResults {
  /** JSON Schema reference */
  $schema?: string
  /** Validation schema version */
  version?: string
  /** Validation timestamp */
  timestamp?: string
  /** Validation rules configuration */
  rules: ValidationRules
  /** Validation results */
  results: ValidationResults
  /** Validation metadata */
  metadata?: ValidationMetadata
}

export interface ValidationRules {
  /** List of enabled validation rule categories */
  enabled?: ValidationRuleCategory[]
  /** Severity levels for different rule categories */
  severity?: Partial<Record<ValidationRuleCategory, ValidationSeverity>>
  /** Custom validation rules */
  custom?: CustomValidationRule[]
  /** Rules to exclude from validation */
  exclusions?: ValidationExclusions
}

export type ValidationRuleCategory =
  | 'schema'
  | 'structure'
  | 'consistency'
  | 'completeness'
  | 'references'
  | 'assets'
  | 'performance'
  | 'accessibility'
  | 'security'
  | 'best-practices'

export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface CustomValidationRule {
  /** Unique rule identifier */
  id: string
  /** Human-readable rule name */
  name: string
  /** Rule description */
  description?: string
  /** Rule type */
  type: 'jsonschema' | 'jsonlogic' | 'regex' | 'function'
  /** Rule severity */
  severity?: ValidationSeverity
  /** Rule target specification */
  target?: RuleTarget
  /** Rule condition based on type */
  condition?: unknown
  /** Error message template */
  message?: string
  /** Automatic fix configuration */
  fix?: AutoFix
  /** Rule tags */
  tags?: string[]
  /** Whether rule is enabled */
  enabled?: boolean
}

export interface RuleTarget {
  /** Target entity type */
  entity?: 'agent' | 'message' | 'state' | 'flow' | 'asset' | 'diagram' | 'bundle'
  /** Target property path (JSONPath) */
  property?: string
  /** Target selector (CSS-like) */
  selector?: string
}

export interface AutoFix {
  /** Fix type */
  type?: 'replace' | 'remove' | 'add' | 'transform'
  /** Fix action specification */
  action?: unknown
  /** Fix description */
  description?: string
}

export interface ValidationExclusions {
  /** List of rule IDs to exclude */
  rules?: string[]
  /** Entity-specific rule exclusions */
  entities?: EntityExclusion[]
}

export interface EntityExclusion {
  /** Entity type to exclude */
  type: 'agent' | 'message' | 'state' | 'flow' | 'asset' | 'diagram'
  /** Entity ID to exclude */
  id: string
  /** Rules to exclude for this entity */
  rules?: string[]
}

export interface ValidationResults {
  /** Validation summary */
  summary: ValidationSummary
  /** List of validation issues found */
  issues: ValidationIssue[]
  /** Validation metrics and statistics */
  metrics?: ValidationMetrics
  /** Improvement recommendations */
  recommendations?: ValidationRecommendation[]
}

export interface ValidationSummary {
  /** Whether overall validation passed */
  passed: boolean
  /** Total number of issues found */
  total: number
  /** Number of error-level issues */
  errors?: number
  /** Number of warning-level issues */
  warnings?: number
  /** Number of info-level issues */
  info?: number
  /** Overall validation score (0-100) */
  score?: number
  /** Issues by category */
  categories?: Record<string, number>
}

export interface ValidationIssue {
  /** Unique issue identifier */
  id: string
  /** Rule that triggered this issue */
  rule: string
  /** Issue severity */
  severity: ValidationSeverity
  /** Issue description */
  message: string
  /** Issue category */
  category?: string
  /** Issue location */
  location?: IssueLocation
  /** Additional context for the issue */
  context?: IssueContext
  /** Automatic fix for the issue */
  fix?: IssueFix
  /** Links to documentation */
  documentation?: IssueDocumentation
}

export interface IssueLocation {
  /** File where issue was found */
  file?: string
  /** Property path (JSONPath) */
  path?: string
  /** Line number */
  line?: number
  /** Column number */
  column?: number
  /** Entity reference */
  entity?: EntityReference
}

export interface EntityReference {
  /** Entity type */
  type?: string
  /** Entity ID */
  id?: string
}

export interface IssueContext {
  /** Actual value that caused the issue */
  actual?: unknown
  /** Expected value or pattern */
  expected?: unknown
  /** Suggested fixes */
  suggestions?: string[]
  /** Additional context properties */
  [key: string]: unknown
}

export interface IssueFix {
  /** Whether automatic fix is available */
  available?: boolean
  /** Fix description */
  description?: string
  /** Fix action specification */
  action?: unknown
  /** Fix confidence level (0-1) */
  confidence?: number
}

export interface IssueDocumentation {
  /** Rule documentation URL */
  rule?: string
  /** Fix guide URL */
  guide?: string
}

export interface ValidationMetrics {
  /** Validation coverage metrics */
  coverage?: CoverageMetrics
  /** Bundle complexity metrics */
  complexity?: ComplexityMetrics
  /** Performance metrics */
  performance?: PerformanceMetrics
}

export interface CoverageMetrics {
  /** Entity coverage */
  entities?: CoverageInfo
  /** Rule coverage */
  rules?: CoverageInfo
}

export interface CoverageInfo {
  /** Total count */
  total?: number
  /** Validated count */
  validated?: number
  /** Coverage percentage */
  percentage?: number
}

export interface ComplexityMetrics {
  /** Number of diagram nodes */
  nodes?: number
  /** Number of diagram edges */
  edges?: number
  /** Number of CSM states */
  states?: number
  /** Number of CSM flows */
  flows?: number
  /** Number of messages */
  messages?: number
  /** Number of assets */
  assets?: number
  /** Cyclomatic complexity score */
  cyclomaticComplexity?: number
  /** Maximum nesting depth */
  nesting?: number
}

export interface PerformanceMetrics {
  /** Total bundle size in bytes */
  bundleSize?: number
  /** Total asset size in bytes */
  assetSize?: number
  /** Estimated load time in seconds */
  loadTime?: number
  /** Estimated memory usage in bytes */
  memoryUsage?: number
}

export interface ValidationRecommendation {
  /** Unique recommendation identifier */
  id: string
  /** Recommendation type */
  type: 'optimization' | 'best-practice' | 'fix' | 'enhancement' | 'security'
  /** Recommendation title */
  title: string
  /** Detailed recommendation description */
  description: string
  /** Recommendation priority */
  priority?: 'low' | 'medium' | 'high' | 'critical'
  /** Estimated implementation effort */
  effort?: 'low' | 'medium' | 'high'
  /** Expected impact */
  impact?: 'low' | 'medium' | 'high'
  /** Recommendation category */
  category?: string
  /** Implementation steps */
  steps?: string[]
  /** Reference links */
  references?: RecommendationReference[]
  /** Code or configuration examples */
  examples?: RecommendationExample[]
}

export interface RecommendationReference {
  /** Reference title */
  title: string
  /** Reference URL */
  url: string
  /** Reference type */
  type?: 'documentation' | 'tutorial' | 'example' | 'tool'
}

export interface RecommendationExample {
  /** Example before applying recommendation */
  before?: unknown
  /** Example after applying recommendation */
  after?: unknown
  /** Example description */
  description?: string
}

export interface ValidationMetadata {
  /** Validator information */
  validator?: ValidatorInfo
  /** Validation environment */
  environment?: ValidationEnvironment
  /** Validation duration in milliseconds */
  duration?: number
  /** Validation options used */
  options?: Record<string, unknown>
}

export interface ValidatorInfo {
  /** Validator name */
  name?: string
  /** Validator version */
  version?: string
  /** Validation engine used */
  engine?: string
}

export interface ValidationEnvironment {
  /** Platform where validation was run */
  platform?: string
  /** Runtime environment */
  runtime?: string
  /** Validation locale */
  locale?: string
}
