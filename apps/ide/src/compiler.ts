interface CompilationResult {
  success: boolean;
  jsCode?: string;
  jsonOutput?: any;
  agentConfig?: any;
  errors?: string[];
  warnings?: string[];
  flowData?: any;
  d2Diagram?: string;
}

interface ParsedAgent {
  name: string;
  displayName: string;
  attributes: Map<string, any>;
}

interface ParsedMessage {
  name: string;
  type: string;
  content: any;
  suggestions?: any[];
}

interface ParsedFlow {
  name: string;
  states: Map<string, ParsedState>;
}

interface ParsedState {
  name: string;
  message?: string;
  transitions: Map<string, string | { target: string; context?: any }>;
}

export class RCLCompiler {
  private parser: any;
  private compiler: any;
  private jsGenerator: any;
  private d2Generator: any;
  private initialized = false;

  constructor() {
    console.log('🔧 RCL Compiler initialized');
  }

  async initialize() {
    if (!this.initialized) {
      const compiler = await import('@rcs-lang/compiler');

      // Create compilation pipeline
      const {
        RCLCompiler,
        CompilationPipeline,
        ParseStage,
        ValidateStage,
        TransformStage,
        JavaScriptGenerator,
        D2Generator,
      } = compiler;

      const pipeline = new CompilationPipeline();
      pipeline.addStage(new ParseStage());
      pipeline.addStage(new ValidateStage());
      pipeline.addStage(new TransformStage());

      this.compiler = new RCLCompiler(pipeline);
      this.jsGenerator = new JavaScriptGenerator();
      this.d2Generator = new D2Generator({ includeStyles: true });

      this.initialized = true;
    }
  }

  async compile(content: string): Promise<CompilationResult> {
    try {
      console.log('📋 Compiling RCL content...');

      // Initialize if not already done
      if (!this.initialized) {
        await this.initialize();
      }

      // Use the modern compiler directly with source content
      const compileResult = await this.compiler.compile({
        source: content,
        uri: 'ide://current.rcl',
      });

      if (!compileResult.success) {
        return {
          success: false,
          errors: [compileResult.error.message],
          warnings: [],
        };
      }

      const result = compileResult.value;

      if (!result.success) {
        return {
          success: false,
          errors: result.diagnostics
            .filter((d) => d.severity === 'error')
            .map((d) => `Line ${(d.range?.start.line || 0) + 1}: ${d.message}`),
          warnings: result.diagnostics
            .filter((d) => d.severity === 'warning')
            .map((d) => `Line ${(d.range?.start.line || 0) + 1}: ${d.message}`),
        };
      }

      // Extract outputs from compilation result
      const jsonOutput = result.output || {};

      // Generate JavaScript code using the standard generator
      const jsCode = this.jsGenerator.generate(jsonOutput, 'current.rcl');

      // Extract agent config
      const agentConfig = this.extractAgentConfig(jsonOutput);

      // Extract flow data from compiled output for diagram
      const flowData = this.extractFlowDataFromOutput(jsonOutput);

      // Generate D2 diagram
      const d2Diagram = this.d2Generator.generate(jsonOutput);

      return {
        success: true,
        jsCode,
        jsonOutput,
        agentConfig,
        flowData,
        d2Diagram,
        warnings: result.diagnostics
          .filter((d) => d.severity === 'warning')
          .map((d) => `Line ${(d.range?.start.line || 0) + 1}: ${d.message}`),
      };
    } catch (error) {
      console.error('Compilation error:', error);
      return {
        success: false,
        errors: [(error as Error).message],
      };
    }
  }

  private extractAgentConfig(jsonOutput: any): any {
    return {
      rcsBusinessMessagingAgent: jsonOutput.agent?.rcsBusinessMessagingAgent || {},
      defaults: {
        fallbackMessage: "I didn't understand that. Please choose from the available options.",
        messageTrafficType: 'promotion',
      },
      metadata: {
        name: jsonOutput.agent?.name || 'Unknown',
        displayName: jsonOutput.agent?.displayName || '',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        compiler: 'RCL IDE v0.1.0',
      },
    };
  }

  private extractFlowDataFromOutput(jsonOutput: any): any {
    const flowData: any = {
      nodes: [],
      edges: [],
    };

    if (!jsonOutput.flows) {
      return flowData;
    }

    let nodeId = 0;
    const nodeMap = new Map<string, number>();

    // Process each flow
    Object.entries(jsonOutput.flows).forEach(([flowName, flow]: [string, any], flowIndex) => {
      const states = flow.states || {};
      const x = 50;
      const y = 50 + flowIndex * 400; // Separate flows vertically
      const spacing = 200;

      // Create nodes for each state
      Object.entries(states).forEach(([stateName, state]: [string, any], i) => {
        const id = nodeId++;
        nodeMap.set(`${flowName}.${stateName}`, id);

        // Calculate position for simple grid layout
        const position = {
          x: x + (i % 4) * spacing,
          y: y + Math.floor(i / 4) * spacing,
        };

        // Determine node type
        let nodeType = 'message';
        if (flow.initial === stateName) {
          nodeType = 'start';
        } else if (!state.on || Object.keys(state.on).length === 0) {
          nodeType = 'end';
        }

        flowData.nodes.push({
          id: id.toString(),
          position,
          data: {
            label: stateName,
            message: state.messageId || stateName,
            flow: flowName,
          },
          type: nodeType,
        });
      });

      // Create edges for transitions
      Object.entries(states).forEach(([stateName, state]: [string, any]) => {
        const fromId = nodeMap.get(`${flowName}.${stateName}`);

        if (state.on) {
          Object.entries(state.on).forEach(([trigger, target]: [string, any]) => {
            const targetState = typeof target === 'string' ? target : target.target;
            const toId = nodeMap.get(`${flowName}.${targetState}`);

            if (fromId !== undefined && toId !== undefined) {
              flowData.edges.push({
                id: `edge-${fromId}-${toId}-${trigger}`,
                source: fromId.toString(),
                target: toId.toString(),
                data: {
                  label: trigger === 'default' ? 'default' : trigger,
                },
                type: trigger === 'default' ? 'default' : 'normal',
              });
            }
          });
        }
      });
    });

    return flowData;
  }
}
