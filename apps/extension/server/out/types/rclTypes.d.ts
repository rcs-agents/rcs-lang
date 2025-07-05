import { Diagnostic, Range, Position } from 'vscode-languageserver/node';
import { RCLASTNode } from './astTypes';
export interface RCLDocument {
    uri: string;
    version: number;
    content: string;
    ast: RCLASTNode | null;
    imports: ImportInfo[];
    symbols: SymbolInfo[];
    diagnostics: Diagnostic[];
}
export interface ImportInfo {
    path: string;
    alias?: string;
    range: Range;
    resolved: boolean;
    resolvedPath?: string;
}
export interface SymbolInfo {
    name: string;
    kind: SymbolKind;
    range: Range;
    selectionRange: Range;
    detail?: string;
    containerName?: string;
    children?: SymbolInfo[];
}
export declare enum SymbolKind {
    Agent = "agent",
    Flow = "flow",
    State = "state",
    Message = "message",
    Action = "action",
    Configuration = "configuration",
    Defaults = "defaults",
    Import = "import",
    Parameter = "parameter",
    Expression = "expression"
}
export interface CompletionContext {
    position: Position;
    word: string;
    line: string;
    context: 'root' | 'agent' | 'flow' | 'message' | 'configuration' | 'defaults' | 'parameter' | 'expression';
    parentNode?: RCLASTNode;
}
export interface ValidationRule {
    name: string;
    description: string;
    severity: 'error' | 'warning' | 'info';
    check: (node: RCLASTNode, document: RCLDocument) => Diagnostic[];
}
export interface RCLSettings {
    maxNumberOfProblems: number;
    validationEnabled: boolean;
    completionEnabled: boolean;
    formattingEnabled: boolean;
    traceServer: 'off' | 'messages' | 'verbose';
}
export interface HoverInfo {
    range: Range;
    contents: string[];
}
export interface DefinitionInfo {
    uri: string;
    range: Range;
}
export interface ReferenceInfo {
    uri: string;
    range: Range;
    context: 'declaration' | 'reference';
}
export interface FormattingOptions {
    tabSize: number;
    insertSpaces: boolean;
    indentSize: number;
    preserveNewlines: boolean;
}
export interface CodeAction {
    title: string;
    kind: string;
    diagnostics?: Diagnostic[];
    edit?: WorkspaceEdit;
    command?: Command;
}
export interface WorkspaceEdit {
    changes: {
        [uri: string]: TextEdit[];
    };
}
export interface TextEdit {
    range: Range;
    newText: string;
}
export interface Command {
    title: string;
    command: string;
    arguments?: any[];
}
export interface SemanticToken {
    line: number;
    char: number;
    length: number;
    tokenType: number;
    tokenModifiers: number;
}
export interface FoldingRange {
    startLine: number;
    startCharacter?: number;
    endLine: number;
    endCharacter?: number;
    kind?: string;
}
export interface RCLLanguageFeatures {
    completion: boolean;
    hover: boolean;
    definition: boolean;
    references: boolean;
    formatting: boolean;
    folding: boolean;
    semanticTokens: boolean;
    codeActions: boolean;
    diagnostics: boolean;
}
export declare const RCL_KEYWORDS: string[];
export declare const RCL_SECTION_TYPES: string[];
export declare const RCL_MESSAGE_TYPES: string[];
export declare const RCL_TYPE_TAGS: string[];
export declare const RCL_BOOLEAN_VALUES: string[];
export declare const RCL_NULL_VALUES: string[];
