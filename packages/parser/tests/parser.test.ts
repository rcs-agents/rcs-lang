import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CharStreams, CommonTokenStream, Token } from 'antlr4ts';
import { ParserRuleContext } from 'antlr4ts';
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker';
import { describe, expect, it } from 'vitest';
import { RclLexer } from '../src/generated/RclLexer';
import {
  type Attribute_assignmentContext,
  RclParser,
  type Rcl_fileContext,
  type SectionContext,
  Section_headerContext,
  type ValueContext,
} from '../src/generated/RclParser';
import type { RclParserListener } from '../src/generated/RclParserListener';

// Helper to extract AST structure
class ASTExtractor implements RclParserListener {
  private ast: any = { type: 'RclFile', sections: [] };
  private currentSection: any = null;
  private currentParent: any[] = [];

  enterRcl_file?(_ctx: Rcl_fileContext): void {
    this.currentParent.push(this.ast);
  }

  enterSection?(ctx: SectionContext): void {
    const header = ctx.section_header();
    const sectionType = header.LOWER_NAME()?.text;
    const idNode = header.IDENTIFIER();
    const id = idNode ? idNode.text : null;
    const stringNode = header.STRING?.();
    const content = stringNode ? stringNode.text.slice(1, -1) : null; // Remove quotes
    const atomNodes = header.ATOM?.();
    const modifier = atomNodes && atomNodes.length > 0 ? atomNodes[0].text : null;

    const section: any = {
      type: 'Section',
      sectionType: sectionType,
      id: id,
      attributes: [],
      children: [],
    };

    if (content) section.content = content;
    if (modifier) section.modifier = modifier;

    const parent = this.currentParent[this.currentParent.length - 1];
    if (parent.sections) {
      parent.sections.push(section);
    } else if (parent.children) {
      parent.children.push(section);
    }

    this.currentSection = section;
    this.currentParent.push(section);
  }

  exitSection?(_ctx: SectionContext): void {
    this.currentParent.pop();
    if (this.currentParent.length > 0) {
      const newParent = this.currentParent[this.currentParent.length - 1];
      this.currentSection = newParent.type === 'RclFile' ? null : newParent;
    } else {
      this.currentSection = null;
    }
  }

  enterAttribute_assignment?(ctx: Attribute_assignmentContext): void {
    if (this.currentSection) {
      const attributeName = ctx.ATTRIBUTE_NAME();
      if (!attributeName) return;
      const key = attributeName.text.slice(0, -1); // Remove trailing colon
      const valueCtx = ctx.value(0); // Use index 0 to get first value
      const value = this.extractValue(valueCtx);
      this.currentSection.attributes.push({ key, value });
    }
  }

  private extractValue(valueCtx: ValueContext): any {
    if (!valueCtx) return null;

    const text = valueCtx.text;

    // Check for primitive value
    const primitiveCtx = valueCtx.primitive_value();
    if (primitiveCtx) {
      if (primitiveCtx.STRING()) {
        const str = primitiveCtx.STRING().text;
        return { type: 'String', value: str.slice(1, -1) };
      }
      if (primitiveCtx.triple_quote_string()) {
        const tripleStr = primitiveCtx.triple_quote_string().text;
        return { type: 'TripleString', value: tripleStr.slice(3, -3) };
      }
      if (primitiveCtx.NUMBER()) {
        return { type: 'Number', value: Number.parseFloat(primitiveCtx.NUMBER().text) };
      }
      if (primitiveCtx.ATOM()) {
        return { type: 'Atom', value: primitiveCtx.ATOM().text };
      }
      if (primitiveCtx.BOOLEAN()) {
        return { type: 'Boolean', value: primitiveCtx.BOOLEAN().text };
      }
      if (primitiveCtx.NULL()) {
        return { type: 'Null', value: null };
      }
      // Check for type tag within primitive value
      const typeTagCtx = primitiveCtx.type_tag();
      if (typeTagCtx) {
        return { type: 'TypeTag', value: typeTagCtx.text };
      }
    }

    // Check for identifier
    if (valueCtx.IDENTIFIER()) {
      return { type: 'Identifier', value: valueCtx.IDENTIFIER()?.text };
    }

    // Check for variable access
    const variableCtx = valueCtx.variable_access();
    if (variableCtx) {
      return { type: 'Variable', value: variableCtx.text };
    }

    // Check for embedded code
    const embeddedCtx = valueCtx.embedded_code();
    if (embeddedCtx) {
      return { type: 'EmbeddedCode', value: embeddedCtx.text };
    }

    // Check for list
    const listCtx = valueCtx.parentheses_list();
    if (listCtx) {
      return { type: 'List', value: listCtx.text };
    }

    // Check for dictionary
    const dictCtx = valueCtx.dictionary();
    if (dictCtx) {
      return { type: 'Dictionary', value: dictCtx.text };
    }

    // Check for multi-line string
    const multiLineCtx = valueCtx.multi_line_string();
    if (multiLineCtx) {
      return { type: 'MultiLineString', value: multiLineCtx.text };
    }

    // Default
    return { type: 'Unknown', value: text };
  }

  getAST() {
    return this.ast;
  }
}

describe('RCL ANTLR Parser', () => {
  it('should parse the coffee-shop.rcl example and produce expected AST structure', () => {
    const filePath = resolve(__dirname, './fixtures/coffee-shop.rcl');
    const rclContent = readFileSync(filePath, 'utf-8');

    // Parse
    const inputStream = CharStreams.fromString(rclContent);
    const lexer = new RclLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new RclParser(tokenStream);

    // Collect errors
    const errors: string[] = [];
    parser.removeErrorListeners();
    parser.addErrorListener({
      syntaxError: (_recognizer, _offendingSymbol, line, column, msg, _error) => {
        errors.push(`Line ${line}:${column} ${msg}`);
      },
    });

    const tree = parser.rcl_file();

    // Extract AST
    const listener = new ASTExtractor();
    ParseTreeWalker.DEFAULT.walk(listener, tree);
    const ast = listener.getAST();

    // Check top-level structure
    expect(ast.type).toBe('RclFile');
    expect(ast.sections).toHaveLength(1); // only agent at top level

    // Check agent section
    const agentSection = ast.sections[0];
    expect(agentSection.type).toBe('Section');
    expect(agentSection.sectionType).toBe('agent');
    expect(agentSection.id).toBe('Coffee Shop');
    expect(agentSection.attributes).toHaveLength(2);
    expect(agentSection.attributes[0]).toEqual({
      key: 'displayName',
      value: { type: 'String', value: 'Quick Coffee' },
    });

    // Check that config and defaults are nested inside agent
    expect(agentSection.children.length).toBeGreaterThan(0);
    const configSection = agentSection.children.find((c: any) => c.sectionType === 'config');
    expect(configSection).toBeDefined();
    expect(configSection.id).toBeNull();

    const defaultsSection = agentSection.children.find((c: any) => c.sectionType === 'defaults');
    expect(defaultsSection).toBeDefined();

    // Check flow section (nested in agent)
    const flowSection = agentSection.children.find((c: any) => c.sectionType === 'flow');
    expect(flowSection).toBeDefined();
    expect(flowSection.id).toBe('Order Flow');
    expect(flowSection.children.length).toBeGreaterThan(0);

    // Check messages section (nested in agent)
    const messagesSection = agentSection.children.find((c: any) => c.sectionType === 'messages');
    expect(messagesSection).toBeDefined();
    expect(messagesSection.id).toBe('Messages');
    expect(messagesSection.children.length).toBeGreaterThan(0);
  });

  it('should parse type tags correctly', () => {
    const source = `test Section
  email: <email user@example.com>
  phone: <phone +1234567890>
  url: <url https://example.com>
`;

    const inputStream = CharStreams.fromString(source);
    const lexer = new RclLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new RclParser(tokenStream);

    parser.removeErrorListeners();
    const tree = parser.rcl_file();

    const listener = new ASTExtractor();
    ParseTreeWalker.DEFAULT.walk(listener, tree);
    const ast = listener.getAST();

    expect(ast.sections).toHaveLength(1);
    expect(ast.sections[0].attributes).toHaveLength(3);
    expect(ast.sections[0].attributes[0].value.type).toBe('TypeTag');
    expect(ast.sections[0].attributes[1].value.type).toBe('TypeTag');
    expect(ast.sections[0].attributes[2].value.type).toBe('TypeTag');
  });

  it('should parse embedded code correctly', () => {
    const source = `
code Examples
  simple: $js> console.log('hello')
  expression: $> 1 + 2
`;

    const inputStream = CharStreams.fromString(source);
    const lexer = new RclLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new RclParser(tokenStream);

    parser.removeErrorListeners();
    const tree = parser.rcl_file();

    const listener = new ASTExtractor();
    ParseTreeWalker.DEFAULT.walk(listener, tree);
    const ast = listener.getAST();

    expect(ast.sections[0].attributes[0].value.type).toBe('EmbeddedCode');
    expect(ast.sections[0].attributes[1].value.type).toBe('EmbeddedCode');
  });

  it('should handle indentation correctly', () => {
    const source = `
parent Section
  child Nested
    grandchild: "value"
  sibling Section
    attr: 123
`;

    const inputStream = CharStreams.fromString(source);
    const lexer = new RclLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new RclParser(tokenStream);

    parser.removeErrorListeners();
    const tree = parser.rcl_file();

    const listener = new ASTExtractor();
    ParseTreeWalker.DEFAULT.walk(listener, tree);
    const ast = listener.getAST();

    const parent = ast.sections[0];
    expect(parent.children).toHaveLength(2);

    const child = parent.children[0];
    expect(child.sectionType).toBe('child');
    expect(child.id).toBe('Nested');
    expect(child.attributes[0].key).toBe('grandchild');

    const sibling = parent.children[1];
    expect(sibling.sectionType).toBe('sibling');
    expect(sibling.attributes[0].value.value).toBe(123);
  });
});
