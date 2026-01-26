
import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { RclParserListener } from "./RclParserListener.js";
// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class RclParser extends antlr.Parser {
    public static readonly IMPORT = 1;
    public static readonly AS = 2;
    public static readonly WITH = 3;
    public static readonly MATCH = 4;
    public static readonly BOOLEAN = 5;
    public static readonly NULL = 6;
    public static readonly NUMBER = 7;
    public static readonly ATTRIBUTE_NAME = 8;
    public static readonly ATOM = 9;
    public static readonly DEFAULT_CASE = 10;
    public static readonly STRING = 11;
    public static readonly REGEX = 12;
    public static readonly TRIPLE_QUOTE = 13;
    public static readonly EMBEDDED_CODE = 14;
    public static readonly MULTI_LINE_CODE_START = 15;
    public static readonly MULTILINE_STR_CLEAN = 16;
    public static readonly MULTILINE_STR_TRIM = 17;
    public static readonly MULTILINE_STR_PRESERVE = 18;
    public static readonly MULTILINE_STR_PRESERVE_ALL = 19;
    public static readonly IDENTIFIER = 20;
    public static readonly LOWER_NAME = 21;
    public static readonly VARIABLE = 22;
    public static readonly ARROW = 23;
    public static readonly COLON = 24;
    public static readonly COMMA = 25;
    public static readonly DOT = 26;
    public static readonly LPAREN = 27;
    public static readonly RPAREN = 28;
    public static readonly LBRACE = 29;
    public static readonly RBRACE = 30;
    public static readonly LANGLE = 31;
    public static readonly RANGLE = 32;
    public static readonly PIPE = 33;
    public static readonly SLASH = 34;
    public static readonly HYPHEN = 35;
    public static readonly SPREAD = 36;
    public static readonly WS = 37;
    public static readonly COMMENT = 38;
    public static readonly NEWLINE = 39;
    public static readonly INDENT = 40;
    public static readonly DEDENT = 41;
    public static readonly TT_TYPE_NAME = 42;
    public static readonly TT_WS = 43;
    public static readonly TT_CONTENT = 44;
    public static readonly TT_PIPE = 45;
    public static readonly TT_RANGLE = 46;
    public static readonly TS_TRIPLE_QUOTE_END = 47;
    public static readonly TS_INTERPOLATION_START = 48;
    public static readonly TS_CONTENT = 49;
    public static readonly INT_RBRACE = 50;
    public static readonly INT_VARIABLE = 51;
    public static readonly INT_DOT = 52;
    public static readonly INT_LOWER_NAME = 53;
    public static readonly INT_WS = 54;
    public static readonly MC_END = 55;
    public static readonly MC_CONTENT = 56;
    public static readonly ML_END = 57;
    public static readonly ML_CONTENT = 58;
    public static readonly ML_NEWLINE = 59;
    public static readonly RULE_rcl_file = 0;
    public static readonly RULE_import_statement = 1;
    public static readonly RULE_import_path = 2;
    public static readonly RULE_section = 3;
    public static readonly RULE_section_header = 4;
    public static readonly RULE_header_values = 5;
    public static readonly RULE_identifier = 6;
    public static readonly RULE_section_body = 7;
    public static readonly RULE_section_content = 8;
    public static readonly RULE_state_reference = 9;
    public static readonly RULE_spread_directive = 10;
    public static readonly RULE_attribute_assignment = 11;
    public static readonly RULE_match_block = 12;
    public static readonly RULE_match_case = 13;
    public static readonly RULE_simple_transition = 14;
    public static readonly RULE_contextualized_value = 15;
    public static readonly RULE_parameter_list = 16;
    public static readonly RULE_parameter = 17;
    public static readonly RULE_value = 18;
    public static readonly RULE_primitive_value = 19;
    public static readonly RULE_triple_quote_string = 20;
    public static readonly RULE_triple_string_content = 21;
    public static readonly RULE_interpolation = 22;
    public static readonly RULE_interpolation_expr = 23;
    public static readonly RULE_variable_access = 24;
    public static readonly RULE_type_tag = 25;
    public static readonly RULE_list = 26;
    public static readonly RULE_parentheses_list = 27;
    public static readonly RULE_list_elements = 28;
    public static readonly RULE_block_list = 29;
    public static readonly RULE_block_list_item = 30;
    public static readonly RULE_dictionary = 31;
    public static readonly RULE_brace_dictionary = 32;
    public static readonly RULE_block_dictionary = 33;
    public static readonly RULE_dict_entry = 34;
    public static readonly RULE_embedded_code = 35;
    public static readonly RULE_multi_line_code = 36;
    public static readonly RULE_multi_line_string = 37;
    public static readonly RULE_multiline_content = 38;

    public static readonly literalNames = [
        null, "'import'", "'as'", "'with'", "'match'", null, null, null, 
        null, null, "':default'", null, null, null, null, null, null, null, 
        null, null, null, null, null, "'->'", "':'", "','", null, "'('", 
        "')'", "'{'", null, "'<'", null, null, "'/'", "'-'", "'...'", null, 
        null, null, "'INDENT_PLACEHOLDER'", "'DEDENT_PLACEHOLDER'", null, 
        null, null, null, null, null, "'#{'", null, null, null, null, null, 
        null, "'<$'"
    ];

    public static readonly symbolicNames = [
        null, "IMPORT", "AS", "WITH", "MATCH", "BOOLEAN", "NULL", "NUMBER", 
        "ATTRIBUTE_NAME", "ATOM", "DEFAULT_CASE", "STRING", "REGEX", "TRIPLE_QUOTE", 
        "EMBEDDED_CODE", "MULTI_LINE_CODE_START", "MULTILINE_STR_CLEAN", 
        "MULTILINE_STR_TRIM", "MULTILINE_STR_PRESERVE", "MULTILINE_STR_PRESERVE_ALL", 
        "IDENTIFIER", "LOWER_NAME", "VARIABLE", "ARROW", "COLON", "COMMA", 
        "DOT", "LPAREN", "RPAREN", "LBRACE", "RBRACE", "LANGLE", "RANGLE", 
        "PIPE", "SLASH", "HYPHEN", "SPREAD", "WS", "COMMENT", "NEWLINE", 
        "INDENT", "DEDENT", "TT_TYPE_NAME", "TT_WS", "TT_CONTENT", "TT_PIPE", 
        "TT_RANGLE", "TS_TRIPLE_QUOTE_END", "TS_INTERPOLATION_START", "TS_CONTENT", 
        "INT_RBRACE", "INT_VARIABLE", "INT_DOT", "INT_LOWER_NAME", "INT_WS", 
        "MC_END", "MC_CONTENT", "ML_END", "ML_CONTENT", "ML_NEWLINE"
    ];
    public static readonly ruleNames = [
        "rcl_file", "import_statement", "import_path", "section", "section_header", 
        "header_values", "identifier", "section_body", "section_content", 
        "state_reference", "spread_directive", "attribute_assignment", "match_block", 
        "match_case", "simple_transition", "contextualized_value", "parameter_list", 
        "parameter", "value", "primitive_value", "triple_quote_string", 
        "triple_string_content", "interpolation", "interpolation_expr", 
        "variable_access", "type_tag", "list", "parentheses_list", "list_elements", 
        "block_list", "block_list_item", "dictionary", "brace_dictionary", 
        "block_dictionary", "dict_entry", "embedded_code", "multi_line_code", 
        "multi_line_string", "multiline_content",
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
            this.state = 83;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 1 || _la === 21 || _la === 39) {
                {
                this.state = 81;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case RclParser.IMPORT:
                    {
                    this.state = 78;
                    this.import_statement();
                    }
                    break;
                case RclParser.LOWER_NAME:
                    {
                    this.state = 79;
                    this.section();
                    }
                    break;
                case RclParser.NEWLINE:
                    {
                    this.state = 80;
                    this.match(RclParser.NEWLINE);
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                this.state = 85;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 86;
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
            this.state = 88;
            this.match(RclParser.IMPORT);
            this.state = 89;
            this.import_path();
            this.state = 92;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 2) {
                {
                this.state = 90;
                this.match(RclParser.AS);
                this.state = 91;
                localContext._alias = this.match(RclParser.IDENTIFIER);
                }
            }

            this.state = 94;
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
            this.state = 96;
            this.match(RclParser.IDENTIFIER);
            this.state = 101;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 34) {
                {
                {
                this.state = 97;
                this.match(RclParser.SLASH);
                this.state = 98;
                this.match(RclParser.IDENTIFIER);
                }
                }
                this.state = 103;
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
            this.state = 104;
            this.section_header();
            this.state = 106;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 40) {
                {
                this.state = 105;
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
            this.state = 108;
            this.match(RclParser.LOWER_NAME);
            this.state = 110;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 5, this.context) ) {
            case 1:
                {
                this.state = 109;
                this.match(RclParser.IDENTIFIER);
                }
                break;
            }
            this.state = 113;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 6, this.context) ) {
            case 1:
                {
                this.state = 112;
                this.header_values();
                }
                break;
            }
            this.state = 116;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2826959840) !== 0) || _la === 40) {
                {
                this.state = 115;
                this.parameter_list();
                }
            }

            this.state = 118;
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
    public header_values(): Header_valuesContext {
        let localContext = new Header_valuesContext(this.context, this.state);
        this.enterRule(localContext, 10, RclParser.RULE_header_values);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 121;
            this.errorHandler.sync(this);
            alternative = 1;
            do {
                switch (alternative) {
                case 1:
                    {
                    {
                    this.state = 120;
                    this.value();
                    }
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                this.state = 123;
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
        this.enterRule(localContext, 12, RclParser.RULE_identifier);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 125;
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
        this.enterRule(localContext, 14, RclParser.RULE_section_body);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 127;
            this.match(RclParser.INDENT);
            this.state = 129;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 128;
                this.section_content();
                }
                }
                this.state = 131;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 15728912) !== 0) || _la === 36 || _la === 39);
            this.state = 133;
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
        this.enterRule(localContext, 16, RclParser.RULE_section_content);
        try {
            this.state = 142;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.SPREAD:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 135;
                this.spread_directive();
                }
                break;
            case RclParser.ATTRIBUTE_NAME:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 136;
                this.attribute_assignment();
                }
                break;
            case RclParser.LOWER_NAME:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 137;
                this.section();
                }
                break;
            case RclParser.MATCH:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 138;
                this.match_block();
                }
                break;
            case RclParser.ARROW:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 139;
                this.simple_transition();
                }
                break;
            case RclParser.IDENTIFIER:
            case RclParser.VARIABLE:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 140;
                this.state_reference();
                }
                break;
            case RclParser.NEWLINE:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 141;
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
        this.enterRule(localContext, 18, RclParser.RULE_state_reference);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 146;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.IDENTIFIER:
                {
                this.state = 144;
                this.match(RclParser.IDENTIFIER);
                }
                break;
            case RclParser.VARIABLE:
                {
                this.state = 145;
                this.variable_access();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            this.state = 148;
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
        this.enterRule(localContext, 20, RclParser.RULE_spread_directive);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 150;
            this.match(RclParser.SPREAD);
            this.state = 151;
            this.match(RclParser.IDENTIFIER);
            this.state = 152;
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
        this.enterRule(localContext, 22, RclParser.RULE_attribute_assignment);
        try {
            this.state = 165;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 12, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 154;
                this.match(RclParser.ATTRIBUTE_NAME);
                this.state = 155;
                this.value();
                this.state = 156;
                this.match(RclParser.NEWLINE);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 158;
                this.match(RclParser.ATTRIBUTE_NAME);
                this.state = 159;
                this.match(RclParser.COMMA);
                this.state = 160;
                this.value();
                this.state = 161;
                this.match(RclParser.NEWLINE);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 163;
                this.match(RclParser.ATTRIBUTE_NAME);
                this.state = 164;
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
        this.enterRule(localContext, 24, RclParser.RULE_match_block);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 167;
            this.match(RclParser.MATCH);
            this.state = 168;
            this.value();
            this.state = 169;
            this.match(RclParser.NEWLINE);
            this.state = 170;
            this.match(RclParser.INDENT);
            this.state = 172;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 171;
                this.match_case();
                }
                }
                this.state = 174;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 7808) !== 0));
            this.state = 176;
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
        this.enterRule(localContext, 26, RclParser.RULE_match_case);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 178;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 7808) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 179;
            this.match(RclParser.ARROW);
            this.state = 180;
            this.contextualized_value();
            this.state = 181;
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
    public simple_transition(): Simple_transitionContext {
        let localContext = new Simple_transitionContext(this.context, this.state);
        this.enterRule(localContext, 28, RclParser.RULE_simple_transition);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 183;
            this.match(RclParser.ARROW);
            this.state = 184;
            this.contextualized_value();
            this.state = 185;
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
        this.enterRule(localContext, 30, RclParser.RULE_contextualized_value);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 187;
            this.value();
            this.state = 190;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 3) {
                {
                this.state = 188;
                this.match(RclParser.WITH);
                this.state = 189;
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
        this.enterRule(localContext, 32, RclParser.RULE_parameter_list);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 192;
            this.parameter();
            this.state = 197;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 25) {
                {
                {
                this.state = 193;
                this.match(RclParser.COMMA);
                this.state = 194;
                this.parameter();
                }
                }
                this.state = 199;
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
        this.enterRule(localContext, 34, RclParser.RULE_parameter);
        try {
            this.state = 206;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.ATTRIBUTE_NAME:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 200;
                this.match(RclParser.ATTRIBUTE_NAME);
                this.state = 201;
                this.value();
                }
                break;
            case RclParser.LOWER_NAME:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 202;
                this.match(RclParser.LOWER_NAME);
                this.state = 203;
                this.match(RclParser.COLON);
                this.state = 204;
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
                this.state = 205;
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
        this.enterRule(localContext, 36, RclParser.RULE_value);
        try {
            this.state = 215;
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
                this.state = 208;
                this.primitive_value();
                }
                break;
            case RclParser.IDENTIFIER:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 209;
                this.match(RclParser.IDENTIFIER);
                }
                break;
            case RclParser.VARIABLE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 210;
                this.variable_access();
                }
                break;
            case RclParser.LPAREN:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 211;
                this.parentheses_list();
                }
                break;
            case RclParser.LBRACE:
            case RclParser.INDENT:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 212;
                this.dictionary();
                }
                break;
            case RclParser.EMBEDDED_CODE:
            case RclParser.MULTI_LINE_CODE_START:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 213;
                this.embedded_code();
                }
                break;
            case RclParser.MULTILINE_STR_CLEAN:
            case RclParser.MULTILINE_STR_TRIM:
            case RclParser.MULTILINE_STR_PRESERVE:
            case RclParser.MULTILINE_STR_PRESERVE_ALL:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 214;
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
        this.enterRule(localContext, 38, RclParser.RULE_primitive_value);
        try {
            this.state = 225;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.STRING:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 217;
                this.match(RclParser.STRING);
                }
                break;
            case RclParser.TRIPLE_QUOTE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 218;
                this.triple_quote_string();
                }
                break;
            case RclParser.REGEX:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 219;
                this.match(RclParser.REGEX);
                }
                break;
            case RclParser.NUMBER:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 220;
                this.match(RclParser.NUMBER);
                }
                break;
            case RclParser.BOOLEAN:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 221;
                this.match(RclParser.BOOLEAN);
                }
                break;
            case RclParser.NULL:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 222;
                this.match(RclParser.NULL);
                }
                break;
            case RclParser.ATOM:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 223;
                this.match(RclParser.ATOM);
                }
                break;
            case RclParser.LANGLE:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 224;
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
        this.enterRule(localContext, 40, RclParser.RULE_triple_quote_string);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 227;
            this.match(RclParser.TRIPLE_QUOTE);
            this.state = 232;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 48 || _la === 49) {
                {
                this.state = 230;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case RclParser.TS_CONTENT:
                    {
                    this.state = 228;
                    this.match(RclParser.TS_CONTENT);
                    }
                    break;
                case RclParser.TS_INTERPOLATION_START:
                    {
                    this.state = 229;
                    this.interpolation();
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                this.state = 234;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 235;
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
        this.enterRule(localContext, 42, RclParser.RULE_triple_string_content);
        try {
            this.state = 239;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.TS_CONTENT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 237;
                this.match(RclParser.TS_CONTENT);
                }
                break;
            case RclParser.TS_INTERPOLATION_START:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 238;
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
        this.enterRule(localContext, 44, RclParser.RULE_interpolation);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 241;
            this.match(RclParser.TS_INTERPOLATION_START);
            this.state = 242;
            this.interpolation_expr();
            this.state = 243;
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
        this.enterRule(localContext, 46, RclParser.RULE_interpolation_expr);
        let _la: number;
        try {
            this.state = 254;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.INT_VARIABLE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 245;
                this.match(RclParser.INT_VARIABLE);
                this.state = 250;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 52) {
                    {
                    {
                    this.state = 246;
                    this.match(RclParser.INT_DOT);
                    this.state = 247;
                    this.match(RclParser.INT_LOWER_NAME);
                    }
                    }
                    this.state = 252;
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
                this.state = 253;
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
        this.enterRule(localContext, 48, RclParser.RULE_variable_access);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 256;
            this.match(RclParser.VARIABLE);
            this.state = 261;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 26) {
                {
                {
                this.state = 257;
                this.match(RclParser.DOT);
                this.state = 258;
                this.match(RclParser.LOWER_NAME);
                }
                }
                this.state = 263;
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
        this.enterRule(localContext, 50, RclParser.RULE_type_tag);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 264;
            this.match(RclParser.LANGLE);
            this.state = 265;
            this.match(RclParser.TT_TYPE_NAME);
            this.state = 267;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 44) {
                {
                this.state = 266;
                this.match(RclParser.TT_CONTENT);
                }
            }

            this.state = 271;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 45) {
                {
                this.state = 269;
                this.match(RclParser.TT_PIPE);
                this.state = 270;
                this.match(RclParser.TT_CONTENT);
                }
            }

            this.state = 273;
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
        this.enterRule(localContext, 52, RclParser.RULE_list);
        try {
            this.state = 277;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.LPAREN:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 275;
                this.parentheses_list();
                }
                break;
            case RclParser.INDENT:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 276;
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
        this.enterRule(localContext, 54, RclParser.RULE_parentheses_list);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 279;
            this.match(RclParser.LPAREN);
            this.state = 281;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2824862432) !== 0) || _la === 40) {
                {
                this.state = 280;
                this.list_elements();
                }
            }

            this.state = 283;
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
        this.enterRule(localContext, 56, RclParser.RULE_list_elements);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 285;
            this.value();
            this.state = 290;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 25) {
                {
                {
                this.state = 286;
                this.match(RclParser.COMMA);
                this.state = 287;
                this.value();
                }
                }
                this.state = 292;
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
        this.enterRule(localContext, 58, RclParser.RULE_block_list);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 293;
            this.match(RclParser.INDENT);
            this.state = 295;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 294;
                this.block_list_item();
                }
                }
                this.state = 297;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while (_la === 35);
            this.state = 299;
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
        this.enterRule(localContext, 60, RclParser.RULE_block_list_item);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 301;
            this.match(RclParser.HYPHEN);
            this.state = 302;
            this.value();
            this.state = 303;
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
        this.enterRule(localContext, 62, RclParser.RULE_dictionary);
        try {
            this.state = 307;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.LBRACE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 305;
                this.brace_dictionary();
                }
                break;
            case RclParser.INDENT:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 306;
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
        this.enterRule(localContext, 64, RclParser.RULE_brace_dictionary);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 309;
            this.match(RclParser.LBRACE);
            this.state = 318;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 11 || _la === 21) {
                {
                this.state = 310;
                this.dict_entry();
                this.state = 315;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 25) {
                    {
                    {
                    this.state = 311;
                    this.match(RclParser.COMMA);
                    this.state = 312;
                    this.dict_entry();
                    }
                    }
                    this.state = 317;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
            }

            this.state = 320;
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
        this.enterRule(localContext, 66, RclParser.RULE_block_dictionary);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 322;
            this.match(RclParser.INDENT);
            this.state = 324;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 323;
                this.dict_entry();
                }
                }
                this.state = 326;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while (_la === 11 || _la === 21);
            this.state = 328;
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
        this.enterRule(localContext, 68, RclParser.RULE_dict_entry);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 330;
            _la = this.tokenStream.LA(1);
            if(!(_la === 11 || _la === 21)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 331;
            this.match(RclParser.COLON);
            this.state = 332;
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
        this.enterRule(localContext, 70, RclParser.RULE_embedded_code);
        try {
            this.state = 336;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case RclParser.EMBEDDED_CODE:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 334;
                this.match(RclParser.EMBEDDED_CODE);
                }
                break;
            case RclParser.MULTI_LINE_CODE_START:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 335;
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
        this.enterRule(localContext, 72, RclParser.RULE_multi_line_code);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 338;
            this.match(RclParser.MULTI_LINE_CODE_START);
            this.state = 342;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 56) {
                {
                {
                this.state = 339;
                this.match(RclParser.MC_CONTENT);
                }
                }
                this.state = 344;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 345;
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
        this.enterRule(localContext, 74, RclParser.RULE_multi_line_string);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 347;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 983040) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 351;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 58) {
                {
                {
                this.state = 348;
                this.multiline_content();
                }
                }
                this.state = 353;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 354;
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
        this.enterRule(localContext, 76, RclParser.RULE_multiline_content);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 356;
            this.match(RclParser.ML_CONTENT);
            this.state = 358;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 59) {
                {
                this.state = 357;
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

    public static readonly _serializedATN: number[] = [
        4,1,59,361,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,
        7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,26,
        2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,2,32,7,32,2,33,
        7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,1,0,1,0,1,
        0,5,0,82,8,0,10,0,12,0,85,9,0,1,0,1,0,1,1,1,1,1,1,1,1,3,1,93,8,1,
        1,1,1,1,1,2,1,2,1,2,5,2,100,8,2,10,2,12,2,103,9,2,1,3,1,3,3,3,107,
        8,3,1,4,1,4,3,4,111,8,4,1,4,3,4,114,8,4,1,4,3,4,117,8,4,1,4,1,4,
        1,5,4,5,122,8,5,11,5,12,5,123,1,6,1,6,1,7,1,7,4,7,130,8,7,11,7,12,
        7,131,1,7,1,7,1,8,1,8,1,8,1,8,1,8,1,8,1,8,3,8,143,8,8,1,9,1,9,3,
        9,147,8,9,1,9,1,9,1,10,1,10,1,10,1,10,1,11,1,11,1,11,1,11,1,11,1,
        11,1,11,1,11,1,11,1,11,1,11,3,11,166,8,11,1,12,1,12,1,12,1,12,1,
        12,4,12,173,8,12,11,12,12,12,174,1,12,1,12,1,13,1,13,1,13,1,13,1,
        13,1,14,1,14,1,14,1,14,1,15,1,15,1,15,3,15,191,8,15,1,16,1,16,1,
        16,5,16,196,8,16,10,16,12,16,199,9,16,1,17,1,17,1,17,1,17,1,17,1,
        17,3,17,207,8,17,1,18,1,18,1,18,1,18,1,18,1,18,1,18,3,18,216,8,18,
        1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,3,19,226,8,19,1,20,1,20,
        1,20,5,20,231,8,20,10,20,12,20,234,9,20,1,20,1,20,1,21,1,21,3,21,
        240,8,21,1,22,1,22,1,22,1,22,1,23,1,23,1,23,5,23,249,8,23,10,23,
        12,23,252,9,23,1,23,3,23,255,8,23,1,24,1,24,1,24,5,24,260,8,24,10,
        24,12,24,263,9,24,1,25,1,25,1,25,3,25,268,8,25,1,25,1,25,3,25,272,
        8,25,1,25,1,25,1,26,1,26,3,26,278,8,26,1,27,1,27,3,27,282,8,27,1,
        27,1,27,1,28,1,28,1,28,5,28,289,8,28,10,28,12,28,292,9,28,1,29,1,
        29,4,29,296,8,29,11,29,12,29,297,1,29,1,29,1,30,1,30,1,30,1,30,1,
        31,1,31,3,31,308,8,31,1,32,1,32,1,32,1,32,5,32,314,8,32,10,32,12,
        32,317,9,32,3,32,319,8,32,1,32,1,32,1,33,1,33,4,33,325,8,33,11,33,
        12,33,326,1,33,1,33,1,34,1,34,1,34,1,34,1,35,1,35,3,35,337,8,35,
        1,36,1,36,5,36,341,8,36,10,36,12,36,344,9,36,1,36,1,36,1,37,1,37,
        5,37,350,8,37,10,37,12,37,353,9,37,1,37,1,37,1,38,1,38,3,38,359,
        8,38,1,38,0,0,39,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,
        36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,0,
        3,2,0,7,7,9,12,2,0,11,11,21,21,1,0,16,19,379,0,83,1,0,0,0,2,88,1,
        0,0,0,4,96,1,0,0,0,6,104,1,0,0,0,8,108,1,0,0,0,10,121,1,0,0,0,12,
        125,1,0,0,0,14,127,1,0,0,0,16,142,1,0,0,0,18,146,1,0,0,0,20,150,
        1,0,0,0,22,165,1,0,0,0,24,167,1,0,0,0,26,178,1,0,0,0,28,183,1,0,
        0,0,30,187,1,0,0,0,32,192,1,0,0,0,34,206,1,0,0,0,36,215,1,0,0,0,
        38,225,1,0,0,0,40,227,1,0,0,0,42,239,1,0,0,0,44,241,1,0,0,0,46,254,
        1,0,0,0,48,256,1,0,0,0,50,264,1,0,0,0,52,277,1,0,0,0,54,279,1,0,
        0,0,56,285,1,0,0,0,58,293,1,0,0,0,60,301,1,0,0,0,62,307,1,0,0,0,
        64,309,1,0,0,0,66,322,1,0,0,0,68,330,1,0,0,0,70,336,1,0,0,0,72,338,
        1,0,0,0,74,347,1,0,0,0,76,356,1,0,0,0,78,82,3,2,1,0,79,82,3,6,3,
        0,80,82,5,39,0,0,81,78,1,0,0,0,81,79,1,0,0,0,81,80,1,0,0,0,82,85,
        1,0,0,0,83,81,1,0,0,0,83,84,1,0,0,0,84,86,1,0,0,0,85,83,1,0,0,0,
        86,87,5,0,0,1,87,1,1,0,0,0,88,89,5,1,0,0,89,92,3,4,2,0,90,91,5,2,
        0,0,91,93,5,20,0,0,92,90,1,0,0,0,92,93,1,0,0,0,93,94,1,0,0,0,94,
        95,5,39,0,0,95,3,1,0,0,0,96,101,5,20,0,0,97,98,5,34,0,0,98,100,5,
        20,0,0,99,97,1,0,0,0,100,103,1,0,0,0,101,99,1,0,0,0,101,102,1,0,
        0,0,102,5,1,0,0,0,103,101,1,0,0,0,104,106,3,8,4,0,105,107,3,14,7,
        0,106,105,1,0,0,0,106,107,1,0,0,0,107,7,1,0,0,0,108,110,5,21,0,0,
        109,111,5,20,0,0,110,109,1,0,0,0,110,111,1,0,0,0,111,113,1,0,0,0,
        112,114,3,10,5,0,113,112,1,0,0,0,113,114,1,0,0,0,114,116,1,0,0,0,
        115,117,3,32,16,0,116,115,1,0,0,0,116,117,1,0,0,0,117,118,1,0,0,
        0,118,119,5,39,0,0,119,9,1,0,0,0,120,122,3,36,18,0,121,120,1,0,0,
        0,122,123,1,0,0,0,123,121,1,0,0,0,123,124,1,0,0,0,124,11,1,0,0,0,
        125,126,5,20,0,0,126,13,1,0,0,0,127,129,5,40,0,0,128,130,3,16,8,
        0,129,128,1,0,0,0,130,131,1,0,0,0,131,129,1,0,0,0,131,132,1,0,0,
        0,132,133,1,0,0,0,133,134,5,41,0,0,134,15,1,0,0,0,135,143,3,20,10,
        0,136,143,3,22,11,0,137,143,3,6,3,0,138,143,3,24,12,0,139,143,3,
        28,14,0,140,143,3,18,9,0,141,143,5,39,0,0,142,135,1,0,0,0,142,136,
        1,0,0,0,142,137,1,0,0,0,142,138,1,0,0,0,142,139,1,0,0,0,142,140,
        1,0,0,0,142,141,1,0,0,0,143,17,1,0,0,0,144,147,5,20,0,0,145,147,
        3,48,24,0,146,144,1,0,0,0,146,145,1,0,0,0,147,148,1,0,0,0,148,149,
        5,39,0,0,149,19,1,0,0,0,150,151,5,36,0,0,151,152,5,20,0,0,152,153,
        5,39,0,0,153,21,1,0,0,0,154,155,5,8,0,0,155,156,3,36,18,0,156,157,
        5,39,0,0,157,166,1,0,0,0,158,159,5,8,0,0,159,160,5,25,0,0,160,161,
        3,36,18,0,161,162,5,39,0,0,162,166,1,0,0,0,163,164,5,8,0,0,164,166,
        5,39,0,0,165,154,1,0,0,0,165,158,1,0,0,0,165,163,1,0,0,0,166,23,
        1,0,0,0,167,168,5,4,0,0,168,169,3,36,18,0,169,170,5,39,0,0,170,172,
        5,40,0,0,171,173,3,26,13,0,172,171,1,0,0,0,173,174,1,0,0,0,174,172,
        1,0,0,0,174,175,1,0,0,0,175,176,1,0,0,0,176,177,5,41,0,0,177,25,
        1,0,0,0,178,179,7,0,0,0,179,180,5,23,0,0,180,181,3,30,15,0,181,182,
        5,39,0,0,182,27,1,0,0,0,183,184,5,23,0,0,184,185,3,30,15,0,185,186,
        5,39,0,0,186,29,1,0,0,0,187,190,3,36,18,0,188,189,5,3,0,0,189,191,
        3,32,16,0,190,188,1,0,0,0,190,191,1,0,0,0,191,31,1,0,0,0,192,197,
        3,34,17,0,193,194,5,25,0,0,194,196,3,34,17,0,195,193,1,0,0,0,196,
        199,1,0,0,0,197,195,1,0,0,0,197,198,1,0,0,0,198,33,1,0,0,0,199,197,
        1,0,0,0,200,201,5,8,0,0,201,207,3,36,18,0,202,203,5,21,0,0,203,204,
        5,24,0,0,204,207,3,36,18,0,205,207,3,36,18,0,206,200,1,0,0,0,206,
        202,1,0,0,0,206,205,1,0,0,0,207,35,1,0,0,0,208,216,3,38,19,0,209,
        216,5,20,0,0,210,216,3,48,24,0,211,216,3,54,27,0,212,216,3,62,31,
        0,213,216,3,70,35,0,214,216,3,74,37,0,215,208,1,0,0,0,215,209,1,
        0,0,0,215,210,1,0,0,0,215,211,1,0,0,0,215,212,1,0,0,0,215,213,1,
        0,0,0,215,214,1,0,0,0,216,37,1,0,0,0,217,226,5,11,0,0,218,226,3,
        40,20,0,219,226,5,12,0,0,220,226,5,7,0,0,221,226,5,5,0,0,222,226,
        5,6,0,0,223,226,5,9,0,0,224,226,3,50,25,0,225,217,1,0,0,0,225,218,
        1,0,0,0,225,219,1,0,0,0,225,220,1,0,0,0,225,221,1,0,0,0,225,222,
        1,0,0,0,225,223,1,0,0,0,225,224,1,0,0,0,226,39,1,0,0,0,227,232,5,
        13,0,0,228,231,5,49,0,0,229,231,3,44,22,0,230,228,1,0,0,0,230,229,
        1,0,0,0,231,234,1,0,0,0,232,230,1,0,0,0,232,233,1,0,0,0,233,235,
        1,0,0,0,234,232,1,0,0,0,235,236,5,47,0,0,236,41,1,0,0,0,237,240,
        5,49,0,0,238,240,3,44,22,0,239,237,1,0,0,0,239,238,1,0,0,0,240,43,
        1,0,0,0,241,242,5,48,0,0,242,243,3,46,23,0,243,244,5,50,0,0,244,
        45,1,0,0,0,245,250,5,51,0,0,246,247,5,52,0,0,247,249,5,53,0,0,248,
        246,1,0,0,0,249,252,1,0,0,0,250,248,1,0,0,0,250,251,1,0,0,0,251,
        255,1,0,0,0,252,250,1,0,0,0,253,255,3,36,18,0,254,245,1,0,0,0,254,
        253,1,0,0,0,255,47,1,0,0,0,256,261,5,22,0,0,257,258,5,26,0,0,258,
        260,5,21,0,0,259,257,1,0,0,0,260,263,1,0,0,0,261,259,1,0,0,0,261,
        262,1,0,0,0,262,49,1,0,0,0,263,261,1,0,0,0,264,265,5,31,0,0,265,
        267,5,42,0,0,266,268,5,44,0,0,267,266,1,0,0,0,267,268,1,0,0,0,268,
        271,1,0,0,0,269,270,5,45,0,0,270,272,5,44,0,0,271,269,1,0,0,0,271,
        272,1,0,0,0,272,273,1,0,0,0,273,274,5,46,0,0,274,51,1,0,0,0,275,
        278,3,54,27,0,276,278,3,58,29,0,277,275,1,0,0,0,277,276,1,0,0,0,
        278,53,1,0,0,0,279,281,5,27,0,0,280,282,3,56,28,0,281,280,1,0,0,
        0,281,282,1,0,0,0,282,283,1,0,0,0,283,284,5,28,0,0,284,55,1,0,0,
        0,285,290,3,36,18,0,286,287,5,25,0,0,287,289,3,36,18,0,288,286,1,
        0,0,0,289,292,1,0,0,0,290,288,1,0,0,0,290,291,1,0,0,0,291,57,1,0,
        0,0,292,290,1,0,0,0,293,295,5,40,0,0,294,296,3,60,30,0,295,294,1,
        0,0,0,296,297,1,0,0,0,297,295,1,0,0,0,297,298,1,0,0,0,298,299,1,
        0,0,0,299,300,5,41,0,0,300,59,1,0,0,0,301,302,5,35,0,0,302,303,3,
        36,18,0,303,304,5,39,0,0,304,61,1,0,0,0,305,308,3,64,32,0,306,308,
        3,66,33,0,307,305,1,0,0,0,307,306,1,0,0,0,308,63,1,0,0,0,309,318,
        5,29,0,0,310,315,3,68,34,0,311,312,5,25,0,0,312,314,3,68,34,0,313,
        311,1,0,0,0,314,317,1,0,0,0,315,313,1,0,0,0,315,316,1,0,0,0,316,
        319,1,0,0,0,317,315,1,0,0,0,318,310,1,0,0,0,318,319,1,0,0,0,319,
        320,1,0,0,0,320,321,5,30,0,0,321,65,1,0,0,0,322,324,5,40,0,0,323,
        325,3,68,34,0,324,323,1,0,0,0,325,326,1,0,0,0,326,324,1,0,0,0,326,
        327,1,0,0,0,327,328,1,0,0,0,328,329,5,41,0,0,329,67,1,0,0,0,330,
        331,7,1,0,0,331,332,5,24,0,0,332,333,3,36,18,0,333,69,1,0,0,0,334,
        337,5,14,0,0,335,337,3,72,36,0,336,334,1,0,0,0,336,335,1,0,0,0,337,
        71,1,0,0,0,338,342,5,15,0,0,339,341,5,56,0,0,340,339,1,0,0,0,341,
        344,1,0,0,0,342,340,1,0,0,0,342,343,1,0,0,0,343,345,1,0,0,0,344,
        342,1,0,0,0,345,346,5,55,0,0,346,73,1,0,0,0,347,351,7,2,0,0,348,
        350,3,76,38,0,349,348,1,0,0,0,350,353,1,0,0,0,351,349,1,0,0,0,351,
        352,1,0,0,0,352,354,1,0,0,0,353,351,1,0,0,0,354,355,5,57,0,0,355,
        75,1,0,0,0,356,358,5,58,0,0,357,359,5,59,0,0,358,357,1,0,0,0,358,
        359,1,0,0,0,359,77,1,0,0,0,39,81,83,92,101,106,110,113,116,123,131,
        142,146,165,174,190,197,206,215,225,230,232,239,250,254,261,267,
        271,277,281,290,297,307,315,318,326,336,342,351,358
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
}


export class Section_headerContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LOWER_NAME(): antlr.TerminalNode {
        return this.getToken(RclParser.LOWER_NAME, 0)!;
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
}


export class Match_caseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ARROW(): antlr.TerminalNode {
        return this.getToken(RclParser.ARROW, 0)!;
    }
    public contextualized_value(): Contextualized_valueContext {
        return this.getRuleContext(0, Contextualized_valueContext)!;
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
}


export class Simple_transitionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ARROW(): antlr.TerminalNode {
        return this.getToken(RclParser.ARROW, 0)!;
    }
    public contextualized_value(): Contextualized_valueContext {
        return this.getRuleContext(0, Contextualized_valueContext)!;
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
}
