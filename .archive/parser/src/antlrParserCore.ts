import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker';
import { RclLexer } from '@rcl/antlr/dist/generated/RclLexer';
import { RclParser } from '@rcl/antlr/dist/generated/RclParser';
import type { RclParserListener } from '@rcl/antlr/dist/generated/RclParserListener';
import { 
    type Rcl_fileContext, 
    type SectionContext, 
    type Attribute_assignmentContext,
    type ValueContext,
    Primitive_valueContext,
    Type_tagContext,
    ListContext,
    DictionaryContext,
    type Spread_directiveContext,
    Match_blockContext,
    type Simple_transitionContext
} from '@rcl/antlr/dist/generated/RclParser';
import type { RCLNode, RCLASTNode, SourceFileNode } from './astTypes';

class ASTExtractor implements RclParserListener {
    private ast: any = {
        type: 'RclFile',
        sections: []
    };
    private currentSection: any = null;
    private currentParent: any[] = [];

    getAST(): any {
        return this.ast;
    }

    enterRcl_file?(_ctx: Rcl_fileContext): void {
        this.currentParent.push(this.ast);
    }

    enterSection?(ctx: SectionContext): void {
        const header = ctx.section_header();
        const sectionType = header.LOWER_NAME().text;
        const idNode = header.identifier();
        const id = idNode ? idNode.text : null;
        const stringNode = header.STRING();
        const content = stringNode ? stringNode.text.slice(1, -1) : null; // Remove quotes
        const atomNode = header.ATOM();
        const modifier = atomNode ? atomNode.text : null;
        
        const section: any = {
            type: 'Section',
            sectionType: sectionType,
            id: id,
            attributes: [],
            children: []
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
            const key = ctx.LOWER_NAME().text;
            const value = this.extractValue(ctx.value());
            this.currentSection.attributes.push({ key, value });
        }
    }

    enterSpread_directive?(ctx: Spread_directiveContext): void {
        if (this.currentSection) {
            const spreadId = ctx.IDENTIFIER().text;
            this.currentSection.attributes.push({ 
                key: '...', 
                value: { type: 'Spread', id: spreadId } 
            });
        }
    }

    enterSimple_transition?(ctx: Simple_transitionContext): void {
        if (this.currentSection) {
            const targetValue = this.extractValue(ctx.contextualized_value().value());
            this.currentSection.attributes.push({
                key: '->',
                value: targetValue
            });
        }
    }

    private extractValue(ctx: ValueContext): any {
        const primitiveCtx = ctx.primitive_value();
        if (primitiveCtx) {
            // Handle type tags
            const typeTagCtx = primitiveCtx.type_tag();
            if (typeTagCtx) {
                const typeNode = typeTagCtx.TT_TYPE_NAME();
                const contentNodes = typeTagCtx.TT_CONTENT();
                return {
                    type: 'TypeTag',
                    tagType: typeNode ? typeNode.text : '',
                    content: contentNodes && contentNodes.length > 0 ? contentNodes[0].text : null,
                    modifier: contentNodes && contentNodes.length > 1 ? contentNodes[1].text : null
                };
            }

            // Handle other primitive values
            const stringNode = primitiveCtx.STRING();
            if (stringNode) {
                const text = stringNode.text;
                return { type: 'String', value: text.slice(1, -1) }; // Remove quotes
            }
            const numberNode = primitiveCtx.NUMBER();
            if (numberNode) return { type: 'Number', value: Number(numberNode.text) };
            const boolNode = primitiveCtx.BOOLEAN();
            if (boolNode) return { type: 'Boolean', value: boolNode.text === 'true' };
            const atomNode = primitiveCtx.ATOM();
            if (atomNode) return { type: 'Atom', value: atomNode.text };
        }

        // Handle other value types
        const identNode = ctx.IDENTIFIER();
        if (identNode) return { type: 'Identifier', value: identNode.text };
        const varAccess = ctx.variable_access();
        if (varAccess) return { type: 'Variable', value: varAccess.text };
        const parenListNode = ctx.parentheses_list();
        if (parenListNode) return { type: 'List', items: [] }; // TODO: extract list items
        const dictNode = ctx.dictionary();
        if (dictNode) return { type: 'Dictionary', entries: {} }; // TODO: extract dict entries

        return { type: 'Unknown', value: ctx.text };
    }
}

export class ANTLRParserCore {
    async parse(text: string): Promise<RCLASTNode> {
        const inputStream = CharStreams.fromString(text);
        const lexer = new RclLexer(inputStream);
        const tokenStream = new CommonTokenStream(lexer);
        const parser = new RclParser(tokenStream);
        
        // Collect errors
        const errors: string[] = [];
        parser.removeErrorListeners();
        parser.addErrorListener({
            syntaxError: (_recognizer, _offendingSymbol, line, column, msg, _error) => {
                errors.push(`Line ${line}:${column} ${msg}`);
            }
        });
        
        const tree = parser.rcl_file();
        
        // Extract AST
        const listener = new ASTExtractor();
        ParseTreeWalker.DEFAULT.walk(listener as any, tree);
        const ast = listener.getAST();
        
        // Convert to RCLASTNode format
        return this.convertToRCLASTNode(ast);
    }

    private convertToRCLASTNode(node: any): RCLASTNode {
        const sourceFile: SourceFileNode = {
            type: 'source_file',
            text: '',
            startPosition: { row: 0, column: 0 },
            endPosition: { row: 0, column: 0 },
            children: []
        };

        // Convert sections
        if (node.sections) {
            sourceFile.children = node.sections.map((s: any) => this.convertSectionToRCLNode(s));
        }

        return sourceFile;
    }

    private convertSectionToRCLNode(section: any): RCLNode {
        const rclNode: RCLNode = {
            type: section.sectionType,
            text: section.id || section.sectionType,
            startPosition: { row: 0, column: 0 },
            endPosition: { row: 0, column: 0 },
            children: []
        };

        // Add content as a child if present
        if (section.content) {
            rclNode.children?.push({
                type: 'content',
                text: section.content,
                startPosition: rclNode.startPosition,
                endPosition: rclNode.endPosition,
                children: []
            });
        }

        // Convert attributes to children
        if (section.attributes) {
            for (const attr of section.attributes) {
                rclNode.children?.push({
                    type: 'attribute',
                    text: `${attr.key}: ${this.valueToText(attr.value)}`,
                    startPosition: rclNode.startPosition,
                    endPosition: rclNode.endPosition,
                    children: []
                });
            }
        }

        // Convert child sections
        if (section.children) {
            for (const child of section.children) {
                rclNode.children?.push(this.convertSectionToRCLNode(child));
            }
        }

        return rclNode;
    }

    private valueToText(value: any): string {
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'boolean') return value.toString();
        if (value && value.value !== undefined) return String(value.value);
        return JSON.stringify(value);
    }
}