// Simplified types for the CLI tool
export interface RCLNode {
  type: string;
  text?: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  children?: RCLNode[];
  parent?: RCLNode | null;
  name?: string;
  value?: string;
  from?: string;
  to?: string;
}

export interface RCLDocument {
  uri: string;
  version: number;
  content: string;
  ast: RCLNode | null;
  imports: any[];
  symbols: any[];
  diagnostics: any[];
}
