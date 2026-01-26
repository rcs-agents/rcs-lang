// Generated from /Users/svallory/work/rcl-tree-sitter/packages/parser/src/RclParser.g4 by ANTLR 4.9.2
import org.antlr.v4.runtime.tree.ParseTreeListener;

/**
 * This interface defines a complete listener for a parse tree produced by
 * {@link RclParser}.
 */
public interface RclParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by {@link RclParser#rcl_file}.
	 * @param ctx the parse tree
	 */
	void enterRcl_file(RclParser.Rcl_fileContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#rcl_file}.
	 * @param ctx the parse tree
	 */
	void exitRcl_file(RclParser.Rcl_fileContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#import_statement}.
	 * @param ctx the parse tree
	 */
	void enterImport_statement(RclParser.Import_statementContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#import_statement}.
	 * @param ctx the parse tree
	 */
	void exitImport_statement(RclParser.Import_statementContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#import_path}.
	 * @param ctx the parse tree
	 */
	void enterImport_path(RclParser.Import_pathContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#import_path}.
	 * @param ctx the parse tree
	 */
	void exitImport_path(RclParser.Import_pathContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#section}.
	 * @param ctx the parse tree
	 */
	void enterSection(RclParser.SectionContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#section}.
	 * @param ctx the parse tree
	 */
	void exitSection(RclParser.SectionContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#section_header}.
	 * @param ctx the parse tree
	 */
	void enterSection_header(RclParser.Section_headerContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#section_header}.
	 * @param ctx the parse tree
	 */
	void exitSection_header(RclParser.Section_headerContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#identifier}.
	 * @param ctx the parse tree
	 */
	void enterIdentifier(RclParser.IdentifierContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#identifier}.
	 * @param ctx the parse tree
	 */
	void exitIdentifier(RclParser.IdentifierContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#section_body}.
	 * @param ctx the parse tree
	 */
	void enterSection_body(RclParser.Section_bodyContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#section_body}.
	 * @param ctx the parse tree
	 */
	void exitSection_body(RclParser.Section_bodyContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#section_content}.
	 * @param ctx the parse tree
	 */
	void enterSection_content(RclParser.Section_contentContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#section_content}.
	 * @param ctx the parse tree
	 */
	void exitSection_content(RclParser.Section_contentContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#spread_directive}.
	 * @param ctx the parse tree
	 */
	void enterSpread_directive(RclParser.Spread_directiveContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#spread_directive}.
	 * @param ctx the parse tree
	 */
	void exitSpread_directive(RclParser.Spread_directiveContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#attribute_assignment}.
	 * @param ctx the parse tree
	 */
	void enterAttribute_assignment(RclParser.Attribute_assignmentContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#attribute_assignment}.
	 * @param ctx the parse tree
	 */
	void exitAttribute_assignment(RclParser.Attribute_assignmentContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#match_block}.
	 * @param ctx the parse tree
	 */
	void enterMatch_block(RclParser.Match_blockContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#match_block}.
	 * @param ctx the parse tree
	 */
	void exitMatch_block(RclParser.Match_blockContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#match_case}.
	 * @param ctx the parse tree
	 */
	void enterMatch_case(RclParser.Match_caseContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#match_case}.
	 * @param ctx the parse tree
	 */
	void exitMatch_case(RclParser.Match_caseContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#contextualized_value}.
	 * @param ctx the parse tree
	 */
	void enterContextualized_value(RclParser.Contextualized_valueContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#contextualized_value}.
	 * @param ctx the parse tree
	 */
	void exitContextualized_value(RclParser.Contextualized_valueContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#parameter_list}.
	 * @param ctx the parse tree
	 */
	void enterParameter_list(RclParser.Parameter_listContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#parameter_list}.
	 * @param ctx the parse tree
	 */
	void exitParameter_list(RclParser.Parameter_listContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#parameter}.
	 * @param ctx the parse tree
	 */
	void enterParameter(RclParser.ParameterContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#parameter}.
	 * @param ctx the parse tree
	 */
	void exitParameter(RclParser.ParameterContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#value}.
	 * @param ctx the parse tree
	 */
	void enterValue(RclParser.ValueContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#value}.
	 * @param ctx the parse tree
	 */
	void exitValue(RclParser.ValueContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#primitive_value}.
	 * @param ctx the parse tree
	 */
	void enterPrimitive_value(RclParser.Primitive_valueContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#primitive_value}.
	 * @param ctx the parse tree
	 */
	void exitPrimitive_value(RclParser.Primitive_valueContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#triple_quote_string}.
	 * @param ctx the parse tree
	 */
	void enterTriple_quote_string(RclParser.Triple_quote_stringContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#triple_quote_string}.
	 * @param ctx the parse tree
	 */
	void exitTriple_quote_string(RclParser.Triple_quote_stringContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#triple_string_content}.
	 * @param ctx the parse tree
	 */
	void enterTriple_string_content(RclParser.Triple_string_contentContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#triple_string_content}.
	 * @param ctx the parse tree
	 */
	void exitTriple_string_content(RclParser.Triple_string_contentContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#interpolation}.
	 * @param ctx the parse tree
	 */
	void enterInterpolation(RclParser.InterpolationContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#interpolation}.
	 * @param ctx the parse tree
	 */
	void exitInterpolation(RclParser.InterpolationContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#interpolation_expr}.
	 * @param ctx the parse tree
	 */
	void enterInterpolation_expr(RclParser.Interpolation_exprContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#interpolation_expr}.
	 * @param ctx the parse tree
	 */
	void exitInterpolation_expr(RclParser.Interpolation_exprContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#variable_access}.
	 * @param ctx the parse tree
	 */
	void enterVariable_access(RclParser.Variable_accessContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#variable_access}.
	 * @param ctx the parse tree
	 */
	void exitVariable_access(RclParser.Variable_accessContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#type_tag}.
	 * @param ctx the parse tree
	 */
	void enterType_tag(RclParser.Type_tagContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#type_tag}.
	 * @param ctx the parse tree
	 */
	void exitType_tag(RclParser.Type_tagContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#list}.
	 * @param ctx the parse tree
	 */
	void enterList(RclParser.ListContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#list}.
	 * @param ctx the parse tree
	 */
	void exitList(RclParser.ListContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#parentheses_list}.
	 * @param ctx the parse tree
	 */
	void enterParentheses_list(RclParser.Parentheses_listContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#parentheses_list}.
	 * @param ctx the parse tree
	 */
	void exitParentheses_list(RclParser.Parentheses_listContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#list_elements}.
	 * @param ctx the parse tree
	 */
	void enterList_elements(RclParser.List_elementsContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#list_elements}.
	 * @param ctx the parse tree
	 */
	void exitList_elements(RclParser.List_elementsContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#block_list}.
	 * @param ctx the parse tree
	 */
	void enterBlock_list(RclParser.Block_listContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#block_list}.
	 * @param ctx the parse tree
	 */
	void exitBlock_list(RclParser.Block_listContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#block_list_item}.
	 * @param ctx the parse tree
	 */
	void enterBlock_list_item(RclParser.Block_list_itemContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#block_list_item}.
	 * @param ctx the parse tree
	 */
	void exitBlock_list_item(RclParser.Block_list_itemContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#dictionary}.
	 * @param ctx the parse tree
	 */
	void enterDictionary(RclParser.DictionaryContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#dictionary}.
	 * @param ctx the parse tree
	 */
	void exitDictionary(RclParser.DictionaryContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#brace_dictionary}.
	 * @param ctx the parse tree
	 */
	void enterBrace_dictionary(RclParser.Brace_dictionaryContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#brace_dictionary}.
	 * @param ctx the parse tree
	 */
	void exitBrace_dictionary(RclParser.Brace_dictionaryContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#block_dictionary}.
	 * @param ctx the parse tree
	 */
	void enterBlock_dictionary(RclParser.Block_dictionaryContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#block_dictionary}.
	 * @param ctx the parse tree
	 */
	void exitBlock_dictionary(RclParser.Block_dictionaryContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#dict_entry}.
	 * @param ctx the parse tree
	 */
	void enterDict_entry(RclParser.Dict_entryContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#dict_entry}.
	 * @param ctx the parse tree
	 */
	void exitDict_entry(RclParser.Dict_entryContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#embedded_code}.
	 * @param ctx the parse tree
	 */
	void enterEmbedded_code(RclParser.Embedded_codeContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#embedded_code}.
	 * @param ctx the parse tree
	 */
	void exitEmbedded_code(RclParser.Embedded_codeContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#multi_line_code}.
	 * @param ctx the parse tree
	 */
	void enterMulti_line_code(RclParser.Multi_line_codeContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#multi_line_code}.
	 * @param ctx the parse tree
	 */
	void exitMulti_line_code(RclParser.Multi_line_codeContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#multi_line_string}.
	 * @param ctx the parse tree
	 */
	void enterMulti_line_string(RclParser.Multi_line_stringContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#multi_line_string}.
	 * @param ctx the parse tree
	 */
	void exitMulti_line_string(RclParser.Multi_line_stringContext ctx);
	/**
	 * Enter a parse tree produced by {@link RclParser#multiline_content}.
	 * @param ctx the parse tree
	 */
	void enterMultiline_content(RclParser.Multiline_contentContext ctx);
	/**
	 * Exit a parse tree produced by {@link RclParser#multiline_content}.
	 * @param ctx the parse tree
	 */
	void exitMultiline_content(RclParser.Multiline_contentContext ctx);
}