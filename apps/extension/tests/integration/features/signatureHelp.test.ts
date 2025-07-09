import { expect } from 'chai';
import * as vscode from 'vscode';
import * as testHelpers from '../../utils/testHelpers';

describe('Signature Help Provider', () => {
  let document: vscode.TextDocument;
  let editor: vscode.TextEditor;

  beforeEach(async () => {
    await testHelpers.closeAllEditors();
  });

  afterEach(async () => {
    await testHelpers.closeAllEditors();
  });

  describe('Message suggestions signatures', () => {
    it('should show signature help for suggestions', async () => {
      const content = `agent TestAgent

displayName "Test Agent"
brandName "Test Brand"

start MainFlow

flow MainFlow {
  message {
    text "Hello"
    suggestions [
      
    ]
  }
  end
}`;

      const uri = vscode.Uri.parse('untitled:test-suggestions.rcl');
      document = await vscode.workspace.openTextDocument(uri);
      editor = await vscode.window.showTextDocument(document);

      await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), content);
      });

      await testHelpers.waitForLanguageServer();

      // Position cursor after 'suggestions ['
      const suggestionsLine = document
        .getText()
        .split('\n')
        .findIndex((line) => line.includes('suggestions ['));

      if (suggestionsLine === -1) throw new Error('Suggestions line not found');

      const position = new vscode.Position(suggestionsLine + 1, 6); // After indent
      await testHelpers.setCursorPosition(position.line, position.character);

      // Type to trigger signature help
      await testHelpers.typeText('reply');
      await testHelpers.sleep(100);

      const signatureHelp = await testHelpers.getSignatureHelp(document, position.translate(0, 5));

      expect(signatureHelp).to.not.be.null;
      expect(signatureHelp.signatures).to.have.length.greaterThan(0);

      // Verify suggestion types are documented
      const signature = signatureHelp.signatures[0];
      expect(signature.label).to.include('reply');
      expect(signature.documentation).to.exist;
    });

    it('should show all suggestion types', async () => {
      const content = `agent TestAgent

displayName "Test Agent"
brandName "Test Brand"

start MainFlow

flow MainFlow {
  message {
    text "Hello"
    suggestions [
      
    ]
  }
  end
}`;

      const uri = vscode.Uri.parse('untitled:test-all-suggestions.rcl');
      document = await vscode.workspace.openTextDocument(uri);
      editor = await vscode.window.showTextDocument(document);

      await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), content);
      });

      await testHelpers.waitForLanguageServer();

      const suggestionsLine = document
        .getText()
        .split('\n')
        .findIndex((line) => line.includes('suggestions ['));

      const position = new vscode.Position(suggestionsLine + 1, 6);
      await testHelpers.setCursorPosition(position.line, position.character);

      // Test different suggestion types
      const suggestionTypes = [
        'reply',
        'openUrl',
        'dial',
        'viewLocation',
        'requestLocation',
        'shareLocation',
        'calendar',
      ];

      for (const suggestionType of suggestionTypes) {
        await editor.edit((editBuilder) => {
          editBuilder.insert(position, suggestionType);
        });

        await testHelpers.sleep(100);

        const signatureHelp = await testHelpers.getSignatureHelp(
          document,
          position.translate(0, suggestionType.length),
        );

        expect(signatureHelp).to.not.be.null;
        expect(signatureHelp.signatures.length).to.be.greaterThan(0);

        // Clear for next test
        await editor.edit((editBuilder) => {
          editBuilder.delete(
            new vscode.Range(position, position.translate(0, suggestionType.length)),
          );
        });
      }
    });
  });

  describe('Rich card properties', () => {
    it('should show signature help for rich card properties', async () => {
      const content = `agent TestAgent

displayName "Test Agent"
brandName "Test Brand"

start MainFlow

flow MainFlow {
  message {
    richCard {
      title "Card Title"
      
    }
  }
  end
}`;

      const uri = vscode.Uri.parse('untitled:test-richcard.rcl');
      document = await vscode.workspace.openTextDocument(uri);
      editor = await vscode.window.showTextDocument(document);

      await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), content);
      });

      await testHelpers.waitForLanguageServer();

      // Find position after 'title' line
      const titleLine = document
        .getText()
        .split('\n')
        .findIndex((line) => line.includes('title "Card Title"'));

      const position = new vscode.Position(titleLine + 1, 6);
      await testHelpers.setCursorPosition(position.line, position.character);

      // Type property name to trigger help
      await testHelpers.typeText('description');
      await testHelpers.sleep(100);

      const signatureHelp = await testHelpers.getSignatureHelp(
        document,
        position.translate(0, 'description'.length),
      );

      expect(signatureHelp).to.not.be.null;
      expect(signatureHelp.signatures).to.have.length.greaterThan(0);

      const signature = signatureHelp.signatures[0];
      expect(signature.documentation).to.include('description');
    });

    it('should show media property signature', async () => {
      const content = `agent TestAgent

displayName "Test Agent"
brandName "Test Brand"

start MainFlow

flow MainFlow {
  message {
    richCard {
      title "Card"
      media
    }
  }
  end
}`;

      const uri = vscode.Uri.parse('untitled:test-media.rcl');
      document = await vscode.workspace.openTextDocument(uri);
      editor = await vscode.window.showTextDocument(document);

      await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), content);
      });

      await testHelpers.waitForLanguageServer();

      const mediaLine = document
        .getText()
        .split('\n')
        .findIndex((line) => line.includes('media'));

      const position = new vscode.Position(mediaLine, (line) => line.indexOf('media') + 5);
      const signatureHelp = await testHelpers.getSignatureHelp(document, position);

      expect(signatureHelp).to.not.be.null;
      expect(signatureHelp.signatures).to.have.length.greaterThan(0);
    });
  });

  describe('Carousel properties', () => {
    it('should show signature help for carousel properties', async () => {
      const content = `agent TestAgent

displayName "Test Agent"
brandName "Test Brand"

start MainFlow

flow MainFlow {
  message {
    carousel {
      width MEDIUM
      
    }
  }
  end
}`;

      const uri = vscode.Uri.parse('untitled:test-carousel.rcl');
      document = await vscode.workspace.openTextDocument(uri);
      editor = await vscode.window.showTextDocument(document);

      await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), content);
      });

      await testHelpers.waitForLanguageServer();

      const widthLine = document
        .getText()
        .split('\n')
        .findIndex((line) => line.includes('width MEDIUM'));

      const position = new vscode.Position(widthLine + 1, 6);
      await testHelpers.setCursorPosition(position.line, position.character);

      await testHelpers.typeText('richCard');
      await testHelpers.sleep(100);

      const signatureHelp = await testHelpers.getSignatureHelp(
        document,
        position.translate(0, 'richCard'.length),
      );

      expect(signatureHelp).to.not.be.null;
      expect(signatureHelp.signatures).to.have.length.greaterThan(0);
    });
  });

  describe('Agent properties', () => {
    it('should show signature help for agent properties', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      editor = await vscode.window.showTextDocument(document);
      await testHelpers.waitForLanguageServer();

      // Find position after 'brandName' line
      const brandLine = document
        .getText()
        .split('\n')
        .findIndex((line) => line.includes('brandName "Test Brand"'));

      const position = new vscode.Position(brandLine + 1, 0);
      await testHelpers.setCursorPosition(position.line, position.character);

      await testHelpers.typeText('agentConfig');
      await testHelpers.sleep(100);

      const signatureHelp = await testHelpers.getSignatureHelp(
        document,
        position.translate(0, 'agentConfig'.length),
      );

      expect(signatureHelp).to.not.be.null;
      if (signatureHelp.signatures.length > 0) {
        expect(signatureHelp.signatures[0].documentation).to.exist;
      }
    });
  });

  describe('Flow properties', () => {
    it('should show signature help for flow properties', async () => {
      const content = `agent TestAgent

displayName "Test Agent"
brandName "Test Brand"

start MainFlow

flow MainFlow {
  timeout
  
  message {
    text "Hello"
  }
  end
}`;

      const uri = vscode.Uri.parse('untitled:test-flow-props.rcl');
      document = await vscode.workspace.openTextDocument(uri);
      editor = await vscode.window.showTextDocument(document);

      await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), content);
      });

      await testHelpers.waitForLanguageServer();

      const timeoutLine = document
        .getText()
        .split('\n')
        .findIndex((line) => line.includes('timeout'));

      const position = new vscode.Position(timeoutLine, (line) => line.indexOf('timeout') + 7);
      const signatureHelp = await testHelpers.getSignatureHelp(document, position);

      expect(signatureHelp).to.not.be.null;
      if (signatureHelp.signatures.length > 0) {
        expect(signatureHelp.signatures[0].label).to.include('timeout');
      }
    });
  });

  describe('Config properties', () => {
    it('should show signature help for config properties', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      editor = await vscode.window.showTextDocument(document);
      await testHelpers.waitForLanguageServer();

      // Find config section
      const configLine = document
        .getText()
        .split('\n')
        .findIndex((line) => line.includes('agentConfig Config {'));

      const descLine = configLine + 1;
      const position = new vscode.Position(descLine, document.lineAt(descLine).text.length);

      await testHelpers.setCursorPosition(position.line, position.character);
      await testHelpers.typeText('\n  privacy');
      await testHelpers.sleep(100);

      const newPos = position.translate(1, 9); // After 'privacy'
      const signatureHelp = await testHelpers.getSignatureHelp(document, newPos);

      expect(signatureHelp).to.not.be.null;
      if (signatureHelp.signatures.length > 0) {
        const signature = signatureHelp.signatures[0];
        expect(signature.documentation).to.include('privacy');
      }
    });
  });

  describe('Trigger characters', () => {
    it('should trigger on colon character', async () => {
      const content = `agent TestAgent

displayName "Test Agent"
brandName "Test Brand"

start MainFlow

flow MainFlow {
  message {
    text
  }
  end
}`;

      const uri = vscode.Uri.parse('untitled:test-colon-trigger.rcl');
      document = await vscode.workspace.openTextDocument(uri);
      editor = await vscode.window.showTextDocument(document);

      await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), content);
      });

      await testHelpers.waitForLanguageServer();

      const textLine = document
        .getText()
        .split('\n')
        .findIndex((line) => line.includes('text'));

      const position = new vscode.Position(textLine, (line) => line.indexOf('text') + 4);
      await testHelpers.setCursorPosition(position.line, position.character);

      await testHelpers.typeText(':');
      await testHelpers.sleep(100);

      const signatureHelp = await testHelpers.getSignatureHelp(document, position.translate(0, 1));

      expect(signatureHelp).to.not.be.null;
    });

    it('should trigger on space character in appropriate contexts', async () => {
      const content = `agent TestAgent

displayName "Test Agent"
brandName "Test Brand"

start MainFlow

flow MainFlow {
  message {
    suggestions [
      reply
    ]
  }
  end
}`;

      const uri = vscode.Uri.parse('untitled:test-space-trigger.rcl');
      document = await vscode.workspace.openTextDocument(uri);
      editor = await vscode.window.showTextDocument(document);

      await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), content);
      });

      await testHelpers.waitForLanguageServer();

      const replyLine = document
        .getText()
        .split('\n')
        .findIndex((line) => line.includes('reply'));

      const position = new vscode.Position(replyLine, (line) => line.indexOf('reply') + 5);
      await testHelpers.setCursorPosition(position.line, position.character);

      await testHelpers.typeText(' ');
      await testHelpers.sleep(100);

      const signatureHelp = await testHelpers.getSignatureHelp(document, position.translate(0, 1));

      expect(signatureHelp).to.not.be.null;
    });

    it('should trigger on quote character for string values', async () => {
      const content = `agent TestAgent

displayName "Test Agent"
brandName "Test Brand"

start MainFlow

flow MainFlow {
  message {
    text 
  }
  end
}`;

      const uri = vscode.Uri.parse('untitled:test-quote-trigger.rcl');
      document = await vscode.workspace.openTextDocument(uri);
      editor = await vscode.window.showTextDocument(document);

      await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), content);
      });

      await testHelpers.waitForLanguageServer();

      const textLine = document
        .getText()
        .split('\n')
        .findIndex((line) => line.includes('text '));

      const position = new vscode.Position(textLine, (line) => line.indexOf('text ') + 5);
      await testHelpers.setCursorPosition(position.line, position.character);

      await testHelpers.typeText('"');
      await testHelpers.sleep(100);

      const signatureHelp = await testHelpers.getSignatureHelp(document, position.translate(0, 1));

      expect(signatureHelp).to.not.be.null;
    });
  });

  describe('Active parameter tracking', () => {
    it('should highlight the active parameter', async () => {
      const content = `agent TestAgent

displayName "Test Agent"
brandName "Test Brand"

start MainFlow

flow MainFlow {
  message {
    suggestions [
      openUrl "Click here",
    ]
  }
  end
}`;

      const uri = vscode.Uri.parse('untitled:test-active-param.rcl');
      document = await vscode.workspace.openTextDocument(uri);
      editor = await vscode.window.showTextDocument(document);

      await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), content);
      });

      await testHelpers.waitForLanguageServer();

      const openUrlLine = document
        .getText()
        .split('\n')
        .findIndex((line) => line.includes('openUrl'));

      // Position after the comma
      const position = new vscode.Position(openUrlLine, (line) => line.indexOf(',') + 1);
      await testHelpers.setCursorPosition(position.line, position.character);

      await testHelpers.typeText(' ');
      await testHelpers.sleep(100);

      const signatureHelp = await testHelpers.getSignatureHelp(document, position.translate(0, 1));

      expect(signatureHelp).to.not.be.null;
      if (signatureHelp.signatures.length > 0 && signatureHelp.activeParameter !== undefined) {
        expect(signatureHelp.activeParameter).to.equal(1); // Second parameter
      }
    });
  });
});
