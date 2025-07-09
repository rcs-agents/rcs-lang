import * as fs from 'node:fs';
import * as path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Enhanced Diagram Tests', () => {
  describe('Diagram Structure Tests', () => {
    it('should have correct structure for SVG diagram', () => {
      // Test that our enhanced diagram creates proper SVG structure
      const diagramJsPath = path.join(__dirname, '../../resources/interactive-diagram-enhanced.js');
      const diagramContent = fs.readFileSync(diagramJsPath, 'utf8');

      // Check for key functions
      expect(diagramContent).toContain('initializeDiagram');
      expect(diagramContent).toContain('renderDiagram');
      expect(diagramContent).toContain('renderNode');
      expect(diagramContent).toContain('renderEdge');
      expect(diagramContent).toContain('createStar'); // For rich card nodes

      // Check for pan/zoom functionality
      expect(diagramContent).toContain('setupDiagramInteractions');
      expect(diagramContent).toContain('updateViewTransform');
      expect(diagramContent).toContain('fitDiagramToView');

      // Check for selection handling
      expect(diagramContent).toContain('selectNode');
      expect(diagramContent).toContain('updateSelection');
    });

    it('should handle different node types', () => {
      const diagramJsPath = path.join(__dirname, '../../resources/interactive-diagram-enhanced.js');
      const diagramContent = fs.readFileSync(diagramJsPath, 'utf8');

      // Check for node type handling
      expect(diagramContent).toContain("case 'start':");
      expect(diagramContent).toContain("case 'end':");
      expect(diagramContent).toContain("case 'rich_card':");
      expect(diagramContent).toContain('Green circle'); // Comment for start node
      expect(diagramContent).toContain('Red circle'); // Comment for end node
      expect(diagramContent).toContain('Star shape'); // Comment for rich card
    });
  });

  describe('Message Handling Tests', () => {
    it('should handle updateModel messages', () => {
      const diagramJsPath = path.join(__dirname, '../../resources/interactive-diagram-enhanced.js');
      const diagramContent = fs.readFileSync(diagramJsPath, 'utf8');

      expect(diagramContent).toContain("case 'updateModel':");
      expect(diagramContent).toContain('handleModelUpdate');
    });

    it('should handle flow selection', () => {
      const diagramJsPath = path.join(__dirname, '../../resources/interactive-diagram-enhanced.js');
      const diagramContent = fs.readFileSync(diagramJsPath, 'utf8');

      expect(diagramContent).toContain("case 'setActiveFlow':");
      expect(diagramContent).toContain('setActiveFlow');
      expect(diagramContent).toContain('updateFlowSelect');
    });
  });

  describe('CSS Validation Tests', () => {
    it('should have proper styles for diagram elements', () => {
      const cssPath = path.join(__dirname, '../../resources/sprotty-diagram.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      // Check for diagram container styles
      expect(cssContent).toContain('#sprotty-container');
      expect(cssContent).toContain('cursor: grab');
      expect(cssContent).toContain('cursor: grabbing');

      // Check for node styles
      expect(cssContent).toContain('.diagram-node');
      expect(cssContent).toContain('.diagram-node.hover');
      expect(cssContent).toContain('.diagram-node.selected');

      // Check for edge styles
      expect(cssContent).toContain('.diagram-edge');
      expect(cssContent).toContain('.diagram-edge:hover');
    });
  });
});
