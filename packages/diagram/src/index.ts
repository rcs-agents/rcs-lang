// Main entry point for @rcl/diagram package

// Export the main diagram engine
export { RCLDiagramEngine } from './diagram';

// Export all types
export * from './types';

// Export layout functionality
export { LayoutEngine } from './layout';

// Export edge management
export { EdgeLayoutManager, edgeLayoutManager } from './edges';

// Export node implementations
export {
  RCLNodeImpl,
  MatchBlockNode,
  MatchOptionNode,
  NodeFactory,
  ConnectionValidator,
  NodeConnectionPoints,
} from './nodes';

// Export property management
export {
  PropertyEditor,
  PropertyManager,
} from './properties';

// Export views
export { RCLNodeView, RCLEdgeView, RCLRoutingHandleView } from './views';

// Export code generation
export { RCLCodeGenerator } from './codeGenerator';

// Export legacy web diagram for compatibility
export { RCLWebDiagram } from './web-diagram.js';
