#!/usr/bin/env node

// Direct test of parse functionality
const { parseRCL } = require('./dist/compiler.js');

const testContent = `agent TestAgent:
  displayName: "Test Agent"

messages Messages:
  welcome Welcome:
    text: "Welcome!"

flow Main:
  initial state: Welcome

  state Welcome:
    message: Welcome
`;

// Create a mock file system and test
const mockFileSystem = {
  resolve: (path) => path,
  exists: async () => ({ success: true, value: true }),
  readFile: async () => ({ success: true, value: testContent }),
  basename: (_path) => 'test.rcl',
};

// Monkey patch the FileSystemFactory
const Module = require('node:module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id) {
  if (id === '@rcs-lang/file-system') {
    return {
      FileSystemFactory: {
        getDefault: () => mockFileSystem,
      },
    };
  }
  if (id === '@rcs-lang/parser') {
    return {
      AntlrRclParser: class {
        constructor() {
          this.isInitialized = false;
        }
        async initialize() {
          this.isInitialized = true;
        }
        async parse(_content) {
          // Return a simple mock AST
          return {
            success: true,
            value: {
              ast: {
                type: 'Program',
                body: [
                  {
                    type: 'AgentDeclaration',
                    name: 'TestAgent',
                    displayName: 'Test Agent',
                    sections: [],
                  },
                ],
              },
              diagnostics: [],
            },
          };
        }
      },
    };
  }
  return originalRequire.apply(this, arguments);
};

// Test the parse function
parseRCL('test.rcl', { pretty: true })
  .then(() => console.log('Parse test completed'))
  .catch((err) => console.error('Parse test failed:', err));
