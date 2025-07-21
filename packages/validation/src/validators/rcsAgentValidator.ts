import { findNodeByType, findNodesByType, isSection, isAttribute, isIdentifier } from '@rcs-lang/ast';
import type { Section, Attribute } from '@rcs-lang/ast';
import type { Diagnostic, Result, Position, RCLError } from '@rcs-lang/core';
import type { IASTNode, IValidationContext, IValidationResult } from '@rcs-lang/core';
import { RCLErrorFactory, errorToDiagnostic } from '@rcs-lang/core';
import { BaseValidator } from './base.js';

/**
 * Validates RCS agent-specific semantic rules
 */
export class RcsAgentValidator extends BaseValidator {
  constructor() {
    super('rcs-agent-validator');
  }

  async validate(ast: IASTNode, _context?: IValidationContext): Promise<Result<IValidationResult>> {
    const diagnostics: Diagnostic[] = [];

    // Validate AST structure
    if (!ast || ast.type !== 'RclFile') {
      const error = RCLErrorFactory.internalError('Invalid AST structure');
      diagnostics.push(this.createDiagnosticFromError(error));
      return this.createResult(diagnostics);
    }

    // Extract sections from the AST
    const sections = this.extractSections(ast);
    
    // Validate agent section
    const agentSections = sections.filter(s => s.sectionType === 'agent');
    if (agentSections.length === 0) {
      const error = RCLErrorFactory.missingRequiredField('agent section');
      diagnostics.push(this.createDiagnosticFromError(error));
    } else if (agentSections.length > 1) {
      const error = RCLErrorFactory.duplicateDefinition('agent', agentSections[1]);
      diagnostics.push(this.createDiagnosticFromError(error));
    } else {
      // Validate agent properties
      this.validateAgentSection(agentSections[0], diagnostics);
    }

    // Validate flows
    const flowSections = sections.filter(s => s.sectionType === 'flow');
    if (flowSections.length === 0) {
      const error = RCLErrorFactory.missingRequiredField('at least one flow');
      diagnostics.push(this.createDiagnosticFromError(error));
    } else {
      flowSections.forEach(flow => this.validateFlowSection(flow, diagnostics));
    }

    // Validate messages
    const messageSections = sections.filter(s => s.sectionType === 'messages');
    if (messageSections.length === 0) {
      const error = RCLErrorFactory.missingRequiredField('messages section');
      diagnostics.push(this.createDiagnosticFromError(error));
    }

    // Cross-reference validation
    this.validateCrossReferences(sections, diagnostics);

    return this.createResult(diagnostics);
  }

  private extractSections(ast: IASTNode): Section[] {
    // Navigate through the AST structure to find sections
    const rclFile = ast as any;
    
    if (rclFile.sections && Array.isArray(rclFile.sections)) {
      // Check if sections are nested inside agent section
      const allSections: Section[] = [];
      for (const section of rclFile.sections) {
        if (isSection(section)) {
          allSections.push(section);
          // Check for nested sections in body
          if (section.body && Array.isArray(section.body)) {
            const nestedSections = section.body.filter(isSection);
            allSections.push(...nestedSections);
          }
        }
      }
      
      return allSections;
    }
    
    // Try alternative structure
    if (rclFile.node && rclFile.node.sections) {
      const allSections: Section[] = [];
      for (const section of rclFile.node.sections) {
        if (isSection(section)) {
          allSections.push(section);
          // Check for nested sections in body
          if (section.body && Array.isArray(section.body)) {
            const nestedSections = section.body.filter(isSection);
            allSections.push(...nestedSections);
          }
        }
      }
      return allSections;
    }
    
    return [];
  }

  private validateAgentSection(agent: Section, diagnostics: Diagnostic[]) {
    // Check for agent name
    if (!agent.identifier || !agent.identifier.value) {
      const error = RCLErrorFactory.missingIdentifier(
        { line: 0, character: 0 }, 
        'agent'
      );
      diagnostics.push(this.createDiagnosticFromError(error));
      return;
    }

    // Extract attributes
    const attributes = this.extractAttributes(agent);
    const hasDisplayName = attributes.some(attr => attr.key === 'displayName');

    if (!hasDisplayName) {
      const error = RCLErrorFactory.missingDisplayName(agent.identifier.value);
      diagnostics.push(this.createDiagnosticFromError(error));
    }
  }

  private validateFlowSection(flow: Section, diagnostics: Diagnostic[]) {
    // Check for flow name
    if (!flow.identifier || !flow.identifier.value) {
      const error = RCLErrorFactory.missingIdentifier(
        { line: 0, character: 0 },
        'flow'
      );
      diagnostics.push(this.createDiagnosticFromError(error));
      return;
    }

    const flowName = flow.identifier.value;
    const attributes = this.extractAttributes(flow);
    const hasStart = attributes.some(attr => attr.key === 'start');

    if (!hasStart) {
      const error = RCLErrorFactory.missingFlowStart(flowName);
      diagnostics.push(this.createDiagnosticFromError(error));
    }

    // Check for at least one state
    const stateSections = this.extractStateSections(flow);
    if (stateSections.length === 0) {
      const error = RCLErrorFactory.emptyFlowSection(flowName);
      diagnostics.push(this.createDiagnosticFromError(error));
    }
  }

  private validateCrossReferences(sections: Section[], diagnostics: Diagnostic[]) {
    // Validate state references in flows
    const flowSections = sections.filter(s => s.sectionType === 'flow');
    
    flowSections.forEach(flow => {
      if (!flow.identifier) return;
      
      const flowName = flow.identifier.value;
      const attributes = this.extractAttributes(flow);
      const startAttr = attributes.find(attr => attr.key === 'start');
      
      if (startAttr && isIdentifier(startAttr.value)) {
        const startState = startAttr.value.value;
        const states = this.extractStateSections(flow);
        const stateNames = states.map(s => s.identifier?.value).filter(Boolean);
        
        if (!stateNames.includes(startState)) {
          const error = RCLErrorFactory.undefinedStateReference(
            startState,
            flowName,
            this.getNodePosition(startAttr)
          );
          diagnostics.push(this.createDiagnosticFromError(error));
        }
      }

      // Check transitions
      this.validateStateTransitions(flow, flowName, diagnostics);
    });
  }

  private validateStateTransitions(flow: Section, flowName: string, diagnostics: Diagnostic[]) {
    const states = this.extractStateSections(flow);
    const stateNames = new Set(states.map(s => s.identifier?.value).filter(Boolean));

    states.forEach(state => {
      // Look for transitions in state body
      const transitions = this.extractTransitions(state);
      
      transitions.forEach(targetState => {
        if (!stateNames.has(targetState)) {
          const error = RCLErrorFactory.undefinedStateReference(
            targetState,
            flowName
          );
          diagnostics.push(this.createDiagnosticFromError(error));
        }
      });
    });
  }

  private extractAttributes(section: Section): Attribute[] {
    if (!section.body || !Array.isArray(section.body)) return [];
    return section.body.filter(isAttribute);
  }

  private extractStateSections(flow: Section): Section[] {
    if (!flow.body || !Array.isArray(flow.body)) return [];
    return flow.body.filter(isSection).filter(s => s.sectionType === 'on');
  }

  private extractTransitions(state: Section): string[] {
    const transitions: string[] = [];
    
    if (!state.body || !Array.isArray(state.body)) return transitions;

    // Look for direct transitions (-> TargetState)
    state.body.forEach(element => {
      // Check if element is a value type and specifically an identifier
      if (typeof element === 'object' && 'type' in element && element.type === 'Identifier') {
        const identifier = element as any;
        if (identifier.value) {
          transitions.push(identifier.value);
        }
      }
      // Look for attributes that represent transitions
      if (isAttribute(element)) {
        const value = element.value;
        if (typeof value === 'object' && 'value' in value && typeof value.value === 'string') {
          transitions.push(value.value);
        }
      }
      // Look for match blocks
      if (typeof element === 'object' && 'type' in element && element.type === 'MatchBlock') {
        const matchBlock = element as any;
        if (matchBlock.cases && Array.isArray(matchBlock.cases)) {
          matchBlock.cases.forEach((matchCase: any) => {
            if (matchCase.consequence) {
              // Handle ContextualizedValue
              if (matchCase.consequence.type === 'ContextualizedValue' && matchCase.consequence.value) {
                if (matchCase.consequence.value.type === 'Identifier' && matchCase.consequence.value.value) {
                  transitions.push(matchCase.consequence.value.value);
                }
              }
              // Handle direct Identifier
              else if (matchCase.consequence.type === 'Identifier' && matchCase.consequence.value) {
                transitions.push(matchCase.consequence.value);
              }
            }
          });
        }
      }
    });

    return transitions;
  }

  private getNodePosition(node: any): Position | undefined {
    if (node?.location?.range?.start) {
      return node.location.range.start;
    }
    return undefined;
  }
}

