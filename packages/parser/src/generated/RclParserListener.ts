
import { ErrorNode, ParseTreeListener, ParserRuleContext, TerminalNode } from "antlr4ng";


import { Rcl_fileContext } from "./RclParser.js";
import { Import_statementContext } from "./RclParser.js";
import { Import_pathContext } from "./RclParser.js";
import { SectionContext } from "./RclParser.js";
import { Section_headerContext } from "./RclParser.js";
import { Header_valuesContext } from "./RclParser.js";
import { IdentifierContext } from "./RclParser.js";
import { Section_bodyContext } from "./RclParser.js";
import { Section_contentContext } from "./RclParser.js";
import { State_referenceContext } from "./RclParser.js";
import { Spread_directiveContext } from "./RclParser.js";
import { Attribute_assignmentContext } from "./RclParser.js";
import { Match_blockContext } from "./RclParser.js";
import { Match_caseContext } from "./RclParser.js";
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


/**
 * This interface defines a complete listener for a parse tree produced by
 * `RclParser`.
 */
export class RclParserListener implements ParseTreeListener {
    /**
     * Enter a parse tree produced by `RclParser.rcl_file`.
     * @param ctx the parse tree
     */
    enterRcl_file?: (ctx: Rcl_fileContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.rcl_file`.
     * @param ctx the parse tree
     */
    exitRcl_file?: (ctx: Rcl_fileContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.import_statement`.
     * @param ctx the parse tree
     */
    enterImport_statement?: (ctx: Import_statementContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.import_statement`.
     * @param ctx the parse tree
     */
    exitImport_statement?: (ctx: Import_statementContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.import_path`.
     * @param ctx the parse tree
     */
    enterImport_path?: (ctx: Import_pathContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.import_path`.
     * @param ctx the parse tree
     */
    exitImport_path?: (ctx: Import_pathContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.section`.
     * @param ctx the parse tree
     */
    enterSection?: (ctx: SectionContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.section`.
     * @param ctx the parse tree
     */
    exitSection?: (ctx: SectionContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.section_header`.
     * @param ctx the parse tree
     */
    enterSection_header?: (ctx: Section_headerContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.section_header`.
     * @param ctx the parse tree
     */
    exitSection_header?: (ctx: Section_headerContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.header_values`.
     * @param ctx the parse tree
     */
    enterHeader_values?: (ctx: Header_valuesContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.header_values`.
     * @param ctx the parse tree
     */
    exitHeader_values?: (ctx: Header_valuesContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.identifier`.
     * @param ctx the parse tree
     */
    enterIdentifier?: (ctx: IdentifierContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.identifier`.
     * @param ctx the parse tree
     */
    exitIdentifier?: (ctx: IdentifierContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.section_body`.
     * @param ctx the parse tree
     */
    enterSection_body?: (ctx: Section_bodyContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.section_body`.
     * @param ctx the parse tree
     */
    exitSection_body?: (ctx: Section_bodyContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.section_content`.
     * @param ctx the parse tree
     */
    enterSection_content?: (ctx: Section_contentContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.section_content`.
     * @param ctx the parse tree
     */
    exitSection_content?: (ctx: Section_contentContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.state_reference`.
     * @param ctx the parse tree
     */
    enterState_reference?: (ctx: State_referenceContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.state_reference`.
     * @param ctx the parse tree
     */
    exitState_reference?: (ctx: State_referenceContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.spread_directive`.
     * @param ctx the parse tree
     */
    enterSpread_directive?: (ctx: Spread_directiveContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.spread_directive`.
     * @param ctx the parse tree
     */
    exitSpread_directive?: (ctx: Spread_directiveContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.attribute_assignment`.
     * @param ctx the parse tree
     */
    enterAttribute_assignment?: (ctx: Attribute_assignmentContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.attribute_assignment`.
     * @param ctx the parse tree
     */
    exitAttribute_assignment?: (ctx: Attribute_assignmentContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.match_block`.
     * @param ctx the parse tree
     */
    enterMatch_block?: (ctx: Match_blockContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.match_block`.
     * @param ctx the parse tree
     */
    exitMatch_block?: (ctx: Match_blockContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.match_case`.
     * @param ctx the parse tree
     */
    enterMatch_case?: (ctx: Match_caseContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.match_case`.
     * @param ctx the parse tree
     */
    exitMatch_case?: (ctx: Match_caseContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.simple_transition`.
     * @param ctx the parse tree
     */
    enterSimple_transition?: (ctx: Simple_transitionContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.simple_transition`.
     * @param ctx the parse tree
     */
    exitSimple_transition?: (ctx: Simple_transitionContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.contextualized_value`.
     * @param ctx the parse tree
     */
    enterContextualized_value?: (ctx: Contextualized_valueContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.contextualized_value`.
     * @param ctx the parse tree
     */
    exitContextualized_value?: (ctx: Contextualized_valueContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.parameter_list`.
     * @param ctx the parse tree
     */
    enterParameter_list?: (ctx: Parameter_listContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.parameter_list`.
     * @param ctx the parse tree
     */
    exitParameter_list?: (ctx: Parameter_listContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.parameter`.
     * @param ctx the parse tree
     */
    enterParameter?: (ctx: ParameterContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.parameter`.
     * @param ctx the parse tree
     */
    exitParameter?: (ctx: ParameterContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.value`.
     * @param ctx the parse tree
     */
    enterValue?: (ctx: ValueContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.value`.
     * @param ctx the parse tree
     */
    exitValue?: (ctx: ValueContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.primitive_value`.
     * @param ctx the parse tree
     */
    enterPrimitive_value?: (ctx: Primitive_valueContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.primitive_value`.
     * @param ctx the parse tree
     */
    exitPrimitive_value?: (ctx: Primitive_valueContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.triple_quote_string`.
     * @param ctx the parse tree
     */
    enterTriple_quote_string?: (ctx: Triple_quote_stringContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.triple_quote_string`.
     * @param ctx the parse tree
     */
    exitTriple_quote_string?: (ctx: Triple_quote_stringContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.triple_string_content`.
     * @param ctx the parse tree
     */
    enterTriple_string_content?: (ctx: Triple_string_contentContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.triple_string_content`.
     * @param ctx the parse tree
     */
    exitTriple_string_content?: (ctx: Triple_string_contentContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.interpolation`.
     * @param ctx the parse tree
     */
    enterInterpolation?: (ctx: InterpolationContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.interpolation`.
     * @param ctx the parse tree
     */
    exitInterpolation?: (ctx: InterpolationContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.interpolation_expr`.
     * @param ctx the parse tree
     */
    enterInterpolation_expr?: (ctx: Interpolation_exprContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.interpolation_expr`.
     * @param ctx the parse tree
     */
    exitInterpolation_expr?: (ctx: Interpolation_exprContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.variable_access`.
     * @param ctx the parse tree
     */
    enterVariable_access?: (ctx: Variable_accessContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.variable_access`.
     * @param ctx the parse tree
     */
    exitVariable_access?: (ctx: Variable_accessContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.type_tag`.
     * @param ctx the parse tree
     */
    enterType_tag?: (ctx: Type_tagContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.type_tag`.
     * @param ctx the parse tree
     */
    exitType_tag?: (ctx: Type_tagContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.list`.
     * @param ctx the parse tree
     */
    enterList?: (ctx: ListContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.list`.
     * @param ctx the parse tree
     */
    exitList?: (ctx: ListContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.parentheses_list`.
     * @param ctx the parse tree
     */
    enterParentheses_list?: (ctx: Parentheses_listContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.parentheses_list`.
     * @param ctx the parse tree
     */
    exitParentheses_list?: (ctx: Parentheses_listContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.list_elements`.
     * @param ctx the parse tree
     */
    enterList_elements?: (ctx: List_elementsContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.list_elements`.
     * @param ctx the parse tree
     */
    exitList_elements?: (ctx: List_elementsContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.block_list`.
     * @param ctx the parse tree
     */
    enterBlock_list?: (ctx: Block_listContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.block_list`.
     * @param ctx the parse tree
     */
    exitBlock_list?: (ctx: Block_listContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.block_list_item`.
     * @param ctx the parse tree
     */
    enterBlock_list_item?: (ctx: Block_list_itemContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.block_list_item`.
     * @param ctx the parse tree
     */
    exitBlock_list_item?: (ctx: Block_list_itemContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.dictionary`.
     * @param ctx the parse tree
     */
    enterDictionary?: (ctx: DictionaryContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.dictionary`.
     * @param ctx the parse tree
     */
    exitDictionary?: (ctx: DictionaryContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.brace_dictionary`.
     * @param ctx the parse tree
     */
    enterBrace_dictionary?: (ctx: Brace_dictionaryContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.brace_dictionary`.
     * @param ctx the parse tree
     */
    exitBrace_dictionary?: (ctx: Brace_dictionaryContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.block_dictionary`.
     * @param ctx the parse tree
     */
    enterBlock_dictionary?: (ctx: Block_dictionaryContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.block_dictionary`.
     * @param ctx the parse tree
     */
    exitBlock_dictionary?: (ctx: Block_dictionaryContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.dict_entry`.
     * @param ctx the parse tree
     */
    enterDict_entry?: (ctx: Dict_entryContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.dict_entry`.
     * @param ctx the parse tree
     */
    exitDict_entry?: (ctx: Dict_entryContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.embedded_code`.
     * @param ctx the parse tree
     */
    enterEmbedded_code?: (ctx: Embedded_codeContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.embedded_code`.
     * @param ctx the parse tree
     */
    exitEmbedded_code?: (ctx: Embedded_codeContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.multi_line_code`.
     * @param ctx the parse tree
     */
    enterMulti_line_code?: (ctx: Multi_line_codeContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.multi_line_code`.
     * @param ctx the parse tree
     */
    exitMulti_line_code?: (ctx: Multi_line_codeContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.multi_line_string`.
     * @param ctx the parse tree
     */
    enterMulti_line_string?: (ctx: Multi_line_stringContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.multi_line_string`.
     * @param ctx the parse tree
     */
    exitMulti_line_string?: (ctx: Multi_line_stringContext) => void;
    /**
     * Enter a parse tree produced by `RclParser.multiline_content`.
     * @param ctx the parse tree
     */
    enterMultiline_content?: (ctx: Multiline_contentContext) => void;
    /**
     * Exit a parse tree produced by `RclParser.multiline_content`.
     * @param ctx the parse tree
     */
    exitMultiline_content?: (ctx: Multiline_contentContext) => void;

    visitTerminal(node: TerminalNode): void {}
    visitErrorNode(node: ErrorNode): void {}
    enterEveryRule(node: ParserRuleContext): void {}
    exitEveryRule(node: ParserRuleContext): void {}
}

