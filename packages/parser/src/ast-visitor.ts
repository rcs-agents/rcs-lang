/**
 * ANTLR Visitor that converts parse tree to the formal AST structure
 */

import { ParserRuleContext, type Token, AbstractParseTreeVisitor, ErrorNode, ParseTree, TerminalNode } from 'antlr4ng';
import { RclParserVisitor } from './generated/RclParserVisitor.js';
import { Rcl_fileContext } from './generated/RclParser.js';

import {
  type AppendOperation,
  type Atom,
  type Attribute,
  type BooleanLiteral,
  type ContextOperation,
  type ContextOperationSequence,
  type ContextualizedValue,
  type Dictionary,
  type DictionaryEntry,
  type FlowInvocation,
  type FlowResult,
  type FlowResultHandler,
  type FlowTermination,
  type Identifier,
  type ImportStatement,
  type List,
  type MatchBlock,
  type MatchCase,
  type MergeOperation,
  type MultiLineCode,
  MultiLineString,
  type NullLiteral,
  type NumericLiteral,
  type Parameter,
  type ParameterList,
  type PropertyAccess,
  type RclFile,
  type Section,
  type SetOperation,
  type SimpleTransition,
  type SingleLineCode,
  type SpreadDirective,
  type StateReference,
  type StringLiteral,
  type TargetReference,
  type TypeTag,
  type Value,
  type Variable,
  type WithLocation,
  createLocation,
  createPosition,
  createRange,
  withLocation,
} from '@rcs-lang/ast';


export class ASTVisitor extends AbstractParseTreeVisitor<any> implements RclParserVisitor<any> {
  private source: string;

  constructor(source: string) {
    super();
    this.source = source;
  }

  protected defaultResult(): any {
    return null;
  }

  /**
   * Convert token to position tracking
   */
  private tokenToLocation(start: Token, stop: Token): WithLocation {
    const location = createLocation(
      createRange(
        createPosition(start.line - 1, start.column),
        createPosition(stop.line - 1, stop.column + (stop.text?.length || 0)),
      ),
      this.source,
    );
    return { location };
  }

  /**
   * Convert context to position tracking
   */
  private contextToLocation(ctx: ParserRuleContext): WithLocation {
    if (!ctx.start || !ctx.stop) {
      return {};
    }
    return this.tokenToLocation(ctx.start, ctx.stop);
  }

  /**
   * Visit RCL file root
   */
  visitRcl_file(ctx: Rcl_fileContext): RclFile {
    const imports: ImportStatement[] = [];
    const sections: Section[] = [];

    // Visit import statements
    const importCtxs = ctx.import_statement();
    for (const importCtx of importCtxs) {
      const importStmt = this.visit(importCtx);
      if (importStmt) {
        imports.push(importStmt);
      }
    }

    // Visit sections
    const sectionCtxs = ctx.section();
    for (const sectionCtx of sectionCtxs) {
      const section = this.visit(sectionCtx);
      if (section) {
        sections.push(section);
      }
    }

    return withLocation<RclFile>(
      {
        type: 'RclFile',
        imports,
        sections,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit import statement
   */
  visitImport_statement(ctx: any): ImportStatement {
    const pathCtx = ctx.import_path();
    const importPath: string[] = [];

    // Extract path segments
    const identifiers = pathCtx.IDENTIFIER();
    for (const id of identifiers) {
      importPath.push(id.getText());
    }

    // Extract alias if present
    let alias: Identifier | undefined;
    const asIndex = ctx.children?.findIndex(
      (child: any) => child instanceof TerminalNode && child.getText() === 'as',
    );
    if (asIndex !== undefined && asIndex >= 0 && ctx.children) {
      const aliasNode = ctx.children[asIndex + 1];
      if (aliasNode instanceof TerminalNode) {
        alias = withLocation<Identifier>(
          {
            type: 'Identifier',
            value: aliasNode.getText(),
          },
          this.tokenToLocation(aliasNode.symbol, aliasNode.symbol).location,
        );
      }
    }

    return withLocation<ImportStatement>(
      {
        type: 'ImportStatement',
        importPath,
        alias,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit section
   */
  visitSection(ctx: any): Section {
    const headerCtx = ctx.section_header();
    const bodyCtx = ctx.section_body();

    // Extract section type
    const sectionTypeCtx = headerCtx.section_type();
    const sectionType = sectionTypeCtx.LOWER_NAME() 
      ? sectionTypeCtx.LOWER_NAME().getText()
      : sectionTypeCtx.ON().getText();

    // Extract identifier if present
    let identifier: Identifier | undefined;
    const idNode = headerCtx.IDENTIFIER();
    if (idNode) {
      identifier = withLocation<Identifier>(
        {
          type: 'Identifier',
          value: idNode.getText(),
        },
        this.tokenToLocation(idNode.symbol, idNode.symbol).location,
      );
    }

    // Extract header values and existing parameters
    let parameters: ParameterList | undefined;

    // First, check for header values (positional parameters)
    const headerValuesCtx = headerCtx.header_values();
    if (headerValuesCtx) {
      parameters = [];
      const valueCtxs = headerValuesCtx.value();
      const valueArray = Array.isArray(valueCtxs) ? valueCtxs : [valueCtxs];
      for (const valueCtx of valueArray) {
        // Create positional parameters from header values
        parameters.push(
          withLocation<Parameter>(
            {
              type: 'Parameter',
              value: this.visitValue(valueCtx),
            },
            this.contextToLocation(valueCtx).location,
          ),
        );
      }
    }

    // Then, extract named parameters if present
    const paramListCtx = headerCtx.parameter_list();
    if (paramListCtx) {
      const namedParams = this.visitParameter_list(paramListCtx);
      if (parameters) {
        // Append named parameters to positional ones
        parameters = parameters.concat(namedParams);
      } else {
        parameters = namedParams;
      }
    }

    // Extract body content
    const body: (SpreadDirective | Attribute | Section | MatchBlock | FlowInvocation | SimpleTransition | StateReference | Value)[] = [];
    if (bodyCtx) {
      const contentCtxs = bodyCtx.section_content();
      for (const contentCtx of contentCtxs) {
        const content = this.visitSection_content(contentCtx);
        if (content) {
          body.push(content);
        }
      }
    }

    return withLocation<Section>(
      {
        type: 'Section',
        sectionType,
        identifier,
        parameters,
        body,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit section content
   */
  visitSection_content(
    ctx: any,
  ): SpreadDirective | Attribute | Section | MatchBlock | FlowInvocation | SimpleTransition | StateReference | Value | null {
    if (ctx.spread_directive()) {
      return this.visitSpread_directive(ctx.spread_directive()!);
    }
    if (ctx.attribute_assignment()) {
      return this.visitAttribute_assignment(ctx.attribute_assignment()!);
    }
    if (ctx.section()) {
      return this.visitSection(ctx.section()!);
    }
    if (ctx.match_block()) {
      return this.visitMatch_block(ctx.match_block()!);
    }
    if (ctx.flow_invocation()) {
      return this.visitFlow_invocation(ctx.flow_invocation()!);
    }
    if (ctx.simple_transition()) {
      return this.visitSimple_transition(ctx.simple_transition()!);
    }
    if (ctx.state_reference()) {
      return this.visitState_reference(ctx.state_reference()!);
    }
    return null;
  }

  /**
   * Visit spread directive
   */
  visitSpread_directive(ctx: any): SpreadDirective {
    const idNode = ctx.IDENTIFIER();
    const reference = withLocation<Identifier>(
      {
        type: 'Identifier',
        value: idNode.getText(),
      },
      this.tokenToLocation(idNode.symbol, idNode.symbol).location,
    );
    return withLocation<SpreadDirective>(
      {
        type: 'SpreadDirective',
        reference,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit attribute assignment
   */
  visitAttribute_assignment(ctx: any): Attribute {
    const attributeName = ctx.ATTRIBUTE_NAME();
    if (!attributeName) {
      throw new Error('Attribute assignment must have an attribute name');
    }

    const key = attributeName.getText().slice(0, -1); // Remove trailing colon

    // Check if there's a value
    const valueCtx = ctx.value(0); // Use index 0 to get first value
    let value: Value;

    if (!valueCtx) {
      // No value case (attribute: with no value)
      value = withLocation<NullLiteral>(
        {
          type: 'NullLiteral',
          value: null,
        },
        this.contextToLocation(ctx).location,
      );
    } else {
      value = this.visitValue(valueCtx);
    }

    return withLocation<Attribute>(
      {
        type: 'Attribute',
        key,
        value,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit match block
   */
  visitMatch_block(ctx: any): MatchBlock {
    const discriminant = this.visitValue(ctx.value());
    const cases: MatchCase[] = [];

    const caseCtxs = ctx.match_case();
    for (const caseCtx of caseCtxs) {
      const matchCase = this.visitMatch_case(caseCtx);
      if (matchCase) {
        cases.push(matchCase);
      }
    }

    return withLocation<MatchBlock>(
      {
        type: 'MatchBlock',
        discriminant,
        cases,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit match case
   */
  visitMatch_case(ctx: any): MatchCase {
    let value: StringLiteral | NumericLiteral | Atom | 'default';

    if (ctx.DEFAULT_CASE()) {
      value = 'default';
    } else if (ctx.STRING()) {
      value = this.visitStringLiteral(ctx.STRING()!);
    } else if (ctx.NUMBER()) {
      value = this.visitNumericLiteral(ctx.NUMBER()!);
    } else if (ctx.ATOM()) {
      value = this.visitAtom(ctx.ATOM()!);
    } else {
      throw new Error('Invalid match case value');
    }

    // Visit transition target
    const consequence = this.visitTransition_target(ctx.transition_target());

    return withLocation<MatchCase>(
      {
        type: 'MatchCase',
        value,
        consequence,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit contextualized value
   */
  visitContextualized_value(ctx: any): ContextualizedValue {
    const value = this.visitValue(ctx.value());
    let context: ParameterList | undefined;

    const paramListCtx = ctx.parameter_list();
    if (paramListCtx) {
      context = this.visitParameter_list(paramListCtx);
    }

    return withLocation<ContextualizedValue>(
      {
        type: 'ContextualizedValue',
        value,
        context,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit parameter list
   */
  visitParameter_list(ctx: any): ParameterList {
    const parameters: Parameter[] = [];
    const paramCtxs = ctx.parameter();

    for (const paramCtx of paramCtxs) {
      const param = this.visitParameter(paramCtx);
      if (param) {
        parameters.push(param);
      }
    }

    return parameters;
  }

  /**
   * Visit parameter
   */
  visitParameter(ctx: any): Parameter {
    // Check if it's a named parameter
    const attributeName = ctx.ATTRIBUTE_NAME?.();
    if (attributeName) {
      // Named parameter with colon included in token
      const valueCtx = ctx.value();
      if (!valueCtx) {
        throw new Error('Named parameter must have a value');
      }
      
      return withLocation<Parameter>(
        {
          type: 'Parameter',
          key: attributeName.getText().slice(0, -1).trim(), // Remove trailing colon and whitespace
          value: this.visitValue(valueCtx),
        },
        this.contextToLocation(ctx).location,
      );
    }

    const lowerName = ctx.LOWER_NAME();
    if (lowerName && ctx.COLON()) {
      // key : value
      const valueCtx = ctx.value();
      if (!valueCtx) {
        throw new Error('Named parameter must have a value after colon');
      }
      
      return withLocation<Parameter>(
        {
          type: 'Parameter',
          key: lowerName.getText(),
          value: this.visitValue(valueCtx),
        },
        this.contextToLocation(ctx).location,
      );
    }

    // Positional parameter
    const valueCtx = ctx.value(0);
    if (!valueCtx) {
      throw new Error('Parameter must have a value');
    }
    
    return withLocation<Parameter>(
      {
        type: 'Parameter',
        value: this.visitValue(valueCtx),
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit value
   */
  visitValue(ctx: any): Value {
    if (!ctx) {
      throw new Error('Cannot visit null value context');
    }
    
    // Primitive values
    if (ctx.primitive_value()) {
      return this.visitPrimitive_value(ctx.primitive_value()!);
    }

    // Identifier
    if (ctx.IDENTIFIER()) {
      const idNode = ctx.IDENTIFIER()!;
      return withLocation<Identifier>(
        {
          type: 'Identifier',
          value: idNode.getText(),
        },
        this.tokenToLocation(idNode.symbol, idNode.symbol).location,
      );
    }

    // Variable access
    if (ctx.variable_access()) {
      return this.visitVariable_access(ctx.variable_access()!);
    }

    // Parentheses list
    if (ctx.parentheses_list()) {
      return this.visitParentheses_list(ctx.parentheses_list()!);
    }

    // Dictionary
    if (ctx.dictionary()) {
      return this.visitDictionary(ctx.dictionary()!);
    }

    // Embedded code
    if (ctx.embedded_code()) {
      return this.visitEmbedded_code(ctx.embedded_code()!);
    }

    // Multi-line string
    if (ctx.multi_line_string()) {
      return this.visitMulti_line_string(ctx.multi_line_string()!);
    }

    throw new Error('Unknown value type');
  }

  /**
   * Visit primitive value
   */
  visitPrimitive_value(ctx: any): Value {
    if (ctx.STRING()) {
      return this.visitStringLiteral(ctx.STRING()!);
    }
    if (ctx.triple_quote_string()) {
      return this.visitTriple_quote_string(ctx.triple_quote_string()!);
    }
    if (ctx.REGEX()) {
      return this.visitRegexLiteral(ctx.REGEX()!);
    }
    if (ctx.NUMBER()) {
      return this.visitNumericLiteral(ctx.NUMBER()!);
    }
    if (ctx.BOOLEAN()) {
      return this.visitBooleanLiteral(ctx.BOOLEAN()!);
    }
    if (ctx.NULL()) {
      return this.visitNullLiteral(ctx.NULL()!);
    }
    if (ctx.ATOM()) {
      return this.visitAtom(ctx.ATOM()!);
    }
    if (ctx.type_tag()) {
      return this.visitType_tag(ctx.type_tag()!);
    }

    throw new Error('Unknown primitive value type');
  }

  /**
   * Visit string literal
   */
  visitStringLiteral(node: TerminalNode): StringLiteral {
    const text = node.getText();
    // Remove quotes and handle escape sequences
    const value = text.slice(1, -1).replace(/\\(.)/g, '$1');

    const token = node.symbol;
    return withLocation<StringLiteral>(
      {
        type: 'StringLiteral',
        value,
      },
      this.tokenToLocation(token, token).location,
    );
  }

  /**
   * Visit numeric literal
   */
  visitNumericLiteral(node: TerminalNode): NumericLiteral {
    const value = Number.parseFloat(node.getText());
    const token = node.symbol;

    return withLocation<NumericLiteral>(
      {
        type: 'NumericLiteral',
        value,
      },
      this.tokenToLocation(token, token).location,
    );
  }

  /**
   * Visit regex literal
   */
  visitRegexLiteral(node: TerminalNode): StringLiteral {
    const text = node.getText();
    // For now, treat regex as a string literal
    const token = node.symbol;
    return withLocation<StringLiteral>(
      {
        type: 'StringLiteral',
        value: text,
      },
      this.tokenToLocation(token, token).location,
    );
  }

  /**
   * Visit boolean literal
   */
  visitBooleanLiteral(node: TerminalNode): BooleanLiteral {
    const token = node.symbol;
    return withLocation<BooleanLiteral>(
      {
        type: 'BooleanLiteral',
        value: node.getText() === 'true',
      },
      this.tokenToLocation(token, token).location,
    );
  }

  /**
   * Visit null literal
   */
  visitNullLiteral(node: TerminalNode): NullLiteral {
    const token = node.symbol;
    return withLocation<NullLiteral>(
      {
        type: 'NullLiteral',
        value: null,
      },
      this.tokenToLocation(token, token).location,
    );
  }

  /**
   * Visit boolean literal
   */

  /**
   * Visit atom
   */
  visitAtom(node: TerminalNode): Atom {
    const token = node.symbol;
    return withLocation<Atom>(
      {
        type: 'Atom',
        value: node.getText(),
      },
      this.tokenToLocation(token, token).location,
    );
  }

  /**
   * Visit variable
   */
  visitVariable(node: TerminalNode): Variable {
    const token = node.symbol;
    return withLocation<Variable>(
      {
        type: 'Variable',
        name: node.getText(),
      },
      this.tokenToLocation(token, token).location,
    );
  }

  /**
   * Visit variable access
   */
  visitVariable_access(ctx: any): Variable | PropertyAccess {
    const varToken = ctx.VARIABLE();
    if (!varToken) {
      throw new Error('Variable access must have a VARIABLE token');
    }

    const variable = this.visitVariable(varToken);

    // Check for property access
    const properties: string[] = [];
    const dots = ctx.DOT();
    if (dots && dots.length > 0) {
      // Get all tokens after each dot
      for (let i = 0; i < dots.length; i++) {
        const nextToken = ctx.getChild(ctx.children.indexOf(dots[i]) + 1);
        if (nextToken && nextToken.getText) {
          properties.push(nextToken.getText());
        }
      }
    }

    if (properties.length > 0) {
      return withLocation<PropertyAccess>(
        {
          type: 'PropertyAccess',
          object: variable,
          properties,
        },
        this.contextToLocation(ctx).location,
      );
    }

    return variable;
  }

  /**
   * Visit parentheses list
   */
  visitParentheses_list(ctx: any): List {
    const items: Value[] = [];

    // Get list_elements if present
    const listElements = ctx.list_elements();
    if (listElements) {
      const valueCtxs = listElements.value();
      if (Array.isArray(valueCtxs)) {
        for (const valueCtx of valueCtxs) {
          items.push(this.visitValue(valueCtx));
        }
      } else if (valueCtxs) {
        items.push(this.visitValue(valueCtxs));
      }
    }

    return withLocation<List>(
      {
        type: 'List',
        items,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit dictionary
   */
  visitDictionary(ctx: any): Dictionary {
    const entries: DictionaryEntry[] = [];

    if (ctx.brace_dictionary()) {
      const entryCtxs = ctx.brace_dictionary()!.dict_entry();
      for (const entryCtx of entryCtxs) {
        entries.push(this.visitDict_entry(entryCtx));
      }
    } else if (ctx.block_dictionary()) {
      const entryCtxs = ctx.block_dictionary()!.dict_entry();
      for (const entryCtx of entryCtxs) {
        entries.push(this.visitDict_entry(entryCtx));
      }
    }

    return withLocation<Dictionary>(
      {
        type: 'Dictionary',
        entries,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit dictionary entry
   */
  visitDict_entry(ctx: any): DictionaryEntry {
    let key: string | StringLiteral;

    if (ctx.LOWER_NAME()) {
      key = ctx.LOWER_NAME()!.getText();
    } else if (ctx.STRING()) {
      key = this.visitStringLiteral(ctx.STRING()!);
    } else {
      throw new Error('Invalid dictionary key');
    }

    const value = this.visitValue(ctx.value());

    return withLocation<DictionaryEntry>(
      {
        type: 'DictionaryEntry',
        key,
        value,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit type tag
   */
  visitType_tag(ctx: any): TypeTag {
    const tagName = ctx.TT_TYPE_NAME().getText();
    let value: string | number;
    let qualifier: string | undefined;

    // Extract value from TT_CONTENT tokens
    const contents = ctx.TT_CONTENT();
    if (contents && contents.length > 0) {
      // First TT_CONTENT is the value
      value = contents[0].getText().trim();

      // Check if value is a number
      const numValue = Number.parseFloat(value as string);
      if (!isNaN(numValue) && numValue.toString() === value) {
        value = numValue;
      }

      // Second TT_CONTENT (after pipe) is the qualifier
      if (contents.length > 1) {
        qualifier = contents[1].getText().trim();
      }
    } else {
      // No value provided - empty type tag
      value = '';
    }

    return withLocation<TypeTag>(
      {
        type: 'TypeTag',
        tagName,
        value,
        qualifier,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit embedded code
   */
  visitEmbedded_code(ctx: any): SingleLineCode | MultiLineCode {
    if (ctx.EMBEDDED_CODE && ctx.EMBEDDED_CODE()) {
      // Single line embedded code
      return this.visitEmbeddedCodeToken(ctx.EMBEDDED_CODE()!);
    } else if (ctx.multi_line_code && ctx.multi_line_code()) {
      return this.visitMulti_line_code(ctx.multi_line_code()!);
    }
    throw new Error('Unknown embedded code type');
  }

  /**
   * Visit embedded code token (single line)
   */
  visitEmbeddedCodeToken(node: TerminalNode): SingleLineCode {
    const embeddedCode = node.getText();
    let language: 'js' | 'ts' | undefined;
    let code = '';

    // Parse the embedded code syntax: $js> code or $> expr
    const match = embeddedCode.match(/^\$((js|ts)?>)?\s*(.*)$/);
    if (match) {
      if (match[2]) {
        language = match[2] as 'js' | 'ts';
      }
      code = match[3] || '';
    }

    const token = node.symbol;
    return withLocation<SingleLineCode>(
      {
        type: 'SingleLineCode',
        language,
        code,
      },
      this.tokenToLocation(token, token).location,
    );
  }

  /**
   * Visit single line code (deprecated - kept for compatibility)
   */
  visitSingle_line_code(ctx: any): SingleLineCode {
    const embeddedCode = ctx.EMBEDDED_CODE().getText();
    let language: 'js' | 'ts' | undefined;
    let code = '';

    // Parse the embedded code syntax: $js> code or $> expr
    const match = embeddedCode.match(/^\$((js|ts)?>)?\s*(.*)$/);
    if (match) {
      if (match[2]) {
        language = match[2] as 'js' | 'ts';
      }
      code = match[3] || '';
    }

    return withLocation<SingleLineCode>(
      {
        type: 'SingleLineCode',
        language,
        code,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit multi line code
   */
  visitMulti_line_code(ctx: any): MultiLineCode {
    const startMarker = ctx.MULTI_LINE_CODE_START().getText();
    let language: 'js' | 'ts' | undefined;

    // Parse the start marker: $js>>> or $>>>
    const match = startMarker.match(/^\$((js|ts)?>>>)/);
    if (match && match[2]) {
      language = match[2] as 'js' | 'ts';
    }

    // Get code content
    const codeCtx = ctx.code_content();
    const code = codeCtx?.getText() || '';

    return withLocation<MultiLineCode>(
      {
        type: 'MultiLineCode',
        language,
        code,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit multi-line string
   */
  visitMulti_line_string(ctx: any): StringLiteral {
    const value = '';
    // Multi-line strings in RCL are simple strings
    return withLocation<StringLiteral>(
      {
        type: 'StringLiteral',
        value: ctx.getText() || '',
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit triple quote string
   */
  visitTriple_quote_string(ctx: any): StringLiteral {
    let value = '';

    // Extract content from triple-quoted string
    const contents = ctx.triple_string_content ? ctx.triple_string_content() : [];
    for (const content of contents) {
      if (content.TS_CONTENT) {
        value += content.TS_CONTENT().getText() || '';
      } else if (content.interpolation) {
        // For now, just add a placeholder for interpolations
        value += '${...}';
      }
    }

    return withLocation<StringLiteral>(
      {
        type: 'StringLiteral',
        value,
      },
      this.contextToLocation(ctx).location,
    );
  }

  // Fallback for unimplemented visitor methods
  visitChildren(node: ParseTree): any {
    if (node instanceof ParserRuleContext) {
      const result = super.visitChildren(node);
      if (result === null) {
        // Unhandled rule - silently ignore
      }
      return result;
    }
    return null;
  }

  private getRuleName(ctx: ParserRuleContext): string {
    const ruleIndex = ctx.ruleIndex;
    return 'rule_' + ruleIndex; // Simple fallback
  }

  /**
   * Visit flow invocation (basic, without result handlers)
   */
  visitFlow_invocation(ctx: any): FlowInvocation {
    const flowName = withLocation<Identifier>(
      {
        type: 'Identifier',
        value: ctx.IDENTIFIER().getText(),
      },
      this.tokenToLocation(ctx.IDENTIFIER().symbol, ctx.IDENTIFIER().symbol).location,
    );

    let parameters: ParameterList | undefined;
    if (ctx.parameter_list()) {
      parameters = this.visitParameter_list(ctx.parameter_list());
    }

    // Basic flow invocation doesn't have result handlers
    // Those are handled by flow_invocation_with_handlers
    return withLocation<FlowInvocation>(
      {
        type: 'FlowInvocation',
        flowName,
        parameters,
        resultHandlers: [],
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit flow result handler
   */
  visitFlow_result_handler(ctx: any): FlowResultHandler {
    const result = this.visitFlow_result(ctx.flow_result());
    
    let operations: ContextOperation[] | undefined;
    // Get context operations if any
    const contextOps = ctx.context_operation();
    if (contextOps) {
      operations = [];
      const opsArray = Array.isArray(contextOps) ? contextOps : [contextOps];
      for (const op of opsArray) {
        operations.push(this.visitContext_operation(op));
      }
    }

    const target = this.visitTarget_reference(ctx.target_reference());

    return withLocation<FlowResultHandler>(
      {
        type: 'FlowResultHandler',
        result,
        operations,
        target,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit flow result
   */
  visitFlow_result(ctx: any): FlowResult {
    // Check for specific flow result tokens
    if (ctx.FLOW_END()) {
      return 'end';
    } else if (ctx.FLOW_CANCEL()) {
      return 'cancel';
    } else if (ctx.FLOW_ERROR()) {
      return 'error';
    } else if (ctx.LOWER_NAME()) {
      // Handle COLON LOWER_NAME pattern (e.g., ": end" -> "end")
      const resultText = ctx.LOWER_NAME().getText();
      if (resultText === 'end') {
        return 'end';
      } else if (resultText === 'cancel') {
        return 'cancel';
      } else if (resultText === 'error') {
        return 'error';
      }
    }
    throw new Error('Unknown flow result type');
  }

  /**
   * Visit context operation chain
   */
  visitContext_operation_chain(ctx: any): ContextOperation[] {
    const operations: ContextOperation[] = [];
    const operationCtxs = ctx.context_operation();
    
    for (const operationCtx of operationCtxs) {
      operations.push(this.visitContext_operation(operationCtx));
    }

    return operations;
  }

  /**
   * Visit context operation
   */
  visitContext_operation(ctx: any): ContextOperation {
    if (ctx.APPEND()) {
      const target = this.visitVariable_access(ctx.variable_access());
      let source: Value | 'result';
      if (ctx.RESULT()) {
        source = 'result';
      } else {
        source = this.visitValue(ctx.value());
      }
      return withLocation<AppendOperation>(
        {
          type: 'AppendOperation',
          source,
          target,
        },
        this.contextToLocation(ctx).location,
      );
    } else if (ctx.SET()) {
      const target = this.visitVariable_access(ctx.variable_access());
      let source: Value | 'result';
      if (ctx.RESULT()) {
        source = 'result';
      } else {
        source = this.visitValue(ctx.value());
      }
      return withLocation<SetOperation>(
        {
          type: 'SetOperation',
          source,
          target,
        },
        this.contextToLocation(ctx).location,
      );
    } else if (ctx.MERGE()) {
      const target = this.visitVariable_access(ctx.variable_access());
      let source: Value | 'result';
      if (ctx.RESULT()) {
        source = 'result';
      } else {
        source = this.visitValue(ctx.value());
      }
      return withLocation<MergeOperation>(
        {
          type: 'MergeOperation',
          source,
          target,
        },
        this.contextToLocation(ctx).location,
      );
    }
    throw new Error('Unknown context operation type');
  }

  /**
   * Visit target reference
   */
  visitTarget_reference(ctx: any): TargetReference {
    if (ctx.IDENTIFIER()) {
      const idNode = ctx.IDENTIFIER();
      return withLocation<Identifier>(
        {
          type: 'Identifier',
          value: idNode.getText(),
        },
        this.tokenToLocation(idNode.symbol, idNode.symbol).location,
      );
    } else if (ctx.variable_access()) {
      return this.visitVariable_access(ctx.variable_access());
    } else if (ctx.flow_termination()) {
      return this.visitFlow_termination(ctx.flow_termination());
    }
    throw new Error('Unknown target reference type');
  }

  /**
   * Visit flow termination
   */
  visitFlow_termination(ctx: any): FlowTermination {
    let result: FlowResult;
    
    // Check for specific flow termination tokens
    if (ctx.FLOW_END()) {
      result = 'end';
    } else if (ctx.FLOW_CANCEL()) {
      result = 'cancel';
    } else if (ctx.FLOW_ERROR()) {
      result = 'error';
    } else if (ctx.LOWER_NAME()) {
      // Handle COLON LOWER_NAME pattern (e.g., ": end" -> "end")
      const resultText = ctx.LOWER_NAME().getText();
      if (resultText === 'end') {
        result = 'end';
      } else if (resultText === 'cancel') {
        result = 'cancel';
      } else if (resultText === 'error') {
        result = 'error';
      } else {
        throw new Error(`Unknown flow termination type: ${resultText}`);
      }
    } else {
      throw new Error('Flow termination must have valid token');
    }
    
    return withLocation<FlowTermination>(
      {
        type: 'FlowTermination',
        result,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit simple transition
   */
  visitSimple_transition(ctx: any): SimpleTransition {
    const target = this.visitTransition_target(ctx.transition_target());

    return withLocation<SimpleTransition>(
      {
        type: 'SimpleTransition',
        target,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit transition target
   */
  visitTransition_target(ctx: any): ContextualizedValue | FlowTermination | FlowInvocation | ContextOperationSequence {
    if (ctx.contextualized_value()) {
      return this.visitContextualized_value(ctx.contextualized_value());
    } else if (ctx.flow_termination()) {
      return this.visitFlow_termination(ctx.flow_termination());
    } else if (ctx.flow_invocation_with_handlers()) {
      return this.visitFlow_invocation_with_handlers(ctx.flow_invocation_with_handlers());
    } else if (ctx.context_operation_sequence()) {
      return this.visitContext_operation_sequence(ctx.context_operation_sequence());
    } else {
      throw new Error('Transition target must have one of: contextualized_value, flow_termination, flow_invocation_with_handlers, or context_operation_sequence');
    }
  }

  /**
   * Visit flow invocation with handlers
   */
  visitFlow_invocation_with_handlers(ctx: any): FlowInvocation {
    // Visit the basic flow invocation
    const flowInvocation = this.visitFlow_invocation(ctx.flow_invocation());
    
    // Visit optional result handlers
    let resultHandlers: FlowResultHandler[] = [];
    
    // In ANTLR, optional groups with + return null when not present
    // and arrays when present
    try {
      const resultHandlerContexts = ctx.flow_result_handler();
      if (resultHandlerContexts && Array.isArray(resultHandlerContexts)) {
        for (const handlerCtx of resultHandlerContexts) {
          resultHandlers.push(this.visitFlow_result_handler(handlerCtx));
        }
      }
    } catch (error) {
      // Method doesn't exist - no result handlers present
      // This is fine for basic flow invocations
    }
    
    // Return enhanced flow invocation with handlers
    return withLocation<FlowInvocation>(
      {
        type: 'FlowInvocation',
        flowName: flowInvocation.flowName,
        parameters: flowInvocation.parameters,
        resultHandlers,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit context operation sequence
   */
  visitContext_operation_sequence(ctx: any): ContextOperationSequence {
    const operations: ContextOperation[] = [];
    
    // Get all context_operation children
    const operationContexts = ctx.context_operation();
    for (const operationCtx of operationContexts || []) {
      operations.push(this.visitContext_operation(operationCtx));  
    }
    
    // Get the target reference
    const target = this.visitTarget_reference(ctx.target_reference());

    return withLocation<ContextOperationSequence>(
      {
        type: 'ContextOperationSequence',
        operations,
        target,
      },
      this.contextToLocation(ctx).location,
    );
  }

  /**
   * Visit state reference
   */
  visitState_reference(ctx: any): StateReference {
    let target: Identifier | Variable | PropertyAccess;
    
    if (ctx.IDENTIFIER()) {
      const idNode = ctx.IDENTIFIER();
      target = withLocation<Identifier>(
        {
          type: 'Identifier',
          value: idNode.getText(),
        },
        this.tokenToLocation(idNode.symbol, idNode.symbol).location,
      );
    } else if (ctx.variable_access()) {
      target = this.visitVariable_access(ctx.variable_access());
    } else {
      throw new Error('State reference must have identifier or variable access');
    }

    return withLocation<StateReference>(
      {
        type: 'StateReference',
        target,
      },
      this.contextToLocation(ctx).location,
    );
  }
}
