
import { AbstractParseTreeVisitor } from "antlr4ng";


import { Rcl_fileContext } from "./RclParser.js";
import { Import_statementContext } from "./RclParser.js";
import { Import_pathContext } from "./RclParser.js";
import { SectionContext } from "./RclParser.js";
import { Section_headerContext } from "./RclParser.js";
import { Section_typeContext } from "./RclParser.js";
import { Header_valuesContext } from "./RclParser.js";
import { IdentifierContext } from "./RclParser.js";
import { Section_bodyContext } from "./RclParser.js";
import { Section_contentContext } from "./RclParser.js";
import { State_referenceContext } from "./RclParser.js";
import { Spread_directiveContext } from "./RclParser.js";
import { Attribute_assignmentContext } from "./RclParser.js";
import { Match_blockContext } from "./RclParser.js";
import { Match_caseContext } from "./RclParser.js";
import { Transition_targetContext } from "./RclParser.js";
import { Flow_invocation_with_handlersContext } from "./RclParser.js";
import { Context_operation_sequenceContext } from "./RclParser.js";
import { Simple_transitionContext } from "./RclParser.js";
import { Contextualized_valueContext } from "./RclParser.js";
import { Parameter_listContext } from "./RclParser.js";
import { ParameterContext } from "./RclParser.js";
import { ValueContext } from "./RclParser.js";
import { Primitive_valueContext } from "./RclParser.js";
import { Triple_quote_stringContext } from "./RclParser.js";
import { Triple_string_contentContext } from "./RclParser.js";
import { InterpolationContext } from "./RclParser.js";
import { Interpolation_exprContext } from "./RclParser.js";
import { Variable_accessContext } from "./RclParser.js";
import { Type_tagContext } from "./RclParser.js";
import { ListContext } from "./RclParser.js";
import { Parentheses_listContext } from "./RclParser.js";
import { List_elementsContext } from "./RclParser.js";
import { Block_listContext } from "./RclParser.js";
import { Block_list_itemContext } from "./RclParser.js";
import { DictionaryContext } from "./RclParser.js";
import { Brace_dictionaryContext } from "./RclParser.js";
import { Block_dictionaryContext } from "./RclParser.js";
import { Dict_entryContext } from "./RclParser.js";
import { Embedded_codeContext } from "./RclParser.js";
import { Multi_line_codeContext } from "./RclParser.js";
import { Multi_line_stringContext } from "./RclParser.js";
import { Multiline_contentContext } from "./RclParser.js";
import { Flow_invocationContext } from "./RclParser.js";
import { Flow_result_handlerContext } from "./RclParser.js";
import { Flow_resultContext } from "./RclParser.js";
import { Context_operationContext } from "./RclParser.js";
import { Target_referenceContext } from "./RclParser.js";
import { Flow_terminationContext } from "./RclParser.js";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `RclParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class RclParserVisitor<Result> extends AbstractParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `RclParser.rcl_file`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRcl_file?: (ctx: Rcl_fileContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.import_statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitImport_statement?: (ctx: Import_statementContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.import_path`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitImport_path?: (ctx: Import_pathContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.section`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSection?: (ctx: SectionContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.section_header`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSection_header?: (ctx: Section_headerContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.section_type`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSection_type?: (ctx: Section_typeContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.header_values`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitHeader_values?: (ctx: Header_valuesContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.identifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdentifier?: (ctx: IdentifierContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.section_body`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSection_body?: (ctx: Section_bodyContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.section_content`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSection_content?: (ctx: Section_contentContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.state_reference`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitState_reference?: (ctx: State_referenceContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.spread_directive`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSpread_directive?: (ctx: Spread_directiveContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.attribute_assignment`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAttribute_assignment?: (ctx: Attribute_assignmentContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.match_block`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMatch_block?: (ctx: Match_blockContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.match_case`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMatch_case?: (ctx: Match_caseContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.transition_target`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTransition_target?: (ctx: Transition_targetContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.flow_invocation_with_handlers`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFlow_invocation_with_handlers?: (ctx: Flow_invocation_with_handlersContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.context_operation_sequence`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitContext_operation_sequence?: (ctx: Context_operation_sequenceContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.simple_transition`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSimple_transition?: (ctx: Simple_transitionContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.contextualized_value`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitContextualized_value?: (ctx: Contextualized_valueContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.parameter_list`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParameter_list?: (ctx: Parameter_listContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.parameter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParameter?: (ctx: ParameterContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.value`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitValue?: (ctx: ValueContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.primitive_value`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPrimitive_value?: (ctx: Primitive_valueContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.triple_quote_string`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTriple_quote_string?: (ctx: Triple_quote_stringContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.triple_string_content`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTriple_string_content?: (ctx: Triple_string_contentContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.interpolation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInterpolation?: (ctx: InterpolationContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.interpolation_expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInterpolation_expr?: (ctx: Interpolation_exprContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.variable_access`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVariable_access?: (ctx: Variable_accessContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.type_tag`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitType_tag?: (ctx: Type_tagContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.list`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitList?: (ctx: ListContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.parentheses_list`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParentheses_list?: (ctx: Parentheses_listContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.list_elements`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitList_elements?: (ctx: List_elementsContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.block_list`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBlock_list?: (ctx: Block_listContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.block_list_item`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBlock_list_item?: (ctx: Block_list_itemContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.dictionary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDictionary?: (ctx: DictionaryContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.brace_dictionary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBrace_dictionary?: (ctx: Brace_dictionaryContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.block_dictionary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBlock_dictionary?: (ctx: Block_dictionaryContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.dict_entry`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDict_entry?: (ctx: Dict_entryContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.embedded_code`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEmbedded_code?: (ctx: Embedded_codeContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.multi_line_code`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMulti_line_code?: (ctx: Multi_line_codeContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.multi_line_string`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMulti_line_string?: (ctx: Multi_line_stringContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.multiline_content`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMultiline_content?: (ctx: Multiline_contentContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.flow_invocation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFlow_invocation?: (ctx: Flow_invocationContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.flow_result_handler`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFlow_result_handler?: (ctx: Flow_result_handlerContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.flow_result`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFlow_result?: (ctx: Flow_resultContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.context_operation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitContext_operation?: (ctx: Context_operationContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.target_reference`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTarget_reference?: (ctx: Target_referenceContext) => Result;
    /**
     * Visit a parse tree produced by `RclParser.flow_termination`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFlow_termination?: (ctx: Flow_terminationContext) => Result;
}

