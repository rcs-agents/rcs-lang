// Core diagram types that extend Sprotty models

export interface Point {
  x: number;
  y: number;
}

export interface RCLNode {
  id: string;
  type: 'start' | 'message' | 'end' | 'rich_card' | 'condition' | 'match' | 'match_option';
  position: { x: number; y: number };
  data: {
    label: string;
    messageData?: any;
    stateData?: any;
    rclMetadata?: {
      hasConditions: boolean;
      hasSuggestions: boolean;
      messageType: string;
      trafficType?: string;
    };
    // For match nodes
    parentMatch?: string;
    matchOptions?: string[];
  };
  // Connection points
  connectionPoints?: {
    top: Point;
    right: Point;
    bottom: Point;
    left: Point;
  };
}

export interface RCLEdge {
  id: string;
  source: string;
  target: string;
  sourceConnectionPoint?: 'top' | 'right' | 'bottom' | 'left';
  targetConnectionPoint?: 'top' | 'right' | 'bottom' | 'left';
  waypoints?: Point[];
  routingType?: 'smooth' | 'orthogonal';
  data?: {
    trigger?: string;
    condition?: string;
    actions?: any[];
    label?: string;
  };
}

export interface RCLFlowModel {
  id: string;
  nodes: RCLNode[];
  edges: RCLEdge[];
}

export interface DiagramState {
  flows: Record<string, RCLFlowModel>;
  activeFlow?: string;
  messages: Record<string, any>;
  agent: any;
  selectedNodes: Set<string>;
  selectedEdges: Set<string>;
  zoom: number;
  pan: { x: number; y: number };
}

export interface DiagramConfig {
  enableZoom?: boolean;
  enablePan?: boolean;
  enableNodeDrag?: boolean;
  enableEdgeReconnect?: boolean;
  showMinimap?: boolean;
  autoLayout?: boolean;
  nodeSpacing?: { x: number; y: number };
}

export interface NodePropertyDefinition {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'boolean' | 'number';
  options?: string[];
  required?: boolean;
  defaultValue?: any;
}

export interface MessageComponent {
  type: 'text' | 'rich_card' | 'carousel';
  props: any;
  preview: boolean;
}

export interface PropertyFormData {
  // Common properties
  label: string;
  type: string;

  // Message properties based on agent-message.schema.json
  messageType?: 'text' | 'richCard' | 'carousel' | 'file';
  text?: string;
  messageTrafficType?:
    | 'AUTHENTICATION'
    | 'TRANSACTION'
    | 'PROMOTION'
    | 'SERVICEREQUEST'
    | 'ACKNOWLEDGEMENT';

  // Rich card properties
  cardTitle?: string;
  cardDescription?: string;
  cardOrientation?: 'HORIZONTAL' | 'VERTICAL';
  cardWidth?: 'SMALL' | 'MEDIUM';

  // Suggestions
  suggestions?: Array<{
    type: 'reply' | 'action';
    text: string;
    postbackData?: string;
    actionType?: 'dial' | 'viewLocation' | 'createCalendarEvent' | 'openUrl' | 'shareLocation';
    actionData?: any;
  }>;

  // File properties
  fileName?: string;
  fileUrl?: string;
  thumbnailUrl?: string;

  // TTL/Expiry
  ttl?: string;
  expireTime?: string;
}
