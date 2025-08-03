import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CharStream, CommonTokenStream } from 'antlr4ng';
import { describe, expect, test } from 'bun:test';
import { RclLexer } from '../src/generated/RclLexer.js';
import { RclParser } from '../src/generated/RclParser.js';
import { ASTVisitor } from '../src/ast-visitor.js';

describe('RCL ANTLR Parser', () => {
  test('should parse a simple RCL file correctly', () => {
    const source = `agent TestBot
  displayName: "Test Bot"
  
  flow MainFlow
    start: Welcome
    
    on Welcome
      -> Welcome
    
  messages Messages
    text Welcome "Hello!"`;

    const inputStream = CharStream.fromString(source);
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
      reportAmbiguity: () => {},
      reportAttemptingFullContext: () => {},
      reportContextSensitivity: () => {},
    });

    const tree = parser.rcl_file();
    expect(errors).toHaveLength(0);

    // Use visitor to convert to AST
    const visitor = new ASTVisitor(source);
    const ast = visitor.visitRcl_file(tree);

    expect(ast.type).toBe('RclFile');
    expect(ast.sections).toHaveLength(1);
    expect(ast.sections[0].sectionType).toBe('agent');
    expect(ast.sections[0].identifier?.value).toBe('TestBot');
  });

  test('should parse the coffee-shop.rcl example and produce expected AST structure', () => {
    const coffeeShopPath = resolve(__dirname, 'fixtures', 'coffee-shop.rcl');
    const source = readFileSync(coffeeShopPath, 'utf-8');

    const inputStream = CharStream.fromString(source);
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
      reportAmbiguity: () => {},
      reportAttemptingFullContext: () => {},
      reportContextSensitivity: () => {},
    });

    const tree = parser.rcl_file();
    expect(errors).toHaveLength(0);

    // Use visitor to convert to AST
    const visitor = new ASTVisitor(source);
    const ast = visitor.visitRcl_file(tree);

    // Check top-level structure
    expect(ast.type).toBe('RclFile');
    expect(ast.sections).toHaveLength(1); // only agent at top level

    // Check agent section
    const agentSection = ast.sections[0];
    expect(agentSection.type).toBe('Section');
    expect(agentSection.sectionType).toBe('agent');
    expect(agentSection.identifier?.value).toBe('Coffee Shop');
    
    // Check displayName attribute
    const displayNameAttr = agentSection.body.find((item: any) => 
      item.type === 'Attribute' && item.key === 'displayName'
    );
    expect(displayNameAttr).toBeDefined();
    expect(displayNameAttr.value.type).toBe('StringLiteral');
    expect(displayNameAttr.value.value).toBe('Quick Coffee');

    // Check that config and defaults are nested inside agent
    const configSection = agentSection.body.find((item: any) => 
      item.type === 'Section' && item.sectionType === 'config'
    );
    expect(configSection).toBeDefined();

    const defaultsSection = agentSection.body.find((item: any) => 
      item.type === 'Section' && item.sectionType === 'defaults'
    );
    expect(defaultsSection).toBeDefined();

    // Check flow section (nested in agent)
    const flowSection = agentSection.body.find((item: any) => 
      item.type === 'Section' && item.sectionType === 'flow'
    );
    expect(flowSection).toBeDefined();
    expect(flowSection.identifier?.value).toBe('Order Flow');

    // Check messages section (nested in agent)
    const messagesSection = agentSection.body.find((item: any) => 
      item.type === 'Section' && item.sectionType === 'messages'
    );
    expect(messagesSection).toBeDefined();
    expect(messagesSection.identifier?.value).toBe('Messages');
  });

  test('should parse type tags correctly', () => {
    const source = `agent TestAgent
  displayName: "Test"
  config
    email: <email user@example.com>
    phone: <phone +1234567890>
    url: <url https://example.com>
  
  flow MainFlow
    start: Welcome
    
    on Welcome
      -> Welcome
    
  messages Messages
    text Welcome "Hello!"`;

    const inputStream = CharStream.fromString(source);
    const lexer = new RclLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new RclParser(tokenStream);

    parser.removeErrorListeners();
    const tree = parser.rcl_file();

    const visitor = new ASTVisitor(source);
    const ast = visitor.visitRcl_file(tree);

    const agentSection = ast.sections[0];
    const configSection = agentSection.body.find((item: any) => 
      item.type === 'Section' && item.sectionType === 'config'
    );
    
    expect(configSection).toBeDefined();
    
    // Find type tag attributes
    const emailAttr = configSection.body.find((item: any) => 
      item.type === 'Attribute' && item.key === 'email'
    );
    expect(emailAttr.value.type).toBe('TypeTag');
    expect(emailAttr.value.tagName).toBe('email');
    expect(emailAttr.value.value).toBe('user@example.com');
  });

  test('should parse embedded code correctly', () => {
    const source = `agent CodeExample
  displayName: "Code Example"
  defaults
    simple: $js> console.log('hello')
    expression: $> 1 + 2
  
  flow MainFlow
    start: Welcome
    
    on Welcome
      -> Welcome
    
  messages Messages
    text Welcome "Hello!"`;

    const inputStream = CharStream.fromString(source);
    const lexer = new RclLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new RclParser(tokenStream);

    parser.removeErrorListeners();
    const tree = parser.rcl_file();

    const visitor = new ASTVisitor(source);
    const ast = visitor.visitRcl_file(tree);

    const agentSection = ast.sections[0];
    const defaultsSection = agentSection.body.find((item: any) => 
      item.type === 'Section' && item.sectionType === 'defaults'
    );
    
    const simpleAttr = defaultsSection.body.find((item: any) => 
      item.type === 'Attribute' && item.key === 'simple'
    );
    expect(simpleAttr.value.type).toBe('SingleLineCode');
    expect(simpleAttr.value.language).toBe('js');
    
    const exprAttr = defaultsSection.body.find((item: any) => 
      item.type === 'Attribute' && item.key === 'expression'
    );
    expect(exprAttr.value.type).toBe('SingleLineCode');
    expect(exprAttr.value.language).toBeUndefined();
  });

  test('should handle indentation correctly', () => {
    const source = `agent Parent
  displayName: "Parent"
  
  flow Nested
    start: Hello
    
    on Hello
      -> Hello
      
  messages Messages
    text Hello "Hi"`;

    const inputStream = CharStream.fromString(source);
    const lexer = new RclLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new RclParser(tokenStream);

    parser.removeErrorListeners();
    const tree = parser.rcl_file();

    const visitor = new ASTVisitor(source);
    const ast = visitor.visitRcl_file(tree);

    const parent = ast.sections[0];
    expect(parent.type).toBe('Section');
    expect(parent.sectionType).toBe('agent');
    
    // Check nested sections
    const flowSection = parent.body.find((item: any) => 
      item.type === 'Section' && item.sectionType === 'flow'
    );
    expect(flowSection).toBeDefined();
    expect(flowSection.identifier?.value).toBe('Nested');
  });
});