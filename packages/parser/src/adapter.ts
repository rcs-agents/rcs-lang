/**
 * Adapter to convert ANTLR parse tree to the formal AST structure
 */

import type { RclFile } from '@rcs-lang/ast';
import type { Diagnostic, IParserAdapter, Result } from '@rcs-lang/core';
import { ParserRuleContext, ErrorNode, ParseTree } from 'antlr4ng';
import { ASTVisitor } from './ast-visitor';

export class AntlrAdapter implements IParserAdapter<ParseTree> {
  convertToAST(parseTree: ParseTree, source: string): Result<RclFile> {
    try {
      const visitor = new ASTVisitor(source);
      const ast = visitor.visit(parseTree);

      if (!ast || ast.type !== 'RclFile') {
        return {
          success: false,
          error: new Error('Failed to convert parse tree to AST'),
        };
      }

      return {
        success: true,
        value: ast as RclFile,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  extractDiagnostics(parseTree: ParseTree, source: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    // Walk the tree looking for error nodes
    this.walkTree(parseTree, (node) => {
      if (node instanceof ErrorNode) {
        const ctx = node.parent as ParserRuleContext | null;
        if (ctx && ctx.start && ctx.stop) {
          diagnostics.push({
            severity: 'error',
            message: 'Syntax error in parsing',
            range: {
              start: {
                line: ctx.start.line - 1,
                character: ctx.start.column,
              },
              end: {
                line: ctx.stop.line - 1,
                character: ctx.stop.column + (ctx.stop.text?.length || 0),
              },
            },
            source: 'antlr-parser',
          });
        }
      }
    });

    return diagnostics;
  }

  getParserType(): string {
    return 'antlr';
  }

  hasErrors(parseTree: ParseTree): boolean {
    let hasError = false;

    this.walkTree(parseTree, (node) => {
      if (node instanceof ErrorNode) {
        hasError = true;
        return false; // Stop walking
      }
      return true; // Continue walking
    });

    return hasError;
  }

  private walkTree(node: ParseTree, visitor: (node: ParseTree) => boolean | void): void {
    const shouldContinue = visitor(node);
    if (shouldContinue === false) {
      return;
    }

    for (let i = 0; i < node.getChildCount(); i++) {
      const child = node.getChild(i);
      if (child) {
        this.walkTree(child, visitor);
      }
    }
  }
}
