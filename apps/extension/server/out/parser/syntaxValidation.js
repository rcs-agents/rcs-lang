"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntaxValidator = void 0;
const node_1 = require("vscode-languageserver/node");
const astWalker_1 = require("./astWalker");
class SyntaxValidator {
    validateDocument(document) {
        const diagnostics = [];
        if (!document.ast) {
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
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
    validateAgentDefinitions(document) {
        const diagnostics = [];
        const agentNodes = astWalker_1.ASTWalker.findNodesByType(document.ast, 'agent_definition');
        if (agentNodes.length === 0) {
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
                message: 'RCL document must contain at least one agent definition',
                source: 'rcl'
            });
        }
        if (agentNodes.length > 1) {
            agentNodes.slice(1).forEach(node => {
                diagnostics.push({
                    severity: node_1.DiagnosticSeverity.Error,
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
    validateAgentStructure(agent, diagnostics) {
        // Check for required displayName
        const hasDisplayName = astWalker_1.ASTWalker.findFirstNode(agent, (node) => node.type === 'parameter' && this.getParameterKey(node) === 'displayName');
        if (!hasDisplayName) {
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Warning,
                range: this.nodeToRange(agent),
                message: 'Agent should have a displayName',
                source: 'rcl'
            });
        }
        // Check for at least one flow
        const flows = astWalker_1.ASTWalker.findNodesByType(agent, 'flow_definition');
        if (flows.length === 0) {
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Warning,
                range: this.nodeToRange(agent),
                message: 'Agent should have at least one flow',
                source: 'rcl'
            });
        }
    }
    validateFlowDefinitions(document) {
        const diagnostics = [];
        const flowNodes = astWalker_1.ASTWalker.findNodesByType(document.ast, 'flow_definition');
        flowNodes.forEach(flow => {
            this.validateFlowStructure(flow, diagnostics);
        });
        return diagnostics;
    }
    validateFlowStructure(flow, diagnostics) {
        // Check for start state
        const hasStartState = astWalker_1.ASTWalker.findFirstNode(flow, (node) => node.type === 'state_definition' && this.isStartState(node));
        if (!hasStartState) {
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Warning,
                range: this.nodeToRange(flow),
                message: 'Flow should have a start state (:start)',
                source: 'rcl'
            });
        }
        // Validate state transitions
        const transitions = astWalker_1.ASTWalker.findNodesByType(flow, 'transition');
        transitions.forEach(transition => {
            this.validateTransition(transition, flow, diagnostics);
        });
    }
    validateTransition(transition, flow, diagnostics) {
        // Extract from and to states from transition
        const fromState = this.getTransitionFromState(transition);
        const toState = this.getTransitionToState(transition);
        if (fromState && toState) {
            // Check if referenced states exist
            const states = astWalker_1.ASTWalker.findNodesByType(flow, 'state_definition');
            const stateNames = states.map(s => this.getStateName(s));
            if (!stateNames.includes(fromState)) {
                diagnostics.push({
                    severity: node_1.DiagnosticSeverity.Error,
                    range: this.nodeToRange(transition),
                    message: `Referenced state '${fromState}' does not exist`,
                    source: 'rcl'
                });
            }
            if (!stateNames.includes(toState)) {
                diagnostics.push({
                    severity: node_1.DiagnosticSeverity.Error,
                    range: this.nodeToRange(transition),
                    message: `Referenced state '${toState}' does not exist`,
                    source: 'rcl'
                });
            }
        }
    }
    validateMessageDefinitions(document) {
        const diagnostics = [];
        const messageNodes = astWalker_1.ASTWalker.findNodesByType(document.ast, 'message_definition');
        messageNodes.forEach(message => {
            this.validateMessageStructure(message, diagnostics);
        });
        return diagnostics;
    }
    validateMessageStructure(message, diagnostics) {
        // Check for required content
        const hasContent = astWalker_1.ASTWalker.findFirstNode(message, (node) => node.type === 'string' || node.type === 'multiline_string');
        if (!hasContent) {
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Warning,
                range: this.nodeToRange(message),
                message: 'Message should have content',
                source: 'rcl'
            });
        }
    }
    validateImports(document) {
        const diagnostics = [];
        document.imports.forEach(importInfo => {
            if (!importInfo.resolved) {
                diagnostics.push({
                    severity: node_1.DiagnosticSeverity.Error,
                    range: importInfo.range,
                    message: `Cannot resolve import '${importInfo.path}'`,
                    source: 'rcl'
                });
            }
        });
        return diagnostics;
    }
    validateExpressions(document) {
        const diagnostics = [];
        const expressions = astWalker_1.ASTWalker.findNodesByType(document.ast, 'expression');
        expressions.forEach(expr => {
            this.validateExpression(expr, diagnostics);
        });
        return diagnostics;
    }
    validateExpression(expr, diagnostics) {
        // Basic syntax validation for embedded expressions
        const code = this.getExpressionCode(expr);
        if (!code || code.trim().length === 0) {
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Warning,
                range: this.nodeToRange(expr),
                message: 'Expression should not be empty',
                source: 'rcl'
            });
        }
        // Check for common syntax errors
        if (code.includes('${') && !code.includes('}')) {
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
                range: this.nodeToRange(expr),
                message: 'Unclosed template literal',
                source: 'rcl'
            });
        }
    }
    validateTypeErrors(document) {
        const diagnostics = [];
        // Validate type tags
        const typeTags = astWalker_1.ASTWalker.findNodesByType(document.ast, 'type_tag');
        typeTags.forEach(tag => {
            this.validateTypeTag(tag, diagnostics);
        });
        return diagnostics;
    }
    validateTypeTag(tag, diagnostics) {
        const tagType = this.getTypeTagType(tag);
        const value = this.getTypeTagValue(tag);
        if (!tagType) {
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
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
                        severity: node_1.DiagnosticSeverity.Warning,
                        range: this.nodeToRange(tag),
                        message: 'Invalid phone number format',
                        source: 'rcl'
                    });
                }
                break;
            case 'email':
                if (!this.isValidEmail(value)) {
                    diagnostics.push({
                        severity: node_1.DiagnosticSeverity.Warning,
                        range: this.nodeToRange(tag),
                        message: 'Invalid email format',
                        source: 'rcl'
                    });
                }
                break;
            case 'url':
                if (!this.isValidURL(value)) {
                    diagnostics.push({
                        severity: node_1.DiagnosticSeverity.Warning,
                        range: this.nodeToRange(tag),
                        message: 'Invalid URL format',
                        source: 'rcl'
                    });
                }
                break;
        }
    }
    // Helper methods
    nodeToRange(node) {
        return {
            start: { line: node.startPosition.row, character: node.startPosition.column },
            end: { line: node.endPosition.row, character: node.endPosition.column }
        };
    }
    getParameterKey(node) {
        // Extract parameter key from parameter node
        return 'name' in node ? node.name : '';
    }
    isStartState(node) {
        // Check if state is marked as start state
        return node.text.includes(':start');
    }
    getTransitionFromState(node) {
        // Extract from state from transition
        const match = node.text.match(/(\w+)\s*->/);
        return match ? match[1] : null;
    }
    getTransitionToState(node) {
        // Extract to state from transition
        const match = node.text.match(/->\s*(\w+)/);
        return match ? match[1] : null;
    }
    getStateName(node) {
        // Extract state name
        return 'name' in node ? node.name : '';
    }
    getExpressionCode(node) {
        // Extract code from expression node
        return node.text.replace(/^\$[^>]*>\s*/, '');
    }
    getTypeTagType(node) {
        // Extract type from type tag
        const match = node.text.match(/<(\w+)/);
        return match ? match[1] : null;
    }
    getTypeTagValue(node) {
        // Extract value from type tag
        const match = node.text.match(/<\w+\|([^>]+)>/);
        return match ? match[1] : '';
    }
    isValidPhoneNumber(value) {
        // Basic phone number validation
        return /^\+?[1-9]\d{1,14}$/.test(value.replace(/\s/g, ''));
    }
    isValidEmail(value) {
        // Basic email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    isValidURL(value) {
        // Basic URL validation
        try {
            new URL(value);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.SyntaxValidator = SyntaxValidator;
//# sourceMappingURL=syntaxValidation.js.map