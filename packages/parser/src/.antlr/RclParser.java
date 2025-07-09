// Generated from /home/ubuntu/work/rcl-tree-sitter/packages/parser/src/RclParser.g4 by ANTLR 4.13.1
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.misc.*;
import org.antlr.v4.runtime.tree.*;
import java.util.List;
import java.util.Iterator;
import java.util.ArrayList;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast", "CheckReturnValue"})
public class RclParser extends Parser {
	static { RuntimeMetaData.checkVersion("4.13.1", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		IMPORT=1, AS=2, WITH=3, MATCH=4, BOOLEAN=5, NULL=6, NUMBER=7, ATTRIBUTE_NAME=8, 
		ATOM=9, DEFAULT_CASE=10, STRING=11, REGEX=12, TRIPLE_QUOTE=13, EMBEDDED_CODE=14, 
		MULTI_LINE_CODE_START=15, MULTILINE_STR_CLEAN=16, MULTILINE_STR_TRIM=17, 
		MULTILINE_STR_PRESERVE=18, MULTILINE_STR_PRESERVE_ALL=19, IDENTIFIER=20, 
		SECTION_TYPE=21, ATTRIBUTE_KEY=22, VARIABLE=23, ARROW=24, COLON=25, COMMA=26, 
		DOT=27, LPAREN=28, RPAREN=29, LBRACE=30, RBRACE=31, LANGLE=32, RANGLE=33, 
		PIPE=34, SLASH=35, HYPHEN=36, SPREAD=37, WS=38, COMMENT=39, NEWLINE=40, 
		INDENT=41, DEDENT=42, TT_TYPE_NAME=43, TT_WS=44, TT_CONTENT=45, TT_PIPE=46, 
		TT_RANGLE=47, TS_TRIPLE_QUOTE_END=48, TS_INTERPOLATION_START=49, TS_CONTENT=50, 
		INT_RBRACE=51, INT_VARIABLE=52, INT_DOT=53, INT_LOWER_NAME=54, INT_WS=55, 
		MC_END=56, MC_CONTENT=57, ML_END=58, ML_CONTENT=59, ML_NEWLINE=60;
	public static final int
		RULE_rcl_file = 0, RULE_import_statement = 1, RULE_import_path = 2, RULE_section = 3, 
		RULE_section_header = 4, RULE_identifier = 5, RULE_section_body = 6, RULE_section_content = 7, 
		RULE_state_reference = 8, RULE_message_definition = 9, RULE_spread_directive = 10, 
		RULE_attribute_assignment = 11, RULE_match_block = 12, RULE_match_case = 13, 
		RULE_simple_transition = 14, RULE_contextualized_value = 15, RULE_parameter_list = 16, 
		RULE_parameter = 17, RULE_value = 18, RULE_primitive_value = 19, RULE_triple_quote_string = 20, 
		RULE_triple_string_content = 21, RULE_interpolation = 22, RULE_interpolation_expr = 23, 
		RULE_variable_access = 24, RULE_type_tag = 25, RULE_list = 26, RULE_parentheses_list = 27, 
		RULE_list_elements = 28, RULE_block_list = 29, RULE_block_list_item = 30, 
		RULE_dictionary = 31, RULE_brace_dictionary = 32, RULE_block_dictionary = 33, 
		RULE_dict_entry = 34, RULE_embedded_code = 35, RULE_multi_line_code = 36, 
		RULE_multi_line_string = 37, RULE_multiline_content = 38;
	private static String[] makeRuleNames() {
		return new String[] {
			"rcl_file", "import_statement", "import_path", "section", "section_header", 
			"identifier", "section_body", "section_content", "state_reference", "message_definition", 
			"spread_directive", "attribute_assignment", "match_block", "match_case", 
			"simple_transition", "contextualized_value", "parameter_list", "parameter", 
			"value", "primitive_value", "triple_quote_string", "triple_string_content", 
			"interpolation", "interpolation_expr", "variable_access", "type_tag", 
			"list", "parentheses_list", "list_elements", "block_list", "block_list_item", 
			"dictionary", "brace_dictionary", "block_dictionary", "dict_entry", "embedded_code", 
			"multi_line_code", "multi_line_string", "multiline_content"
		};
	}
	public static final String[] ruleNames = makeRuleNames();

	private static String[] makeLiteralNames() {
		return new String[] {
			null, "'import'", "'as'", "'with'", "'match'", null, null, null, null, 
			null, "':default'", null, null, null, null, null, null, null, null, null, 
			null, null, null, null, "'->'", "':'", "','", null, "'('", "')'", "'{'", 
			null, "'<'", null, null, "'/'", "'-'", "'...'", null, null, null, "'INDENT_PLACEHOLDER'", 
			"'DEDENT_PLACEHOLDER'", null, null, null, null, null, null, "'#{'", null, 
			null, null, null, null, null, "'<$'"
		};
	}
	private static final String[] _LITERAL_NAMES = makeLiteralNames();
	private static String[] makeSymbolicNames() {
		return new String[] {
			null, "IMPORT", "AS", "WITH", "MATCH", "BOOLEAN", "NULL", "NUMBER", "ATTRIBUTE_NAME", 
			"ATOM", "DEFAULT_CASE", "STRING", "REGEX", "TRIPLE_QUOTE", "EMBEDDED_CODE", 
			"MULTI_LINE_CODE_START", "MULTILINE_STR_CLEAN", "MULTILINE_STR_TRIM", 
			"MULTILINE_STR_PRESERVE", "MULTILINE_STR_PRESERVE_ALL", "IDENTIFIER", 
			"SECTION_TYPE", "ATTRIBUTE_KEY", "VARIABLE", "ARROW", "COLON", "COMMA", 
			"DOT", "LPAREN", "RPAREN", "LBRACE", "RBRACE", "LANGLE", "RANGLE", "PIPE", 
			"SLASH", "HYPHEN", "SPREAD", "WS", "COMMENT", "NEWLINE", "INDENT", "DEDENT", 
			"TT_TYPE_NAME", "TT_WS", "TT_CONTENT", "TT_PIPE", "TT_RANGLE", "TS_TRIPLE_QUOTE_END", 
			"TS_INTERPOLATION_START", "TS_CONTENT", "INT_RBRACE", "INT_VARIABLE", 
			"INT_DOT", "INT_LOWER_NAME", "INT_WS", "MC_END", "MC_CONTENT", "ML_END", 
			"ML_CONTENT", "ML_NEWLINE"
		};
	}
	private static final String[] _SYMBOLIC_NAMES = makeSymbolicNames();
	public static final Vocabulary VOCABULARY = new VocabularyImpl(_LITERAL_NAMES, _SYMBOLIC_NAMES);

	/**
	 * @deprecated Use {@link #VOCABULARY} instead.
	 */
	@Deprecated
	public static final String[] tokenNames;
	static {
		tokenNames = new String[_SYMBOLIC_NAMES.length];
		for (int i = 0; i < tokenNames.length; i++) {
			tokenNames[i] = VOCABULARY.getLiteralName(i);
			if (tokenNames[i] == null) {
				tokenNames[i] = VOCABULARY.getSymbolicName(i);
			}

			if (tokenNames[i] == null) {
				tokenNames[i] = "<INVALID>";
			}
		}
	}

	@Override
	@Deprecated
	public String[] getTokenNames() {
		return tokenNames;
	}

	@Override

	public Vocabulary getVocabulary() {
		return VOCABULARY;
	}

	@Override
	public String getGrammarFileName() { return "RclParser.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public ATN getATN() { return _ATN; }

	public RclParser(TokenStream input) {
		super(input);
		_interp = new ParserATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Rcl_fileContext extends ParserRuleContext {
		public TerminalNode EOF() { return getToken(RclParser.EOF, 0); }
		public List<Import_statementContext> import_statement() {
			return getRuleContexts(Import_statementContext.class);
		}
		public Import_statementContext import_statement(int i) {
			return getRuleContext(Import_statementContext.class,i);
		}
		public List<SectionContext> section() {
			return getRuleContexts(SectionContext.class);
		}
		public SectionContext section(int i) {
			return getRuleContext(SectionContext.class,i);
		}
		public List<TerminalNode> NEWLINE() { return getTokens(RclParser.NEWLINE); }
		public TerminalNode NEWLINE(int i) {
			return getToken(RclParser.NEWLINE, i);
		}
		public Rcl_fileContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_rcl_file; }
	}

	public final Rcl_fileContext rcl_file() throws RecognitionException {
		Rcl_fileContext _localctx = new Rcl_fileContext(_ctx, getState());
		enterRule(_localctx, 0, RULE_rcl_file);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(83);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while ((((_la) & ~0x3f) == 0 && ((1L << _la) & 1099513724930L) != 0)) {
				{
				setState(81);
				_errHandler.sync(this);
				switch (_input.LA(1)) {
				case IMPORT:
					{
					setState(78);
					import_statement();
					}
					break;
				case SECTION_TYPE:
					{
					setState(79);
					section();
					}
					break;
				case NEWLINE:
					{
					setState(80);
					match(NEWLINE);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				setState(85);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(86);
			match(EOF);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Import_statementContext extends ParserRuleContext {
		public Token alias;
		public TerminalNode IMPORT() { return getToken(RclParser.IMPORT, 0); }
		public Import_pathContext import_path() {
			return getRuleContext(Import_pathContext.class,0);
		}
		public TerminalNode NEWLINE() { return getToken(RclParser.NEWLINE, 0); }
		public TerminalNode AS() { return getToken(RclParser.AS, 0); }
		public TerminalNode IDENTIFIER() { return getToken(RclParser.IDENTIFIER, 0); }
		public Import_statementContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_import_statement; }
	}

	public final Import_statementContext import_statement() throws RecognitionException {
		Import_statementContext _localctx = new Import_statementContext(_ctx, getState());
		enterRule(_localctx, 2, RULE_import_statement);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(88);
			match(IMPORT);
			setState(89);
			import_path();
			setState(92);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==AS) {
				{
				setState(90);
				match(AS);
				setState(91);
				((Import_statementContext)_localctx).alias = match(IDENTIFIER);
				}
			}

			setState(94);
			match(NEWLINE);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Import_pathContext extends ParserRuleContext {
		public List<TerminalNode> IDENTIFIER() { return getTokens(RclParser.IDENTIFIER); }
		public TerminalNode IDENTIFIER(int i) {
			return getToken(RclParser.IDENTIFIER, i);
		}
		public List<TerminalNode> SLASH() { return getTokens(RclParser.SLASH); }
		public TerminalNode SLASH(int i) {
			return getToken(RclParser.SLASH, i);
		}
		public Import_pathContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_import_path; }
	}

	public final Import_pathContext import_path() throws RecognitionException {
		Import_pathContext _localctx = new Import_pathContext(_ctx, getState());
		enterRule(_localctx, 4, RULE_import_path);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(96);
			match(IDENTIFIER);
			setState(101);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==SLASH) {
				{
				{
				setState(97);
				match(SLASH);
				setState(98);
				match(IDENTIFIER);
				}
				}
				setState(103);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class SectionContext extends ParserRuleContext {
		public Section_headerContext section_header() {
			return getRuleContext(Section_headerContext.class,0);
		}
		public Section_bodyContext section_body() {
			return getRuleContext(Section_bodyContext.class,0);
		}
		public SectionContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_section; }
	}

	public final SectionContext section() throws RecognitionException {
		SectionContext _localctx = new SectionContext(_ctx, getState());
		enterRule(_localctx, 6, RULE_section);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(104);
			section_header();
			setState(106);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==INDENT) {
				{
				setState(105);
				section_body();
				}
			}

			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Section_headerContext extends ParserRuleContext {
		public TerminalNode SECTION_TYPE() { return getToken(RclParser.SECTION_TYPE, 0); }
		public TerminalNode NEWLINE() { return getToken(RclParser.NEWLINE, 0); }
		public TerminalNode IDENTIFIER() { return getToken(RclParser.IDENTIFIER, 0); }
		public Parameter_listContext parameter_list() {
			return getRuleContext(Parameter_listContext.class,0);
		}
		public TerminalNode STRING() { return getToken(RclParser.STRING, 0); }
		public TerminalNode COLON() { return getToken(RclParser.COLON, 0); }
		public TerminalNode ATOM() { return getToken(RclParser.ATOM, 0); }
		public Section_headerContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_section_header; }
	}

	public final Section_headerContext section_header() throws RecognitionException {
		Section_headerContext _localctx = new Section_headerContext(_ctx, getState());
		enterRule(_localctx, 8, RULE_section_header);
		int _la;
		try {
			setState(126);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,9,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(108);
				match(SECTION_TYPE);
				setState(110);
				_errHandler.sync(this);
				switch ( getInterpreter().adaptivePredict(_input,5,_ctx) ) {
				case 1:
					{
					setState(109);
					match(IDENTIFIER);
					}
					break;
				}
				setState(113);
				_errHandler.sync(this);
				switch ( getInterpreter().adaptivePredict(_input,6,_ctx) ) {
				case 1:
					{
					setState(112);
					parameter_list();
					}
					break;
				}
				setState(115);
				match(NEWLINE);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(116);
				match(SECTION_TYPE);
				setState(117);
				match(STRING);
				setState(120);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==COLON) {
					{
					setState(118);
					match(COLON);
					setState(119);
					match(ATOM);
					}
				}

				setState(123);
				_errHandler.sync(this);
				switch ( getInterpreter().adaptivePredict(_input,8,_ctx) ) {
				case 1:
					{
					setState(122);
					parameter_list();
					}
					break;
				}
				setState(125);
				match(NEWLINE);
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class IdentifierContext extends ParserRuleContext {
		public TerminalNode IDENTIFIER() { return getToken(RclParser.IDENTIFIER, 0); }
		public IdentifierContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_identifier; }
	}

	public final IdentifierContext identifier() throws RecognitionException {
		IdentifierContext _localctx = new IdentifierContext(_ctx, getState());
		enterRule(_localctx, 10, RULE_identifier);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(128);
			match(IDENTIFIER);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Section_bodyContext extends ParserRuleContext {
		public TerminalNode INDENT() { return getToken(RclParser.INDENT, 0); }
		public TerminalNode DEDENT() { return getToken(RclParser.DEDENT, 0); }
		public List<Section_contentContext> section_content() {
			return getRuleContexts(Section_contentContext.class);
		}
		public Section_contentContext section_content(int i) {
			return getRuleContext(Section_contentContext.class,i);
		}
		public Section_bodyContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_section_body; }
	}

	public final Section_bodyContext section_body() throws RecognitionException {
		Section_bodyContext _localctx = new Section_bodyContext(_ctx, getState());
		enterRule(_localctx, 12, RULE_section_body);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(130);
			match(INDENT);
			setState(132); 
			_errHandler.sync(this);
			_la = _input.LA(1);
			do {
				{
				{
				setState(131);
				section_content();
				}
				}
				setState(134); 
				_errHandler.sync(this);
				_la = _input.LA(1);
			} while ( (((_la) & ~0x3f) == 0 && ((1L << _la) & 1236978893072L) != 0) );
			setState(136);
			match(DEDENT);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Section_contentContext extends ParserRuleContext {
		public Spread_directiveContext spread_directive() {
			return getRuleContext(Spread_directiveContext.class,0);
		}
		public Attribute_assignmentContext attribute_assignment() {
			return getRuleContext(Attribute_assignmentContext.class,0);
		}
		public SectionContext section() {
			return getRuleContext(SectionContext.class,0);
		}
		public Match_blockContext match_block() {
			return getRuleContext(Match_blockContext.class,0);
		}
		public Simple_transitionContext simple_transition() {
			return getRuleContext(Simple_transitionContext.class,0);
		}
		public State_referenceContext state_reference() {
			return getRuleContext(State_referenceContext.class,0);
		}
		public Message_definitionContext message_definition() {
			return getRuleContext(Message_definitionContext.class,0);
		}
		public TerminalNode NEWLINE() { return getToken(RclParser.NEWLINE, 0); }
		public Section_contentContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_section_content; }
	}

	public final Section_contentContext section_content() throws RecognitionException {
		Section_contentContext _localctx = new Section_contentContext(_ctx, getState());
		enterRule(_localctx, 14, RULE_section_content);
		try {
			setState(146);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,11,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(138);
				spread_directive();
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(139);
				attribute_assignment();
				}
				break;
			case 3:
				enterOuterAlt(_localctx, 3);
				{
				setState(140);
				section();
				}
				break;
			case 4:
				enterOuterAlt(_localctx, 4);
				{
				setState(141);
				match_block();
				}
				break;
			case 5:
				enterOuterAlt(_localctx, 5);
				{
				setState(142);
				simple_transition();
				}
				break;
			case 6:
				enterOuterAlt(_localctx, 6);
				{
				setState(143);
				state_reference();
				}
				break;
			case 7:
				enterOuterAlt(_localctx, 7);
				{
				setState(144);
				message_definition();
				}
				break;
			case 8:
				enterOuterAlt(_localctx, 8);
				{
				setState(145);
				match(NEWLINE);
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class State_referenceContext extends ParserRuleContext {
		public TerminalNode NEWLINE() { return getToken(RclParser.NEWLINE, 0); }
		public TerminalNode IDENTIFIER() { return getToken(RclParser.IDENTIFIER, 0); }
		public Variable_accessContext variable_access() {
			return getRuleContext(Variable_accessContext.class,0);
		}
		public State_referenceContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_state_reference; }
	}

	public final State_referenceContext state_reference() throws RecognitionException {
		State_referenceContext _localctx = new State_referenceContext(_ctx, getState());
		enterRule(_localctx, 16, RULE_state_reference);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(150);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case IDENTIFIER:
				{
				setState(148);
				match(IDENTIFIER);
				}
				break;
			case VARIABLE:
				{
				setState(149);
				variable_access();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			setState(152);
			match(NEWLINE);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Message_definitionContext extends ParserRuleContext {
		public TerminalNode SECTION_TYPE() { return getToken(RclParser.SECTION_TYPE, 0); }
		public TerminalNode IDENTIFIER() { return getToken(RclParser.IDENTIFIER, 0); }
		public TerminalNode NEWLINE() { return getToken(RclParser.NEWLINE, 0); }
		public TerminalNode STRING() { return getToken(RclParser.STRING, 0); }
		public Triple_quote_stringContext triple_quote_string() {
			return getRuleContext(Triple_quote_stringContext.class,0);
		}
		public TerminalNode COLON() { return getToken(RclParser.COLON, 0); }
		public TerminalNode ATOM() { return getToken(RclParser.ATOM, 0); }
		public Parameter_listContext parameter_list() {
			return getRuleContext(Parameter_listContext.class,0);
		}
		public TerminalNode INDENT() { return getToken(RclParser.INDENT, 0); }
		public TerminalNode DEDENT() { return getToken(RclParser.DEDENT, 0); }
		public List<Section_contentContext> section_content() {
			return getRuleContexts(Section_contentContext.class);
		}
		public Section_contentContext section_content(int i) {
			return getRuleContext(Section_contentContext.class,i);
		}
		public Message_definitionContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_message_definition; }
	}

	public final Message_definitionContext message_definition() throws RecognitionException {
		Message_definitionContext _localctx = new Message_definitionContext(_ctx, getState());
		enterRule(_localctx, 18, RULE_message_definition);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(154);
			match(SECTION_TYPE);
			setState(155);
			match(IDENTIFIER);
			setState(158);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case STRING:
				{
				setState(156);
				match(STRING);
				}
				break;
			case TRIPLE_QUOTE:
				{
				setState(157);
				triple_quote_string();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			setState(162);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==COLON) {
				{
				setState(160);
				match(COLON);
				setState(161);
				match(ATOM);
				}
			}

			setState(165);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,15,_ctx) ) {
			case 1:
				{
				setState(164);
				parameter_list();
				}
				break;
			}
			setState(167);
			match(NEWLINE);
			setState(176);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==INDENT) {
				{
				setState(168);
				match(INDENT);
				setState(170); 
				_errHandler.sync(this);
				_la = _input.LA(1);
				do {
					{
					{
					setState(169);
					section_content();
					}
					}
					setState(172); 
					_errHandler.sync(this);
					_la = _input.LA(1);
				} while ( (((_la) & ~0x3f) == 0 && ((1L << _la) & 1236978893072L) != 0) );
				setState(174);
				match(DEDENT);
				}
			}

			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Spread_directiveContext extends ParserRuleContext {
		public TerminalNode SPREAD() { return getToken(RclParser.SPREAD, 0); }
		public TerminalNode IDENTIFIER() { return getToken(RclParser.IDENTIFIER, 0); }
		public TerminalNode NEWLINE() { return getToken(RclParser.NEWLINE, 0); }
		public Spread_directiveContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_spread_directive; }
	}

	public final Spread_directiveContext spread_directive() throws RecognitionException {
		Spread_directiveContext _localctx = new Spread_directiveContext(_ctx, getState());
		enterRule(_localctx, 20, RULE_spread_directive);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(178);
			match(SPREAD);
			setState(179);
			match(IDENTIFIER);
			setState(180);
			match(NEWLINE);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Attribute_assignmentContext extends ParserRuleContext {
		public TerminalNode ATTRIBUTE_NAME() { return getToken(RclParser.ATTRIBUTE_NAME, 0); }
		public ValueContext value() {
			return getRuleContext(ValueContext.class,0);
		}
		public TerminalNode NEWLINE() { return getToken(RclParser.NEWLINE, 0); }
		public TerminalNode COMMA() { return getToken(RclParser.COMMA, 0); }
		public Attribute_assignmentContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_attribute_assignment; }
	}

	public final Attribute_assignmentContext attribute_assignment() throws RecognitionException {
		Attribute_assignmentContext _localctx = new Attribute_assignmentContext(_ctx, getState());
		enterRule(_localctx, 22, RULE_attribute_assignment);
		try {
			setState(193);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,18,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(182);
				match(ATTRIBUTE_NAME);
				setState(183);
				value();
				setState(184);
				match(NEWLINE);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(186);
				match(ATTRIBUTE_NAME);
				setState(187);
				match(COMMA);
				setState(188);
				value();
				setState(189);
				match(NEWLINE);
				}
				break;
			case 3:
				enterOuterAlt(_localctx, 3);
				{
				setState(191);
				match(ATTRIBUTE_NAME);
				setState(192);
				match(NEWLINE);
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Match_blockContext extends ParserRuleContext {
		public TerminalNode MATCH() { return getToken(RclParser.MATCH, 0); }
		public ValueContext value() {
			return getRuleContext(ValueContext.class,0);
		}
		public TerminalNode NEWLINE() { return getToken(RclParser.NEWLINE, 0); }
		public TerminalNode INDENT() { return getToken(RclParser.INDENT, 0); }
		public TerminalNode DEDENT() { return getToken(RclParser.DEDENT, 0); }
		public List<Match_caseContext> match_case() {
			return getRuleContexts(Match_caseContext.class);
		}
		public Match_caseContext match_case(int i) {
			return getRuleContext(Match_caseContext.class,i);
		}
		public Match_blockContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_match_block; }
	}

	public final Match_blockContext match_block() throws RecognitionException {
		Match_blockContext _localctx = new Match_blockContext(_ctx, getState());
		enterRule(_localctx, 24, RULE_match_block);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(195);
			match(MATCH);
			setState(196);
			value();
			setState(197);
			match(NEWLINE);
			setState(198);
			match(INDENT);
			setState(200); 
			_errHandler.sync(this);
			_la = _input.LA(1);
			do {
				{
				{
				setState(199);
				match_case();
				}
				}
				setState(202); 
				_errHandler.sync(this);
				_la = _input.LA(1);
			} while ( (((_la) & ~0x3f) == 0 && ((1L << _la) & 7808L) != 0) );
			setState(204);
			match(DEDENT);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Match_caseContext extends ParserRuleContext {
		public TerminalNode ARROW() { return getToken(RclParser.ARROW, 0); }
		public Contextualized_valueContext contextualized_value() {
			return getRuleContext(Contextualized_valueContext.class,0);
		}
		public TerminalNode NEWLINE() { return getToken(RclParser.NEWLINE, 0); }
		public TerminalNode STRING() { return getToken(RclParser.STRING, 0); }
		public TerminalNode NUMBER() { return getToken(RclParser.NUMBER, 0); }
		public TerminalNode ATOM() { return getToken(RclParser.ATOM, 0); }
		public TerminalNode REGEX() { return getToken(RclParser.REGEX, 0); }
		public TerminalNode DEFAULT_CASE() { return getToken(RclParser.DEFAULT_CASE, 0); }
		public Match_caseContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_match_case; }
	}

	public final Match_caseContext match_case() throws RecognitionException {
		Match_caseContext _localctx = new Match_caseContext(_ctx, getState());
		enterRule(_localctx, 26, RULE_match_case);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(206);
			_la = _input.LA(1);
			if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 7808L) != 0)) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			setState(207);
			match(ARROW);
			setState(208);
			contextualized_value();
			setState(209);
			match(NEWLINE);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Simple_transitionContext extends ParserRuleContext {
		public TerminalNode ARROW() { return getToken(RclParser.ARROW, 0); }
		public Contextualized_valueContext contextualized_value() {
			return getRuleContext(Contextualized_valueContext.class,0);
		}
		public TerminalNode NEWLINE() { return getToken(RclParser.NEWLINE, 0); }
		public Simple_transitionContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_simple_transition; }
	}

	public final Simple_transitionContext simple_transition() throws RecognitionException {
		Simple_transitionContext _localctx = new Simple_transitionContext(_ctx, getState());
		enterRule(_localctx, 28, RULE_simple_transition);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(211);
			match(ARROW);
			setState(212);
			contextualized_value();
			setState(213);
			match(NEWLINE);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Contextualized_valueContext extends ParserRuleContext {
		public ValueContext value() {
			return getRuleContext(ValueContext.class,0);
		}
		public TerminalNode WITH() { return getToken(RclParser.WITH, 0); }
		public Parameter_listContext parameter_list() {
			return getRuleContext(Parameter_listContext.class,0);
		}
		public Contextualized_valueContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_contextualized_value; }
	}

	public final Contextualized_valueContext contextualized_value() throws RecognitionException {
		Contextualized_valueContext _localctx = new Contextualized_valueContext(_ctx, getState());
		enterRule(_localctx, 30, RULE_contextualized_value);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(215);
			value();
			setState(218);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==WITH) {
				{
				setState(216);
				match(WITH);
				setState(217);
				parameter_list();
				}
			}

			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Parameter_listContext extends ParserRuleContext {
		public List<ParameterContext> parameter() {
			return getRuleContexts(ParameterContext.class);
		}
		public ParameterContext parameter(int i) {
			return getRuleContext(ParameterContext.class,i);
		}
		public List<TerminalNode> COMMA() { return getTokens(RclParser.COMMA); }
		public TerminalNode COMMA(int i) {
			return getToken(RclParser.COMMA, i);
		}
		public Parameter_listContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_parameter_list; }
	}

	public final Parameter_listContext parameter_list() throws RecognitionException {
		Parameter_listContext _localctx = new Parameter_listContext(_ctx, getState());
		enterRule(_localctx, 32, RULE_parameter_list);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(220);
			parameter();
			setState(225);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==COMMA) {
				{
				{
				setState(221);
				match(COMMA);
				setState(222);
				parameter();
				}
				}
				setState(227);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ParameterContext extends ParserRuleContext {
		public TerminalNode ATTRIBUTE_NAME() { return getToken(RclParser.ATTRIBUTE_NAME, 0); }
		public ValueContext value() {
			return getRuleContext(ValueContext.class,0);
		}
		public TerminalNode ATTRIBUTE_KEY() { return getToken(RclParser.ATTRIBUTE_KEY, 0); }
		public TerminalNode COLON() { return getToken(RclParser.COLON, 0); }
		public ParameterContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_parameter; }
	}

	public final ParameterContext parameter() throws RecognitionException {
		ParameterContext _localctx = new ParameterContext(_ctx, getState());
		enterRule(_localctx, 34, RULE_parameter);
		try {
			setState(234);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case ATTRIBUTE_NAME:
				enterOuterAlt(_localctx, 1);
				{
				setState(228);
				match(ATTRIBUTE_NAME);
				setState(229);
				value();
				}
				break;
			case ATTRIBUTE_KEY:
				enterOuterAlt(_localctx, 2);
				{
				setState(230);
				match(ATTRIBUTE_KEY);
				setState(231);
				match(COLON);
				setState(232);
				value();
				}
				break;
			case BOOLEAN:
			case NULL:
			case NUMBER:
			case ATOM:
			case STRING:
			case REGEX:
			case TRIPLE_QUOTE:
			case EMBEDDED_CODE:
			case MULTI_LINE_CODE_START:
			case MULTILINE_STR_CLEAN:
			case MULTILINE_STR_TRIM:
			case MULTILINE_STR_PRESERVE:
			case MULTILINE_STR_PRESERVE_ALL:
			case IDENTIFIER:
			case VARIABLE:
			case COMMA:
			case LPAREN:
			case LBRACE:
			case LANGLE:
			case NEWLINE:
			case INDENT:
				enterOuterAlt(_localctx, 3);
				{
				setState(233);
				value();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ValueContext extends ParserRuleContext {
		public Primitive_valueContext primitive_value() {
			return getRuleContext(Primitive_valueContext.class,0);
		}
		public TerminalNode IDENTIFIER() { return getToken(RclParser.IDENTIFIER, 0); }
		public Variable_accessContext variable_access() {
			return getRuleContext(Variable_accessContext.class,0);
		}
		public Parentheses_listContext parentheses_list() {
			return getRuleContext(Parentheses_listContext.class,0);
		}
		public DictionaryContext dictionary() {
			return getRuleContext(DictionaryContext.class,0);
		}
		public Embedded_codeContext embedded_code() {
			return getRuleContext(Embedded_codeContext.class,0);
		}
		public Multi_line_stringContext multi_line_string() {
			return getRuleContext(Multi_line_stringContext.class,0);
		}
		public ValueContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_value; }
	}

	public final ValueContext value() throws RecognitionException {
		ValueContext _localctx = new ValueContext(_ctx, getState());
		enterRule(_localctx, 36, RULE_value);
		try {
			setState(244);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,23,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(237);
				primitive_value();
				}
				break;
			case 3:
				enterOuterAlt(_localctx, 3);
				{
				setState(238);
				match(IDENTIFIER);
				}
				break;
			case 4:
				enterOuterAlt(_localctx, 4);
				{
				setState(239);
				variable_access();
				}
				break;
			case 5:
				enterOuterAlt(_localctx, 5);
				{
				setState(240);
				parentheses_list();
				}
				break;
			case 6:
				enterOuterAlt(_localctx, 6);
				{
				setState(241);
				dictionary();
				}
				break;
			case 7:
				enterOuterAlt(_localctx, 7);
				{
				setState(242);
				embedded_code();
				}
				break;
			case 8:
				enterOuterAlt(_localctx, 8);
				{
				setState(243);
				multi_line_string();
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Primitive_valueContext extends ParserRuleContext {
		public TerminalNode STRING() { return getToken(RclParser.STRING, 0); }
		public Triple_quote_stringContext triple_quote_string() {
			return getRuleContext(Triple_quote_stringContext.class,0);
		}
		public TerminalNode REGEX() { return getToken(RclParser.REGEX, 0); }
		public TerminalNode NUMBER() { return getToken(RclParser.NUMBER, 0); }
		public TerminalNode BOOLEAN() { return getToken(RclParser.BOOLEAN, 0); }
		public TerminalNode NULL() { return getToken(RclParser.NULL, 0); }
		public TerminalNode ATOM() { return getToken(RclParser.ATOM, 0); }
		public Type_tagContext type_tag() {
			return getRuleContext(Type_tagContext.class,0);
		}
		public Primitive_valueContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_primitive_value; }
	}

	public final Primitive_valueContext primitive_value() throws RecognitionException {
		Primitive_valueContext _localctx = new Primitive_valueContext(_ctx, getState());
		enterRule(_localctx, 38, RULE_primitive_value);
		try {
			setState(254);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case STRING:
				enterOuterAlt(_localctx, 1);
				{
				setState(246);
				match(STRING);
				}
				break;
			case TRIPLE_QUOTE:
				enterOuterAlt(_localctx, 2);
				{
				setState(247);
				triple_quote_string();
				}
				break;
			case REGEX:
				enterOuterAlt(_localctx, 3);
				{
				setState(248);
				match(REGEX);
				}
				break;
			case NUMBER:
				enterOuterAlt(_localctx, 4);
				{
				setState(249);
				match(NUMBER);
				}
				break;
			case BOOLEAN:
				enterOuterAlt(_localctx, 5);
				{
				setState(250);
				match(BOOLEAN);
				}
				break;
			case NULL:
				enterOuterAlt(_localctx, 6);
				{
				setState(251);
				match(NULL);
				}
				break;
			case ATOM:
				enterOuterAlt(_localctx, 7);
				{
				setState(252);
				match(ATOM);
				}
				break;
			case LANGLE:
				enterOuterAlt(_localctx, 8);
				{
				setState(253);
				type_tag();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Triple_quote_stringContext extends ParserRuleContext {
		public TerminalNode TRIPLE_QUOTE() { return getToken(RclParser.TRIPLE_QUOTE, 0); }
		public TerminalNode TS_TRIPLE_QUOTE_END() { return getToken(RclParser.TS_TRIPLE_QUOTE_END, 0); }
		public List<TerminalNode> TS_CONTENT() { return getTokens(RclParser.TS_CONTENT); }
		public TerminalNode TS_CONTENT(int i) {
			return getToken(RclParser.TS_CONTENT, i);
		}
		public List<InterpolationContext> interpolation() {
			return getRuleContexts(InterpolationContext.class);
		}
		public InterpolationContext interpolation(int i) {
			return getRuleContext(InterpolationContext.class,i);
		}
		public Triple_quote_stringContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_triple_quote_string; }
	}

	public final Triple_quote_stringContext triple_quote_string() throws RecognitionException {
		Triple_quote_stringContext _localctx = new Triple_quote_stringContext(_ctx, getState());
		enterRule(_localctx, 40, RULE_triple_quote_string);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(256);
			match(TRIPLE_QUOTE);
			setState(261);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==TS_INTERPOLATION_START || _la==TS_CONTENT) {
				{
				setState(259);
				_errHandler.sync(this);
				switch (_input.LA(1)) {
				case TS_CONTENT:
					{
					setState(257);
					match(TS_CONTENT);
					}
					break;
				case TS_INTERPOLATION_START:
					{
					setState(258);
					interpolation();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				setState(263);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(264);
			match(TS_TRIPLE_QUOTE_END);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Triple_string_contentContext extends ParserRuleContext {
		public TerminalNode TS_CONTENT() { return getToken(RclParser.TS_CONTENT, 0); }
		public InterpolationContext interpolation() {
			return getRuleContext(InterpolationContext.class,0);
		}
		public Triple_string_contentContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_triple_string_content; }
	}

	public final Triple_string_contentContext triple_string_content() throws RecognitionException {
		Triple_string_contentContext _localctx = new Triple_string_contentContext(_ctx, getState());
		enterRule(_localctx, 42, RULE_triple_string_content);
		try {
			setState(268);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case TS_CONTENT:
				enterOuterAlt(_localctx, 1);
				{
				setState(266);
				match(TS_CONTENT);
				}
				break;
			case TS_INTERPOLATION_START:
				enterOuterAlt(_localctx, 2);
				{
				setState(267);
				interpolation();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class InterpolationContext extends ParserRuleContext {
		public TerminalNode TS_INTERPOLATION_START() { return getToken(RclParser.TS_INTERPOLATION_START, 0); }
		public Interpolation_exprContext interpolation_expr() {
			return getRuleContext(Interpolation_exprContext.class,0);
		}
		public TerminalNode INT_RBRACE() { return getToken(RclParser.INT_RBRACE, 0); }
		public InterpolationContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_interpolation; }
	}

	public final InterpolationContext interpolation() throws RecognitionException {
		InterpolationContext _localctx = new InterpolationContext(_ctx, getState());
		enterRule(_localctx, 44, RULE_interpolation);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(270);
			match(TS_INTERPOLATION_START);
			setState(271);
			interpolation_expr();
			setState(272);
			match(INT_RBRACE);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Interpolation_exprContext extends ParserRuleContext {
		public TerminalNode INT_VARIABLE() { return getToken(RclParser.INT_VARIABLE, 0); }
		public List<TerminalNode> INT_DOT() { return getTokens(RclParser.INT_DOT); }
		public TerminalNode INT_DOT(int i) {
			return getToken(RclParser.INT_DOT, i);
		}
		public List<TerminalNode> INT_LOWER_NAME() { return getTokens(RclParser.INT_LOWER_NAME); }
		public TerminalNode INT_LOWER_NAME(int i) {
			return getToken(RclParser.INT_LOWER_NAME, i);
		}
		public ValueContext value() {
			return getRuleContext(ValueContext.class,0);
		}
		public Interpolation_exprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_interpolation_expr; }
	}

	public final Interpolation_exprContext interpolation_expr() throws RecognitionException {
		Interpolation_exprContext _localctx = new Interpolation_exprContext(_ctx, getState());
		enterRule(_localctx, 46, RULE_interpolation_expr);
		int _la;
		try {
			setState(283);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case INT_VARIABLE:
				enterOuterAlt(_localctx, 1);
				{
				setState(274);
				match(INT_VARIABLE);
				setState(279);
				_errHandler.sync(this);
				_la = _input.LA(1);
				while (_la==INT_DOT) {
					{
					{
					setState(275);
					match(INT_DOT);
					setState(276);
					match(INT_LOWER_NAME);
					}
					}
					setState(281);
					_errHandler.sync(this);
					_la = _input.LA(1);
				}
				}
				break;
			case BOOLEAN:
			case NULL:
			case NUMBER:
			case ATOM:
			case STRING:
			case REGEX:
			case TRIPLE_QUOTE:
			case EMBEDDED_CODE:
			case MULTI_LINE_CODE_START:
			case MULTILINE_STR_CLEAN:
			case MULTILINE_STR_TRIM:
			case MULTILINE_STR_PRESERVE:
			case MULTILINE_STR_PRESERVE_ALL:
			case IDENTIFIER:
			case VARIABLE:
			case LPAREN:
			case LBRACE:
			case LANGLE:
			case INDENT:
			case INT_RBRACE:
				enterOuterAlt(_localctx, 2);
				{
				setState(282);
				value();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Variable_accessContext extends ParserRuleContext {
		public TerminalNode VARIABLE() { return getToken(RclParser.VARIABLE, 0); }
		public List<TerminalNode> DOT() { return getTokens(RclParser.DOT); }
		public TerminalNode DOT(int i) {
			return getToken(RclParser.DOT, i);
		}
		public List<TerminalNode> ATTRIBUTE_KEY() { return getTokens(RclParser.ATTRIBUTE_KEY); }
		public TerminalNode ATTRIBUTE_KEY(int i) {
			return getToken(RclParser.ATTRIBUTE_KEY, i);
		}
		public List<TerminalNode> SECTION_TYPE() { return getTokens(RclParser.SECTION_TYPE); }
		public TerminalNode SECTION_TYPE(int i) {
			return getToken(RclParser.SECTION_TYPE, i);
		}
		public Variable_accessContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_variable_access; }
	}

	public final Variable_accessContext variable_access() throws RecognitionException {
		Variable_accessContext _localctx = new Variable_accessContext(_ctx, getState());
		enterRule(_localctx, 48, RULE_variable_access);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(285);
			match(VARIABLE);
			setState(290);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==DOT) {
				{
				{
				setState(286);
				match(DOT);
				setState(287);
				_la = _input.LA(1);
				if ( !(_la==SECTION_TYPE || _la==ATTRIBUTE_KEY) ) {
				_errHandler.recoverInline(this);
				}
				else {
					if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
					_errHandler.reportMatch(this);
					consume();
				}
				}
				}
				setState(292);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Type_tagContext extends ParserRuleContext {
		public TerminalNode LANGLE() { return getToken(RclParser.LANGLE, 0); }
		public TerminalNode TT_TYPE_NAME() { return getToken(RclParser.TT_TYPE_NAME, 0); }
		public TerminalNode TT_RANGLE() { return getToken(RclParser.TT_RANGLE, 0); }
		public List<TerminalNode> TT_CONTENT() { return getTokens(RclParser.TT_CONTENT); }
		public TerminalNode TT_CONTENT(int i) {
			return getToken(RclParser.TT_CONTENT, i);
		}
		public TerminalNode TT_PIPE() { return getToken(RclParser.TT_PIPE, 0); }
		public Type_tagContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_type_tag; }
	}

	public final Type_tagContext type_tag() throws RecognitionException {
		Type_tagContext _localctx = new Type_tagContext(_ctx, getState());
		enterRule(_localctx, 50, RULE_type_tag);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(293);
			match(LANGLE);
			setState(294);
			match(TT_TYPE_NAME);
			setState(296);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==TT_CONTENT) {
				{
				setState(295);
				match(TT_CONTENT);
				}
			}

			setState(300);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==TT_PIPE) {
				{
				setState(298);
				match(TT_PIPE);
				setState(299);
				match(TT_CONTENT);
				}
			}

			setState(302);
			match(TT_RANGLE);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ListContext extends ParserRuleContext {
		public Parentheses_listContext parentheses_list() {
			return getRuleContext(Parentheses_listContext.class,0);
		}
		public Block_listContext block_list() {
			return getRuleContext(Block_listContext.class,0);
		}
		public ListContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_list; }
	}

	public final ListContext list() throws RecognitionException {
		ListContext _localctx = new ListContext(_ctx, getState());
		enterRule(_localctx, 52, RULE_list);
		try {
			setState(306);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case LPAREN:
				enterOuterAlt(_localctx, 1);
				{
				setState(304);
				parentheses_list();
				}
				break;
			case INDENT:
				enterOuterAlt(_localctx, 2);
				{
				setState(305);
				block_list();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Parentheses_listContext extends ParserRuleContext {
		public TerminalNode LPAREN() { return getToken(RclParser.LPAREN, 0); }
		public TerminalNode RPAREN() { return getToken(RclParser.RPAREN, 0); }
		public List_elementsContext list_elements() {
			return getRuleContext(List_elementsContext.class,0);
		}
		public Parentheses_listContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_parentheses_list; }
	}

	public final Parentheses_listContext parentheses_list() throws RecognitionException {
		Parentheses_listContext _localctx = new Parentheses_listContext(_ctx, getState());
		enterRule(_localctx, 54, RULE_parentheses_list);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(308);
			match(LPAREN);
			setState(310);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,34,_ctx) ) {
			case 1:
				{
				setState(309);
				list_elements();
				}
				break;
			}
			setState(312);
			match(RPAREN);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class List_elementsContext extends ParserRuleContext {
		public List<ValueContext> value() {
			return getRuleContexts(ValueContext.class);
		}
		public ValueContext value(int i) {
			return getRuleContext(ValueContext.class,i);
		}
		public List<TerminalNode> COMMA() { return getTokens(RclParser.COMMA); }
		public TerminalNode COMMA(int i) {
			return getToken(RclParser.COMMA, i);
		}
		public List_elementsContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_list_elements; }
	}

	public final List_elementsContext list_elements() throws RecognitionException {
		List_elementsContext _localctx = new List_elementsContext(_ctx, getState());
		enterRule(_localctx, 56, RULE_list_elements);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(314);
			value();
			setState(319);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==COMMA) {
				{
				{
				setState(315);
				match(COMMA);
				setState(316);
				value();
				}
				}
				setState(321);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Block_listContext extends ParserRuleContext {
		public TerminalNode INDENT() { return getToken(RclParser.INDENT, 0); }
		public TerminalNode DEDENT() { return getToken(RclParser.DEDENT, 0); }
		public List<Block_list_itemContext> block_list_item() {
			return getRuleContexts(Block_list_itemContext.class);
		}
		public Block_list_itemContext block_list_item(int i) {
			return getRuleContext(Block_list_itemContext.class,i);
		}
		public Block_listContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_block_list; }
	}

	public final Block_listContext block_list() throws RecognitionException {
		Block_listContext _localctx = new Block_listContext(_ctx, getState());
		enterRule(_localctx, 58, RULE_block_list);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(322);
			match(INDENT);
			setState(324); 
			_errHandler.sync(this);
			_la = _input.LA(1);
			do {
				{
				{
				setState(323);
				block_list_item();
				}
				}
				setState(326); 
				_errHandler.sync(this);
				_la = _input.LA(1);
			} while ( _la==HYPHEN );
			setState(328);
			match(DEDENT);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Block_list_itemContext extends ParserRuleContext {
		public TerminalNode HYPHEN() { return getToken(RclParser.HYPHEN, 0); }
		public ValueContext value() {
			return getRuleContext(ValueContext.class,0);
		}
		public TerminalNode NEWLINE() { return getToken(RclParser.NEWLINE, 0); }
		public Block_list_itemContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_block_list_item; }
	}

	public final Block_list_itemContext block_list_item() throws RecognitionException {
		Block_list_itemContext _localctx = new Block_list_itemContext(_ctx, getState());
		enterRule(_localctx, 60, RULE_block_list_item);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(330);
			match(HYPHEN);
			setState(331);
			value();
			setState(332);
			match(NEWLINE);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class DictionaryContext extends ParserRuleContext {
		public Brace_dictionaryContext brace_dictionary() {
			return getRuleContext(Brace_dictionaryContext.class,0);
		}
		public Block_dictionaryContext block_dictionary() {
			return getRuleContext(Block_dictionaryContext.class,0);
		}
		public DictionaryContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_dictionary; }
	}

	public final DictionaryContext dictionary() throws RecognitionException {
		DictionaryContext _localctx = new DictionaryContext(_ctx, getState());
		enterRule(_localctx, 62, RULE_dictionary);
		try {
			setState(336);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case LBRACE:
				enterOuterAlt(_localctx, 1);
				{
				setState(334);
				brace_dictionary();
				}
				break;
			case INDENT:
				enterOuterAlt(_localctx, 2);
				{
				setState(335);
				block_dictionary();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Brace_dictionaryContext extends ParserRuleContext {
		public TerminalNode LBRACE() { return getToken(RclParser.LBRACE, 0); }
		public TerminalNode RBRACE() { return getToken(RclParser.RBRACE, 0); }
		public List<Dict_entryContext> dict_entry() {
			return getRuleContexts(Dict_entryContext.class);
		}
		public Dict_entryContext dict_entry(int i) {
			return getRuleContext(Dict_entryContext.class,i);
		}
		public List<TerminalNode> COMMA() { return getTokens(RclParser.COMMA); }
		public TerminalNode COMMA(int i) {
			return getToken(RclParser.COMMA, i);
		}
		public Brace_dictionaryContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_brace_dictionary; }
	}

	public final Brace_dictionaryContext brace_dictionary() throws RecognitionException {
		Brace_dictionaryContext _localctx = new Brace_dictionaryContext(_ctx, getState());
		enterRule(_localctx, 64, RULE_brace_dictionary);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(338);
			match(LBRACE);
			setState(347);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==STRING || _la==ATTRIBUTE_KEY) {
				{
				setState(339);
				dict_entry();
				setState(344);
				_errHandler.sync(this);
				_la = _input.LA(1);
				while (_la==COMMA) {
					{
					{
					setState(340);
					match(COMMA);
					setState(341);
					dict_entry();
					}
					}
					setState(346);
					_errHandler.sync(this);
					_la = _input.LA(1);
				}
				}
			}

			setState(349);
			match(RBRACE);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Block_dictionaryContext extends ParserRuleContext {
		public TerminalNode INDENT() { return getToken(RclParser.INDENT, 0); }
		public TerminalNode DEDENT() { return getToken(RclParser.DEDENT, 0); }
		public List<Dict_entryContext> dict_entry() {
			return getRuleContexts(Dict_entryContext.class);
		}
		public Dict_entryContext dict_entry(int i) {
			return getRuleContext(Dict_entryContext.class,i);
		}
		public Block_dictionaryContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_block_dictionary; }
	}

	public final Block_dictionaryContext block_dictionary() throws RecognitionException {
		Block_dictionaryContext _localctx = new Block_dictionaryContext(_ctx, getState());
		enterRule(_localctx, 66, RULE_block_dictionary);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(351);
			match(INDENT);
			setState(353); 
			_errHandler.sync(this);
			_la = _input.LA(1);
			do {
				{
				{
				setState(352);
				dict_entry();
				}
				}
				setState(355); 
				_errHandler.sync(this);
				_la = _input.LA(1);
			} while ( _la==STRING || _la==ATTRIBUTE_KEY );
			setState(357);
			match(DEDENT);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Dict_entryContext extends ParserRuleContext {
		public TerminalNode COLON() { return getToken(RclParser.COLON, 0); }
		public ValueContext value() {
			return getRuleContext(ValueContext.class,0);
		}
		public TerminalNode ATTRIBUTE_KEY() { return getToken(RclParser.ATTRIBUTE_KEY, 0); }
		public TerminalNode STRING() { return getToken(RclParser.STRING, 0); }
		public Dict_entryContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_dict_entry; }
	}

	public final Dict_entryContext dict_entry() throws RecognitionException {
		Dict_entryContext _localctx = new Dict_entryContext(_ctx, getState());
		enterRule(_localctx, 68, RULE_dict_entry);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(359);
			_la = _input.LA(1);
			if ( !(_la==STRING || _la==ATTRIBUTE_KEY) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			setState(360);
			match(COLON);
			setState(361);
			value();
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Embedded_codeContext extends ParserRuleContext {
		public TerminalNode EMBEDDED_CODE() { return getToken(RclParser.EMBEDDED_CODE, 0); }
		public Multi_line_codeContext multi_line_code() {
			return getRuleContext(Multi_line_codeContext.class,0);
		}
		public Embedded_codeContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_embedded_code; }
	}

	public final Embedded_codeContext embedded_code() throws RecognitionException {
		Embedded_codeContext _localctx = new Embedded_codeContext(_ctx, getState());
		enterRule(_localctx, 70, RULE_embedded_code);
		try {
			setState(365);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case EMBEDDED_CODE:
				enterOuterAlt(_localctx, 1);
				{
				setState(363);
				match(EMBEDDED_CODE);
				}
				break;
			case MULTI_LINE_CODE_START:
				enterOuterAlt(_localctx, 2);
				{
				setState(364);
				multi_line_code();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Multi_line_codeContext extends ParserRuleContext {
		public TerminalNode MULTI_LINE_CODE_START() { return getToken(RclParser.MULTI_LINE_CODE_START, 0); }
		public TerminalNode MC_END() { return getToken(RclParser.MC_END, 0); }
		public List<TerminalNode> MC_CONTENT() { return getTokens(RclParser.MC_CONTENT); }
		public TerminalNode MC_CONTENT(int i) {
			return getToken(RclParser.MC_CONTENT, i);
		}
		public Multi_line_codeContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_multi_line_code; }
	}

	public final Multi_line_codeContext multi_line_code() throws RecognitionException {
		Multi_line_codeContext _localctx = new Multi_line_codeContext(_ctx, getState());
		enterRule(_localctx, 72, RULE_multi_line_code);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(367);
			match(MULTI_LINE_CODE_START);
			setState(371);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==MC_CONTENT) {
				{
				{
				setState(368);
				match(MC_CONTENT);
				}
				}
				setState(373);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(374);
			match(MC_END);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Multi_line_stringContext extends ParserRuleContext {
		public TerminalNode ML_END() { return getToken(RclParser.ML_END, 0); }
		public TerminalNode MULTILINE_STR_CLEAN() { return getToken(RclParser.MULTILINE_STR_CLEAN, 0); }
		public TerminalNode MULTILINE_STR_TRIM() { return getToken(RclParser.MULTILINE_STR_TRIM, 0); }
		public TerminalNode MULTILINE_STR_PRESERVE() { return getToken(RclParser.MULTILINE_STR_PRESERVE, 0); }
		public TerminalNode MULTILINE_STR_PRESERVE_ALL() { return getToken(RclParser.MULTILINE_STR_PRESERVE_ALL, 0); }
		public List<Multiline_contentContext> multiline_content() {
			return getRuleContexts(Multiline_contentContext.class);
		}
		public Multiline_contentContext multiline_content(int i) {
			return getRuleContext(Multiline_contentContext.class,i);
		}
		public Multi_line_stringContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_multi_line_string; }
	}

	public final Multi_line_stringContext multi_line_string() throws RecognitionException {
		Multi_line_stringContext _localctx = new Multi_line_stringContext(_ctx, getState());
		enterRule(_localctx, 74, RULE_multi_line_string);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(376);
			_la = _input.LA(1);
			if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 983040L) != 0)) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			setState(380);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==ML_CONTENT) {
				{
				{
				setState(377);
				multiline_content();
				}
				}
				setState(382);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(383);
			match(ML_END);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Multiline_contentContext extends ParserRuleContext {
		public TerminalNode ML_CONTENT() { return getToken(RclParser.ML_CONTENT, 0); }
		public TerminalNode ML_NEWLINE() { return getToken(RclParser.ML_NEWLINE, 0); }
		public Multiline_contentContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_multiline_content; }
	}

	public final Multiline_contentContext multiline_content() throws RecognitionException {
		Multiline_contentContext _localctx = new Multiline_contentContext(_ctx, getState());
		enterRule(_localctx, 76, RULE_multiline_content);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(385);
			match(ML_CONTENT);
			setState(387);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==ML_NEWLINE) {
				{
				setState(386);
				match(ML_NEWLINE);
				}
			}

			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static final String _serializedATN =
		"\u0004\u0001<\u0186\u0002\u0000\u0007\u0000\u0002\u0001\u0007\u0001\u0002"+
		"\u0002\u0007\u0002\u0002\u0003\u0007\u0003\u0002\u0004\u0007\u0004\u0002"+
		"\u0005\u0007\u0005\u0002\u0006\u0007\u0006\u0002\u0007\u0007\u0007\u0002"+
		"\b\u0007\b\u0002\t\u0007\t\u0002\n\u0007\n\u0002\u000b\u0007\u000b\u0002"+
		"\f\u0007\f\u0002\r\u0007\r\u0002\u000e\u0007\u000e\u0002\u000f\u0007\u000f"+
		"\u0002\u0010\u0007\u0010\u0002\u0011\u0007\u0011\u0002\u0012\u0007\u0012"+
		"\u0002\u0013\u0007\u0013\u0002\u0014\u0007\u0014\u0002\u0015\u0007\u0015"+
		"\u0002\u0016\u0007\u0016\u0002\u0017\u0007\u0017\u0002\u0018\u0007\u0018"+
		"\u0002\u0019\u0007\u0019\u0002\u001a\u0007\u001a\u0002\u001b\u0007\u001b"+
		"\u0002\u001c\u0007\u001c\u0002\u001d\u0007\u001d\u0002\u001e\u0007\u001e"+
		"\u0002\u001f\u0007\u001f\u0002 \u0007 \u0002!\u0007!\u0002\"\u0007\"\u0002"+
		"#\u0007#\u0002$\u0007$\u0002%\u0007%\u0002&\u0007&\u0001\u0000\u0001\u0000"+
		"\u0001\u0000\u0005\u0000R\b\u0000\n\u0000\f\u0000U\t\u0000\u0001\u0000"+
		"\u0001\u0000\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0003\u0001"+
		"]\b\u0001\u0001\u0001\u0001\u0001\u0001\u0002\u0001\u0002\u0001\u0002"+
		"\u0005\u0002d\b\u0002\n\u0002\f\u0002g\t\u0002\u0001\u0003\u0001\u0003"+
		"\u0003\u0003k\b\u0003\u0001\u0004\u0001\u0004\u0003\u0004o\b\u0004\u0001"+
		"\u0004\u0003\u0004r\b\u0004\u0001\u0004\u0001\u0004\u0001\u0004\u0001"+
		"\u0004\u0001\u0004\u0003\u0004y\b\u0004\u0001\u0004\u0003\u0004|\b\u0004"+
		"\u0001\u0004\u0003\u0004\u007f\b\u0004\u0001\u0005\u0001\u0005\u0001\u0006"+
		"\u0001\u0006\u0004\u0006\u0085\b\u0006\u000b\u0006\f\u0006\u0086\u0001"+
		"\u0006\u0001\u0006\u0001\u0007\u0001\u0007\u0001\u0007\u0001\u0007\u0001"+
		"\u0007\u0001\u0007\u0001\u0007\u0001\u0007\u0003\u0007\u0093\b\u0007\u0001"+
		"\b\u0001\b\u0003\b\u0097\b\b\u0001\b\u0001\b\u0001\t\u0001\t\u0001\t\u0001"+
		"\t\u0003\t\u009f\b\t\u0001\t\u0001\t\u0003\t\u00a3\b\t\u0001\t\u0003\t"+
		"\u00a6\b\t\u0001\t\u0001\t\u0001\t\u0004\t\u00ab\b\t\u000b\t\f\t\u00ac"+
		"\u0001\t\u0001\t\u0003\t\u00b1\b\t\u0001\n\u0001\n\u0001\n\u0001\n\u0001"+
		"\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001"+
		"\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0003\u000b\u00c2"+
		"\b\u000b\u0001\f\u0001\f\u0001\f\u0001\f\u0001\f\u0004\f\u00c9\b\f\u000b"+
		"\f\f\f\u00ca\u0001\f\u0001\f\u0001\r\u0001\r\u0001\r\u0001\r\u0001\r\u0001"+
		"\u000e\u0001\u000e\u0001\u000e\u0001\u000e\u0001\u000f\u0001\u000f\u0001"+
		"\u000f\u0003\u000f\u00db\b\u000f\u0001\u0010\u0001\u0010\u0001\u0010\u0005"+
		"\u0010\u00e0\b\u0010\n\u0010\f\u0010\u00e3\t\u0010\u0001\u0011\u0001\u0011"+
		"\u0001\u0011\u0001\u0011\u0001\u0011\u0001\u0011\u0003\u0011\u00eb\b\u0011"+
		"\u0001\u0012\u0001\u0012\u0001\u0012\u0001\u0012\u0001\u0012\u0001\u0012"+
		"\u0001\u0012\u0001\u0012\u0003\u0012\u00f5\b\u0012\u0001\u0013\u0001\u0013"+
		"\u0001\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001\u0013\u0001\u0013"+
		"\u0003\u0013\u00ff\b\u0013\u0001\u0014\u0001\u0014\u0001\u0014\u0005\u0014"+
		"\u0104\b\u0014\n\u0014\f\u0014\u0107\t\u0014\u0001\u0014\u0001\u0014\u0001"+
		"\u0015\u0001\u0015\u0003\u0015\u010d\b\u0015\u0001\u0016\u0001\u0016\u0001"+
		"\u0016\u0001\u0016\u0001\u0017\u0001\u0017\u0001\u0017\u0005\u0017\u0116"+
		"\b\u0017\n\u0017\f\u0017\u0119\t\u0017\u0001\u0017\u0003\u0017\u011c\b"+
		"\u0017\u0001\u0018\u0001\u0018\u0001\u0018\u0005\u0018\u0121\b\u0018\n"+
		"\u0018\f\u0018\u0124\t\u0018\u0001\u0019\u0001\u0019\u0001\u0019\u0003"+
		"\u0019\u0129\b\u0019\u0001\u0019\u0001\u0019\u0003\u0019\u012d\b\u0019"+
		"\u0001\u0019\u0001\u0019\u0001\u001a\u0001\u001a\u0003\u001a\u0133\b\u001a"+
		"\u0001\u001b\u0001\u001b\u0003\u001b\u0137\b\u001b\u0001\u001b\u0001\u001b"+
		"\u0001\u001c\u0001\u001c\u0001\u001c\u0005\u001c\u013e\b\u001c\n\u001c"+
		"\f\u001c\u0141\t\u001c\u0001\u001d\u0001\u001d\u0004\u001d\u0145\b\u001d"+
		"\u000b\u001d\f\u001d\u0146\u0001\u001d\u0001\u001d\u0001\u001e\u0001\u001e"+
		"\u0001\u001e\u0001\u001e\u0001\u001f\u0001\u001f\u0003\u001f\u0151\b\u001f"+
		"\u0001 \u0001 \u0001 \u0001 \u0005 \u0157\b \n \f \u015a\t \u0003 \u015c"+
		"\b \u0001 \u0001 \u0001!\u0001!\u0004!\u0162\b!\u000b!\f!\u0163\u0001"+
		"!\u0001!\u0001\"\u0001\"\u0001\"\u0001\"\u0001#\u0001#\u0003#\u016e\b"+
		"#\u0001$\u0001$\u0005$\u0172\b$\n$\f$\u0175\t$\u0001$\u0001$\u0001%\u0001"+
		"%\u0005%\u017b\b%\n%\f%\u017e\t%\u0001%\u0001%\u0001&\u0001&\u0003&\u0184"+
		"\b&\u0001&\u0000\u0000\'\u0000\u0002\u0004\u0006\b\n\f\u000e\u0010\u0012"+
		"\u0014\u0016\u0018\u001a\u001c\u001e \"$&(*,.02468:<>@BDFHJL\u0000\u0004"+
		"\u0002\u0000\u0007\u0007\t\f\u0001\u0000\u0015\u0016\u0002\u0000\u000b"+
		"\u000b\u0016\u0016\u0001\u0000\u0010\u0013\u01a0\u0000S\u0001\u0000\u0000"+
		"\u0000\u0002X\u0001\u0000\u0000\u0000\u0004`\u0001\u0000\u0000\u0000\u0006"+
		"h\u0001\u0000\u0000\u0000\b~\u0001\u0000\u0000\u0000\n\u0080\u0001\u0000"+
		"\u0000\u0000\f\u0082\u0001\u0000\u0000\u0000\u000e\u0092\u0001\u0000\u0000"+
		"\u0000\u0010\u0096\u0001\u0000\u0000\u0000\u0012\u009a\u0001\u0000\u0000"+
		"\u0000\u0014\u00b2\u0001\u0000\u0000\u0000\u0016\u00c1\u0001\u0000\u0000"+
		"\u0000\u0018\u00c3\u0001\u0000\u0000\u0000\u001a\u00ce\u0001\u0000\u0000"+
		"\u0000\u001c\u00d3\u0001\u0000\u0000\u0000\u001e\u00d7\u0001\u0000\u0000"+
		"\u0000 \u00dc\u0001\u0000\u0000\u0000\"\u00ea\u0001\u0000\u0000\u0000"+
		"$\u00f4\u0001\u0000\u0000\u0000&\u00fe\u0001\u0000\u0000\u0000(\u0100"+
		"\u0001\u0000\u0000\u0000*\u010c\u0001\u0000\u0000\u0000,\u010e\u0001\u0000"+
		"\u0000\u0000.\u011b\u0001\u0000\u0000\u00000\u011d\u0001\u0000\u0000\u0000"+
		"2\u0125\u0001\u0000\u0000\u00004\u0132\u0001\u0000\u0000\u00006\u0134"+
		"\u0001\u0000\u0000\u00008\u013a\u0001\u0000\u0000\u0000:\u0142\u0001\u0000"+
		"\u0000\u0000<\u014a\u0001\u0000\u0000\u0000>\u0150\u0001\u0000\u0000\u0000"+
		"@\u0152\u0001\u0000\u0000\u0000B\u015f\u0001\u0000\u0000\u0000D\u0167"+
		"\u0001\u0000\u0000\u0000F\u016d\u0001\u0000\u0000\u0000H\u016f\u0001\u0000"+
		"\u0000\u0000J\u0178\u0001\u0000\u0000\u0000L\u0181\u0001\u0000\u0000\u0000"+
		"NR\u0003\u0002\u0001\u0000OR\u0003\u0006\u0003\u0000PR\u0005(\u0000\u0000"+
		"QN\u0001\u0000\u0000\u0000QO\u0001\u0000\u0000\u0000QP\u0001\u0000\u0000"+
		"\u0000RU\u0001\u0000\u0000\u0000SQ\u0001\u0000\u0000\u0000ST\u0001\u0000"+
		"\u0000\u0000TV\u0001\u0000\u0000\u0000US\u0001\u0000\u0000\u0000VW\u0005"+
		"\u0000\u0000\u0001W\u0001\u0001\u0000\u0000\u0000XY\u0005\u0001\u0000"+
		"\u0000Y\\\u0003\u0004\u0002\u0000Z[\u0005\u0002\u0000\u0000[]\u0005\u0014"+
		"\u0000\u0000\\Z\u0001\u0000\u0000\u0000\\]\u0001\u0000\u0000\u0000]^\u0001"+
		"\u0000\u0000\u0000^_\u0005(\u0000\u0000_\u0003\u0001\u0000\u0000\u0000"+
		"`e\u0005\u0014\u0000\u0000ab\u0005#\u0000\u0000bd\u0005\u0014\u0000\u0000"+
		"ca\u0001\u0000\u0000\u0000dg\u0001\u0000\u0000\u0000ec\u0001\u0000\u0000"+
		"\u0000ef\u0001\u0000\u0000\u0000f\u0005\u0001\u0000\u0000\u0000ge\u0001"+
		"\u0000\u0000\u0000hj\u0003\b\u0004\u0000ik\u0003\f\u0006\u0000ji\u0001"+
		"\u0000\u0000\u0000jk\u0001\u0000\u0000\u0000k\u0007\u0001\u0000\u0000"+
		"\u0000ln\u0005\u0015\u0000\u0000mo\u0005\u0014\u0000\u0000nm\u0001\u0000"+
		"\u0000\u0000no\u0001\u0000\u0000\u0000oq\u0001\u0000\u0000\u0000pr\u0003"+
		" \u0010\u0000qp\u0001\u0000\u0000\u0000qr\u0001\u0000\u0000\u0000rs\u0001"+
		"\u0000\u0000\u0000s\u007f\u0005(\u0000\u0000tu\u0005\u0015\u0000\u0000"+
		"ux\u0005\u000b\u0000\u0000vw\u0005\u0019\u0000\u0000wy\u0005\t\u0000\u0000"+
		"xv\u0001\u0000\u0000\u0000xy\u0001\u0000\u0000\u0000y{\u0001\u0000\u0000"+
		"\u0000z|\u0003 \u0010\u0000{z\u0001\u0000\u0000\u0000{|\u0001\u0000\u0000"+
		"\u0000|}\u0001\u0000\u0000\u0000}\u007f\u0005(\u0000\u0000~l\u0001\u0000"+
		"\u0000\u0000~t\u0001\u0000\u0000\u0000\u007f\t\u0001\u0000\u0000\u0000"+
		"\u0080\u0081\u0005\u0014\u0000\u0000\u0081\u000b\u0001\u0000\u0000\u0000"+
		"\u0082\u0084\u0005)\u0000\u0000\u0083\u0085\u0003\u000e\u0007\u0000\u0084"+
		"\u0083\u0001\u0000\u0000\u0000\u0085\u0086\u0001\u0000\u0000\u0000\u0086"+
		"\u0084\u0001\u0000\u0000\u0000\u0086\u0087\u0001\u0000\u0000\u0000\u0087"+
		"\u0088\u0001\u0000\u0000\u0000\u0088\u0089\u0005*\u0000\u0000\u0089\r"+
		"\u0001\u0000\u0000\u0000\u008a\u0093\u0003\u0014\n\u0000\u008b\u0093\u0003"+
		"\u0016\u000b\u0000\u008c\u0093\u0003\u0006\u0003\u0000\u008d\u0093\u0003"+
		"\u0018\f\u0000\u008e\u0093\u0003\u001c\u000e\u0000\u008f\u0093\u0003\u0010"+
		"\b\u0000\u0090\u0093\u0003\u0012\t\u0000\u0091\u0093\u0005(\u0000\u0000"+
		"\u0092\u008a\u0001\u0000\u0000\u0000\u0092\u008b\u0001\u0000\u0000\u0000"+
		"\u0092\u008c\u0001\u0000\u0000\u0000\u0092\u008d\u0001\u0000\u0000\u0000"+
		"\u0092\u008e\u0001\u0000\u0000\u0000\u0092\u008f\u0001\u0000\u0000\u0000"+
		"\u0092\u0090\u0001\u0000\u0000\u0000\u0092\u0091\u0001\u0000\u0000\u0000"+
		"\u0093\u000f\u0001\u0000\u0000\u0000\u0094\u0097\u0005\u0014\u0000\u0000"+
		"\u0095\u0097\u00030\u0018\u0000\u0096\u0094\u0001\u0000\u0000\u0000\u0096"+
		"\u0095\u0001\u0000\u0000\u0000\u0097\u0098\u0001\u0000\u0000\u0000\u0098"+
		"\u0099\u0005(\u0000\u0000\u0099\u0011\u0001\u0000\u0000\u0000\u009a\u009b"+
		"\u0005\u0015\u0000\u0000\u009b\u009e\u0005\u0014\u0000\u0000\u009c\u009f"+
		"\u0005\u000b\u0000\u0000\u009d\u009f\u0003(\u0014\u0000\u009e\u009c\u0001"+
		"\u0000\u0000\u0000\u009e\u009d\u0001\u0000\u0000\u0000\u009f\u00a2\u0001"+
		"\u0000\u0000\u0000\u00a0\u00a1\u0005\u0019\u0000\u0000\u00a1\u00a3\u0005"+
		"\t\u0000\u0000\u00a2\u00a0\u0001\u0000\u0000\u0000\u00a2\u00a3\u0001\u0000"+
		"\u0000\u0000\u00a3\u00a5\u0001\u0000\u0000\u0000\u00a4\u00a6\u0003 \u0010"+
		"\u0000\u00a5\u00a4\u0001\u0000\u0000\u0000\u00a5\u00a6\u0001\u0000\u0000"+
		"\u0000\u00a6\u00a7\u0001\u0000\u0000\u0000\u00a7\u00b0\u0005(\u0000\u0000"+
		"\u00a8\u00aa\u0005)\u0000\u0000\u00a9\u00ab\u0003\u000e\u0007\u0000\u00aa"+
		"\u00a9\u0001\u0000\u0000\u0000\u00ab\u00ac\u0001\u0000\u0000\u0000\u00ac"+
		"\u00aa\u0001\u0000\u0000\u0000\u00ac\u00ad\u0001\u0000\u0000\u0000\u00ad"+
		"\u00ae\u0001\u0000\u0000\u0000\u00ae\u00af\u0005*\u0000\u0000\u00af\u00b1"+
		"\u0001\u0000\u0000\u0000\u00b0\u00a8\u0001\u0000\u0000\u0000\u00b0\u00b1"+
		"\u0001\u0000\u0000\u0000\u00b1\u0013\u0001\u0000\u0000\u0000\u00b2\u00b3"+
		"\u0005%\u0000\u0000\u00b3\u00b4\u0005\u0014\u0000\u0000\u00b4\u00b5\u0005"+
		"(\u0000\u0000\u00b5\u0015\u0001\u0000\u0000\u0000\u00b6\u00b7\u0005\b"+
		"\u0000\u0000\u00b7\u00b8\u0003$\u0012\u0000\u00b8\u00b9\u0005(\u0000\u0000"+
		"\u00b9\u00c2\u0001\u0000\u0000\u0000\u00ba\u00bb\u0005\b\u0000\u0000\u00bb"+
		"\u00bc\u0005\u001a\u0000\u0000\u00bc\u00bd\u0003$\u0012\u0000\u00bd\u00be"+
		"\u0005(\u0000\u0000\u00be\u00c2\u0001\u0000\u0000\u0000\u00bf\u00c0\u0005"+
		"\b\u0000\u0000\u00c0\u00c2\u0005(\u0000\u0000\u00c1\u00b6\u0001\u0000"+
		"\u0000\u0000\u00c1\u00ba\u0001\u0000\u0000\u0000\u00c1\u00bf\u0001\u0000"+
		"\u0000\u0000\u00c2\u0017\u0001\u0000\u0000\u0000\u00c3\u00c4\u0005\u0004"+
		"\u0000\u0000\u00c4\u00c5\u0003$\u0012\u0000\u00c5\u00c6\u0005(\u0000\u0000"+
		"\u00c6\u00c8\u0005)\u0000\u0000\u00c7\u00c9\u0003\u001a\r\u0000\u00c8"+
		"\u00c7\u0001\u0000\u0000\u0000\u00c9\u00ca\u0001\u0000\u0000\u0000\u00ca"+
		"\u00c8\u0001\u0000\u0000\u0000\u00ca\u00cb\u0001\u0000\u0000\u0000\u00cb"+
		"\u00cc\u0001\u0000\u0000\u0000\u00cc\u00cd\u0005*\u0000\u0000\u00cd\u0019"+
		"\u0001\u0000\u0000\u0000\u00ce\u00cf\u0007\u0000\u0000\u0000\u00cf\u00d0"+
		"\u0005\u0018\u0000\u0000\u00d0\u00d1\u0003\u001e\u000f\u0000\u00d1\u00d2"+
		"\u0005(\u0000\u0000\u00d2\u001b\u0001\u0000\u0000\u0000\u00d3\u00d4\u0005"+
		"\u0018\u0000\u0000\u00d4\u00d5\u0003\u001e\u000f\u0000\u00d5\u00d6\u0005"+
		"(\u0000\u0000\u00d6\u001d\u0001\u0000\u0000\u0000\u00d7\u00da\u0003$\u0012"+
		"\u0000\u00d8\u00d9\u0005\u0003\u0000\u0000\u00d9\u00db\u0003 \u0010\u0000"+
		"\u00da\u00d8\u0001\u0000\u0000\u0000\u00da\u00db\u0001\u0000\u0000\u0000"+
		"\u00db\u001f\u0001\u0000\u0000\u0000\u00dc\u00e1\u0003\"\u0011\u0000\u00dd"+
		"\u00de\u0005\u001a\u0000\u0000\u00de\u00e0\u0003\"\u0011\u0000\u00df\u00dd"+
		"\u0001\u0000\u0000\u0000\u00e0\u00e3\u0001\u0000\u0000\u0000\u00e1\u00df"+
		"\u0001\u0000\u0000\u0000\u00e1\u00e2\u0001\u0000\u0000\u0000\u00e2!\u0001"+
		"\u0000\u0000\u0000\u00e3\u00e1\u0001\u0000\u0000\u0000\u00e4\u00e5\u0005"+
		"\b\u0000\u0000\u00e5\u00eb\u0003$\u0012\u0000\u00e6\u00e7\u0005\u0016"+
		"\u0000\u0000\u00e7\u00e8\u0005\u0019\u0000\u0000\u00e8\u00eb\u0003$\u0012"+
		"\u0000\u00e9\u00eb\u0003$\u0012\u0000\u00ea\u00e4\u0001\u0000\u0000\u0000"+
		"\u00ea\u00e6\u0001\u0000\u0000\u0000\u00ea\u00e9\u0001\u0000\u0000\u0000"+
		"\u00eb#\u0001\u0000\u0000\u0000\u00ec\u00f5\u0001\u0000\u0000\u0000\u00ed"+
		"\u00f5\u0003&\u0013\u0000\u00ee\u00f5\u0005\u0014\u0000\u0000\u00ef\u00f5"+
		"\u00030\u0018\u0000\u00f0\u00f5\u00036\u001b\u0000\u00f1\u00f5\u0003>"+
		"\u001f\u0000\u00f2\u00f5\u0003F#\u0000\u00f3\u00f5\u0003J%\u0000\u00f4"+
		"\u00ec\u0001\u0000\u0000\u0000\u00f4\u00ed\u0001\u0000\u0000\u0000\u00f4"+
		"\u00ee\u0001\u0000\u0000\u0000\u00f4\u00ef\u0001\u0000\u0000\u0000\u00f4"+
		"\u00f0\u0001\u0000\u0000\u0000\u00f4\u00f1\u0001\u0000\u0000\u0000\u00f4"+
		"\u00f2\u0001\u0000\u0000\u0000\u00f4\u00f3\u0001\u0000\u0000\u0000\u00f5"+
		"%\u0001\u0000\u0000\u0000\u00f6\u00ff\u0005\u000b\u0000\u0000\u00f7\u00ff"+
		"\u0003(\u0014\u0000\u00f8\u00ff\u0005\f\u0000\u0000\u00f9\u00ff\u0005"+
		"\u0007\u0000\u0000\u00fa\u00ff\u0005\u0005\u0000\u0000\u00fb\u00ff\u0005"+
		"\u0006\u0000\u0000\u00fc\u00ff\u0005\t\u0000\u0000\u00fd\u00ff\u00032"+
		"\u0019\u0000\u00fe\u00f6\u0001\u0000\u0000\u0000\u00fe\u00f7\u0001\u0000"+
		"\u0000\u0000\u00fe\u00f8\u0001\u0000\u0000\u0000\u00fe\u00f9\u0001\u0000"+
		"\u0000\u0000\u00fe\u00fa\u0001\u0000\u0000\u0000\u00fe\u00fb\u0001\u0000"+
		"\u0000\u0000\u00fe\u00fc\u0001\u0000\u0000\u0000\u00fe\u00fd\u0001\u0000"+
		"\u0000\u0000\u00ff\'\u0001\u0000\u0000\u0000\u0100\u0105\u0005\r\u0000"+
		"\u0000\u0101\u0104\u00052\u0000\u0000\u0102\u0104\u0003,\u0016\u0000\u0103"+
		"\u0101\u0001\u0000\u0000\u0000\u0103\u0102\u0001\u0000\u0000\u0000\u0104"+
		"\u0107\u0001\u0000\u0000\u0000\u0105\u0103\u0001\u0000\u0000\u0000\u0105"+
		"\u0106\u0001\u0000\u0000\u0000\u0106\u0108\u0001\u0000\u0000\u0000\u0107"+
		"\u0105\u0001\u0000\u0000\u0000\u0108\u0109\u00050\u0000\u0000\u0109)\u0001"+
		"\u0000\u0000\u0000\u010a\u010d\u00052\u0000\u0000\u010b\u010d\u0003,\u0016"+
		"\u0000\u010c\u010a\u0001\u0000\u0000\u0000\u010c\u010b\u0001\u0000\u0000"+
		"\u0000\u010d+\u0001\u0000\u0000\u0000\u010e\u010f\u00051\u0000\u0000\u010f"+
		"\u0110\u0003.\u0017\u0000\u0110\u0111\u00053\u0000\u0000\u0111-\u0001"+
		"\u0000\u0000\u0000\u0112\u0117\u00054\u0000\u0000\u0113\u0114\u00055\u0000"+
		"\u0000\u0114\u0116\u00056\u0000\u0000\u0115\u0113\u0001\u0000\u0000\u0000"+
		"\u0116\u0119\u0001\u0000\u0000\u0000\u0117\u0115\u0001\u0000\u0000\u0000"+
		"\u0117\u0118\u0001\u0000\u0000\u0000\u0118\u011c\u0001\u0000\u0000\u0000"+
		"\u0119\u0117\u0001\u0000\u0000\u0000\u011a\u011c\u0003$\u0012\u0000\u011b"+
		"\u0112\u0001\u0000\u0000\u0000\u011b\u011a\u0001\u0000\u0000\u0000\u011c"+
		"/\u0001\u0000\u0000\u0000\u011d\u0122\u0005\u0017\u0000\u0000\u011e\u011f"+
		"\u0005\u001b\u0000\u0000\u011f\u0121\u0007\u0001\u0000\u0000\u0120\u011e"+
		"\u0001\u0000\u0000\u0000\u0121\u0124\u0001\u0000\u0000\u0000\u0122\u0120"+
		"\u0001\u0000\u0000\u0000\u0122\u0123\u0001\u0000\u0000\u0000\u01231\u0001"+
		"\u0000\u0000\u0000\u0124\u0122\u0001\u0000\u0000\u0000\u0125\u0126\u0005"+
		" \u0000\u0000\u0126\u0128\u0005+\u0000\u0000\u0127\u0129\u0005-\u0000"+
		"\u0000\u0128\u0127\u0001\u0000\u0000\u0000\u0128\u0129\u0001\u0000\u0000"+
		"\u0000\u0129\u012c\u0001\u0000\u0000\u0000\u012a\u012b\u0005.\u0000\u0000"+
		"\u012b\u012d\u0005-\u0000\u0000\u012c\u012a\u0001\u0000\u0000\u0000\u012c"+
		"\u012d\u0001\u0000\u0000\u0000\u012d\u012e\u0001\u0000\u0000\u0000\u012e"+
		"\u012f\u0005/\u0000\u0000\u012f3\u0001\u0000\u0000\u0000\u0130\u0133\u0003"+
		"6\u001b\u0000\u0131\u0133\u0003:\u001d\u0000\u0132\u0130\u0001\u0000\u0000"+
		"\u0000\u0132\u0131\u0001\u0000\u0000\u0000\u01335\u0001\u0000\u0000\u0000"+
		"\u0134\u0136\u0005\u001c\u0000\u0000\u0135\u0137\u00038\u001c\u0000\u0136"+
		"\u0135\u0001\u0000\u0000\u0000\u0136\u0137\u0001\u0000\u0000\u0000\u0137"+
		"\u0138\u0001\u0000\u0000\u0000\u0138\u0139\u0005\u001d\u0000\u0000\u0139"+
		"7\u0001\u0000\u0000\u0000\u013a\u013f\u0003$\u0012\u0000\u013b\u013c\u0005"+
		"\u001a\u0000\u0000\u013c\u013e\u0003$\u0012\u0000\u013d\u013b\u0001\u0000"+
		"\u0000\u0000\u013e\u0141\u0001\u0000\u0000\u0000\u013f\u013d\u0001\u0000"+
		"\u0000\u0000\u013f\u0140\u0001\u0000\u0000\u0000\u01409\u0001\u0000\u0000"+
		"\u0000\u0141\u013f\u0001\u0000\u0000\u0000\u0142\u0144\u0005)\u0000\u0000"+
		"\u0143\u0145\u0003<\u001e\u0000\u0144\u0143\u0001\u0000\u0000\u0000\u0145"+
		"\u0146\u0001\u0000\u0000\u0000\u0146\u0144\u0001\u0000\u0000\u0000\u0146"+
		"\u0147\u0001\u0000\u0000\u0000\u0147\u0148\u0001\u0000\u0000\u0000\u0148"+
		"\u0149\u0005*\u0000\u0000\u0149;\u0001\u0000\u0000\u0000\u014a\u014b\u0005"+
		"$\u0000\u0000\u014b\u014c\u0003$\u0012\u0000\u014c\u014d\u0005(\u0000"+
		"\u0000\u014d=\u0001\u0000\u0000\u0000\u014e\u0151\u0003@ \u0000\u014f"+
		"\u0151\u0003B!\u0000\u0150\u014e\u0001\u0000\u0000\u0000\u0150\u014f\u0001"+
		"\u0000\u0000\u0000\u0151?\u0001\u0000\u0000\u0000\u0152\u015b\u0005\u001e"+
		"\u0000\u0000\u0153\u0158\u0003D\"\u0000\u0154\u0155\u0005\u001a\u0000"+
		"\u0000\u0155\u0157\u0003D\"\u0000\u0156\u0154\u0001\u0000\u0000\u0000"+
		"\u0157\u015a\u0001\u0000\u0000\u0000\u0158\u0156\u0001\u0000\u0000\u0000"+
		"\u0158\u0159\u0001\u0000\u0000\u0000\u0159\u015c\u0001\u0000\u0000\u0000"+
		"\u015a\u0158\u0001\u0000\u0000\u0000\u015b\u0153\u0001\u0000\u0000\u0000"+
		"\u015b\u015c\u0001\u0000\u0000\u0000\u015c\u015d\u0001\u0000\u0000\u0000"+
		"\u015d\u015e\u0005\u001f\u0000\u0000\u015eA\u0001\u0000\u0000\u0000\u015f"+
		"\u0161\u0005)\u0000\u0000\u0160\u0162\u0003D\"\u0000\u0161\u0160\u0001"+
		"\u0000\u0000\u0000\u0162\u0163\u0001\u0000\u0000\u0000\u0163\u0161\u0001"+
		"\u0000\u0000\u0000\u0163\u0164\u0001\u0000\u0000\u0000\u0164\u0165\u0001"+
		"\u0000\u0000\u0000\u0165\u0166\u0005*\u0000\u0000\u0166C\u0001\u0000\u0000"+
		"\u0000\u0167\u0168\u0007\u0002\u0000\u0000\u0168\u0169\u0005\u0019\u0000"+
		"\u0000\u0169\u016a\u0003$\u0012\u0000\u016aE\u0001\u0000\u0000\u0000\u016b"+
		"\u016e\u0005\u000e\u0000\u0000\u016c\u016e\u0003H$\u0000\u016d\u016b\u0001"+
		"\u0000\u0000\u0000\u016d\u016c\u0001\u0000\u0000\u0000\u016eG\u0001\u0000"+
		"\u0000\u0000\u016f\u0173\u0005\u000f\u0000\u0000\u0170\u0172\u00059\u0000"+
		"\u0000\u0171\u0170\u0001\u0000\u0000\u0000\u0172\u0175\u0001\u0000\u0000"+
		"\u0000\u0173\u0171\u0001\u0000\u0000\u0000\u0173\u0174\u0001\u0000\u0000"+
		"\u0000\u0174\u0176\u0001\u0000\u0000\u0000\u0175\u0173\u0001\u0000\u0000"+
		"\u0000\u0176\u0177\u00058\u0000\u0000\u0177I\u0001\u0000\u0000\u0000\u0178"+
		"\u017c\u0007\u0003\u0000\u0000\u0179\u017b\u0003L&\u0000\u017a\u0179\u0001"+
		"\u0000\u0000\u0000\u017b\u017e\u0001\u0000\u0000\u0000\u017c\u017a\u0001"+
		"\u0000\u0000\u0000\u017c\u017d\u0001\u0000\u0000\u0000\u017d\u017f\u0001"+
		"\u0000\u0000\u0000\u017e\u017c\u0001\u0000\u0000\u0000\u017f\u0180\u0005"+
		":\u0000\u0000\u0180K\u0001\u0000\u0000\u0000\u0181\u0183\u0005;\u0000"+
		"\u0000\u0182\u0184\u0005<\u0000\u0000\u0183\u0182\u0001\u0000\u0000\u0000"+
		"\u0183\u0184\u0001\u0000\u0000\u0000\u0184M\u0001\u0000\u0000\u0000-Q"+
		"S\\ejnqx{~\u0086\u0092\u0096\u009e\u00a2\u00a5\u00ac\u00b0\u00c1\u00ca"+
		"\u00da\u00e1\u00ea\u00f4\u00fe\u0103\u0105\u010c\u0117\u011b\u0122\u0128"+
		"\u012c\u0132\u0136\u013f\u0146\u0150\u0158\u015b\u0163\u016d\u0173\u017c"+
		"\u0183";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}