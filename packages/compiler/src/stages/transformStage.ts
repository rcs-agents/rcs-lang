import { Result, ok, err } from '@rcl/core-types';
import { ICompilationStage, IASTNode, ICompilationOutput } from '@rcl/core-interfaces';

interface TransformInput {
  ast: IASTNode;
  diagnostics?: any[];
  validationFailed?: boolean;
}

/**
 * Transform stage - converts AST to output format
 */
export class TransformStage implements ICompilationStage {
  readonly name = 'transform';
  
  async process(input: TransformInput): Promise<Result<any>> {
    try {
      // Don't transform if validation failed
      if (input.validationFailed) {
        return ok(input);
      }
      
      if (!input.ast) {
        return err(new Error('No AST provided to transform stage'));
      }
      
      // Transform AST to output structure
      const output = this.transformAST(input.ast);
      
      return ok({
        ...input,
        output
      });
    } catch (error) {
      return err(new Error(`Transform stage failed: ${error}`));
    }
  }
  
  private transformAST(ast: IASTNode): ICompilationOutput {
    const output: ICompilationOutput = {
      agent: {},
      messages: {},
      flows: {}
    };
    
    // Find agent definition
    const agentNode = ast.find(node => node.type === 'agent_definition');
    if (agentNode) {
      output.agent = this.transformAgent(agentNode);
    }
    
    // Find messages
    const messagesNode = ast.find(node => node.type === 'messages_section');
    if (messagesNode) {
      output.messages = this.transformMessages(messagesNode);
    }
    
    // Find flows
    const flowNodes = ast.findAll(node => node.type === 'flow_section');
    for (const flowNode of flowNodes) {
      const flowName = this.getFlowName(flowNode);
      if (flowName) {
        output.flows[flowName] = this.transformFlow(flowNode);
      }
    }
    
    return output;
  }
  
  private transformAgent(agentNode: IASTNode): any {
    const agent: any = {};
    
    // Extract agent name
    const nameNode = agentNode.children?.find(child => child.type === 'identifier');
    if (nameNode?.text) {
      agent.name = nameNode.text;
    }
    
    // Extract displayName
    const displayNameNode = agentNode.find(node => node.type === 'string' && !!node.range);
    if (displayNameNode?.text) {
      agent.displayName = this.parseString(displayNameNode.text);
    }
    
    return agent;
  }
  
  private transformMessages(messagesNode: IASTNode): Record<string, any> {
    const messages: Record<string, any> = {};
    
    // Extract message definitions
    const messageNodes = messagesNode.findAll(node => 
      node.type === 'property' || node.type === 'message_definition'
    );
    
    for (const messageNode of messageNodes) {
      const nameNode = messageNode.children?.find(child => 
        child.type === 'identifier' || child.type === 'attribute_key'
      );
      
      if (nameNode?.text) {
        messages[nameNode.text] = this.transformMessage(messageNode);
      }
    }
    
    return messages;
  }
  
  private transformMessage(messageNode: IASTNode): any {
    const message: any = {};
    
    // Extract text
    const textNode = messageNode.find(node => 
      node.type === 'string' && (node.text?.startsWith('"') || false)
    );
    
    if (textNode?.text) {
      message.text = this.parseString(textNode.text);
    }
    
    return message;
  }
  
  private transformFlow(flowNode: IASTNode): any {
    const flow: any = {
      rules: []
    };
    
    // Extract flow rules
    const ruleNodes = flowNode.findAll(node => node.type === 'flow_rule');
    for (const ruleNode of ruleNodes) {
      flow.rules.push(this.transformFlowRule(ruleNode));
    }
    
    return flow;
  }
  
  private transformFlowRule(ruleNode: IASTNode): any {
    // Simple transformation for now
    return {
      from: 'start',
      to: 'end'
    };
  }
  
  private getFlowName(flowNode: IASTNode): string | null {
    const nameNode = flowNode.children?.find(child => child.type === 'identifier');
    return nameNode?.text || null;
  }
  
  private parseString(str: string): string {
    // Remove quotes and handle escapes
    if (str.startsWith('"') && str.endsWith('"')) {
      return str.slice(1, -1).replace(/\\"/g, '"');
    }
    return str;
  }
}