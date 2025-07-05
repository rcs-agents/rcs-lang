import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver/node';
import { RCLDocument } from '../types/rclTypes';
import { RCLASTNode } from '../types/astTypes';
import { ASTWalker } from './astWalker';

export class SyntaxValidator {
  
  public validateDocument(document: RCLDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    
    if (!document.ast) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
        message: 'Failed to parse document',
        source: 'rcl'
      });
      return diagnostics;
    }
    
    // Run all syntax validation rules
    diagnostics.push(...this.validateAgentDefinitions(document));
    diagnostics.push(...this.validateFlowDefinitions(document));
    diagnostics.push(...this.validateMessageDefinitions(document));
    diagnostics.push(...this.validateImports(document));
    diagnostics.push(...this.validateExpressions(document));
    diagnostics.push(...this.validateTypeErrors(document));
    
    return diagnostics;
  }

  private validateAgentDefinitions(document: RCLDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const agentNodes = ASTWalker.findNodesByType(document.ast!, 'agent_definition');
    
    if (agentNodes.length === 0) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
        message: 'RCL document must contain at least one agent definition',
        source: 'rcl'
      });
    }
    
    if (agentNodes.length > 1) {
      agentNodes.slice(1).forEach(node => {
        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: this.nodeToRange(node),
          message: 'Multiple agent definitions are not allowed in a single file',
          source: 'rcl'
        });
      });
    }
    
    // Validate agent structure
    agentNodes.forEach(agent => {
      this.validateAgentStructure(agent, diagnostics);
    });
    
    return diagnostics;
  }

  private validateAgentStructure(agent: RCLASTNode, diagnostics: Diagnostic[]): void {
    // Check for required displayName
    const hasDisplayName = ASTWalker.findFirstNode(agent, (node) => 
      node.type === 'parameter' && this.getParameterKey(node) === 'displayName'
    );
    
    if (!hasDisplayName) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: this.nodeToRange(agent),
        message: 'Agent should have a displayName',
        source: 'rcl'
      });
    }
    
    // Check for at least one flow
    const flows = ASTWalker.findNodesByType(agent, 'flow_definition');
    if (flows.length === 0) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: this.nodeToRange(agent),
        message: 'Agent should have at least one flow',
        source: 'rcl'
      });
    }
  }

  private validateFlowDefinitions(document: RCLDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const flowNodes = ASTWalker.findNodesByType(document.ast!, 'flow_definition');
    
    flowNodes.forEach(flow => {
      this.validateFlowStructure(flow, diagnostics);
    });
    
    return diagnostics;
  }

  private validateFlowStructure(flow: RCLASTNode, diagnostics: Diagnostic[]): void {
    // Check for start state
    const hasStartState = ASTWalker.findFirstNode(flow, (node) => 
      node.type === 'state_definition' && this.isStartState(node)
    );
    
    if (!hasStartState) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: this.nodeToRange(flow),
        message: 'Flow should have a start state (:start)',
        source: 'rcl'
      });
    }
    
    // Validate state transitions
    const transitions = ASTWalker.findNodesByType(flow, 'transition');
    transitions.forEach(transition => {
      this.validateTransition(transition, flow, diagnostics);
    });
  }

  private validateTransition(transition: RCLASTNode, flow: RCLASTNode, diagnostics: Diagnostic[]): void {
    // Extract from and to states from transition
    const fromState = this.getTransitionFromState(transition);
    const toState = this.getTransitionToState(transition);
    
    if (fromState && toState) {
      // Check if referenced states exist
      const states = ASTWalker.findNodesByType(flow, 'state_definition');
      const stateNames = states.map(s => this.getStateName(s));
      
      if (!stateNames.includes(fromState)) {
        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: this.nodeToRange(transition),
          message: `Referenced state '${fromState}' does not exist`,
          source: 'rcl'
        });
      }
      
      if (!stateNames.includes(toState)) {
        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: this.nodeToRange(transition),
          message: `Referenced state '${toState}' does not exist`,
          source: 'rcl'
        });
      }
    }
  }

  private validateMessageDefinitions(document: RCLDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const messageNodes = ASTWalker.findNodesByType(document.ast!, 'message_definition');
    
    messageNodes.forEach(message => {
      this.validateMessageStructure(message, diagnostics);
    });
    
    return diagnostics;
  }

  private validateMessageStructure(message: RCLASTNode, diagnostics: Diagnostic[]): void {
    // Check for required content
    const hasContent = ASTWalker.findFirstNode(message, (node) => 
      node.type === 'string' || node.type === 'multiline_string'
    );
    
    if (!hasContent) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: this.nodeToRange(message),
        message: 'Message should have content',
        source: 'rcl'
      });
    }
  }

  private validateImports(document: RCLDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    
    document.imports.forEach(importInfo => {
      if (!importInfo.resolved) {
        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: importInfo.range,
          message: `Cannot resolve import '${importInfo.path}'`,
          source: 'rcl'
        });
      }
    });
    
    return diagnostics;
  }

  private validateExpressions(document: RCLDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const expressions = ASTWalker.findNodesByType(document.ast!, 'expression');
    
    expressions.forEach(expr => {
      this.validateExpression(expr, diagnostics);
    });
    
    return diagnostics;
  }

  private validateExpression(expr: RCLASTNode, diagnostics: Diagnostic[]): void {
    // Basic syntax validation for embedded expressions
    const code = this.getExpressionCode(expr);
    
    if (!code || code.trim().length === 0) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: this.nodeToRange(expr),
        message: 'Expression should not be empty',
        source: 'rcl'
      });
    }
    
    // Check for common syntax errors
    if (code.includes('${') && !code.includes('}')) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: this.nodeToRange(expr),
        message: 'Unclosed template literal',
        source: 'rcl'
      });
    }
  }

  private validateTypeErrors(document: RCLDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    
    // Validate type tags
    const typeTags = ASTWalker.findNodesByType(document.ast!, 'type_tag');
    typeTags.forEach(tag => {
      this.validateTypeTag(tag, diagnostics);
    });
    
    return diagnostics;
  }

  private validateTypeTag(tag: RCLASTNode, diagnostics: Diagnostic[]): void {
    const tagType = this.getTypeTagType(tag);
    const value = this.getTypeTagValue(tag);
    
    if (!tagType) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: this.nodeToRange(tag),
        message: 'Type tag must specify a type',
        source: 'rcl'
      });
      return;
    }
    
    // Validate specific type formats
    switch (tagType) {
      case 'phone':
        if (!this.isValidPhoneNumber(value)) {
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: this.nodeToRange(tag),
            message: 'Invalid phone number format',
            source: 'rcl'
          });
        }
        break;
      case 'email':
        if (!this.isValidEmail(value)) {
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: this.nodeToRange(tag),
            message: 'Invalid email format',
            source: 'rcl'
          });
        }
        break;
      case 'url':
        if (!this.isValidURL(value)) {
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: this.nodeToRange(tag),
            message: 'Invalid URL format',
            source: 'rcl'
          });
        }
        break;
    }
  }

  // Helper methods
  private nodeToRange(node: RCLASTNode): Range {
    return {
      start: { line: node.startPosition.row, character: node.startPosition.column },
      end: { line: node.endPosition.row, character: node.endPosition.column }
    };
  }

  private getParameterKey(node: RCLASTNode): string {
    // Extract parameter key from parameter node
    return 'name' in node ? node.name as string : '';
  }

  private isStartState(node: RCLASTNode): boolean {
    // Check if state is marked as start state
    return node.text.includes(':start');
  }

  private getTransitionFromState(node: RCLASTNode): string | null {
    // Extract from state from transition
    const match = node.text.match(/(\w+)\s*->/);
    return match ? match[1] : null;
  }

  private getTransitionToState(node: RCLASTNode): string | null {
    // Extract to state from transition
    const match = node.text.match(/->\s*(\w+)/);
    return match ? match[1] : null;
  }

  private getStateName(node: RCLASTNode): string {
    // Extract state name
    return 'name' in node ? node.name as string : '';
  }

  private getExpressionCode(node: RCLASTNode): string {
    // Extract code from expression node
    return node.text.replace(/^\$[^>]*>\s*/, '');
  }

  private getTypeTagType(node: RCLASTNode): string | null {
    // Extract type from type tag
    const match = node.text.match(/<(\w+)/);
    return match ? match[1] : null;
  }

  private getTypeTagValue(node: RCLASTNode): string {
    // Extract value from type tag
    const match = node.text.match(/<\w+\|([^>]+)>/);
    return match ? match[1] : '';
  }

  private isValidPhoneNumber(value: string): boolean {
    // Basic phone number validation
    return /^\+?[1-9]\d{1,14}$/.test(value.replace(/\s/g, ''));
  }

  private isValidEmail(value: string): boolean {
    // Basic email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private isValidURL(value: string): boolean {
    // Basic URL validation
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
}