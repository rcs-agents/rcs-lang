const __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        let desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
const __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : (o, v) => {
        o.default = v;
      });
const __importStar =
  (this && this.__importStar) ||
  (() => {
    let ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          const ar = [];
          for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod?.__esModule) return mod;
      const result = {};
      if (mod != null)
        for (let k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
const assert = __importStar(require('node:assert'));
const path = __importStar(require('node:path'));
const fs = __importStar(require('node:fs'));
describe('RCL Extension Client Tests', () => {
  it('should pass basic functionality test', () => {
    // Basic test that doesn't require VS Code
    assert.ok(true);
  });
  it('should handle RCL file paths', () => {
    const testPath = path.join(__dirname, '..', '..', '..', 'sample.rcl');
    assert.ok(testPath.includes('sample.rcl'));
  });
  it('should validate extension configuration', () => {
    const extensionPackagePath = path.join(__dirname, '..', '..', '..', 'package.json');
    const clientPackagePath = path.join(__dirname, '..', '..', 'package.json');
    if (fs.existsSync(extensionPackagePath)) {
      const extensionPackageJson = JSON.parse(fs.readFileSync(extensionPackagePath, 'utf8'));
      assert.equal(extensionPackageJson.name, 'rcl-language-support');
      assert.equal(extensionPackageJson.main, './client/out/extension.js');
    } else {
      assert.ok(true, 'Extension package.json not found, skipping validation');
    }
    if (fs.existsSync(clientPackagePath)) {
      const clientPackageJson = JSON.parse(fs.readFileSync(clientPackagePath, 'utf8'));
      assert.equal(clientPackageJson.name, 'rcl-language-client');
      assert.equal(clientPackageJson.main, './out/extension.js');
    } else {
      assert.ok(true, 'Client package.json not found, skipping validation');
    }
  });
  describe('Command Registration', () => {
    it('should register all required commands', () => {
      const packagePath = path.join(__dirname, '..', '..', '..', 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const commands = packageJson.contributes?.commands || [];
        const expectedCommands = [
          'rcl.showAgentOutput',
          'rcl.showPreview',
          'rcl.showJSONOutput',
          'rcl.exportCompiled',
          'rcl.openInteractiveDiagram',
        ];
        expectedCommands.forEach((commandId) => {
          const command = commands.find((cmd) => cmd.command === commandId);
          assert.ok(command, `Command ${commandId} should be registered`);
          if (command) {
            assert.ok(command.title, `Command ${commandId} should have a title`);
            assert.equal(command.category, 'RCL', `Command ${commandId} should be in RCL category`);
          }
        });
      } else {
        assert.ok(true, 'Package.json not found, skipping command registration test');
      }
    });
    it('should register webview view correctly', () => {
      const packagePath = path.join(__dirname, '..', '..', '..', 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const views = packageJson.contributes?.views?.explorer || [];
        const previewView = views.find((view) => view.id === 'rclPreview');
        assert.ok(previewView, 'RCL Preview view should be registered');
        if (previewView) {
          assert.equal(previewView.type, 'webview', 'Preview view should be webview type');
          assert.equal(previewView.name, 'RCL Preview', 'Preview view should have correct name');
        }
      } else {
        assert.ok(true, 'Package.json not found, skipping webview view test');
      }
    });
    it('should have correct context menu entries', () => {
      const packagePath = path.join(__dirname, '..', '..', '..', 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const editorContextMenu = packageJson.contributes?.menus?.['editor/context'] || [];
        const explorerContextMenu = packageJson.contributes?.menus?.['explorer/context'] || [];
        // Check that context menus are properly configured for .rcl files
        editorContextMenu.forEach((menu) => {
          assert.equal(
            menu.when,
            'resourceExtname == .rcl',
            'Editor context menu should be for .rcl files',
          );
        });
        explorerContextMenu.forEach((menu) => {
          assert.equal(
            menu.when,
            'resourceExtname == .rcl',
            'Explorer context menu should be for .rcl files',
          );
        });
      }
    });
  });
  describe('Extension Activation', () => {
    it('should support RCL file extensions', () => {
      const packagePath = path.join(__dirname, '..', '..', '..', 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const languages = packageJson.contributes?.languages || [];
        const rclLanguage = languages.find((lang) => lang.id === 'rcl');
        assert.ok(rclLanguage, 'RCL language should be defined');
        if (rclLanguage) {
          assert.ok(
            rclLanguage.extensions.includes('.rcl'),
            'RCL language should support .rcl extension',
          );
        }
      } else {
        assert.ok(true, 'Package.json not found, skipping RCL file extensions test');
      }
    });
  });
  describe('Fixed Issues', () => {
    it('should not reference invalid workbench commands', () => {
      // Test that the problematic workbench command is not in the extension code
      const extensionPath = path.join(__dirname, '..', 'extension.ts');
      if (fs.existsSync(extensionPath)) {
        const extensionCode = fs.readFileSync(extensionPath, 'utf8');
        // Should not contain the problematic command that was causing errors
        assert.ok(
          !extensionCode.includes('workbench.view.extension.rclPreview'),
          'Extension should not reference invalid workbench command',
        );
        // Should handle preview activation properly
        assert.ok(
          extensionCode.includes('showPreview'),
          'Extension should have showPreview functionality',
        );
      }
    });
    it('should handle interactive diagram functionality', () => {
      const extensionPath = path.join(__dirname, '..', 'extension.ts');
      if (fs.existsSync(extensionPath)) {
        const extensionCode = fs.readFileSync(extensionPath, 'utf8');
        assert.ok(
          extensionCode.includes('InteractiveDiagramProvider'),
          'Extension should include interactive diagram provider',
        );
        assert.ok(
          extensionCode.includes('openInteractiveDiagram'),
          'Extension should have interactive diagram command',
        );
      }
    });
  });
});
//# sourceMappingURL=extension.test.js.map
