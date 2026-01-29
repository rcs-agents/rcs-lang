# @rcs-lang/diagram

Interactive diagram component for visualizing RCL (Rich Communication Language) conversation flows using Sprotty.

## Overview

This package provides a sophisticated diagramming solution for RCL flows. It creates interactive, web-based diagrams that help developers visualize conversation flows, state transitions, and message patterns in RCL agents.

## Features

- 🎨 **Interactive Diagrams** - Click, hover, and navigate through flow states
- 🔄 **Real-time Updates** - Diagrams update as RCL code changes
- 📱 **Responsive Layout** - Automatic layout with ELK.js
- 🎯 **Flow Visualization** - Clear representation of states and transitions
- 🔍 **Zoom & Pan** - Navigate large diagrams easily
- 🎨 **Customizable Styling** - Themes and custom CSS support
- 📝 **Context Information** - Rich tooltips and state details

## Installation

```bash
npm install @rcs-lang/diagram
```

## Quick Start

### Basic Usage

```typescript
import { DiagramRenderer } from '@rcs-lang/diagram';

const renderer = new DiagramRenderer({
  container: document.getElementById('diagram-container'),
  theme: 'default'
});

// Render a flow diagram
await renderer.renderFlow(flowDefinition);
```

### With RCL Compiler Integration

```typescript
import { RCLCompiler } from '@rcs-lang/compiler';
import { DiagramRenderer } from '@rcs-lang/diagram';

const compiler = new RCLCompiler();
const renderer = new DiagramRenderer({
  container: document.getElementById('diagram')
});

const result = await compiler.compile(rclSource);
if (result.success) {
  await renderer.renderFromCompilation(result.output);
}
```

## Diagram Types

### Flow Diagrams

Visualize conversation flows with states and transitions:

```typescript
import { FlowDiagramRenderer } from '@rcs-lang/diagram';

const flowRenderer = new FlowDiagramRenderer({
  container: document.getElementById('flow-diagram'),
  layout: 'hierarchical', // or 'force', 'layered'
  showTransitionLabels: true,
  highlightStartState: true
});

await flowRenderer.render(flowData);
```

### Message Flow Diagrams

Show how messages flow between states:

```typescript
import { MessageFlowRenderer } from '@rcs-lang/diagram';

const messageRenderer = new MessageFlowRenderer({
  container: document.getElementById('message-flow'),
  showMessageContent: true,
  groupByType: true
});

await messageRenderer.render(messageFlowData);
```

### Overview Diagrams

High-level view of entire agent structure:

```typescript
import { OverviewRenderer } from '@rcs-lang/diagram';

const overviewRenderer = new OverviewRenderer({
  container: document.getElementById('overview'),
  showFlowSummary: true,
  compactMode: true
});

await overviewRenderer.render(agentData);
```

## Configuration

### Renderer Options

```typescript
interface DiagramOptions {
  // Container
  container: HTMLElement;
  width?: number;
  height?: number;
  
  // Theme and styling
  theme?: 'default' | 'dark' | 'light' | 'minimal';
  customCSS?: string;
  
  // Layout
  layout?: 'hierarchical' | 'force' | 'layered' | 'circular';
  layoutOptions?: LayoutOptions;
  
  // Interaction
  enablePanZoom?: boolean;
  enableSelection?: boolean;
  enableTooltips?: boolean;
  
  // Display options
  showLabels?: boolean;
  showMinimap?: boolean;
  showGrid?: boolean;
  
  // Callbacks
  onNodeClick?: (node: DiagramNode) => void;
  onEdgeClick?: (edge: DiagramEdge) => void;
  onSelectionChange?: (selection: string[]) => void;
}
```

### Layout Configuration

```typescript
const layoutOptions = {
  hierarchical: {
    direction: 'DOWN', // 'UP', 'DOWN', 'LEFT', 'RIGHT'
    spacing: {
      node: 50,
      rank: 80
    }
  },
  force: {
    linkDistance: 100,
    chargeStrength: -300,
    iterations: 300
  }
};

const renderer = new DiagramRenderer({
  container: element,
  layout: 'hierarchical',
  layoutOptions
});
```

## Styling and Themes

### Built-in Themes

```typescript
// Light theme (default)
const renderer = new DiagramRenderer({
  container: element,
  theme: 'light'
});

// Dark theme
const renderer = new DiagramRenderer({
  container: element,
  theme: 'dark'
});

// Minimal theme
const renderer = new DiagramRenderer({
  container: element,
  theme: 'minimal'
});
```

### Custom Styling

```typescript
import '@rcs-lang/diagram/styles/diagram.css';

// Custom CSS
const customCSS = `
  .rcl-state-node {
    fill: #3498db;
    stroke: #2980b9;
  }
  
  .rcl-start-state {
    fill: #2ecc71;
  }
  
  .rcl-transition-edge {
    stroke: #95a5a6;
    stroke-width: 2;
  }
`;

const renderer = new DiagramRenderer({
  container: element,
  customCSS
});
```

### CSS Classes

The diagram generates semantic CSS classes:

```css
/* Nodes */
.rcl-node { /* Base node styling */ }
.rcl-state-node { /* Flow states */ }
.rcl-message-node { /* Message nodes */ }
.rcl-start-state { /* Start state */ }
.rcl-end-state { /* End states */ }

/* Edges */
.rcl-edge { /* Base edge styling */ }
.rcl-transition-edge { /* State transitions */ }
.rcl-message-edge { /* Message references */ }

/* Labels */
.rcl-node-label { /* Node labels */ }
.rcl-edge-label { /* Edge labels */ }

/* Interactive states */
.rcl-node:hover { /* Hover effects */ }
.rcl-node.selected { /* Selected elements */ }
```

## Advanced Features

### Real-time Updates

```typescript
const renderer = new DiagramRenderer({
  container: element,
  enableRealTimeUpdates: true
});

// Watch for changes
renderer.onRCLChange((newSource) => {
  const result = compiler.compile(newSource);
  if (result.success) {
    renderer.updateDiagram(result.output);
  }
});
```

### Export Capabilities

```typescript
// Export as SVG
const svgString = await renderer.exportSVG();

// Export as PNG
const pngBlob = await renderer.exportPNG({
  width: 1200,
  height: 800,
  scale: 2
});

// Export diagram data
const diagramData = renderer.exportData();
```

### Interactive Navigation

```typescript
const renderer = new DiagramRenderer({
  container: element,
  enableNavigation: true
});

// Navigate to specific states
renderer.navigateToState('WelcomeState');

// Highlight paths
renderer.highlightPath(['Start', 'Menu', 'OrderFlow']);

// Focus on subflow
renderer.focusOnFlow('OrderingFlow');
```

## Integration Examples

### VSCode Extension

```typescript
import { DiagramRenderer } from '@rcs-lang/diagram';

class RCLDiagramProvider {
  private renderer: DiagramRenderer;
  
  constructor(private webview: vscode.Webview) {
    this.renderer = new DiagramRenderer({
      container: document.getElementById('diagram'),
      theme: 'dark' // Match VSCode theme
    });
  }
  
  async updateDiagram(rclSource: string) {
    const result = await compiler.compile(rclSource);
    if (result.success) {
      await this.renderer.renderFromCompilation(result.output);
    }
  }
}
```

### Web IDE

```typescript
import { DiagramRenderer } from '@rcs-lang/diagram';

class WebIDEDiagramPanel {
  private renderer: DiagramRenderer;
  
  constructor(container: HTMLElement) {
    this.renderer = new DiagramRenderer({
      container,
      enablePanZoom: true,
      enableTooltips: true,
      onNodeClick: (node) => {
        this.navigateToCode(node.sourceLocation);
      }
    });
  }
  
  private navigateToCode(location: SourceLocation) {
    // Jump to corresponding RCL code
    editor.setPosition(location.line, location.character);
  }
}
```

### Documentation Generator

```typescript
import { DiagramRenderer } from '@rcs-lang/diagram';

async function generateDocumentation(rclFiles: string[]) {
  const diagrams = [];
  
  for (const file of rclFiles) {
    const result = await compiler.compileFile(file);
    if (result.success) {
      const renderer = new DiagramRenderer({
        container: createTempContainer(),
        theme: 'minimal'
      });
      
      await renderer.renderFromCompilation(result.output);
      const svg = await renderer.exportSVG();
      
      diagrams.push({
        file,
        diagram: svg
      });
    }
  }
  
  return diagrams;
}
```

## Browser Compatibility

The diagram component works in modern browsers:

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

For older browsers, include polyfills:

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
```

## Performance

The diagram renderer is optimized for large flows:

- **Virtualization** - Only render visible elements
- **Lazy loading** - Load diagram data on demand
- **Efficient updates** - Incremental rendering
- **Memory management** - Cleanup unused resources

```typescript
const renderer = new DiagramRenderer({
  container: element,
  performance: {
    enableVirtualization: true,
    maxVisibleNodes: 100,
    lazyLoading: true
  }
});
```

## Contributing

See the main repository README for contribution guidelines.

## License

MIT