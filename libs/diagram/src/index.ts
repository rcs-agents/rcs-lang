// Main entry point for @rcs-lang/diagram package

// Export the main diagram engine
export { RCLDiagramEngine } from './diagram.js';

// Export all types
export * from './types.js';

// Export layout functionality
export { LayoutEngine } from './layout.js';

// Export edge management
export { EdgeLayoutManager, edgeLayoutManager } from './edges.js';

// Export node implementations
export {
  RCLNodeImpl,
  MatchBlockNode,
  MatchOptionNode,
  NodeFactory,
  ConnectionValidator,
  NodeConnectionPoints,
} from './nodes.js';

// Export property management
export {
  PropertyEditor,
  PropertyManager,
} from './properties.js';

// Export views
export { RCLNodeView, RCLEdgeView, RCLRoutingHandleView } from './views.js';

// Export code generation
export { RCLCodeGenerator } from './codeGenerator.js';

// Export legacy web diagram for compatibility
export { RCLWebDiagram } from './web-diagram.js';
