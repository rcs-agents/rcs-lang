
import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { RclParserListener } from "./RclParserListener.js";
import { RclParserVisitor } from "./RclParserVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class RclParser extends antlr.Parser {
    public static readonly IMPORT = 1;
    public static readonly AS = 2;
    public static readonly WITH = 3;
    public static readonly MATCH = 4;
    public static readonly START = 5;
    public static readonly ON = 6;
    public static readonly APPEND = 7;
    public static readonly SET = 8;
    public static readonly MERGE = 9;
    public static readonly TO = 10;
    public static readonly INTO = 11;
    public static readonly RESULT = 12;
    public static readonly FLOW_END = 13;
    public static readonly FLOW_CANCEL = 14;
    public static readonly FLOW_ERROR = 15;
    public static readonly BOOLEAN = 16;
    public static readonly NULL = 17;
    public static readonly NUMBER = 18;
    public static readonly ATTRIBUTE_NAME = 19;
    public static readonly ATOM = 20;
    public static readonly DEFAULT_CASE = 21;
    public static readonly STRING = 22;
    public static readonly REGEX = 23;
    public static readonly TRIPLE_QUOTE = 24;
    public static readonly EMBEDDED_CODE = 25;
    public static readonly MULTI_LINE_CODE_START = 26;
    public static readonly MULTILINE_STR_CLEAN = 27;
    public static readonly MULTILINE_STR_TRIM = 28;
    public static readonly MULTILINE_STR_PRESERVE = 29;
    public static readonly MULTILINE_STR_PRESERVE_ALL = 30;
    public static readonly IDENTIFIER = 31;
    public static readonly LOWER_NAME = 32;
    public static readonly VARIABLE = 33;
    public static readonly ARROW = 34;
    public static readonly COLON = 35;
    public static readonly COMMA = 36;
    public static readonly DOT = 37;
    public static readonly LPAREN = 38;
    public static readonly RPAREN = 39;
    public static readonly LBRACE = 40;
    public static readonly RBRACE = 41;
    public static readonly LANGLE = 42;
    public static readonly RANGLE = 43;
    public static readonly PIPE = 44;
    public static readonly SLASH = 45;
    public static readonly HYPHEN = 46;
    public static readonly SPREAD = 47;
    public static readonly WS = 48;
    public static readonly COMMENT = 49;
    public static readonly NEWLINE = 50;
    public static readonly INDENT = 51;
    public static readonly DEDENT = 52;
    public static readonly TT_TYPE_NAME = 53;
    public static readonly TT_WS = 54;
    public static readonly TT_CONTENT = 55;
    public static readonly TT_PIPE = 56;
    public static readonly TT_RANGLE = 57;
    public static readonly TS_TRIPLE_QUOTE_END = 58;
    public static readonly TS_INTERPOLATION_START = 59;
    public static readonly TS_CONTENT = 60;
    public static readonly INT_RBRACE = 61;
    public static readonly INT_VARIABLE = 62;
    public static readonly INT_DOT = 63;
    public static readonly INT_LOWER_NAME = 64;
    public static readonly INT_WS = 65;
    public static readonly MC_END = 66;
    public static readonly MC_CONTENT = 67;
    public static readonly ML_END = 68;
    public static readonly ML_CONTENT = 69;
    public static readonly ML_NEWLINE = 70;
    public static readonly RULE_rcl_file = 0;
    public static readonly RULE_import_statement = 1;
    public static readonly RULE_import_path = 2;
    public static readonly RULE_section = 3;
    public static readonly RULE_section_header = 4;
    public static readonly RULE_section_type = 5;
    public static readonly RULE_header_values = 6;
    public static readonly RULE_identifier = 7;
    public static readonly RULE_section_body = 8;
    public static readonly RULE_section_content = 9;
    public static readonly RULE_state_reference = 10;
    public static readonly RULE_spread_directive = 11;
    public static readonly RULE_attribute_assignment = 12;
    public static readonly RULE_match_block = 13;
    public static readonly RULE_match_case = 14;
    public static readonly RULE_transition_target = 15;
    public static readonly RULE_flow_invocation_with_handlers = 16;
    public static readonly RULE_context_operation_sequence = 17;
    public static readonly RULE_simple_transition = 18;
    public static readonly RULE_contextualized_value = 19;
    public static readonly RULE_parameter_list = 20;
    public static readonly RULE_parameter = 21;
    public static readonly RULE_value = 22;
    public static readonly RULE_primitive_value = 23;
    public static readonly RULE_triple_quote_string = 24;
    public static readonly RULE_triple_string_content = 25;
    public static readonly RULE_interpolation = 26;
    public static readonly RULE_interpolation_expr = 27;
    public static readonly RULE_variable_access = 28;
    public static readonly RULE_type_tag = 29;
    public static readonly RULE_list = 30;
    public static readonly RULE_parentheses_list = 31;
    public static readonly RULE_list_elements = 32;
    public static readonly RULE_block_list = 33;
    public static readonly RULE_block_list_item = 34;
    public static readonly RULE_dictionary = 35;
    public static readonly RULE_brace_dictionary = 36;
    public static readonly RULE_block_dictionary = 37;
    public static readonly RULE_dict_entry = 38;
    public static readonly RULE_embedded_code = 39;
    public static readonly RULE_multi_line_code = 40;
    public static readonly RULE_multi_line_string = 41;
    public static readonly RULE_multiline_content = 42;
    public static readonly RULE_flow_invocation = 43;
    public static readonly RULE_flow_result_handler = 44;
    public static readonly RULE_flow_result = 45;
    public static readonly RULE_context_operation = 46;
    public static readonly RULE_target_reference = 47;
    public static readonly RULE_flow_termination = 48;

    public static readonly literalNames = [
        null, "'import'", "'as'", "'with'", "'match'", "'start'", "'on'", 
        "'append'", "'set'", "'merge'", "'to'", "'into'", "'result'", "':end'", 
        "':cancel'", "':error'", null, null, null, null, null, "':default'", 
        null, null, null, null, null, null, null, null, null, null, null, 
        null, "'->'", "':'", "','", null, "'('", "')'", "'{'", null, "'<'", 
        null, null, "'/'", "'-'", "'...'", null, null, null, "'INDENT_PLACEHOLDER'", 
        "'DEDENT_PLACEHOLDER'", null, null, null, null, null, null, "'#{'", 
        null, null, null, null, null, null, "'<$'"
    ];

    public static readonly symbolicNames = [
        null, "IMPORT", "AS", "WITH", "MATCH", "START", "ON", "APPEND", 
        "SET", "MERGE", "TO", "INTO", "RESULT", "FLOW_END", "FLOW_CANCEL", 
        "FLOW_ERROR", "BOOLEAN", "NULL", "NUMBER", "ATTRIBUTE_NAME", "ATOM", 
        "DEFAULT_CASE", "STRING", "REGEX", "TRIPLE_QUOTE", "EMBEDDED_CODE", 
        "MULTI_LINE_CODE_START", "MULTILINE_STR_CLEAN", "MULTILINE_STR_TRIM", 
        "MULTILINE_STR_PRESERVE", "MULTILINE_STR_PRESERVE_ALL", "IDENTIFIER", 
        "LOWER_NAME", "VARIABLE", "ARROW", "COLON", "COMMA", "DOT", "LPAREN", 
        "RPAREN", "LBRACE", "RBRACE", "LANGLE", "RANGLE", "PIPE", "SLASH", 
        "HYPHEN", "SPREAD", "WS", "COMMENT", "NEWLINE", "INDENT", "DEDENT", 
        "TT_TYPE_NAME", "TT_WS", "TT_CONTENT", "TT_PIPE", "TT_RANGLE", "TS_TRIPLE_QUOTE_END", 
        "TS_INTERPOLATION_START", "TS_CONTENT", "INT_RBRACE", "INT_VARIABLE", 
        "INT_DOT", "INT_LOWER_NAME", "INT_WS", "MC_END", "MC_CONTENT", "ML_END", 
        "ML_CONTENT", "ML_NEWLINE"
    ];
    public static readonly ruleNames = [
        "rcl_file", "import_statement", "import_path", "section", "section_header", 
        "section_type", "header_values", "identifier", "section_body", "section_content", 
        "state_reference", "spread_directive", "attribute_assignment", "match_block", 
        "match_case", "transition_target", "flow_invocation_with_handlers", 
        "context_operation_sequence", "simple_transition", "contextualized_value", 
        "parameter_list", "parameter", "value", "primitive_value", "triple_quote_string", 
        "triple_string_content", "interpolation", "interpolation_expr", 
        "variable_access", "type_tag", "list", "parentheses_list", "list_elements", 
        "block_list", "block_list_item", "dictionary", "brace_dictionary", 
        "block_dictionary", "dict_entry", "embedded_code", "multi_line_code", 
        "multi_line_string", "multiline_content", "flow_invocation", "flow_result_handler", 
        "flow_result", "context_operation", "target_reference", "flow_termination",
    ];

    public get grammarFileName(): string { return "RclParser.g4"; }
    public get literalNames(): (string | null)[] { return RclParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return RclParser.symbolicNames; }
    public get ruleNames(): string[] { return RclParser.ruleNames; }
    public get serializedATN(): number[] { return RclParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, RclParser._ATN, RclParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public rcl_file(): Rcl_fileContext {
        let localContext = new Rcl_fileContext(this.context, this.state);
        this.enterRule(localContext, 0, RclParser.RULE_rcl_file);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 103;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 1 || _la === 6 || _la === 32 || _la === 50) {
                {
                this.state = 101;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case RclParser.IMPORT:
                    {
                    this.state = 98;
                    this.import_statement();
                    }
                    break;
                case RclParser.ON:
                case RclParser.LOWER_NAME:
                    {
                    this.state = 99;
                    this.section();
                    }
                    break;
                case RclParser.NEWLINE:
                    {
                    this.state = 100;
                    this.match(RclParser.NEWLINE);
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                this.state = 105;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 106;
            this.match(RclParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public import_statement(): Import_statementContext {
        let localContext = new Import_statementContext(this.context, this.state);
        this.enterRule(localContext, 2, RclParser.RULE_import_statement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 108;
            this.match(RclParser.IMPORT);
            this.state = 109;
            this.import_path();
            this.state = 112;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 2) {
                {
                this.state = 110;
                this.match(RclParser.AS);
                this.state = 111;
                localContext._alias = this.match(RclParser.IDENTIFIER);
                }
            }

            this.state = 114;
            this.match(RclParser.NEWLINE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public import_path(): Import_pathContext {
        let localContext = new Import_pathContext(this.context, this.state);
        this.enterRule(localContext, 4, RclParser.RULE_import_path);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 116;
            this.match(RclParser.IDENTIFIER);
            this.state = 121;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 45) {
                {
                {
                this.state = 117;
                this.match(RclParser.SLASH);
                this.state = 118;
                this.match(RclParser.IDENTIFIER);
                }
                }
                this.state = 123;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public section(): SectionContext {
        let localContext = new SectionContext(this.context, this.state);
        this.enterRule(localContext, 6, RclParser.RULE_section);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 124;
            this.section_header();
            this.state = 126;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 51) {
                {
                this.state = 125;
                this.section_body();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public section_header(): Section_headerContext {
        let localContext = new Section_headerContext(this.context, this.state);
        this.enterRule(localContext, 8, RclParser.RULE_section_header);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 128;
            this.section_type();
            this.state = 130;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 5, this.context) ) {
            case 1:
                {
                this.state = 129;
                this.match(RclParser.IDENTIFIER);
                }
                break;
            }
            this.state = 133;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 6, this.context) ) {
            case 1:
                {
                this.state = 132;
                this.header_values();
                }
                break;
            }
            this.state = 136;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4292804608) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 525635) !== 0)) {
                {
                this.state = 135;
                this.parameter_list();
                }
            }

            this.state = 138;
            this.match(RclParser.NEWLINE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public section_type(): Section_typeContext {
        let localContext = new Section_typeContext(this.context, this.state);
        this.enterRule(localContext, 10, RclParser.RULE_section_type);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 140;
            _la = this.tokenStream.LA(1);
            if(!(_la === 6 || _la === 32)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public header_values(): Header_valuesContext {
        let localContext = new Header_valuesContext(this.context, this.state);
        this.enterRule(localContext, 12, RclParser.RULE_header_values);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 143;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 142;
                    this.value();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 145;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 8, this.context);
            } while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public identifier(): IdentifierContext {
        let localContext = new IdentifierContext(this.context, this.state);
        this.enterRule(localContext, 14, RclParser.RULE_identifier);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 147;
            this.match(RclParser.IDENTIFIER);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public section_body(): Section_bodyContext {
        let localContext = new Section_bodyContext(this.context, this.state);
        this.enterRule(localContext, 16, RclParser.RULE_section_body);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 149;
            this.match(RclParser.INDENT);
            this.state = 151;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 150;
                this.section_content();
                }
                }
                this.state = 153;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2148008048) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 294919) !== 0));
            this.state = 155;
            this.match(RclParser.DEDENT);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public section_content(): Section_contentContext {
        let localContext = new Section_contentContext(this.context, this.state);
        this.enterRule(localContext, 18, RclParser.RULE_section_content);
        try {
            this.state = 165;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.SPREAD:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 157;
                this.spread_directive();
                }
                break;
            case RclParser.ATTRIBUTE_NAME:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 158;
                this.attribute_assignment();
                }
                break;
            case RclParser.ON:
            case RclParser.LOWER_NAME:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 159;
                this.section();
                }
                break;
            case RclParser.MATCH:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 160;
                this.match_block();
                }
                break;
            case RclParser.ARROW:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 161;
                this.simple_transition();
                }
                break;
            case RclParser.START:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 162;
                this.flow_invocation();
                }
                break;
            case RclParser.IDENTIFIER:
            case RclParser.VARIABLE:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 163;
                this.state_reference();
                }
                break;
            case RclParser.NEWLINE:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 164;
                this.match(RclParser.NEWLINE);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public state_reference(): State_referenceContext {
        let localContext = new State_referenceContext(this.context, this.state);
        this.enterRule(localContext, 20, RclParser.RULE_state_reference);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 169;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.IDENTIFIER:
                {
                this.state = 167;
                this.match(RclParser.IDENTIFIER);
                }
                break;
            case RclParser.VARIABLE:
                {
                this.state = 168;
                this.variable_access();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            this.state = 171;
            this.match(RclParser.NEWLINE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public spread_directive(): Spread_directiveContext {
        let localContext = new Spread_directiveContext(this.context, this.state);
        this.enterRule(localContext, 22, RclParser.RULE_spread_directive);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 173;
            this.match(RclParser.SPREAD);
            this.state = 174;
            this.match(RclParser.IDENTIFIER);
            this.state = 175;
            this.match(RclParser.NEWLINE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public attribute_assignment(): Attribute_assignmentContext {
        let localContext = new Attribute_assignmentContext(this.context, this.state);
        this.enterRule(localContext, 24, RclParser.RULE_attribute_assignment);
        try {
            this.state = 188;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 12, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 177;
                this.match(RclParser.ATTRIBUTE_NAME);
                this.state = 178;
                this.value();
                this.state = 179;
                this.match(RclParser.NEWLINE);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 181;
                this.match(RclParser.ATTRIBUTE_NAME);
                this.state = 182;
                this.match(RclParser.COMMA);
                this.state = 183;
                this.value();
                this.state = 184;
                this.match(RclParser.NEWLINE);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 186;
                this.match(RclParser.ATTRIBUTE_NAME);
                this.state = 187;
                this.match(RclParser.NEWLINE);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public match_block(): Match_blockContext {
        let localContext = new Match_blockContext(this.context, this.state);
        this.enterRule(localContext, 26, RclParser.RULE_match_block);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 190;
            this.match(RclParser.MATCH);
            this.state = 191;
            this.value();
            this.state = 192;
            this.match(RclParser.NEWLINE);
            this.state = 193;
            this.match(RclParser.INDENT);
            this.state = 195;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 194;
                this.match_case();
                }
                }
                this.state = 197;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 15990784) !== 0));
            this.state = 199;
            this.match(RclParser.DEDENT);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public match_case(): Match_caseContext {
        let localContext = new Match_caseContext(this.context, this.state);
        this.enterRule(localContext, 28, RclParser.RULE_match_case);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 201;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 15990784) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 202;
            this.match(RclParser.ARROW);
            this.state = 203;
            this.transition_target();
            this.state = 204;
            this.match(RclParser.NEWLINE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public transition_target(): Transition_targetContext {
        let localContext = new Transition_targetContext(this.context, this.state);
        this.enterRule(localContext, 30, RclParser.RULE_transition_target);
        try {
            this.state = 210;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.BOOLEAN:
            case RclParser.NULL:
            case RclParser.NUMBER:
            case RclParser.ATOM:
            case RclParser.STRING:
            case RclParser.REGEX:
            case RclParser.TRIPLE_QUOTE:
            case RclParser.EMBEDDED_CODE:
            case RclParser.MULTI_LINE_CODE_START:
            case RclParser.MULTILINE_STR_CLEAN:
            case RclParser.MULTILINE_STR_TRIM:
            case RclParser.MULTILINE_STR_PRESERVE:
            case RclParser.MULTILINE_STR_PRESERVE_ALL:
            case RclParser.IDENTIFIER:
            case RclParser.VARIABLE:
            case RclParser.LPAREN:
            case RclParser.LBRACE:
            case RclParser.LANGLE:
            case RclParser.INDENT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 206;
                this.contextualized_value();
                }
                break;
            case RclParser.COLON:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 207;
                this.flow_termination();
                }
                break;
            case RclParser.START:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 208;
                this.flow_invocation_with_handlers();
                }
                break;
            case RclParser.APPEND:
            case RclParser.SET:
            case RclParser.MERGE:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 209;
                this.context_operation_sequence();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public flow_invocation_with_handlers(): Flow_invocation_with_handlersContext {
        let localContext = new Flow_invocation_with_handlersContext(this.context, this.state);
        this.enterRule(localContext, 32, RclParser.RULE_flow_invocation_with_handlers);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 212;
            this.flow_invocation();
            this.state = 222;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 16, this.context) ) {
            case 1:
                {
                this.state = 213;
                this.match(RclParser.NEWLINE);
                this.state = 214;
                this.match(RclParser.INDENT);
                this.state = 216;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 215;
                    this.flow_result_handler();
                    }
                    }
                    this.state = 218;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while (_la === 6);
                this.state = 220;
                this.match(RclParser.DEDENT);
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public context_operation_sequence(): Context_operation_sequenceContext {
        let localContext = new Context_operation_sequenceContext(this.context, this.state);
        this.enterRule(localContext, 34, RclParser.RULE_context_operation_sequence);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 224;
            this.context_operation();
            this.state = 229;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 17, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 225;
                    this.match(RclParser.ARROW);
                    this.state = 226;
                    this.context_operation();
                    }
                    }
                }
                this.state = 231;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 17, this.context);
            }
            this.state = 232;
            this.match(RclParser.ARROW);
            this.state = 233;
            this.target_reference();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public simple_transition(): Simple_transitionContext {
        let localContext = new Simple_transitionContext(this.context, this.state);
        this.enterRule(localContext, 36, RclParser.RULE_simple_transition);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 235;
            this.match(RclParser.ARROW);
            this.state = 236;
            this.transition_target();
            this.state = 237;
            this.match(RclParser.NEWLINE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public contextualized_value(): Contextualized_valueContext {
        let localContext = new Contextualized_valueContext(this.context, this.state);
        this.enterRule(localContext, 38, RclParser.RULE_contextualized_value);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 239;
            this.value();
            this.state = 242;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 3) {
                {
                this.state = 240;
                this.match(RclParser.WITH);
                this.state = 241;
                this.parameter_list();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public parameter_list(): Parameter_listContext {
        let localContext = new Parameter_listContext(this.context, this.state);
        this.enterRule(localContext, 40, RclParser.RULE_parameter_list);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 244;
            this.parameter();
            this.state = 249;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 36) {
                {
                {
                this.state = 245;
                this.match(RclParser.COMMA);
                this.state = 246;
                this.parameter();
                }
                }
                this.state = 251;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public parameter(): ParameterContext {
        let localContext = new ParameterContext(this.context, this.state);
        this.enterRule(localContext, 42, RclParser.RULE_parameter);
        try {
            this.state = 258;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.ATTRIBUTE_NAME:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 252;
                this.match(RclParser.ATTRIBUTE_NAME);
                this.state = 253;
                this.value();
                }
                break;
            case RclParser.LOWER_NAME:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 254;
                this.match(RclParser.LOWER_NAME);
                this.state = 255;
                this.match(RclParser.COLON);
                this.state = 256;
                this.value();
                }
                break;
            case RclParser.BOOLEAN:
            case RclParser.NULL:
            case RclParser.NUMBER:
            case RclParser.ATOM:
            case RclParser.STRING:
            case RclParser.REGEX:
            case RclParser.TRIPLE_QUOTE:
            case RclParser.EMBEDDED_CODE:
            case RclParser.MULTI_LINE_CODE_START:
            case RclParser.MULTILINE_STR_CLEAN:
            case RclParser.MULTILINE_STR_TRIM:
            case RclParser.MULTILINE_STR_PRESERVE:
            case RclParser.MULTILINE_STR_PRESERVE_ALL:
            case RclParser.IDENTIFIER:
            case RclParser.VARIABLE:
            case RclParser.LPAREN:
            case RclParser.LBRACE:
            case RclParser.LANGLE:
            case RclParser.INDENT:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 257;
                this.value();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public value(): ValueContext {
        let localContext = new ValueContext(this.context, this.state);
        this.enterRule(localContext, 44, RclParser.RULE_value);
        try {
            this.state = 267;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.BOOLEAN:
            case RclParser.NULL:
            case RclParser.NUMBER:
            case RclParser.ATOM:
            case RclParser.STRING:
            case RclParser.REGEX:
            case RclParser.TRIPLE_QUOTE:
            case RclParser.LANGLE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 260;
                this.primitive_value();
                }
                break;
            case RclParser.IDENTIFIER:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 261;
                this.match(RclParser.IDENTIFIER);
                }
                break;
            case RclParser.VARIABLE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 262;
                this.variable_access();
                }
                break;
            case RclParser.LPAREN:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 263;
                this.parentheses_list();
                }
                break;
            case RclParser.LBRACE:
            case RclParser.INDENT:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 264;
                this.dictionary();
                }
                break;
            case RclParser.EMBEDDED_CODE:
            case RclParser.MULTI_LINE_CODE_START:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 265;
                this.embedded_code();
                }
                break;
            case RclParser.MULTILINE_STR_CLEAN:
            case RclParser.MULTILINE_STR_TRIM:
            case RclParser.MULTILINE_STR_PRESERVE:
            case RclParser.MULTILINE_STR_PRESERVE_ALL:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 266;
                this.multi_line_string();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public primitive_value(): Primitive_valueContext {
        let localContext = new Primitive_valueContext(this.context, this.state);
        this.enterRule(localContext, 46, RclParser.RULE_primitive_value);
        try {
            this.state = 277;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.STRING:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 269;
                this.match(RclParser.STRING);
                }
                break;
            case RclParser.TRIPLE_QUOTE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 270;
                this.triple_quote_string();
                }
                break;
            case RclParser.REGEX:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 271;
                this.match(RclParser.REGEX);
                }
                break;
            case RclParser.NUMBER:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 272;
                this.match(RclParser.NUMBER);
                }
                break;
            case RclParser.BOOLEAN:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 273;
                this.match(RclParser.BOOLEAN);
                }
                break;
            case RclParser.NULL:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 274;
                this.match(RclParser.NULL);
                }
                break;
            case RclParser.ATOM:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 275;
                this.match(RclParser.ATOM);
                }
                break;
            case RclParser.LANGLE:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 276;
                this.type_tag();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public triple_quote_string(): Triple_quote_stringContext {
        let localContext = new Triple_quote_stringContext(this.context, this.state);
        this.enterRule(localContext, 48, RclParser.RULE_triple_quote_string);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 279;
            this.match(RclParser.TRIPLE_QUOTE);
            this.state = 284;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 59 || _la === 60) {
                {
                this.state = 282;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case RclParser.TS_CONTENT:
                    {
                    this.state = 280;
                    this.match(RclParser.TS_CONTENT);
                    }
                    break;
                case RclParser.TS_INTERPOLATION_START:
                    {
                    this.state = 281;
                    this.interpolation();
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                this.state = 286;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 287;
            this.match(RclParser.TS_TRIPLE_QUOTE_END);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public triple_string_content(): Triple_string_contentContext {
        let localContext = new Triple_string_contentContext(this.context, this.state);
        this.enterRule(localContext, 50, RclParser.RULE_triple_string_content);
        try {
            this.state = 291;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.TS_CONTENT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 289;
                this.match(RclParser.TS_CONTENT);
                }
                break;
            case RclParser.TS_INTERPOLATION_START:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 290;
                this.interpolation();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public interpolation(): InterpolationContext {
        let localContext = new InterpolationContext(this.context, this.state);
        this.enterRule(localContext, 52, RclParser.RULE_interpolation);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 293;
            this.match(RclParser.TS_INTERPOLATION_START);
            this.state = 294;
            this.interpolation_expr();
            this.state = 295;
            this.match(RclParser.INT_RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public interpolation_expr(): Interpolation_exprContext {
        let localContext = new Interpolation_exprContext(this.context, this.state);
        this.enterRule(localContext, 54, RclParser.RULE_interpolation_expr);
        let _la: number;
        try {
            this.state = 306;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.INT_VARIABLE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 297;
                this.match(RclParser.INT_VARIABLE);
                this.state = 302;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 63) {
                    {
                    {
                    this.state = 298;
                    this.match(RclParser.INT_DOT);
                    this.state = 299;
                    this.match(RclParser.INT_LOWER_NAME);
                    }
                    }
                    this.state = 304;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
                break;
            case RclParser.BOOLEAN:
            case RclParser.NULL:
            case RclParser.NUMBER:
            case RclParser.ATOM:
            case RclParser.STRING:
            case RclParser.REGEX:
            case RclParser.TRIPLE_QUOTE:
            case RclParser.EMBEDDED_CODE:
            case RclParser.MULTI_LINE_CODE_START:
            case RclParser.MULTILINE_STR_CLEAN:
            case RclParser.MULTILINE_STR_TRIM:
            case RclParser.MULTILINE_STR_PRESERVE:
            case RclParser.MULTILINE_STR_PRESERVE_ALL:
            case RclParser.IDENTIFIER:
            case RclParser.VARIABLE:
            case RclParser.LPAREN:
            case RclParser.LBRACE:
            case RclParser.LANGLE:
            case RclParser.INDENT:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 305;
                this.value();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public variable_access(): Variable_accessContext {
        let localContext = new Variable_accessContext(this.context, this.state);
        this.enterRule(localContext, 56, RclParser.RULE_variable_access);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 308;
            this.match(RclParser.VARIABLE);
            this.state = 313;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 37) {
                {
                {
                this.state = 309;
                this.match(RclParser.DOT);
                this.state = 310;
                this.match(RclParser.LOWER_NAME);
                }
                }
                this.state = 315;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public type_tag(): Type_tagContext {
        let localContext = new Type_tagContext(this.context, this.state);
        this.enterRule(localContext, 58, RclParser.RULE_type_tag);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 316;
            this.match(RclParser.LANGLE);
            this.state = 317;
            this.match(RclParser.TT_TYPE_NAME);
            this.state = 319;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 55) {
                {
                this.state = 318;
                this.match(RclParser.TT_CONTENT);
                }
            }

            this.state = 323;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 56) {
                {
                this.state = 321;
                this.match(RclParser.TT_PIPE);
                this.state = 322;
                this.match(RclParser.TT_CONTENT);
                }
            }

            this.state = 325;
            this.match(RclParser.TT_RANGLE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public list(): ListContext {
        let localContext = new ListContext(this.context, this.state);
        this.enterRule(localContext, 60, RclParser.RULE_list);
        try {
            this.state = 329;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.LPAREN:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 327;
                this.parentheses_list();
                }
                break;
            case RclParser.INDENT:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 328;
                this.block_list();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public parentheses_list(): Parentheses_listContext {
        let localContext = new Parentheses_listContext(this.context, this.state);
        this.enterRule(localContext, 62, RclParser.RULE_parentheses_list);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 331;
            this.match(RclParser.LPAREN);
            this.state = 333;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4292280320) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & 262817) !== 0)) {
                {
                this.state = 332;
                this.list_elements();
                }
            }

            this.state = 335;
            this.match(RclParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public list_elements(): List_elementsContext {
        let localContext = new List_elementsContext(this.context, this.state);
        this.enterRule(localContext, 64, RclParser.RULE_list_elements);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 337;
            this.value();
            this.state = 342;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 36) {
                {
                {
                this.state = 338;
                this.match(RclParser.COMMA);
                this.state = 339;
                this.value();
                }
                }
                this.state = 344;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public block_list(): Block_listContext {
        let localContext = new Block_listContext(this.context, this.state);
        this.enterRule(localContext, 66, RclParser.RULE_block_list);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 345;
            this.match(RclParser.INDENT);
            this.state = 347;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 346;
                this.block_list_item();
                }
                }
                this.state = 349;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while (_la === 46);
            this.state = 351;
            this.match(RclParser.DEDENT);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public block_list_item(): Block_list_itemContext {
        let localContext = new Block_list_itemContext(this.context, this.state);
        this.enterRule(localContext, 68, RclParser.RULE_block_list_item);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 353;
            this.match(RclParser.HYPHEN);
            this.state = 354;
            this.value();
            this.state = 355;
            this.match(RclParser.NEWLINE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dictionary(): DictionaryContext {
        let localContext = new DictionaryContext(this.context, this.state);
        this.enterRule(localContext, 70, RclParser.RULE_dictionary);
        try {
            this.state = 359;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.LBRACE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 357;
                this.brace_dictionary();
                }
                break;
            case RclParser.INDENT:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 358;
                this.block_dictionary();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public brace_dictionary(): Brace_dictionaryContext {
        let localContext = new Brace_dictionaryContext(this.context, this.state);
        this.enterRule(localContext, 72, RclParser.RULE_brace_dictionary);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 361;
            this.match(RclParser.LBRACE);
            this.state = 370;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 22 || _la === 32) {
                {
                this.state = 362;
                this.dict_entry();
                this.state = 367;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 36) {
                    {
                    {
                    this.state = 363;
                    this.match(RclParser.COMMA);
                    this.state = 364;
                    this.dict_entry();
                    }
                    }
                    this.state = 369;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 372;
            this.match(RclParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public block_dictionary(): Block_dictionaryContext {
        let localContext = new Block_dictionaryContext(this.context, this.state);
        this.enterRule(localContext, 74, RclParser.RULE_block_dictionary);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 374;
            this.match(RclParser.INDENT);
            this.state = 376;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 375;
                this.dict_entry();
                }
                }
                this.state = 378;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while (_la === 22 || _la === 32);
            this.state = 380;
            this.match(RclParser.DEDENT);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dict_entry(): Dict_entryContext {
        let localContext = new Dict_entryContext(this.context, this.state);
        this.enterRule(localContext, 76, RclParser.RULE_dict_entry);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 382;
            _la = this.tokenStream.LA(1);
            if(!(_la === 22 || _la === 32)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 383;
            this.match(RclParser.COLON);
            this.state = 384;
            this.value();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public embedded_code(): Embedded_codeContext {
        let localContext = new Embedded_codeContext(this.context, this.state);
        this.enterRule(localContext, 78, RclParser.RULE_embedded_code);
        try {
            this.state = 388;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.EMBEDDED_CODE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 386;
                this.match(RclParser.EMBEDDED_CODE);
                }
                break;
            case RclParser.MULTI_LINE_CODE_START:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 387;
                this.multi_line_code();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public multi_line_code(): Multi_line_codeContext {
        let localContext = new Multi_line_codeContext(this.context, this.state);
        this.enterRule(localContext, 80, RclParser.RULE_multi_line_code);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 390;
            this.match(RclParser.MULTI_LINE_CODE_START);
            this.state = 394;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 67) {
                {
                {
                this.state = 391;
                this.match(RclParser.MC_CONTENT);
                }
                }
                this.state = 396;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 397;
            this.match(RclParser.MC_END);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public multi_line_string(): Multi_line_stringContext {
        let localContext = new Multi_line_stringContext(this.context, this.state);
        this.enterRule(localContext, 82, RclParser.RULE_multi_line_string);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 399;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 2013265920) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 403;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 69) {
                {
                {
                this.state = 400;
                this.multiline_content();
                }
                }
                this.state = 405;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 406;
            this.match(RclParser.ML_END);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public multiline_content(): Multiline_contentContext {
        let localContext = new Multiline_contentContext(this.context, this.state);
        this.enterRule(localContext, 84, RclParser.RULE_multiline_content);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 408;
            this.match(RclParser.ML_CONTENT);
            this.state = 410;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 70) {
                {
                this.state = 409;
                this.match(RclParser.ML_NEWLINE);
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public flow_invocation(): Flow_invocationContext {
        let localContext = new Flow_invocationContext(this.context, this.state);
        this.enterRule(localContext, 86, RclParser.RULE_flow_invocation);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 412;
            this.match(RclParser.START);
            this.state = 413;
            this.match(RclParser.IDENTIFIER);
            this.state = 416;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 3) {
                {
                this.state = 414;
                this.match(RclParser.WITH);
                this.state = 415;
                this.parameter_list();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public flow_result_handler(): Flow_result_handlerContext {
        let localContext = new Flow_result_handlerContext(this.context, this.state);
        this.enterRule(localContext, 88, RclParser.RULE_flow_result_handler);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 418;
            this.match(RclParser.ON);
            this.state = 419;
            this.flow_result();
            this.state = 420;
            this.match(RclParser.ARROW);
            this.state = 426;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 896) !== 0)) {
                {
                {
                this.state = 421;
                this.context_operation();
                this.state = 422;
                this.match(RclParser.ARROW);
                }
                }
                this.state = 428;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 429;
            this.target_reference();
            this.state = 430;
            this.match(RclParser.NEWLINE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public flow_result(): Flow_resultContext {
        let localContext = new Flow_resultContext(this.context, this.state);
        this.enterRule(localContext, 90, RclParser.RULE_flow_result);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 432;
            this.match(RclParser.COLON);
            this.state = 433;
            this.match(RclParser.LOWER_NAME);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public context_operation(): Context_operationContext {
        let localContext = new Context_operationContext(this.context, this.state);
        this.enterRule(localContext, 92, RclParser.RULE_context_operation);
        try {
            this.state = 456;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.APPEND:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 435;
                this.match(RclParser.APPEND);
                this.state = 438;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case RclParser.RESULT:
                    {
                    this.state = 436;
                    this.match(RclParser.RESULT);
                    }
                    break;
                case RclParser.BOOLEAN:
                case RclParser.NULL:
                case RclParser.NUMBER:
                case RclParser.ATOM:
                case RclParser.STRING:
                case RclParser.REGEX:
                case RclParser.TRIPLE_QUOTE:
                case RclParser.EMBEDDED_CODE:
                case RclParser.MULTI_LINE_CODE_START:
                case RclParser.MULTILINE_STR_CLEAN:
                case RclParser.MULTILINE_STR_TRIM:
                case RclParser.MULTILINE_STR_PRESERVE:
                case RclParser.MULTILINE_STR_PRESERVE_ALL:
                case RclParser.IDENTIFIER:
                case RclParser.VARIABLE:
                case RclParser.LPAREN:
                case RclParser.LBRACE:
                case RclParser.LANGLE:
                case RclParser.INDENT:
                    {
                    this.state = 437;
                    this.value();
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 440;
                this.match(RclParser.TO);
                this.state = 441;
                this.variable_access();
                }
                break;
            case RclParser.SET:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 442;
                this.match(RclParser.SET);
                this.state = 443;
                this.variable_access();
                this.state = 444;
                this.match(RclParser.TO);
                this.state = 447;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case RclParser.RESULT:
                    {
                    this.state = 445;
                    this.match(RclParser.RESULT);
                    }
                    break;
                case RclParser.BOOLEAN:
                case RclParser.NULL:
                case RclParser.NUMBER:
                case RclParser.ATOM:
                case RclParser.STRING:
                case RclParser.REGEX:
                case RclParser.TRIPLE_QUOTE:
                case RclParser.EMBEDDED_CODE:
                case RclParser.MULTI_LINE_CODE_START:
                case RclParser.MULTILINE_STR_CLEAN:
                case RclParser.MULTILINE_STR_TRIM:
                case RclParser.MULTILINE_STR_PRESERVE:
                case RclParser.MULTILINE_STR_PRESERVE_ALL:
                case RclParser.IDENTIFIER:
                case RclParser.VARIABLE:
                case RclParser.LPAREN:
                case RclParser.LBRACE:
                case RclParser.LANGLE:
                case RclParser.INDENT:
                    {
                    this.state = 446;
                    this.value();
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                break;
            case RclParser.MERGE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 449;
                this.match(RclParser.MERGE);
                this.state = 452;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case RclParser.RESULT:
                    {
                    this.state = 450;
                    this.match(RclParser.RESULT);
                    }
                    break;
                case RclParser.BOOLEAN:
                case RclParser.NULL:
                case RclParser.NUMBER:
                case RclParser.ATOM:
                case RclParser.STRING:
                case RclParser.REGEX:
                case RclParser.TRIPLE_QUOTE:
                case RclParser.EMBEDDED_CODE:
                case RclParser.MULTI_LINE_CODE_START:
                case RclParser.MULTILINE_STR_CLEAN:
                case RclParser.MULTILINE_STR_TRIM:
                case RclParser.MULTILINE_STR_PRESERVE:
                case RclParser.MULTILINE_STR_PRESERVE_ALL:
                case RclParser.IDENTIFIER:
                case RclParser.VARIABLE:
                case RclParser.LPAREN:
                case RclParser.LBRACE:
                case RclParser.LANGLE:
                case RclParser.INDENT:
                    {
                    this.state = 451;
                    this.value();
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 454;
                this.match(RclParser.INTO);
                this.state = 455;
                this.variable_access();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public target_reference(): Target_referenceContext {
        let localContext = new Target_referenceContext(this.context, this.state);
        this.enterRule(localContext, 94, RclParser.RULE_target_reference);
        try {
            this.state = 461;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.IDENTIFIER:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 458;
                this.match(RclParser.IDENTIFIER);
                }
                break;
            case RclParser.VARIABLE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 459;
                this.variable_access();
                }
                break;
            case RclParser.COLON:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 460;
                this.flow_termination();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public flow_termination(): Flow_terminationContext {
        let localContext = new Flow_terminationContext(this.context, this.state);
        this.enterRule(localContext, 96, RclParser.RULE_flow_termination);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 463;
            this.match(RclParser.COLON);
            this.state = 464;
            this.match(RclParser.LOWER_NAME);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public static readonly _serializedATN: number[] = [
        4,1,70,467,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,
        7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,26,
        2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,2,32,7,32,2,33,
        7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,39,7,39,
        2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,45,2,46,
        7,46,2,47,7,47,2,48,7,48,1,0,1,0,1,0,5,0,102,8,0,10,0,12,0,105,9,
        0,1,0,1,0,1,1,1,1,1,1,1,1,3,1,113,8,1,1,1,1,1,1,2,1,2,1,2,5,2,120,
        8,2,10,2,12,2,123,9,2,1,3,1,3,3,3,127,8,3,1,4,1,4,3,4,131,8,4,1,
        4,3,4,134,8,4,1,4,3,4,137,8,4,1,4,1,4,1,5,1,5,1,6,4,6,144,8,6,11,
        6,12,6,145,1,7,1,7,1,8,1,8,4,8,152,8,8,11,8,12,8,153,1,8,1,8,1,9,
        1,9,1,9,1,9,1,9,1,9,1,9,1,9,3,9,166,8,9,1,10,1,10,3,10,170,8,10,
        1,10,1,10,1,11,1,11,1,11,1,11,1,12,1,12,1,12,1,12,1,12,1,12,1,12,
        1,12,1,12,1,12,1,12,3,12,189,8,12,1,13,1,13,1,13,1,13,1,13,4,13,
        196,8,13,11,13,12,13,197,1,13,1,13,1,14,1,14,1,14,1,14,1,14,1,15,
        1,15,1,15,1,15,3,15,211,8,15,1,16,1,16,1,16,1,16,4,16,217,8,16,11,
        16,12,16,218,1,16,1,16,3,16,223,8,16,1,17,1,17,1,17,5,17,228,8,17,
        10,17,12,17,231,9,17,1,17,1,17,1,17,1,18,1,18,1,18,1,18,1,19,1,19,
        1,19,3,19,243,8,19,1,20,1,20,1,20,5,20,248,8,20,10,20,12,20,251,
        9,20,1,21,1,21,1,21,1,21,1,21,1,21,3,21,259,8,21,1,22,1,22,1,22,
        1,22,1,22,1,22,1,22,3,22,268,8,22,1,23,1,23,1,23,1,23,1,23,1,23,
        1,23,1,23,3,23,278,8,23,1,24,1,24,1,24,5,24,283,8,24,10,24,12,24,
        286,9,24,1,24,1,24,1,25,1,25,3,25,292,8,25,1,26,1,26,1,26,1,26,1,
        27,1,27,1,27,5,27,301,8,27,10,27,12,27,304,9,27,1,27,3,27,307,8,
        27,1,28,1,28,1,28,5,28,312,8,28,10,28,12,28,315,9,28,1,29,1,29,1,
        29,3,29,320,8,29,1,29,1,29,3,29,324,8,29,1,29,1,29,1,30,1,30,3,30,
        330,8,30,1,31,1,31,3,31,334,8,31,1,31,1,31,1,32,1,32,1,32,5,32,341,
        8,32,10,32,12,32,344,9,32,1,33,1,33,4,33,348,8,33,11,33,12,33,349,
        1,33,1,33,1,34,1,34,1,34,1,34,1,35,1,35,3,35,360,8,35,1,36,1,36,
        1,36,1,36,5,36,366,8,36,10,36,12,36,369,9,36,3,36,371,8,36,1,36,
        1,36,1,37,1,37,4,37,377,8,37,11,37,12,37,378,1,37,1,37,1,38,1,38,
        1,38,1,38,1,39,1,39,3,39,389,8,39,1,40,1,40,5,40,393,8,40,10,40,
        12,40,396,9,40,1,40,1,40,1,41,1,41,5,41,402,8,41,10,41,12,41,405,
        9,41,1,41,1,41,1,42,1,42,3,42,411,8,42,1,43,1,43,1,43,1,43,3,43,
        417,8,43,1,44,1,44,1,44,1,44,1,44,1,44,5,44,425,8,44,10,44,12,44,
        428,9,44,1,44,1,44,1,44,1,45,1,45,1,45,1,46,1,46,1,46,3,46,439,8,
        46,1,46,1,46,1,46,1,46,1,46,1,46,1,46,3,46,448,8,46,1,46,1,46,1,
        46,3,46,453,8,46,1,46,1,46,3,46,457,8,46,1,47,1,47,1,47,3,47,462,
        8,47,1,48,1,48,1,48,1,48,0,0,49,0,2,4,6,8,10,12,14,16,18,20,22,24,
        26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,68,
        70,72,74,76,78,80,82,84,86,88,90,92,94,96,0,4,2,0,6,6,32,32,2,0,
        18,18,20,23,2,0,22,22,32,32,1,0,27,30,491,0,103,1,0,0,0,2,108,1,
        0,0,0,4,116,1,0,0,0,6,124,1,0,0,0,8,128,1,0,0,0,10,140,1,0,0,0,12,
        143,1,0,0,0,14,147,1,0,0,0,16,149,1,0,0,0,18,165,1,0,0,0,20,169,
        1,0,0,0,22,173,1,0,0,0,24,188,1,0,0,0,26,190,1,0,0,0,28,201,1,0,
        0,0,30,210,1,0,0,0,32,212,1,0,0,0,34,224,1,0,0,0,36,235,1,0,0,0,
        38,239,1,0,0,0,40,244,1,0,0,0,42,258,1,0,0,0,44,267,1,0,0,0,46,277,
        1,0,0,0,48,279,1,0,0,0,50,291,1,0,0,0,52,293,1,0,0,0,54,306,1,0,
        0,0,56,308,1,0,0,0,58,316,1,0,0,0,60,329,1,0,0,0,62,331,1,0,0,0,
        64,337,1,0,0,0,66,345,1,0,0,0,68,353,1,0,0,0,70,359,1,0,0,0,72,361,
        1,0,0,0,74,374,1,0,0,0,76,382,1,0,0,0,78,388,1,0,0,0,80,390,1,0,
        0,0,82,399,1,0,0,0,84,408,1,0,0,0,86,412,1,0,0,0,88,418,1,0,0,0,
        90,432,1,0,0,0,92,456,1,0,0,0,94,461,1,0,0,0,96,463,1,0,0,0,98,102,
        3,2,1,0,99,102,3,6,3,0,100,102,5,50,0,0,101,98,1,0,0,0,101,99,1,
        0,0,0,101,100,1,0,0,0,102,105,1,0,0,0,103,101,1,0,0,0,103,104,1,
        0,0,0,104,106,1,0,0,0,105,103,1,0,0,0,106,107,5,0,0,1,107,1,1,0,
        0,0,108,109,5,1,0,0,109,112,3,4,2,0,110,111,5,2,0,0,111,113,5,31,
        0,0,112,110,1,0,0,0,112,113,1,0,0,0,113,114,1,0,0,0,114,115,5,50,
        0,0,115,3,1,0,0,0,116,121,5,31,0,0,117,118,5,45,0,0,118,120,5,31,
        0,0,119,117,1,0,0,0,120,123,1,0,0,0,121,119,1,0,0,0,121,122,1,0,
        0,0,122,5,1,0,0,0,123,121,1,0,0,0,124,126,3,8,4,0,125,127,3,16,8,
        0,126,125,1,0,0,0,126,127,1,0,0,0,127,7,1,0,0,0,128,130,3,10,5,0,
        129,131,5,31,0,0,130,129,1,0,0,0,130,131,1,0,0,0,131,133,1,0,0,0,
        132,134,3,12,6,0,133,132,1,0,0,0,133,134,1,0,0,0,134,136,1,0,0,0,
        135,137,3,40,20,0,136,135,1,0,0,0,136,137,1,0,0,0,137,138,1,0,0,
        0,138,139,5,50,0,0,139,9,1,0,0,0,140,141,7,0,0,0,141,11,1,0,0,0,
        142,144,3,44,22,0,143,142,1,0,0,0,144,145,1,0,0,0,145,143,1,0,0,
        0,145,146,1,0,0,0,146,13,1,0,0,0,147,148,5,31,0,0,148,15,1,0,0,0,
        149,151,5,51,0,0,150,152,3,18,9,0,151,150,1,0,0,0,152,153,1,0,0,
        0,153,151,1,0,0,0,153,154,1,0,0,0,154,155,1,0,0,0,155,156,5,52,0,
        0,156,17,1,0,0,0,157,166,3,22,11,0,158,166,3,24,12,0,159,166,3,6,
        3,0,160,166,3,26,13,0,161,166,3,36,18,0,162,166,3,86,43,0,163,166,
        3,20,10,0,164,166,5,50,0,0,165,157,1,0,0,0,165,158,1,0,0,0,165,159,
        1,0,0,0,165,160,1,0,0,0,165,161,1,0,0,0,165,162,1,0,0,0,165,163,
        1,0,0,0,165,164,1,0,0,0,166,19,1,0,0,0,167,170,5,31,0,0,168,170,
        3,56,28,0,169,167,1,0,0,0,169,168,1,0,0,0,170,171,1,0,0,0,171,172,
        5,50,0,0,172,21,1,0,0,0,173,174,5,47,0,0,174,175,5,31,0,0,175,176,
        5,50,0,0,176,23,1,0,0,0,177,178,5,19,0,0,178,179,3,44,22,0,179,180,
        5,50,0,0,180,189,1,0,0,0,181,182,5,19,0,0,182,183,5,36,0,0,183,184,
        3,44,22,0,184,185,5,50,0,0,185,189,1,0,0,0,186,187,5,19,0,0,187,
        189,5,50,0,0,188,177,1,0,0,0,188,181,1,0,0,0,188,186,1,0,0,0,189,
        25,1,0,0,0,190,191,5,4,0,0,191,192,3,44,22,0,192,193,5,50,0,0,193,
        195,5,51,0,0,194,196,3,28,14,0,195,194,1,0,0,0,196,197,1,0,0,0,197,
        195,1,0,0,0,197,198,1,0,0,0,198,199,1,0,0,0,199,200,5,52,0,0,200,
        27,1,0,0,0,201,202,7,1,0,0,202,203,5,34,0,0,203,204,3,30,15,0,204,
        205,5,50,0,0,205,29,1,0,0,0,206,211,3,38,19,0,207,211,3,96,48,0,
        208,211,3,32,16,0,209,211,3,34,17,0,210,206,1,0,0,0,210,207,1,0,
        0,0,210,208,1,0,0,0,210,209,1,0,0,0,211,31,1,0,0,0,212,222,3,86,
        43,0,213,214,5,50,0,0,214,216,5,51,0,0,215,217,3,88,44,0,216,215,
        1,0,0,0,217,218,1,0,0,0,218,216,1,0,0,0,218,219,1,0,0,0,219,220,
        1,0,0,0,220,221,5,52,0,0,221,223,1,0,0,0,222,213,1,0,0,0,222,223,
        1,0,0,0,223,33,1,0,0,0,224,229,3,92,46,0,225,226,5,34,0,0,226,228,
        3,92,46,0,227,225,1,0,0,0,228,231,1,0,0,0,229,227,1,0,0,0,229,230,
        1,0,0,0,230,232,1,0,0,0,231,229,1,0,0,0,232,233,5,34,0,0,233,234,
        3,94,47,0,234,35,1,0,0,0,235,236,5,34,0,0,236,237,3,30,15,0,237,
        238,5,50,0,0,238,37,1,0,0,0,239,242,3,44,22,0,240,241,5,3,0,0,241,
        243,3,40,20,0,242,240,1,0,0,0,242,243,1,0,0,0,243,39,1,0,0,0,244,
        249,3,42,21,0,245,246,5,36,0,0,246,248,3,42,21,0,247,245,1,0,0,0,
        248,251,1,0,0,0,249,247,1,0,0,0,249,250,1,0,0,0,250,41,1,0,0,0,251,
        249,1,0,0,0,252,253,5,19,0,0,253,259,3,44,22,0,254,255,5,32,0,0,
        255,256,5,35,0,0,256,259,3,44,22,0,257,259,3,44,22,0,258,252,1,0,
        0,0,258,254,1,0,0,0,258,257,1,0,0,0,259,43,1,0,0,0,260,268,3,46,
        23,0,261,268,5,31,0,0,262,268,3,56,28,0,263,268,3,62,31,0,264,268,
        3,70,35,0,265,268,3,78,39,0,266,268,3,82,41,0,267,260,1,0,0,0,267,
        261,1,0,0,0,267,262,1,0,0,0,267,263,1,0,0,0,267,264,1,0,0,0,267,
        265,1,0,0,0,267,266,1,0,0,0,268,45,1,0,0,0,269,278,5,22,0,0,270,
        278,3,48,24,0,271,278,5,23,0,0,272,278,5,18,0,0,273,278,5,16,0,0,
        274,278,5,17,0,0,275,278,5,20,0,0,276,278,3,58,29,0,277,269,1,0,
        0,0,277,270,1,0,0,0,277,271,1,0,0,0,277,272,1,0,0,0,277,273,1,0,
        0,0,277,274,1,0,0,0,277,275,1,0,0,0,277,276,1,0,0,0,278,47,1,0,0,
        0,279,284,5,24,0,0,280,283,5,60,0,0,281,283,3,52,26,0,282,280,1,
        0,0,0,282,281,1,0,0,0,283,286,1,0,0,0,284,282,1,0,0,0,284,285,1,
        0,0,0,285,287,1,0,0,0,286,284,1,0,0,0,287,288,5,58,0,0,288,49,1,
        0,0,0,289,292,5,60,0,0,290,292,3,52,26,0,291,289,1,0,0,0,291,290,
        1,0,0,0,292,51,1,0,0,0,293,294,5,59,0,0,294,295,3,54,27,0,295,296,
        5,61,0,0,296,53,1,0,0,0,297,302,5,62,0,0,298,299,5,63,0,0,299,301,
        5,64,0,0,300,298,1,0,0,0,301,304,1,0,0,0,302,300,1,0,0,0,302,303,
        1,0,0,0,303,307,1,0,0,0,304,302,1,0,0,0,305,307,3,44,22,0,306,297,
        1,0,0,0,306,305,1,0,0,0,307,55,1,0,0,0,308,313,5,33,0,0,309,310,
        5,37,0,0,310,312,5,32,0,0,311,309,1,0,0,0,312,315,1,0,0,0,313,311,
        1,0,0,0,313,314,1,0,0,0,314,57,1,0,0,0,315,313,1,0,0,0,316,317,5,
        42,0,0,317,319,5,53,0,0,318,320,5,55,0,0,319,318,1,0,0,0,319,320,
        1,0,0,0,320,323,1,0,0,0,321,322,5,56,0,0,322,324,5,55,0,0,323,321,
        1,0,0,0,323,324,1,0,0,0,324,325,1,0,0,0,325,326,5,57,0,0,326,59,
        1,0,0,0,327,330,3,62,31,0,328,330,3,66,33,0,329,327,1,0,0,0,329,
        328,1,0,0,0,330,61,1,0,0,0,331,333,5,38,0,0,332,334,3,64,32,0,333,
        332,1,0,0,0,333,334,1,0,0,0,334,335,1,0,0,0,335,336,5,39,0,0,336,
        63,1,0,0,0,337,342,3,44,22,0,338,339,5,36,0,0,339,341,3,44,22,0,
        340,338,1,0,0,0,341,344,1,0,0,0,342,340,1,0,0,0,342,343,1,0,0,0,
        343,65,1,0,0,0,344,342,1,0,0,0,345,347,5,51,0,0,346,348,3,68,34,
        0,347,346,1,0,0,0,348,349,1,0,0,0,349,347,1,0,0,0,349,350,1,0,0,
        0,350,351,1,0,0,0,351,352,5,52,0,0,352,67,1,0,0,0,353,354,5,46,0,
        0,354,355,3,44,22,0,355,356,5,50,0,0,356,69,1,0,0,0,357,360,3,72,
        36,0,358,360,3,74,37,0,359,357,1,0,0,0,359,358,1,0,0,0,360,71,1,
        0,0,0,361,370,5,40,0,0,362,367,3,76,38,0,363,364,5,36,0,0,364,366,
        3,76,38,0,365,363,1,0,0,0,366,369,1,0,0,0,367,365,1,0,0,0,367,368,
        1,0,0,0,368,371,1,0,0,0,369,367,1,0,0,0,370,362,1,0,0,0,370,371,
        1,0,0,0,371,372,1,0,0,0,372,373,5,41,0,0,373,73,1,0,0,0,374,376,
        5,51,0,0,375,377,3,76,38,0,376,375,1,0,0,0,377,378,1,0,0,0,378,376,
        1,0,0,0,378,379,1,0,0,0,379,380,1,0,0,0,380,381,5,52,0,0,381,75,
        1,0,0,0,382,383,7,2,0,0,383,384,5,35,0,0,384,385,3,44,22,0,385,77,
        1,0,0,0,386,389,5,25,0,0,387,389,3,80,40,0,388,386,1,0,0,0,388,387,
        1,0,0,0,389,79,1,0,0,0,390,394,5,26,0,0,391,393,5,67,0,0,392,391,
        1,0,0,0,393,396,1,0,0,0,394,392,1,0,0,0,394,395,1,0,0,0,395,397,
        1,0,0,0,396,394,1,0,0,0,397,398,5,66,0,0,398,81,1,0,0,0,399,403,
        7,3,0,0,400,402,3,84,42,0,401,400,1,0,0,0,402,405,1,0,0,0,403,401,
        1,0,0,0,403,404,1,0,0,0,404,406,1,0,0,0,405,403,1,0,0,0,406,407,
        5,68,0,0,407,83,1,0,0,0,408,410,5,69,0,0,409,411,5,70,0,0,410,409,
        1,0,0,0,410,411,1,0,0,0,411,85,1,0,0,0,412,413,5,5,0,0,413,416,5,
        31,0,0,414,415,5,3,0,0,415,417,3,40,20,0,416,414,1,0,0,0,416,417,
        1,0,0,0,417,87,1,0,0,0,418,419,5,6,0,0,419,420,3,90,45,0,420,426,
        5,34,0,0,421,422,3,92,46,0,422,423,5,34,0,0,423,425,1,0,0,0,424,
        421,1,0,0,0,425,428,1,0,0,0,426,424,1,0,0,0,426,427,1,0,0,0,427,
        429,1,0,0,0,428,426,1,0,0,0,429,430,3,94,47,0,430,431,5,50,0,0,431,
        89,1,0,0,0,432,433,5,35,0,0,433,434,5,32,0,0,434,91,1,0,0,0,435,
        438,5,7,0,0,436,439,5,12,0,0,437,439,3,44,22,0,438,436,1,0,0,0,438,
        437,1,0,0,0,439,440,1,0,0,0,440,441,5,10,0,0,441,457,3,56,28,0,442,
        443,5,8,0,0,443,444,3,56,28,0,444,447,5,10,0,0,445,448,5,12,0,0,
        446,448,3,44,22,0,447,445,1,0,0,0,447,446,1,0,0,0,448,457,1,0,0,
        0,449,452,5,9,0,0,450,453,5,12,0,0,451,453,3,44,22,0,452,450,1,0,
        0,0,452,451,1,0,0,0,453,454,1,0,0,0,454,455,5,11,0,0,455,457,3,56,
        28,0,456,435,1,0,0,0,456,442,1,0,0,0,456,449,1,0,0,0,457,93,1,0,
        0,0,458,462,5,31,0,0,459,462,3,56,28,0,460,462,3,96,48,0,461,458,
        1,0,0,0,461,459,1,0,0,0,461,460,1,0,0,0,462,95,1,0,0,0,463,464,5,
        35,0,0,464,465,5,32,0,0,465,97,1,0,0,0,50,101,103,112,121,126,130,
        133,136,145,153,165,169,188,197,210,218,222,229,242,249,258,267,
        277,282,284,291,302,306,313,319,323,329,333,342,349,359,367,370,
        378,388,394,403,410,416,426,438,447,452,456,461
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!RclParser.__ATN) {
            RclParser.__ATN = new antlr.ATNDeserializer().deserialize(RclParser._serializedATN);
        }

        return RclParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(RclParser.literalNames, RclParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return RclParser.vocabulary;
    }

    private static readonly decisionsToDFA = RclParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class Rcl_fileContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(RclParser.EOF, 0)!;
    }
    public import_statement(): Import_statementContext[];
    public import_statement(i: number): Import_statementContext | null;
    public import_statement(i?: number): Import_statementContext[] | Import_statementContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Import_statementContext);
        }

        return this.getRuleContext(i, Import_statementContext);
    }
    public section(): SectionContext[];
    public section(i: number): SectionContext | null;
    public section(i?: number): SectionContext[] | SectionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SectionContext);
        }

        return this.getRuleContext(i, SectionContext);
    }
    public NEWLINE(): antlr.TerminalNode[];
    public NEWLINE(i: number): antlr.TerminalNode | null;
    public NEWLINE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.NEWLINE);
    	} else {
    		return this.getToken(RclParser.NEWLINE, i);
    	}
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_rcl_file;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterRcl_file) {
             listener.enterRcl_file(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitRcl_file) {
             listener.exitRcl_file(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitRcl_file) {
            return visitor.visitRcl_file(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Import_statementContext extends antlr.ParserRuleContext {
    public _alias?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IMPORT(): antlr.TerminalNode {
        return this.getToken(RclParser.IMPORT, 0)!;
    }
    public import_path(): Import_pathContext {
        return this.getRuleContext(0, Import_pathContext)!;
    }
    public NEWLINE(): antlr.TerminalNode {
        return this.getToken(RclParser.NEWLINE, 0)!;
    }
    public AS(): antlr.TerminalNode | null {
        return this.getToken(RclParser.AS, 0);
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(RclParser.IDENTIFIER, 0);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_import_statement;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterImport_statement) {
             listener.enterImport_statement(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitImport_statement) {
             listener.exitImport_statement(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitImport_statement) {
            return visitor.visitImport_statement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Import_pathContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode[];
    public IDENTIFIER(i: number): antlr.TerminalNode | null;
    public IDENTIFIER(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.IDENTIFIER);
    	} else {
    		return this.getToken(RclParser.IDENTIFIER, i);
    	}
    }
    public SLASH(): antlr.TerminalNode[];
    public SLASH(i: number): antlr.TerminalNode | null;
    public SLASH(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.SLASH);
    	} else {
    		return this.getToken(RclParser.SLASH, i);
    	}
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_import_path;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterImport_path) {
             listener.enterImport_path(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitImport_path) {
             listener.exitImport_path(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitImport_path) {
            return visitor.visitImport_path(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SectionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public section_header(): Section_headerContext {
        return this.getRuleContext(0, Section_headerContext)!;
    }
    public section_body(): Section_bodyContext | null {
        return this.getRuleContext(0, Section_bodyContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_section;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterSection) {
             listener.enterSection(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitSection) {
             listener.exitSection(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitSection) {
            return visitor.visitSection(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Section_headerContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public section_type(): Section_typeContext {
        return this.getRuleContext(0, Section_typeContext)!;
    }
    public NEWLINE(): antlr.TerminalNode {
        return this.getToken(RclParser.NEWLINE, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(RclParser.IDENTIFIER, 0);
    }
    public header_values(): Header_valuesContext | null {
        return this.getRuleContext(0, Header_valuesContext);
    }
    public parameter_list(): Parameter_listContext | null {
        return this.getRuleContext(0, Parameter_listContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_section_header;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterSection_header) {
             listener.enterSection_header(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitSection_header) {
             listener.exitSection_header(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitSection_header) {
            return visitor.visitSection_header(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Section_typeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LOWER_NAME(): antlr.TerminalNode | null {
        return this.getToken(RclParser.LOWER_NAME, 0);
    }
    public ON(): antlr.TerminalNode | null {
        return this.getToken(RclParser.ON, 0);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_section_type;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterSection_type) {
             listener.enterSection_type(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitSection_type) {
             listener.exitSection_type(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitSection_type) {
            return visitor.visitSection_type(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Header_valuesContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public value(): ValueContext[];
    public value(i: number): ValueContext | null;
    public value(i?: number): ValueContext[] | ValueContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ValueContext);
        }

        return this.getRuleContext(i, ValueContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_header_values;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterHeader_values) {
             listener.enterHeader_values(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitHeader_values) {
             listener.exitHeader_values(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitHeader_values) {
            return visitor.visitHeader_values(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class IdentifierContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(RclParser.IDENTIFIER, 0)!;
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_identifier;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterIdentifier) {
             listener.enterIdentifier(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitIdentifier) {
             listener.exitIdentifier(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitIdentifier) {
            return visitor.visitIdentifier(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Section_bodyContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public INDENT(): antlr.TerminalNode {
        return this.getToken(RclParser.INDENT, 0)!;
    }
    public DEDENT(): antlr.TerminalNode {
        return this.getToken(RclParser.DEDENT, 0)!;
    }
    public section_content(): Section_contentContext[];
    public section_content(i: number): Section_contentContext | null;
    public section_content(i?: number): Section_contentContext[] | Section_contentContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Section_contentContext);
        }

        return this.getRuleContext(i, Section_contentContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_section_body;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterSection_body) {
             listener.enterSection_body(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitSection_body) {
             listener.exitSection_body(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitSection_body) {
            return visitor.visitSection_body(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Section_contentContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public spread_directive(): Spread_directiveContext | null {
        return this.getRuleContext(0, Spread_directiveContext);
    }
    public attribute_assignment(): Attribute_assignmentContext | null {
        return this.getRuleContext(0, Attribute_assignmentContext);
    }
    public section(): SectionContext | null {
        return this.getRuleContext(0, SectionContext);
    }
    public match_block(): Match_blockContext | null {
        return this.getRuleContext(0, Match_blockContext);
    }
    public simple_transition(): Simple_transitionContext | null {
        return this.getRuleContext(0, Simple_transitionContext);
    }
    public flow_invocation(): Flow_invocationContext | null {
        return this.getRuleContext(0, Flow_invocationContext);
    }
    public state_reference(): State_referenceContext | null {
        return this.getRuleContext(0, State_referenceContext);
    }
    public NEWLINE(): antlr.TerminalNode | null {
        return this.getToken(RclParser.NEWLINE, 0);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_section_content;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterSection_content) {
             listener.enterSection_content(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitSection_content) {
             listener.exitSection_content(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitSection_content) {
            return visitor.visitSection_content(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class State_referenceContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public NEWLINE(): antlr.TerminalNode {
        return this.getToken(RclParser.NEWLINE, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(RclParser.IDENTIFIER, 0);
    }
    public variable_access(): Variable_accessContext | null {
        return this.getRuleContext(0, Variable_accessContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_state_reference;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterState_reference) {
             listener.enterState_reference(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitState_reference) {
             listener.exitState_reference(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitState_reference) {
            return visitor.visitState_reference(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Spread_directiveContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SPREAD(): antlr.TerminalNode {
        return this.getToken(RclParser.SPREAD, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(RclParser.IDENTIFIER, 0)!;
    }
    public NEWLINE(): antlr.TerminalNode {
        return this.getToken(RclParser.NEWLINE, 0)!;
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_spread_directive;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterSpread_directive) {
             listener.enterSpread_directive(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitSpread_directive) {
             listener.exitSpread_directive(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitSpread_directive) {
            return visitor.visitSpread_directive(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Attribute_assignmentContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ATTRIBUTE_NAME(): antlr.TerminalNode {
        return this.getToken(RclParser.ATTRIBUTE_NAME, 0)!;
    }
    public value(): ValueContext | null {
        return this.getRuleContext(0, ValueContext);
    }
    public NEWLINE(): antlr.TerminalNode {
        return this.getToken(RclParser.NEWLINE, 0)!;
    }
    public COMMA(): antlr.TerminalNode | null {
        return this.getToken(RclParser.COMMA, 0);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_attribute_assignment;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterAttribute_assignment) {
             listener.enterAttribute_assignment(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitAttribute_assignment) {
             listener.exitAttribute_assignment(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitAttribute_assignment) {
            return visitor.visitAttribute_assignment(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Match_blockContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public MATCH(): antlr.TerminalNode {
        return this.getToken(RclParser.MATCH, 0)!;
    }
    public value(): ValueContext {
        return this.getRuleContext(0, ValueContext)!;
    }
    public NEWLINE(): antlr.TerminalNode {
        return this.getToken(RclParser.NEWLINE, 0)!;
    }
    public INDENT(): antlr.TerminalNode {
        return this.getToken(RclParser.INDENT, 0)!;
    }
    public DEDENT(): antlr.TerminalNode {
        return this.getToken(RclParser.DEDENT, 0)!;
    }
    public match_case(): Match_caseContext[];
    public match_case(i: number): Match_caseContext | null;
    public match_case(i?: number): Match_caseContext[] | Match_caseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Match_caseContext);
        }

        return this.getRuleContext(i, Match_caseContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_match_block;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterMatch_block) {
             listener.enterMatch_block(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitMatch_block) {
             listener.exitMatch_block(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitMatch_block) {
            return visitor.visitMatch_block(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Match_caseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ARROW(): antlr.TerminalNode {
        return this.getToken(RclParser.ARROW, 0)!;
    }
    public transition_target(): Transition_targetContext {
        return this.getRuleContext(0, Transition_targetContext)!;
    }
    public NEWLINE(): antlr.TerminalNode {
        return this.getToken(RclParser.NEWLINE, 0)!;
    }
    public STRING(): antlr.TerminalNode | null {
        return this.getToken(RclParser.STRING, 0);
    }
    public NUMBER(): antlr.TerminalNode | null {
        return this.getToken(RclParser.NUMBER, 0);
    }
    public ATOM(): antlr.TerminalNode | null {
        return this.getToken(RclParser.ATOM, 0);
    }
    public REGEX(): antlr.TerminalNode | null {
        return this.getToken(RclParser.REGEX, 0);
    }
    public DEFAULT_CASE(): antlr.TerminalNode | null {
        return this.getToken(RclParser.DEFAULT_CASE, 0);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_match_case;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterMatch_case) {
             listener.enterMatch_case(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitMatch_case) {
             listener.exitMatch_case(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitMatch_case) {
            return visitor.visitMatch_case(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Transition_targetContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public contextualized_value(): Contextualized_valueContext | null {
        return this.getRuleContext(0, Contextualized_valueContext);
    }
    public flow_termination(): Flow_terminationContext | null {
        return this.getRuleContext(0, Flow_terminationContext);
    }
    public flow_invocation_with_handlers(): Flow_invocation_with_handlersContext | null {
        return this.getRuleContext(0, Flow_invocation_with_handlersContext);
    }
    public context_operation_sequence(): Context_operation_sequenceContext | null {
        return this.getRuleContext(0, Context_operation_sequenceContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_transition_target;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterTransition_target) {
             listener.enterTransition_target(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitTransition_target) {
             listener.exitTransition_target(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitTransition_target) {
            return visitor.visitTransition_target(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Flow_invocation_with_handlersContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public flow_invocation(): Flow_invocationContext {
        return this.getRuleContext(0, Flow_invocationContext)!;
    }
    public NEWLINE(): antlr.TerminalNode | null {
        return this.getToken(RclParser.NEWLINE, 0);
    }
    public INDENT(): antlr.TerminalNode | null {
        return this.getToken(RclParser.INDENT, 0);
    }
    public DEDENT(): antlr.TerminalNode | null {
        return this.getToken(RclParser.DEDENT, 0);
    }
    public flow_result_handler(): Flow_result_handlerContext[];
    public flow_result_handler(i: number): Flow_result_handlerContext | null;
    public flow_result_handler(i?: number): Flow_result_handlerContext[] | Flow_result_handlerContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Flow_result_handlerContext);
        }

        return this.getRuleContext(i, Flow_result_handlerContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_flow_invocation_with_handlers;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterFlow_invocation_with_handlers) {
             listener.enterFlow_invocation_with_handlers(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitFlow_invocation_with_handlers) {
             listener.exitFlow_invocation_with_handlers(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitFlow_invocation_with_handlers) {
            return visitor.visitFlow_invocation_with_handlers(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Context_operation_sequenceContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public context_operation(): Context_operationContext[];
    public context_operation(i: number): Context_operationContext | null;
    public context_operation(i?: number): Context_operationContext[] | Context_operationContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Context_operationContext);
        }

        return this.getRuleContext(i, Context_operationContext);
    }
    public ARROW(): antlr.TerminalNode[];
    public ARROW(i: number): antlr.TerminalNode | null;
    public ARROW(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.ARROW);
    	} else {
    		return this.getToken(RclParser.ARROW, i);
    	}
    }
    public target_reference(): Target_referenceContext {
        return this.getRuleContext(0, Target_referenceContext)!;
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_context_operation_sequence;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterContext_operation_sequence) {
             listener.enterContext_operation_sequence(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitContext_operation_sequence) {
             listener.exitContext_operation_sequence(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitContext_operation_sequence) {
            return visitor.visitContext_operation_sequence(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Simple_transitionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ARROW(): antlr.TerminalNode {
        return this.getToken(RclParser.ARROW, 0)!;
    }
    public transition_target(): Transition_targetContext {
        return this.getRuleContext(0, Transition_targetContext)!;
    }
    public NEWLINE(): antlr.TerminalNode {
        return this.getToken(RclParser.NEWLINE, 0)!;
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_simple_transition;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterSimple_transition) {
             listener.enterSimple_transition(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitSimple_transition) {
             listener.exitSimple_transition(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitSimple_transition) {
            return visitor.visitSimple_transition(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Contextualized_valueContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public value(): ValueContext {
        return this.getRuleContext(0, ValueContext)!;
    }
    public WITH(): antlr.TerminalNode | null {
        return this.getToken(RclParser.WITH, 0);
    }
    public parameter_list(): Parameter_listContext | null {
        return this.getRuleContext(0, Parameter_listContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_contextualized_value;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterContextualized_value) {
             listener.enterContextualized_value(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitContextualized_value) {
             listener.exitContextualized_value(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitContextualized_value) {
            return visitor.visitContextualized_value(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Parameter_listContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public parameter(): ParameterContext[];
    public parameter(i: number): ParameterContext | null;
    public parameter(i?: number): ParameterContext[] | ParameterContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ParameterContext);
        }

        return this.getRuleContext(i, ParameterContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.COMMA);
    	} else {
    		return this.getToken(RclParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_parameter_list;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterParameter_list) {
             listener.enterParameter_list(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitParameter_list) {
             listener.exitParameter_list(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitParameter_list) {
            return visitor.visitParameter_list(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ParameterContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ATTRIBUTE_NAME(): antlr.TerminalNode | null {
        return this.getToken(RclParser.ATTRIBUTE_NAME, 0);
    }
    public value(): ValueContext {
        return this.getRuleContext(0, ValueContext)!;
    }
    public LOWER_NAME(): antlr.TerminalNode | null {
        return this.getToken(RclParser.LOWER_NAME, 0);
    }
    public COLON(): antlr.TerminalNode | null {
        return this.getToken(RclParser.COLON, 0);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_parameter;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterParameter) {
             listener.enterParameter(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitParameter) {
             listener.exitParameter(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitParameter) {
            return visitor.visitParameter(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ValueContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public primitive_value(): Primitive_valueContext | null {
        return this.getRuleContext(0, Primitive_valueContext);
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(RclParser.IDENTIFIER, 0);
    }
    public variable_access(): Variable_accessContext | null {
        return this.getRuleContext(0, Variable_accessContext);
    }
    public parentheses_list(): Parentheses_listContext | null {
        return this.getRuleContext(0, Parentheses_listContext);
    }
    public dictionary(): DictionaryContext | null {
        return this.getRuleContext(0, DictionaryContext);
    }
    public embedded_code(): Embedded_codeContext | null {
        return this.getRuleContext(0, Embedded_codeContext);
    }
    public multi_line_string(): Multi_line_stringContext | null {
        return this.getRuleContext(0, Multi_line_stringContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_value;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterValue) {
             listener.enterValue(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitValue) {
             listener.exitValue(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitValue) {
            return visitor.visitValue(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Primitive_valueContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public STRING(): antlr.TerminalNode | null {
        return this.getToken(RclParser.STRING, 0);
    }
    public triple_quote_string(): Triple_quote_stringContext | null {
        return this.getRuleContext(0, Triple_quote_stringContext);
    }
    public REGEX(): antlr.TerminalNode | null {
        return this.getToken(RclParser.REGEX, 0);
    }
    public NUMBER(): antlr.TerminalNode | null {
        return this.getToken(RclParser.NUMBER, 0);
    }
    public BOOLEAN(): antlr.TerminalNode | null {
        return this.getToken(RclParser.BOOLEAN, 0);
    }
    public NULL(): antlr.TerminalNode | null {
        return this.getToken(RclParser.NULL, 0);
    }
    public ATOM(): antlr.TerminalNode | null {
        return this.getToken(RclParser.ATOM, 0);
    }
    public type_tag(): Type_tagContext | null {
        return this.getRuleContext(0, Type_tagContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_primitive_value;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterPrimitive_value) {
             listener.enterPrimitive_value(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitPrimitive_value) {
             listener.exitPrimitive_value(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitPrimitive_value) {
            return visitor.visitPrimitive_value(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Triple_quote_stringContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TRIPLE_QUOTE(): antlr.TerminalNode {
        return this.getToken(RclParser.TRIPLE_QUOTE, 0)!;
    }
    public TS_TRIPLE_QUOTE_END(): antlr.TerminalNode {
        return this.getToken(RclParser.TS_TRIPLE_QUOTE_END, 0)!;
    }
    public TS_CONTENT(): antlr.TerminalNode[];
    public TS_CONTENT(i: number): antlr.TerminalNode | null;
    public TS_CONTENT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.TS_CONTENT);
    	} else {
    		return this.getToken(RclParser.TS_CONTENT, i);
    	}
    }
    public interpolation(): InterpolationContext[];
    public interpolation(i: number): InterpolationContext | null;
    public interpolation(i?: number): InterpolationContext[] | InterpolationContext | null {
        if (i === undefined) {
            return this.getRuleContexts(InterpolationContext);
        }

        return this.getRuleContext(i, InterpolationContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_triple_quote_string;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterTriple_quote_string) {
             listener.enterTriple_quote_string(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitTriple_quote_string) {
             listener.exitTriple_quote_string(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitTriple_quote_string) {
            return visitor.visitTriple_quote_string(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Triple_string_contentContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TS_CONTENT(): antlr.TerminalNode | null {
        return this.getToken(RclParser.TS_CONTENT, 0);
    }
    public interpolation(): InterpolationContext | null {
        return this.getRuleContext(0, InterpolationContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_triple_string_content;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterTriple_string_content) {
             listener.enterTriple_string_content(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitTriple_string_content) {
             listener.exitTriple_string_content(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitTriple_string_content) {
            return visitor.visitTriple_string_content(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class InterpolationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TS_INTERPOLATION_START(): antlr.TerminalNode {
        return this.getToken(RclParser.TS_INTERPOLATION_START, 0)!;
    }
    public interpolation_expr(): Interpolation_exprContext {
        return this.getRuleContext(0, Interpolation_exprContext)!;
    }
    public INT_RBRACE(): antlr.TerminalNode {
        return this.getToken(RclParser.INT_RBRACE, 0)!;
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_interpolation;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterInterpolation) {
             listener.enterInterpolation(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitInterpolation) {
             listener.exitInterpolation(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitInterpolation) {
            return visitor.visitInterpolation(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Interpolation_exprContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public INT_VARIABLE(): antlr.TerminalNode | null {
        return this.getToken(RclParser.INT_VARIABLE, 0);
    }
    public INT_DOT(): antlr.TerminalNode[];
    public INT_DOT(i: number): antlr.TerminalNode | null;
    public INT_DOT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.INT_DOT);
    	} else {
    		return this.getToken(RclParser.INT_DOT, i);
    	}
    }
    public INT_LOWER_NAME(): antlr.TerminalNode[];
    public INT_LOWER_NAME(i: number): antlr.TerminalNode | null;
    public INT_LOWER_NAME(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.INT_LOWER_NAME);
    	} else {
    		return this.getToken(RclParser.INT_LOWER_NAME, i);
    	}
    }
    public value(): ValueContext | null {
        return this.getRuleContext(0, ValueContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_interpolation_expr;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterInterpolation_expr) {
             listener.enterInterpolation_expr(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitInterpolation_expr) {
             listener.exitInterpolation_expr(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitInterpolation_expr) {
            return visitor.visitInterpolation_expr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Variable_accessContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public VARIABLE(): antlr.TerminalNode {
        return this.getToken(RclParser.VARIABLE, 0)!;
    }
    public DOT(): antlr.TerminalNode[];
    public DOT(i: number): antlr.TerminalNode | null;
    public DOT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.DOT);
    	} else {
    		return this.getToken(RclParser.DOT, i);
    	}
    }
    public LOWER_NAME(): antlr.TerminalNode[];
    public LOWER_NAME(i: number): antlr.TerminalNode | null;
    public LOWER_NAME(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.LOWER_NAME);
    	} else {
    		return this.getToken(RclParser.LOWER_NAME, i);
    	}
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_variable_access;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterVariable_access) {
             listener.enterVariable_access(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitVariable_access) {
             listener.exitVariable_access(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitVariable_access) {
            return visitor.visitVariable_access(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Type_tagContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LANGLE(): antlr.TerminalNode {
        return this.getToken(RclParser.LANGLE, 0)!;
    }
    public TT_TYPE_NAME(): antlr.TerminalNode {
        return this.getToken(RclParser.TT_TYPE_NAME, 0)!;
    }
    public TT_RANGLE(): antlr.TerminalNode {
        return this.getToken(RclParser.TT_RANGLE, 0)!;
    }
    public TT_CONTENT(): antlr.TerminalNode[];
    public TT_CONTENT(i: number): antlr.TerminalNode | null;
    public TT_CONTENT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.TT_CONTENT);
    	} else {
    		return this.getToken(RclParser.TT_CONTENT, i);
    	}
    }
    public TT_PIPE(): antlr.TerminalNode | null {
        return this.getToken(RclParser.TT_PIPE, 0);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_type_tag;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterType_tag) {
             listener.enterType_tag(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitType_tag) {
             listener.exitType_tag(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitType_tag) {
            return visitor.visitType_tag(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public parentheses_list(): Parentheses_listContext | null {
        return this.getRuleContext(0, Parentheses_listContext);
    }
    public block_list(): Block_listContext | null {
        return this.getRuleContext(0, Block_listContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_list;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterList) {
             listener.enterList(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitList) {
             listener.exitList(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitList) {
            return visitor.visitList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Parentheses_listContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(RclParser.LPAREN, 0)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(RclParser.RPAREN, 0)!;
    }
    public list_elements(): List_elementsContext | null {
        return this.getRuleContext(0, List_elementsContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_parentheses_list;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterParentheses_list) {
             listener.enterParentheses_list(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitParentheses_list) {
             listener.exitParentheses_list(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitParentheses_list) {
            return visitor.visitParentheses_list(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class List_elementsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public value(): ValueContext[];
    public value(i: number): ValueContext | null;
    public value(i?: number): ValueContext[] | ValueContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ValueContext);
        }

        return this.getRuleContext(i, ValueContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.COMMA);
    	} else {
    		return this.getToken(RclParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_list_elements;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterList_elements) {
             listener.enterList_elements(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitList_elements) {
             listener.exitList_elements(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitList_elements) {
            return visitor.visitList_elements(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Block_listContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public INDENT(): antlr.TerminalNode {
        return this.getToken(RclParser.INDENT, 0)!;
    }
    public DEDENT(): antlr.TerminalNode {
        return this.getToken(RclParser.DEDENT, 0)!;
    }
    public block_list_item(): Block_list_itemContext[];
    public block_list_item(i: number): Block_list_itemContext | null;
    public block_list_item(i?: number): Block_list_itemContext[] | Block_list_itemContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Block_list_itemContext);
        }

        return this.getRuleContext(i, Block_list_itemContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_block_list;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterBlock_list) {
             listener.enterBlock_list(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitBlock_list) {
             listener.exitBlock_list(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitBlock_list) {
            return visitor.visitBlock_list(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Block_list_itemContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public HYPHEN(): antlr.TerminalNode {
        return this.getToken(RclParser.HYPHEN, 0)!;
    }
    public value(): ValueContext {
        return this.getRuleContext(0, ValueContext)!;
    }
    public NEWLINE(): antlr.TerminalNode {
        return this.getToken(RclParser.NEWLINE, 0)!;
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_block_list_item;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterBlock_list_item) {
             listener.enterBlock_list_item(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitBlock_list_item) {
             listener.exitBlock_list_item(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitBlock_list_item) {
            return visitor.visitBlock_list_item(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class DictionaryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public brace_dictionary(): Brace_dictionaryContext | null {
        return this.getRuleContext(0, Brace_dictionaryContext);
    }
    public block_dictionary(): Block_dictionaryContext | null {
        return this.getRuleContext(0, Block_dictionaryContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_dictionary;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterDictionary) {
             listener.enterDictionary(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitDictionary) {
             listener.exitDictionary(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitDictionary) {
            return visitor.visitDictionary(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Brace_dictionaryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(RclParser.LBRACE, 0)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(RclParser.RBRACE, 0)!;
    }
    public dict_entry(): Dict_entryContext[];
    public dict_entry(i: number): Dict_entryContext | null;
    public dict_entry(i?: number): Dict_entryContext[] | Dict_entryContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Dict_entryContext);
        }

        return this.getRuleContext(i, Dict_entryContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.COMMA);
    	} else {
    		return this.getToken(RclParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_brace_dictionary;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterBrace_dictionary) {
             listener.enterBrace_dictionary(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitBrace_dictionary) {
             listener.exitBrace_dictionary(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitBrace_dictionary) {
            return visitor.visitBrace_dictionary(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Block_dictionaryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public INDENT(): antlr.TerminalNode {
        return this.getToken(RclParser.INDENT, 0)!;
    }
    public DEDENT(): antlr.TerminalNode {
        return this.getToken(RclParser.DEDENT, 0)!;
    }
    public dict_entry(): Dict_entryContext[];
    public dict_entry(i: number): Dict_entryContext | null;
    public dict_entry(i?: number): Dict_entryContext[] | Dict_entryContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Dict_entryContext);
        }

        return this.getRuleContext(i, Dict_entryContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_block_dictionary;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterBlock_dictionary) {
             listener.enterBlock_dictionary(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitBlock_dictionary) {
             listener.exitBlock_dictionary(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitBlock_dictionary) {
            return visitor.visitBlock_dictionary(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Dict_entryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public COLON(): antlr.TerminalNode {
        return this.getToken(RclParser.COLON, 0)!;
    }
    public value(): ValueContext {
        return this.getRuleContext(0, ValueContext)!;
    }
    public LOWER_NAME(): antlr.TerminalNode | null {
        return this.getToken(RclParser.LOWER_NAME, 0);
    }
    public STRING(): antlr.TerminalNode | null {
        return this.getToken(RclParser.STRING, 0);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_dict_entry;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterDict_entry) {
             listener.enterDict_entry(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitDict_entry) {
             listener.exitDict_entry(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitDict_entry) {
            return visitor.visitDict_entry(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Embedded_codeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public EMBEDDED_CODE(): antlr.TerminalNode | null {
        return this.getToken(RclParser.EMBEDDED_CODE, 0);
    }
    public multi_line_code(): Multi_line_codeContext | null {
        return this.getRuleContext(0, Multi_line_codeContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_embedded_code;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterEmbedded_code) {
             listener.enterEmbedded_code(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitEmbedded_code) {
             listener.exitEmbedded_code(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitEmbedded_code) {
            return visitor.visitEmbedded_code(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Multi_line_codeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public MULTI_LINE_CODE_START(): antlr.TerminalNode {
        return this.getToken(RclParser.MULTI_LINE_CODE_START, 0)!;
    }
    public MC_END(): antlr.TerminalNode {
        return this.getToken(RclParser.MC_END, 0)!;
    }
    public MC_CONTENT(): antlr.TerminalNode[];
    public MC_CONTENT(i: number): antlr.TerminalNode | null;
    public MC_CONTENT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.MC_CONTENT);
    	} else {
    		return this.getToken(RclParser.MC_CONTENT, i);
    	}
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_multi_line_code;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterMulti_line_code) {
             listener.enterMulti_line_code(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitMulti_line_code) {
             listener.exitMulti_line_code(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitMulti_line_code) {
            return visitor.visitMulti_line_code(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Multi_line_stringContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ML_END(): antlr.TerminalNode {
        return this.getToken(RclParser.ML_END, 0)!;
    }
    public MULTILINE_STR_CLEAN(): antlr.TerminalNode | null {
        return this.getToken(RclParser.MULTILINE_STR_CLEAN, 0);
    }
    public MULTILINE_STR_TRIM(): antlr.TerminalNode | null {
        return this.getToken(RclParser.MULTILINE_STR_TRIM, 0);
    }
    public MULTILINE_STR_PRESERVE(): antlr.TerminalNode | null {
        return this.getToken(RclParser.MULTILINE_STR_PRESERVE, 0);
    }
    public MULTILINE_STR_PRESERVE_ALL(): antlr.TerminalNode | null {
        return this.getToken(RclParser.MULTILINE_STR_PRESERVE_ALL, 0);
    }
    public multiline_content(): Multiline_contentContext[];
    public multiline_content(i: number): Multiline_contentContext | null;
    public multiline_content(i?: number): Multiline_contentContext[] | Multiline_contentContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Multiline_contentContext);
        }

        return this.getRuleContext(i, Multiline_contentContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_multi_line_string;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterMulti_line_string) {
             listener.enterMulti_line_string(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitMulti_line_string) {
             listener.exitMulti_line_string(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitMulti_line_string) {
            return visitor.visitMulti_line_string(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Multiline_contentContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ML_CONTENT(): antlr.TerminalNode {
        return this.getToken(RclParser.ML_CONTENT, 0)!;
    }
    public ML_NEWLINE(): antlr.TerminalNode | null {
        return this.getToken(RclParser.ML_NEWLINE, 0);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_multiline_content;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterMultiline_content) {
             listener.enterMultiline_content(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitMultiline_content) {
             listener.exitMultiline_content(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitMultiline_content) {
            return visitor.visitMultiline_content(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Flow_invocationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public START(): antlr.TerminalNode {
        return this.getToken(RclParser.START, 0)!;
    }
    public IDENTIFIER(): antlr.TerminalNode {
        return this.getToken(RclParser.IDENTIFIER, 0)!;
    }
    public WITH(): antlr.TerminalNode | null {
        return this.getToken(RclParser.WITH, 0);
    }
    public parameter_list(): Parameter_listContext | null {
        return this.getRuleContext(0, Parameter_listContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_flow_invocation;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterFlow_invocation) {
             listener.enterFlow_invocation(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitFlow_invocation) {
             listener.exitFlow_invocation(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitFlow_invocation) {
            return visitor.visitFlow_invocation(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Flow_result_handlerContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ON(): antlr.TerminalNode {
        return this.getToken(RclParser.ON, 0)!;
    }
    public flow_result(): Flow_resultContext {
        return this.getRuleContext(0, Flow_resultContext)!;
    }
    public ARROW(): antlr.TerminalNode[];
    public ARROW(i: number): antlr.TerminalNode | null;
    public ARROW(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(RclParser.ARROW);
    	} else {
    		return this.getToken(RclParser.ARROW, i);
    	}
    }
    public target_reference(): Target_referenceContext {
        return this.getRuleContext(0, Target_referenceContext)!;
    }
    public NEWLINE(): antlr.TerminalNode {
        return this.getToken(RclParser.NEWLINE, 0)!;
    }
    public context_operation(): Context_operationContext[];
    public context_operation(i: number): Context_operationContext | null;
    public context_operation(i?: number): Context_operationContext[] | Context_operationContext | null {
        if (i === undefined) {
            return this.getRuleContexts(Context_operationContext);
        }

        return this.getRuleContext(i, Context_operationContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_flow_result_handler;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterFlow_result_handler) {
             listener.enterFlow_result_handler(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitFlow_result_handler) {
             listener.exitFlow_result_handler(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitFlow_result_handler) {
            return visitor.visitFlow_result_handler(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Flow_resultContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public COLON(): antlr.TerminalNode {
        return this.getToken(RclParser.COLON, 0)!;
    }
    public LOWER_NAME(): antlr.TerminalNode {
        return this.getToken(RclParser.LOWER_NAME, 0)!;
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_flow_result;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterFlow_result) {
             listener.enterFlow_result(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitFlow_result) {
             listener.exitFlow_result(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitFlow_result) {
            return visitor.visitFlow_result(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Context_operationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public APPEND(): antlr.TerminalNode | null {
        return this.getToken(RclParser.APPEND, 0);
    }
    public TO(): antlr.TerminalNode | null {
        return this.getToken(RclParser.TO, 0);
    }
    public variable_access(): Variable_accessContext {
        return this.getRuleContext(0, Variable_accessContext)!;
    }
    public RESULT(): antlr.TerminalNode | null {
        return this.getToken(RclParser.RESULT, 0);
    }
    public value(): ValueContext | null {
        return this.getRuleContext(0, ValueContext);
    }
    public SET(): antlr.TerminalNode | null {
        return this.getToken(RclParser.SET, 0);
    }
    public MERGE(): antlr.TerminalNode | null {
        return this.getToken(RclParser.MERGE, 0);
    }
    public INTO(): antlr.TerminalNode | null {
        return this.getToken(RclParser.INTO, 0);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_context_operation;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterContext_operation) {
             listener.enterContext_operation(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitContext_operation) {
             listener.exitContext_operation(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitContext_operation) {
            return visitor.visitContext_operation(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Target_referenceContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IDENTIFIER(): antlr.TerminalNode | null {
        return this.getToken(RclParser.IDENTIFIER, 0);
    }
    public variable_access(): Variable_accessContext | null {
        return this.getRuleContext(0, Variable_accessContext);
    }
    public flow_termination(): Flow_terminationContext | null {
        return this.getRuleContext(0, Flow_terminationContext);
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_target_reference;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterTarget_reference) {
             listener.enterTarget_reference(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitTarget_reference) {
             listener.exitTarget_reference(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitTarget_reference) {
            return visitor.visitTarget_reference(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Flow_terminationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public COLON(): antlr.TerminalNode {
        return this.getToken(RclParser.COLON, 0)!;
    }
    public LOWER_NAME(): antlr.TerminalNode {
        return this.getToken(RclParser.LOWER_NAME, 0)!;
    }
    public override get ruleIndex(): number {
        return RclParser.RULE_flow_termination;
    }
    public override enterRule(listener: RclParserListener): void {
        if(listener.enterFlow_termination) {
             listener.enterFlow_termination(this);
        }
    }
    public override exitRule(listener: RclParserListener): void {
        if(listener.exitFlow_termination) {
             listener.exitFlow_termination(this);
        }
    }
    public override accept<Result>(visitor: RclParserVisitor<Result>): Result | null {
        if (visitor.visitFlow_termination) {
            return visitor.visitFlow_termination(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
