import { Result, Diagnostic } from '@rcl/core-types';
import { IASTNode, IRange, IPosition } from './parser';

/**
 * Language service interface - provides language features
 */
export interface ILanguageService {
  /**
   * Get diagnostics for a document
   */
  getDiagnostics(uri: string, text: string): Promise<Result<Diagnostic[]>>;
  
  /**
   * Get completions at a position
   */
  getCompletions(uri: string, text: string, position: IPosition): Promise<Result<ICompletionItem[]>>;
  
  /**
   * Get hover information at a position
   */
  getHover(uri: string, text: string, position: IPosition): Promise<Result<IHover | null>>;
  
  /**
   * Get symbol information for a document
   */
  getSymbols(uri: string, text: string): Promise<Result<ISymbol[]>>;
  
  /**
   * Get definition locations for a symbol at position
   */
  getDefinition(uri: string, text: string, position: IPosition): Promise<Result<ILocation[]>>;
  
  /**
   * Get references to a symbol at position
   */
  getReferences(uri: string, text: string, position: IPosition): Promise<Result<ILocation[]>>;
  
  /**
   * Format a document
   */
  format(uri: string, text: string, options?: IFormattingOptions): Promise<Result<ITextEdit[]>>;
  
  /**
   * Get code actions for a range
   */
  getCodeActions(uri: string, text: string, range: IRange): Promise<Result<ICodeAction[]>>;
}

/**
 * Completion item
 */
export interface ICompletionItem {
  label: string;
  kind: CompletionItemKind;
  detail?: string;
  documentation?: string;
  insertText?: string;
  sortText?: string;
  filterText?: string;
  range?: IRange;
}

/**
 * Completion item kinds
 */
export enum CompletionItemKind {
  Text = 1,
  Method = 2,
  Function = 3,
  Constructor = 4,
  Field = 5,
  Variable = 6,
  Class = 7,
  Interface = 8,
  Module = 9,
  Property = 10,
  Unit = 11,
  Value = 12,
  Enum = 13,
  Keyword = 14,
  Snippet = 15,
  Color = 16,
  File = 17,
  Reference = 18,
  Folder = 19,
  EnumMember = 20,
  Constant = 21,
  Struct = 22,
  Event = 23,
  Operator = 24,
  TypeParameter = 25
}

/**
 * Hover information
 */
export interface IHover {
  contents: string | { language: string; value: string };
  range?: IRange;
}

/**
 * Symbol information
 */
export interface ISymbol {
  name: string;
  kind: SymbolKind;
  range: IRange;
  selectionRange: IRange;
  children?: ISymbol[];
}

/**
 * Symbol kinds
 */
export enum SymbolKind {
  File = 1,
  Module = 2,
  Namespace = 3,
  Package = 4,
  Class = 5,
  Method = 6,
  Property = 7,
  Field = 8,
  Constructor = 9,
  Enum = 10,
  Interface = 11,
  Function = 12,
  Variable = 13,
  Constant = 14,
  String = 15,
  Number = 16,
  Boolean = 17,
  Array = 18,
  Object = 19,
  Key = 20,
  Null = 21,
  EnumMember = 22,
  Struct = 23,
  Event = 24,
  Operator = 25,
  TypeParameter = 26
}

/**
 * Location in a document
 */
export interface ILocation {
  uri: string;
  range: IRange;
}

/**
 * Text edit
 */
export interface ITextEdit {
  range: IRange;
  newText: string;
}

/**
 * Formatting options
 */
export interface IFormattingOptions {
  tabSize: number;
  insertSpaces: boolean;
}

/**
 * Code action
 */
export interface ICodeAction {
  title: string;
  kind?: CodeActionKind;
  diagnostics?: Diagnostic[];
  edit?: IWorkspaceEdit;
  command?: ICommand;
}

/**
 * Code action kinds
 */
export enum CodeActionKind {
  QuickFix = 'quickfix',
  Refactor = 'refactor',
  RefactorExtract = 'refactor.extract',
  RefactorInline = 'refactor.inline',
  RefactorRewrite = 'refactor.rewrite',
  Source = 'source',
  SourceOrganizeImports = 'source.organizeImports'
}

/**
 * Workspace edit
 */
export interface IWorkspaceEdit {
  changes?: { [uri: string]: ITextEdit[] };
}

/**
 * Command
 */
export interface ICommand {
  title: string;
  command: string;
  arguments?: any[];
}