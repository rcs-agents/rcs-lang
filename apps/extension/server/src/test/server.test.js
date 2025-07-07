'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
const assert = __importStar(require('assert'));
const vscode_languageserver_textdocument_1 = require('vscode-languageserver-textdocument');
const completion_1 = require('../features/completion');
const hover_1 = require('../features/hover');
describe('RCL Language Server', () => {
  let completionProvider;
  let hoverProvider;
  beforeEach(() => {
    // Create providers with null parser to avoid tree-sitter issues
    completionProvider = new completion_1.CompletionProvider(null);
    hoverProvider = new hover_1.HoverProvider(null);
  });
  describe('Completion Provider', () => {
    it('should provide basic keyword completions', async () => {
      const text = 'age';
      const document = vscode_languageserver_textdocument_1.TextDocument.create(
        'test://test.rcl',
        'rcl',
        1,
        text,
      );
      const position = { line: 0, character: 3 };
      const completions = await completionProvider.getCompletions(document, position);
      assert.ok(completions);
      assert.ok(Array.isArray(completions));
      assert.ok(completions.length > 0);
      assert.ok(completions.some((item) => item.label === 'agent'));
    });
  });
  describe('Hover Provider', () => {
    it('should provide hover information for keywords', async () => {
      const text = 'agent TestAgent';
      const document = vscode_languageserver_textdocument_1.TextDocument.create(
        'test://test.rcl',
        'rcl',
        1,
        text,
      );
      const position = { line: 0, character: 2 };
      const hover = await hoverProvider.getHover(document, position);
      assert.ok(hover);
      assert.ok(hover.contents);
    });
  });
  describe('Basic functionality', () => {
    it('should handle RCL documents', () => {
      const text = 'agent TestAgent\n  displayName: "Test"';
      const document = vscode_languageserver_textdocument_1.TextDocument.create(
        'test://test.rcl',
        'rcl',
        1,
        text,
      );
      assert.equal(document.languageId, 'rcl');
      assert.ok(document.getText().includes('agent'));
    });
  });
  describe('Language Server Protocol', () => {
    it('should support completion requests', async () => {
      const document = vscode_languageserver_textdocument_1.TextDocument.create(
        'test://test.rcl',
        'rcl',
        1,
        'fl',
      );
      const position = { line: 0, character: 2 };
      const completions = await completionProvider.getCompletions(document, position);
      assert.ok(completions);
      assert.ok(completions.some((item) => item.label === 'flow'));
    });
    it('should support hover requests', async () => {
      const document = vscode_languageserver_textdocument_1.TextDocument.create(
        'test://test.rcl',
        'rcl',
        1,
        'flow TestFlow',
      );
      const position = { line: 0, character: 2 };
      const hover = await hoverProvider.getHover(document, position);
      assert.ok(hover);
      assert.ok(hover.contents);
    });
  });
});
//# sourceMappingURL=server.test.js.map
