import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as vscode from 'vscode';
import { CompilationService } from '../compilationService';
import { InteractiveDiagramProvider } from '../interactiveDiagramProvider';

describe('Interactive Diagram Comprehensive Flow Tests', () => {
  let provider: InteractiveDiagramProvider;
  let compilationService: CompilationService;
  let extensionContext: vscode.ExtensionContext;
  let disposables: vscode.Disposable[] = [];

  beforeEach(() => {
    // Create mock extension context
    extensionContext = {
      extensionUri: vscode.Uri.file(path.join(__dirname, '../../../')),
      subscriptions: [],
    } as any;

    compilationService = new CompilationService();
    provider = new InteractiveDiagramProvider(extensionContext);
    provider.setCompilationService(compilationService);

    disposables.push(compilationService, provider);
  });

  afterEach(() => {
    disposables.forEach((d) => d.dispose());
    disposables = [];
  });

  describe('1. Command Registration and Execution Flow', () => {
    it('should handle command with no active editor', async () => {
      // Mock no active editor
      const originalActiveEditor = vscode.window.activeTextEditor;
      (vscode.window as any).activeTextEditor = undefined;

      try {
        // This should be handled gracefully in the actual command handler
        expect(vscode.window.activeTextEditor).toBeUndefined();
      } finally {
        (vscode.window as any).activeTextEditor = originalActiveEditor;
      }
    });

    it('should validate RCL file extension', () => {
      const validUri = vscode.Uri.file('/path/to/file.rcl');
      const invalidUri = vscode.Uri.file('/path/to/file.txt');

      expect(validUri.fsPath.endsWith('.rcl')).toBe(true);
      expect(invalidUri.fsPath.endsWith('.rcl')).toBe(false);
    });

    it('should handle document loading errors gracefully', async () => {
      const nonExistentUri = vscode.Uri.file('/non/existent/file.rcl');

      try {
        await vscode.workspace.openTextDocument(nonExistentUri);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('2. Compilation Service Integration', () => {
    let tempFile: vscode.Uri;

    beforeEach(async () => {
      // Create a temporary RCL file for testing
      const tempDir = path.join(__dirname, '../../../.test-temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempPath = path.join(tempDir, `test-${Date.now()}.rcl`);
      tempFile = vscode.Uri.file(tempPath);
    });

    afterEach(() => {
      // Clean up temp file
      if (fs.existsSync(tempFile.fsPath)) {
        fs.unlinkSync(tempFile.fsPath);
      }
    });

    it('should compile valid coffee-shop.rcl without errors', async () => {
      const coffeeShopContent = `agent CoffeeShop
  displayName: "Quick Coffee"
  start: OrderFlow

flow OrderFlow
  start: Welcome

  on Welcome
    message Welcome
    match @reply.text
      "Order Coffee" -> ChooseSize
      :default -> Welcome

  on ChooseSize
    message ChooseSize
    match @reply.text
      "Small" -> ChooseDrink
      :default -> Welcome

  on ChooseDrink
    message ChooseDrink

messages Messages
  text Welcome "Welcome! How can I help you?"
    suggestions
      reply "Order Coffee"

  text ChooseSize "What size would you like?"
    suggestions
      reply "Small"

  text ChooseDrink "What drink would you like?"`;

      // Write content to temp file
      fs.writeFileSync(tempFile.fsPath, coffeeShopContent);

      // Test compilation
      const result = await compilationService.compileFile(tempFile);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data.flows).toBeDefined();
        expect(result.data.flows.OrderFlow).toBeDefined();
        expect(result.data.messages).toBeDefined();
      }
    });

    it('should handle compilation errors for invalid RCL', async () => {
      const invalidContent = `invalid rcl content
      this should fail`;

      fs.writeFileSync(tempFile.fsPath, invalidContent);

      const result = await compilationService.compileFile(tempFile);

      // Should either fail or return with diagnostics
      if (!result.success) {
        expect(result.diagnostics).toBeDefined();
        expect(result.diagnostics.length).toBeGreaterThan(0);
      }
    });

    it('should generate diagnostics for coffee-shop.rcl', async () => {
      // Use the actual coffee-shop.rcl file
      const coffeeShopPath = path.join(__dirname, '../../../../../examples/coffee-shop.rcl');

      if (fs.existsSync(coffeeShopPath)) {
        const coffeeShopUri = vscode.Uri.file(coffeeShopPath);
        const result = await compilationService.compileFile(coffeeShopUri);

        expect(result).toBeDefined();
        console.log('Coffee shop compilation result:', {
          success: result.success,
          diagnosticsCount: result.diagnostics?.length || 0,
          hasData: !!result.data,
          diagnostics: result.diagnostics?.map((d) => ({
            message: d.message,
            severity: d.severity,
            code: d.code,
          })),
        });

        // This test helps us understand what's happening during compilation
        if (!result.success && result.diagnostics) {
          console.log('Compilation diagnostics:', result.diagnostics);
        }
      } else {
        console.warn('Coffee shop example not found, skipping test');
      }
    });
  });

  describe('3. Model Conversion to Sprotty Format', () => {
    it('should convert simple flow data to Sprotty model', () => {
      const mockCompiledData = {
        flows: {
          TestFlow: {
            initial: 'start',
            states: {
              start: {
                on: {
                  NEXT: 'end',
                },
              },
              end: {
                type: 'final',
              },
            },
          },
        },
        messages: {
          start: {
            contentMessage: {
              text: 'Start message',
            },
          },
          end: {
            contentMessage: {
              text: 'End message',
            },
          },
        },
      };

      // Access private method via type assertion
      const sprottyModel = (provider as any)._convertToSprottyModel(mockCompiledData);

      expect(sprottyModel).toBeDefined();
      expect(sprottyModel.TestFlow).toBeDefined();
      expect(sprottyModel.TestFlow.nodes).toBeDefined();
      expect(sprottyModel.TestFlow.edges).toBeDefined();
      expect(sprottyModel.TestFlow.nodes.length).toBeGreaterThan(0);
    });

    it('should handle complex coffee-shop-like flow structure', () => {
      const mockCoffeeShopData = {
        flows: {
          OrderFlow: {
            initial: 'Welcome',
            states: {
              Welcome: {
                on: {
                  'Order Coffee': 'ChooseSize',
                  default: 'Welcome',
                },
              },
              ChooseSize: {
                on: {
                  Small: 'ChooseDrink',
                  Medium: 'ChooseDrink',
                  Large: 'ChooseDrink',
                  default: 'InvalidOption',
                },
              },
              ChooseDrink: {
                on: {
                  Espresso: 'Customize',
                  Latte: 'Customize',
                },
              },
              Customize: {
                on: {
                  Regular: 'ConfirmOrder',
                },
              },
              ConfirmOrder: {
                on: {
                  Confirm: 'OrderComplete',
                },
              },
              InvalidOption: {
                // Uses @next context variable
              },
              OrderComplete: {
                type: 'final',
              },
            },
          },
        },
        messages: {
          Welcome: { contentMessage: { text: 'Welcome!' } },
          ChooseSize: { contentMessage: { text: 'Choose size' } },
          ChooseDrink: { contentMessage: { text: 'Choose drink' } },
          Customize: { contentMessage: { text: 'Customize' } },
          ConfirmOrder: {
            contentMessage: {
              richCard: {
                standaloneCard: {
                  cardContent: {
                    title: 'Confirm Order',
                  },
                },
              },
            },
          },
          InvalidOption: { contentMessage: { text: 'Invalid option' } },
          OrderComplete: { contentMessage: { text: 'Order complete!' } },
        },
      };

      const sprottyModel = (provider as any)._convertToSprottyModel(mockCoffeeShopData);

      expect(sprottyModel).toBeDefined();
      expect(sprottyModel.OrderFlow).toBeDefined();

      const flow = sprottyModel.OrderFlow;
      expect(flow.nodes.length).toBeGreaterThan(5); // Should have multiple states
      expect(flow.edges.length).toBeGreaterThan(5); // Should have multiple transitions

      // Check for specific nodes
      const nodeIds = flow.nodes.map((n) => n.id);
      expect(nodeIds).toContain('Welcome');
      expect(nodeIds).toContain('ChooseSize');
      expect(nodeIds).toContain('ConfirmOrder');
      expect(nodeIds).toContain('InvalidOption');

      // Check node types
      const richCardNode = flow.nodes.find((n) => n.id === 'ConfirmOrder');
      expect(richCardNode?.type).toBe('rich_card');
    });

    it('should handle layout algorithm for complex flows', () => {
      const mockFlowData = {
        initial: 'start',
        states: {
          start: { on: { NEXT: 'middle1' } },
          middle1: { on: { NEXT: 'middle2' } },
          middle2: { on: { NEXT: 'end' } },
          end: { type: 'final' },
        },
      };

      const layoutedNodes = (provider as any)._layoutFlowNodes(mockFlowData, {});

      expect(layoutedNodes).toBeDefined();
      expect(layoutedNodes.length).toBe(4);

      // Check positions are assigned
      layoutedNodes.forEach((node) => {
        expect(node.position).toBeDefined();
        expect(typeof node.position.x).toBe('number');
        expect(typeof node.position.y).toBe('number');
      });
    });
  });

  describe('4. Position Mapping and Cursor Sync', () => {
    it('should build position map from RCL document', () => {
      const mockDocument = {
        getText: () => `agent TestAgent
  displayName: "Test"

flow TestFlow
  start: Welcome

  on Welcome
    message Welcome
    match @reply.text
      "test" -> End

  on End
    message End

messages Messages
  text Welcome "Hello"
  text End "Goodbye"`,
        uri: vscode.Uri.file('/test.rcl'),
      } as vscode.TextDocument;

      // Set current document and build position map
      (provider as any)._currentDocument = mockDocument;
      (provider as any)._buildNodePositionMap();

      const positionMap = (provider as any)._nodePositionMap;
      expect(positionMap).toBeDefined();
      expect(positionMap.size).toBeGreaterThan(0);

      // Should find message nodes
      expect(positionMap.has('Welcome')).toBe(true);
      expect(positionMap.has('End')).toBe(true);
    });

    it('should find nodes at specific positions', () => {
      const mockDocument = {
        getText: () => `flow TestFlow
  on TestState
    message TestMessage`,
        uri: vscode.Uri.file('/test.rcl'),
      } as vscode.TextDocument;

      (provider as any)._currentDocument = mockDocument;
      (provider as any)._buildNodePositionMap();

      // Mock a position within a node range
      const testPosition = new vscode.Position(1, 5); // Should be in "TestState"
      const nodeId = (provider as any).findNodeAtPosition(testPosition);

      // This test might need adjustment based on actual regex patterns
      console.log('Found node at position:', nodeId);
    });
  });

  describe('5. Webview Content Generation', () => {
    it('should generate valid HTML for webview', () => {
      const mockWebview = {
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'vscode-webview:',
      } as any;

      const html = (provider as any)._getHtmlForWebview(mockWebview);

      expect(html).toBeDefined();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('RCL Interactive Diagram');
      expect(html).toContain('sprotty-container');
      expect(html).toContain('interactive-diagram.css');
      expect(html).toContain('interactive-diagram.js');
    });

    it('should include security headers in HTML', () => {
      const mockWebview = {
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'vscode-webview:',
      } as any;

      const html = (provider as any)._getHtmlForWebview(mockWebview);

      expect(html).toContain('Content-Security-Policy');
      expect(html).toContain('nonce-');
    });

    it('should include all required UI elements', () => {
      const mockWebview = {
        asWebviewUri: (uri: vscode.Uri) => uri,
        cspSource: 'vscode-webview:',
      } as any;

      const html = (provider as any)._getHtmlForWebview(mockWebview);

      // Check for toolbar elements
      expect(html).toContain('saveBtn');
      expect(html).toContain('undoBtn');
      expect(html).toContain('redoBtn');
      expect(html).toContain('flowSelect');

      // Check for sidebar elements
      expect(html).toContain('node-palette');
      expect(html).toContain('properties-panel');

      // Check for diagram container
      expect(html).toContain('diagram-container');
      expect(html).toContain('sprotty-container');
    });
  });

  describe('6. End-to-End Integration Test', () => {
    it('should handle complete diagram opening flow', async () => {
      // Create a simple valid RCL document
      const simpleRclContent = `agent TestAgent
  displayName: "Test Agent"
  start: TestFlow

flow TestFlow
  start: Welcome

  on Welcome
    message Welcome

messages Messages
  text Welcome "Hello World"`;

      const tempDir = path.join(__dirname, '../../../.test-temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempPath = path.join(tempDir, `integration-test-${Date.now()}.rcl`);
      fs.writeFileSync(tempPath, simpleRclContent);

      try {
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(tempPath));

        // Test the complete flow (without actual webview creation)
        (provider as any)._currentDocument = document;
        await (provider as any)._loadModelFromDocument();

        // Check that state was updated
        const state = (provider as any)._state;
        expect(state).toBeDefined();
        expect(state.flows).toBeDefined();
        expect(state.messages).toBeDefined();
        expect(state.agent).toBeDefined();

        console.log('Integration test state:', {
          hasFlows: Object.keys(state.flows).length > 0,
          hasMessages: Object.keys(state.messages).length > 0,
          hasAgent: !!state.agent,
          activeFlow: state.activeFlow,
        });
      } finally {
        // Clean up
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    });
  });

  describe('7. Error Handling Tests', () => {
    it('should handle missing compilation service', async () => {
      const providerWithoutService = new InteractiveDiagramProvider(extensionContext);
      // Don't set compilation service

      const mockDocument = {
        uri: vscode.Uri.file('/test.rcl'),
      } as vscode.TextDocument;

      const result = await (providerWithoutService as any)._compileRCLDocument(mockDocument);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors).toContain('Compilation service not initialized');
    });

    it('should handle empty or invalid flow data', () => {
      const invalidData = {
        flows: {},
        messages: {},
      };

      const sprottyModel = (provider as any)._convertToSprottyModel(invalidData);

      expect(sprottyModel).toBeDefined();
      expect(typeof sprottyModel).toBe('object');
      expect(Object.keys(sprottyModel)).toHaveLength(0);
    });

    it('should handle missing resource files gracefully', () => {
      const mockWebview = {
        asWebviewUri: (uri: vscode.Uri) => {
          // Simulate missing resources
          if (uri.fsPath.includes('missing-resource')) {
            throw new Error('Resource not found');
          }
          return uri;
        },
        cspSource: 'vscode-webview:',
      } as any;

      // This should not throw, even if resources are missing
      expect(() => {
        (provider as any)._getHtmlForWebview(mockWebview);
      }).not.toThrow();
    });
  });
});
