import { SyntaxNode } from 'tree-sitter';

export interface Position {
  line: number;
  character: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface RCLNode {
  type: string;
  text?: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  children?: RCLNode[];
  parent?: RCLNode | null;
}

export interface AgentNode extends RCLNode {
  type: 'agent_definition';
  name: string;
  displayName?: string;
  description?: string;
  flows: FlowNode[];
  messages: MessageNode[];
  defaults?: DefaultsNode;
  configuration?: ConfigurationNode;
}

export interface FlowNode extends RCLNode {
  type: 'flow_definition';
  name: string;
  states: StateNode[];
  transitions: TransitionNode[];
}

export interface StateNode extends RCLNode {
  type: 'state_definition';
  name: string;
  isStart: boolean;
  isEnd: boolean;
  actions: ActionNode[];
}

export interface StateDefinitionNode extends RCLNode {
  type: 'state_definition';
  name: string;
  isStart: boolean;
  isEnd: boolean;
  actions: ActionNode[];
}

export interface TransitionNode extends RCLNode {
  type: 'transition';
  from: string;
  to: string;
  condition?: string;
  action?: string;
}

export interface MessageNode extends RCLNode {
  type: 'message_definition';
  name: string;
  messageType: 'text' | 'rich_card' | 'carousel' | 'suggestion';
  content: string;
  metadata?: Record<string, any>;
}

export interface ActionNode extends RCLNode {
  type: 'action';
  actionType: string;
  parameters: Record<string, any>;
}

export interface DefaultsNode extends RCLNode {
  type: 'defaults_section';
  values: Record<string, any>;
}

export interface ConfigurationNode extends RCLNode {
  type: 'configuration_section';
  settings: Record<string, any>;
}

export interface ImportNode extends RCLNode {
  type: 'import_statement';
  path: string;
  alias?: string;
}

export interface ExpressionNode extends RCLNode {
  type: 'expression';
  language: 'javascript' | 'typescript';
  code: string;
  isMultiline: boolean;
}

export interface TypeTagNode extends RCLNode {
  type: 'type_tag';
  tagType: string;
  value: string;
  modifier?: string;
}

export interface MultilineStringNode extends RCLNode {
  type: 'multiline_string';
  marker: 'clean' | 'trim' | 'preserve' | 'preserve_all';
  content: string;
}

export interface ParameterNode extends RCLNode {
  type: 'parameter';
  key: string;
  value: any;
  valueType: 'string' | 'number' | 'boolean' | 'atom' | 'expression' | 'type_tag';
}

export interface CollectionNode extends RCLNode {
  type: 'collection';
  collectionType: 'list' | 'dictionary';
  items: any[];
}

export interface SourceFileNode extends RCLNode {
  type: 'source_file';
}

export interface BooleanLiteralNode extends RCLNode {
  type: 'boolean_literal';
  value: boolean;
}

export interface AtomNode extends RCLNode {
  type: 'atom';
  value: string;
}

export interface StringNode extends RCLNode {
  type: 'string';
  value: string;
}

export interface NumberNode extends RCLNode {
  type: 'number';
  value: number;
}

export interface IsoDurationNode extends RCLNode {
  type: 'iso_duration';
  value: string;
}

export interface CommentNode extends RCLNode {
  type: 'comment';
  content: string;
}

export interface PropertyNode extends RCLNode {
  type: 'property';
  name: string;
  value: string;
}

export interface ContentNode extends RCLNode {
  type: 'content';
}

export interface MessagesDefinitionNode extends RCLNode {
  type: 'messages_definition';
  name: string;
}

export interface DefaultsDefinitionNode extends RCLNode {
  type: 'defaults_definition';
  name: string;
}

export interface ConfigurationDefinitionNode extends RCLNode {
  type: 'configuration_definition';
  name: string;
}

export type RCLASTNode =
  | SourceFileNode
  | AgentNode
  | FlowNode
  | StateNode
  | StateDefinitionNode
  | TransitionNode
  | MessageNode
  | ActionNode
  | DefaultsNode
  | ConfigurationNode
  | ImportNode
  | ExpressionNode
  | TypeTagNode
  | MultilineStringNode
  | ParameterNode
  | CollectionNode
  | BooleanLiteralNode
  | AtomNode
  | StringNode
  | NumberNode
  | IsoDurationNode
  | CommentNode
  | PropertyNode
  | ContentNode
  | MessagesDefinitionNode
  | DefaultsDefinitionNode
  | ConfigurationDefinitionNode;