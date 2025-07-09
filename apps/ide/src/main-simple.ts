import * as monaco from 'monaco-editor';
import { RCLCompiler } from './compiler';
import { SimpleDiagramRenderer } from './diagram';
import { RCL_LANGUAGE_ID, registerRCLLanguage } from './rcl-language';
import { TabManager } from './tabs';
import { Toolbar } from './toolbar';

// Global polyfill for assert
(globalThis as any).assert = (condition: any, message?: string) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
};

// Coffee shop example content
const COFFEE_SHOP_CONTENT = `agent CoffeeShop
  displayName: "Quick Coffee"
  start: OrderFlow

  config
    # defines the properties of the RcsBusinessMessagingAgent object from agent.schema.json
    description: "Order your favorite coffee for pickup"
    logoUri: <url https://quickcoffee.com/logo.png>
    color: "#6F4E37"

    phoneNumber: <phone +1-555-0123>
    phoneLabel: "Call Store"

  defaults
    # override the values in the rcl.config.json file
    fallbackMessage: "I didn't understand that. Please choose from the available options."
    messageTrafficType: :promotion
    postbackData: $js> (suggestion) => suggestion?.text?.toLowerCase().replace(/[^a-z0-9]/g, '_')

  flow OrderFlow
    # the \`start\` attribute is required and must be the ID of a state
    start: Welcome

    # states are now sections of type \`on\`
    on InvalidOption
      # This state returns to the state specified in the 'next' context variable
      @next

    on Welcome
      # the \`match\` section is a list of Ma
      match @reply.text
        "Order Coffee" -> ChooseSize
        "View Menu" -> ShowMenu
        "Store Hours" -> StoreInfo
        :default -> Welcome

    on ChooseSize
      match @reply.text
        "Small" -> ChooseDrink with size: "small", price: <money 3.50>
        "Medium" -> ChooseDrink with size: "medium", price: <money 4.50>
        "Large" -> ChooseDrink with size: "large", price: <money 5.50>
        :default -> InvalidOption with property: "size", next: ChooseSize

    on ChooseDrink
      match @reply.text
        "Espresso" -> Customize with drink: "espresso"
        "Cappuccino" -> Customize with drink: "cappuccino"
        "Latte" -> Customize with drink: "latte"
        "Americano" -> Customize with drink: "americano"
        :default -> InvalidOption with property: "drink", next: ChooseDrink

    on Customize
      match @reply.text
        "Regular" -> ConfirmOrder with milk: "regular"
        "Skim" -> ConfirmOrder with milk: "skim"
        "Soy" -> ConfirmOrder with milk: "soy", extraCharge: 0.60
        "Oat" -> ConfirmOrder with milk: "oat", extraCharge: 0.60
        "No Milk" -> ConfirmOrder with milk: "none"
        :default -> InvalidOption with property: "milk", next: Customize

    on ConfirmOrder
      match @reply.text
        "Confirm" -> ProcessPayment
        "Cancel" -> OrderCancelled
        :default -> ConfirmOrder

    on ProcessPayment
      -> OrderComplete

    on OrderCancelled
      -> ShowMenu

    on OrderComplete
      -> ThankYou

    on ThankYou
      -> ShowMenu

    on ShowMenu
      -> Welcome

    on StoreInfo
      Welcome

  messages Messages
    richCard Welcome "Welcome to Quick Coffee!" :large
      description: "Get your favorite coffee ready for pickup in minutes!"
      media: <url https://quickcoffee.com/welcome.jpg>
      suggestions
        reply "Order Coffee"
        reply "View Menu"
        reply "Store Hours"

    text ChooseSize "What size would you like?"
      suggestions
        reply "Small $3.50"
        reply "Medium $4.50"
        reply "Large $5.50"

    text Invalid Size "Please choose a valid size."
      suggestions
        reply "Small $3.50"
        reply "Medium $4.50"
        reply "Large $5.50"

    # String interpolation is now supported in any string using the #{variable} syntax
    # The \`@\` symbol is used to reference the current state's context properties
    text ChooseDrink "Great! A #{@size} coffee. What type would you like?"
      suggestions
        reply "Espresso"
        reply "Cappuccino"
        reply "Latte"
        reply "Americano"

    text Invalid Drink "Please choose from our available drinks."
      suggestions
        reply "Espresso"
        reply "Cappuccino"
        reply "Latte"
        reply "Americano"

    text Customize "Perfect! A #{context.size} #{context.drink}. How would you like your milk?"
      suggestions
        reply "Regular"
        reply "Skim"
        reply "Soy +$0.60"
        reply "Oat +$0.60"
        reply "No Milk"

    text Invalid Milk "Please choose a valid milk option."
      suggestions
        reply "Regular"
        reply "Skim"
        reply "Soy +$0.60"
        reply "Oat +$0.60"
        reply "No Milk"

    richCard ConfirmOrder "Confirm Your Order" :medium
      description: "#{context.size} #{context.drink} with #{context.milk} milk\\nTotal: $#{(context.price + (context.extraCharge || 0)).toFixed(2)}"
      media: <url https://quickcoffee.com/coffee.jpg>
      suggestions
        reply "Confirm"
        reply "Cancel"

    text ProcessPayment "Processing your payment..."

    richCard OrderComplete "Order Confirmed!" :large
      description: """
        Your order will be ready for pickup in 5-7 minutes.
        Show this confirmation at the counter.
      """
      media: <url https://quickcoffee.com/confirmed.jpg>
      suggestions
        saveEvent "Add to Calendar"
          title: "Coffee Pickup"
          startTime: <datetime +5m>
          endTime: <datetime +15m>
          description: "Pick up #{@size} #{@drink}"

    text OrderCancelled "Your order has been cancelled. Thank you!"

    text ThankYou """
      Thank you for your order!
      Your order will be ready for pickup in 5-7 minutes.
      Show this confirmation at the counter.
    """

    carousel ShowMenu "Our Coffee Menu" :medium
      richCard EspressoCard "Espresso" :compact
        description: "Rich, bold shot of coffee"
        media: <url https://quickcoffee.com/espresso.jpg>

      richCard CappuccinoCard "Cappuccino" :compact
        description: "Espresso with steamed milk foam"
        media: <url https://quickcoffee.com/cappuccino.jpg>

      richCard LatteCard "Latte" :compact
        description: "Espresso with steamed milk"
        media: <url https://quickcoffee.com/latte.jpg>

      richCard AmericanoCard "Americano" :compact
        description: "Espresso with hot water"
        media: <url https://quickcoffee.com/americano.jpg>

    text StoreInfo "We're open Monday-Friday 6am-7pm, weekends 7am-6pm."

    # multi-line strings can now be defined with """
    text InvalidOption """
      Sorry, that's not a valid option for #{@property}.
      Please choose from the available options.
    """
`;

class RCLIdeSimple {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private compiler: RCLCompiler;
  private diagramRenderer: SimpleDiagramRenderer;
  private previewRenderer: SimpleDiagramRenderer;
  private tabManager: TabManager;
  private toolbar: Toolbar;
  private lastCompilationResult: any = null;

  constructor() {
    this.compiler = new RCLCompiler();
    this.diagramRenderer = new SimpleDiagramRenderer('diagram-container', false);
    this.previewRenderer = new SimpleDiagramRenderer('preview-container', true);
    this.tabManager = new TabManager();
    this.toolbar = new Toolbar();
  }

  async initialize() {
    console.log('🚀 Initializing RCL IDE...');

    try {
      // Initialize Monaco Editor
      await this.initializeMonaco();

      // Initialize other components
      this.initializeComponents();

      // Set up event listeners
      this.setupEventListeners();

      console.log('✅ RCL IDE initialized successfully');

      // Debug initial state
      console.log('Running initial tab content debug...');
      this.debugTabContent();
    } catch (error) {
      console.error('❌ Failed to initialize RCL IDE:', error);
      this.showError('Failed to initialize IDE: ' + (error as Error).message);
    }
  }

  private async initializeMonaco() {
    console.log('📝 Initializing Monaco Editor...');

    // Configure Monaco environment
    (self as any).MonacoEnvironment = {
      getWorkerUrl: (_moduleId: string, label: string) => {
        if (label === 'json') {
          return './node_modules/monaco-editor/esm/vs/language/json/json.worker.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return './node_modules/monaco-editor/esm/vs/language/css/css.worker.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return './node_modules/monaco-editor/esm/vs/language/html/html.worker.js';
        }
        if (label === 'typescript' || label === 'javascript') {
          return './node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js';
        }
        return './node_modules/monaco-editor/esm/vs/editor/editor.worker.js';
      },
    };

    // Register RCL language
    registerRCLLanguage();

    const editorContainer = document.getElementById('editor-container');
    if (!editorContainer) {
      throw new Error('Editor container not found');
    }

    // Clear loading message
    editorContainer.innerHTML = '';

    // Create Monaco editor
    this.editor = monaco.editor.create(editorContainer, {
      value: COFFEE_SHOP_CONTENT,
      language: RCL_LANGUAGE_ID,
      theme: 'vs-dark',
      fontSize: 14,
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      folding: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: 'inline' as const,
        comments: false,
        strings: false,
      },
      acceptSuggestionOnCommitCharacter: true,
      tabCompletion: 'on',
      wordBasedSuggestions: 'currentDocument' as const,
    });

    console.log('✅ Monaco Editor initialized with RCL language support');
  }

  private initializeComponents() {
    console.log('🔧 Initializing components...');

    this.tabManager.initialize();
    this.diagramRenderer.initialize();
    this.previewRenderer.initialize();
    this.toolbar.initialize();

    // Set up toolbar action handler
    this.toolbar.setActionHandler((action, data) => this.handleToolbarAction(action, data));

    // Initialize toolbar state
    this.toolbar.setSelectValue('layout-algorithm', this.diagramRenderer.options.layoutAlgorithm);
    this.toolbar.setSelectValue('layout-direction', this.diagramRenderer.options.layoutDirection);
    this.toolbar.setSelectValue('edge-routing', this.diagramRenderer.options.edgeRouting);
    this.toolbar.setSelectValue('edge-spacing', this.diagramRenderer.options.edgeSpacing);
    this.toolbar.toggleButtonActive('toggle-auto-layout', this.diagramRenderer.options.autoLayout);

    // Initial compilation
    this.compileAndUpdate();
  }

  private setupEventListeners() {
    // Editor content change
    if (this.editor) {
      this.editor.onDidChangeModelContent(() => {
        // Debounce compilation
        this.debounceCompile();
      });
    }

    // Tab switching
    this.tabManager.onTabChange((tabId) => {
      // No need to update diagram on tab change since it's already updated on compilation
      console.log('Tab changed to:', tabId);
      this.debugTabContent();
    });
  }

  private debugTabContent() {
    console.log('=== Tab Content Debug ===');
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach((panel, index) => {
      const computed = window.getComputedStyle(panel);
      console.log(`Panel ${index}: ${panel.id}`);
      console.log(`  - Display: ${computed.display}`);
      console.log(`  - Has active class: ${panel.classList.contains('active')}`);
      console.log(`  - Content preview: ${panel.textContent?.substring(0, 50)}...`);
    });

    console.log('\n=== Content Containers ===');

    // Check specific content containers
    const previewContainer = document.getElementById('preview-container');
    const diagramContainer = document.getElementById('diagram-container');
    const codeContent = document.getElementById('code-content');
    const jsonContent = document.getElementById('json-content');
    const configContent = document.getElementById('config-content');

    if (previewContainer) {
      console.log('Preview (D2) (preview-container):');
      console.log(`  - Tag: ${previewContainer.tagName}`);
      console.log(`  - Parent panel: ${previewContainer.closest('.tab-panel')?.id}`);
      console.log(
        `  - Content type: ${previewContainer.querySelector('pre') ? 'Pre-formatted' : 'Other'}`,
      );
      console.log(`  - Content preview: ${previewContainer.textContent?.substring(0, 50)}...`);
    }

    if (diagramContainer) {
      console.log('Flow (SVG) (diagram-container):');
      console.log(`  - Tag: ${diagramContainer.tagName}`);
      console.log(`  - Parent panel: ${diagramContainer.closest('.tab-panel')?.id}`);
      console.log(`  - Content type: ${diagramContainer.querySelector('svg') ? 'SVG' : 'Other'}`);
      console.log(`  - Content preview: ${diagramContainer.textContent?.substring(0, 50)}...`);
    }

    if (codeContent) {
      console.log('Code (JS) (code-content):');
      console.log(`  - Tag: ${codeContent.tagName}`);
      console.log(`  - Parent panel: ${codeContent.closest('.tab-panel')?.id}`);
      console.log(`  - Content type: Text`);
      console.log(`  - Content preview: ${codeContent.textContent?.substring(0, 50)}...`);
    }

    if (jsonContent) {
      console.log('Export (JSON) (json-content):');
      console.log(`  - Tag: ${jsonContent.tagName}`);
      console.log(`  - Parent panel: ${jsonContent.closest('.tab-panel')?.id}`);
      console.log(`  - Content type: Text`);
      console.log(`  - Content preview: ${jsonContent.textContent?.substring(0, 50)}...`);
    }

    if (configContent) {
      console.log('Export (Config) (config-content):');
      console.log(`  - Tag: ${configContent.tagName}`);
      console.log(`  - Parent panel: ${configContent.closest('.tab-panel')?.id}`);
      console.log(`  - Content type: Text`);
      console.log(`  - Content preview: ${configContent.textContent?.substring(0, 50)}...`);
    }

    console.log('\n=== Active Tab/Panel ===');
    const activeTab = document.querySelector('.tab.active');
    const activePanel = document.querySelector('.tab-panel.active');
    console.log(`Active tab: ${activeTab?.getAttribute('data-tab')}`);
    console.log(`Active panel: ${activePanel?.id}`);
  }

  private debounceTimer: number | null = null;

  private debounceCompile() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.compileAndUpdate();
    }, 500);
  }

  private async compileAndUpdate() {
    if (!this.editor) return;

    const content = this.editor.getValue();

    try {
      console.log('🔄 Compiling RCL content...');

      const result = await this.compiler.compile(content);

      if (result.success) {
        this.lastCompilationResult = result;
        this.updateCodeTab(result.jsCode || '// No JavaScript output');
        this.updateExportTab(result.jsonOutput, result.agentConfig);
        this.updatePreviewTab(result.d2Diagram, undefined, result.flowData);
        this.diagramRenderer.updateModel({
          flows: { main: result.flowData },
          activeFlow: 'main',
          messages: {},
          agent: {},
        });
        console.log('✅ Compilation successful');

        // Enable copy/download buttons
        this.toolbar.setButtonState('copy-js', true);
        this.toolbar.setButtonState('copy-json', true);
        this.toolbar.setButtonState('download-js', true);
        this.toolbar.setButtonState('download-json', true);

        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
          console.warn('⚠️ Compilation warnings:', result.warnings);
        }
      } else {
        this.lastCompilationResult = null;
        const errorMsg = result.errors?.join('\n') || 'Compilation failed';
        this.updateCodeTab(`// Compilation failed:\n// ${errorMsg}`);
        this.updateExportTab(null, null);
        this.updatePreviewTab(null, result.errors, null);
        this.diagramRenderer.updateModel({
          flows: {},
          activeFlow: null,
          messages: {},
          agent: {},
        });
        console.error('❌ Compilation failed:', result.errors);

        // Disable copy/download buttons
        this.toolbar.setButtonState('copy-js', false);
        this.toolbar.setButtonState('copy-json', false);
        this.toolbar.setButtonState('download-js', false);
        this.toolbar.setButtonState('download-json', false);
      }
    } catch (error) {
      console.error('💥 Compilation error:', error);
      console.error('Stack trace:', (error as Error).stack);
      const errorMsg = (error as Error).message;
      this.updateCodeTab(`// Compilation error:\n// ${errorMsg}`);
      this.updateExportTab(null, null);
      this.updatePreviewTab(null, [errorMsg]);
      this.diagramRenderer.updateModel({
        flows: {},
        activeFlow: null,
        messages: {},
        agent: {},
      });
    }
  }

  private updateCodeTab(jsCode: string) {
    const codeContent = document.getElementById('code-content');
    console.log('Updating Code tab with:', jsCode.substring(0, 100) + '...');
    if (codeContent) {
      codeContent.textContent = jsCode;
      console.log('Code content updated successfully');
    } else {
      console.error('Code content element not found!');
    }
  }

  private updateExportTab(jsonOutput: any, agentConfig: any) {
    const jsonContent = document.getElementById('json-content');
    const configContent = document.getElementById('config-content');

    if (jsonContent) {
      if (jsonOutput) {
        jsonContent.textContent = JSON.stringify(jsonOutput, null, 2);
      } else {
        jsonContent.innerHTML = '<div class="loading">No JSON output available</div>';
      }
    }

    if (configContent) {
      if (agentConfig) {
        configContent.textContent = JSON.stringify(agentConfig, null, 2);
      } else {
        configContent.innerHTML = '<div class="loading">No agent config available</div>';
      }
    }
  }

  private updatePreviewTab(d2Diagram: string | null, errors?: string[], flowData?: any) {
    const previewContainer = document.getElementById('preview-container');

    if (!previewContainer) return;

    if (errors && errors.length > 0) {
      previewContainer.innerHTML = `
        <div class="error-panel">
          <h3>❌ Compilation Error</h3>
          <pre>${errors.map((e) => e.replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('\n')}</pre>
        </div>
      `;
    } else if (flowData) {
      // Render the flow diagram as a visualization in the preview tab
      this.previewRenderer.updateModel({
        flows: { main: flowData },
        activeFlow: 'main',
        messages: {},
        agent: {},
      });
    } else {
      previewContainer.innerHTML =
        '<div class="loading">Compile RCL to see diagram preview...</div>';
    }
  }

  private showError(message: string) {
    const container = document.querySelector('.ide-container');
    if (container) {
      container.innerHTML = `<div class="error">Error: ${message}</div>`;
    }
  }

  private handleToolbarAction(action: string, data?: any) {
    console.log('Toolbar action:', action, data);

    switch (action) {
      case 'format':
        this.formatCode();
        break;
      case 'compile':
        this.compileAndUpdate();
        break;
      case 'copy-js':
        this.copyToClipboard('js');
        break;
      case 'copy-json':
        this.copyToClipboard('json');
        break;
      case 'download-js':
        this.downloadFile('js');
        break;
      case 'download-json':
        this.downloadFile('json');
        break;
      case 'help':
        this.showHelp();
        break;
      case 'layout-algorithm':
        this.diagramRenderer.setLayoutAlgorithm(data);
        break;
      case 'layout-direction':
        this.diagramRenderer.setLayoutDirection(data);
        break;
      case 'edge-routing':
        this.diagramRenderer.setEdgeRouting(data);
        break;
      case 'edge-spacing':
        this.diagramRenderer.setEdgeSpacing(data);
        break;
      case 'toggle-auto-layout':
        this.diagramRenderer.toggleAutoLayout();
        this.toolbar.toggleButtonActive(
          'toggle-auto-layout',
          this.diagramRenderer.options.autoLayout,
        );
        break;
      case 'manual-layout':
        this.diagramRenderer.manualLayout();
        this.toolbar.toggleButtonActive('toggle-auto-layout', false);
        break;
      case 'toggle-waypoint-edit':
        this.diagramRenderer.toggleWaypointEditMode();
        this.toolbar.toggleButtonActive(
          'toggle-waypoint-edit',
          this.diagramRenderer.state.waypointEditMode,
        );
        break;
    }
  }

  private formatCode() {
    if (!this.editor) return;

    // Basic formatting - in the future this would use a proper RCL formatter
    const value = this.editor.getValue();
    const formatted = this.simpleFormatRCL(value);
    this.editor.setValue(formatted);
  }

  private simpleFormatRCL(code: string): string {
    // Simple formatting - just ensure consistent indentation
    const lines = code.split('\n');
    let indentLevel = 0;
    const formatted: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        formatted.push('');
        continue;
      }

      // Decrease indent for closing keywords
      if (trimmed.match(/^(flow|state|message|messages|config|suggestions)/)) {
        if (indentLevel > 0 && !trimmed.startsWith('state') && !trimmed.startsWith('message ')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
      }

      // Add the line with current indent
      formatted.push('  '.repeat(indentLevel) + trimmed);

      // Increase indent after opening keywords
      if (trimmed.match(/^(agent|flow|state|messages|message|config|suggestions|richCard)/)) {
        indentLevel++;
      }

      // Special case: state lines don't increase indent if they're one-liners
      if (trimmed.startsWith('state ') && trimmed.includes('->')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
    }

    return formatted.join('\n');
  }

  private copyToClipboard(format: 'js' | 'json') {
    if (!this.lastCompilationResult) {
      console.error('No compilation result available');
      return;
    }

    const content =
      format === 'js'
        ? this.lastCompilationResult.jsCode
        : JSON.stringify(this.lastCompilationResult.jsonOutput, null, 2);

    if (!content) {
      console.error('No content to copy');
      return;
    }

    navigator.clipboard
      .writeText(content)
      .then(() => {
        console.log(`✅ ${format.toUpperCase()} copied to clipboard`);
        this.showNotification(`${format.toUpperCase()} copied to clipboard!`);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  }

  private downloadFile(format: 'js' | 'json') {
    if (!this.lastCompilationResult) {
      console.error('No compilation result available');
      return;
    }

    const content =
      format === 'js'
        ? this.lastCompilationResult.jsCode
        : JSON.stringify(this.lastCompilationResult.jsonOutput, null, 2);

    if (!content) {
      console.error('No content to download');
      return;
    }

    const agentName = this.lastCompilationResult.jsonOutput?.agent?.name || 'agent';
    const filename = `${agentName}.${format}`;

    const blob = new Blob([content], {
      type: format === 'js' ? 'text/javascript' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`✅ Downloaded ${filename}`);
    this.showNotification(`Downloaded ${filename}`);
  }

  private showHelp() {
    const helpContent = `
RCL IDE Help

Keyboard Shortcuts:
- Ctrl/Cmd + S: Compile
- Ctrl/Cmd + Shift + F: Format code
- Ctrl/Cmd + Space: Show completions

RCL Syntax:
- agent: Define an agent with displayName
- flow: Define conversation flows with states
- state: Define states with messages and transitions
- messages: Define message templates
- message: Define individual messages (text or richCard)

Example:
agent MyAgent
  displayName "My Agent"

flow MainFlow
  state Welcome
    message Welcome
    "Start" -> NextState
    default -> Welcome

messages Messages
  message Welcome
    text "Hello! How can I help?"
    suggestions
      reply "Start"
    `;

    alert(helpContent);
  }

  private showNotification(message: string, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #007acc;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, duration);
  }
}

// Initialize the IDE when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  const ide = new RCLIdeSimple();
  await ide.initialize();
});

export { RCLIdeSimple };
