import { expect } from 'chai';
import * as vscode from 'vscode';
import * as testHelpers from '../../utils/testHelpers';

describe('Code Actions Provider', () => {
  let document: vscode.TextDocument;

  beforeEach(async () => {
    await testHelpers.closeAllEditors();
  });

  afterEach(async () => {
    await testHelpers.closeAllEditors();
  });

  describe('Import Missing Symbol', () => {
    it('should offer import action for undefined symbol', async () => {
      // Create a document with an undefined symbol reference
      const content = `agent TestAgent

displayName "Test Agent"
brandName "Test Brand"

start MainFlow

flow MainFlow {
  // Reference to undefined imported flow
  next: UndefinedFlow
}`;

      const uri = vscode.Uri.parse('untitled:test-import.rcl');
      const doc = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(doc);
      await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), content);
      });

      await testHelpers.waitForLanguageServer();
      await testHelpers.sleep(1000); // Wait for diagnostics

      // Find the error position
      const errorPos = testHelpers.findFirstOccurrence(doc, 'UndefinedFlow');
      if (!errorPos) throw new Error('Undefined symbol not found');

      const range = new vscode.Range(errorPos, errorPos.translate(0, 'UndefinedFlow'.length));
      const actions = await testHelpers.getCodeActions(doc, range);

      const importAction = actions.find(
        (action) => action.title.includes('Import') || action.title.includes('import'),
      );

      expect(importAction).to.exist;
      expect(importAction?.kind).to.equal(vscode.CodeActionKind.QuickFix);
    });
  });

  describe('Create Missing Message', () => {
    it('should offer to create missing message in Messages section', async () => {
      document = await testHelpers.openDocument('error-cases.rcl');
      await testHelpers.waitForLanguageServer();
      await testHelpers.sleep(1000);

      const errorPos = testHelpers.findFirstOccurrence(document, 'UndefinedMessage');
      if (!errorPos) throw new Error('Undefined message not found');

      const range = new vscode.Range(errorPos, errorPos.translate(0, 'UndefinedMessage'.length));
      const actions = await testHelpers.getCodeActions(document, range);

      const createMessageAction = actions.find(
        (action) =>
          action.title.includes('Create message') ||
          action.title.includes('Create missing message'),
      );

      expect(createMessageAction).to.exist;
      expect(createMessageAction?.kind).to.equal(vscode.CodeActionKind.QuickFix);
    });

    it('should create Messages section if it does not exist', async () => {
      const content = `agent TestAgent

displayName "Test Agent"
brandName "Test Brand"

start MainFlow

flow MainFlow {
  message MissingMessage
  end
}`;

      const uri = vscode.Uri.parse('untitled:test-messages.rcl');
      const doc = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(doc);
      await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), content);
      });

      await testHelpers.waitForLanguageServer();
      await testHelpers.sleep(1000);

      const errorPos = testHelpers.findFirstOccurrence(doc, 'MissingMessage');
      if (!errorPos) throw new Error('Missing message not found');

      const range = new vscode.Range(errorPos, errorPos.translate(0, 'MissingMessage'.length));
      const actions = await testHelpers.getCodeActions(doc, range);

      const createAction = actions.find((action) => action.title.includes('Create message'));

      expect(createAction).to.exist;

      // Apply the action
      if (createAction && createAction.edit) {
        const success = await vscode.workspace.applyEdit(createAction.edit);
        expect(success).to.be.true;

        const updatedText = doc.getText();
        expect(updatedText).to.include('messages Messages');
        expect(updatedText).to.include('MissingMessage {');
      }
    });
  });

  describe('Fix Invalid Transition', () => {
    it('should offer to fix invalid transition syntax', async () => {
      document = await testHelpers.openDocument('error-cases.rcl');
      await testHelpers.waitForLanguageServer();
      await testHelpers.sleep(1000);

      // Find the invalid transition line
      const invalidLine = document
        .getText()
        .split('\n')
        .findIndex((line) => line.includes('when userMessage InvalidState'));

      if (invalidLine === -1) throw new Error('Invalid transition not found');

      const range = new vscode.Range(
        new vscode.Position(invalidLine, 0),
        new vscode.Position(invalidLine, document.lineAt(invalidLine).text.length),
      );

      const actions = await testHelpers.getCodeActions(document, range);

      const fixAction = actions.find(
        (action) => action.title.includes('Fix transition') || action.title.includes('Add colon'),
      );

      expect(fixAction).to.exist;
    });
  });

  describe('Convert to Rich Card', () => {
    it('should offer to convert text message to rich card', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      await testHelpers.waitForLanguageServer();

      // Find a text message
      const textMessageLine = document
        .getText()
        .split('\n')
        .findIndex((line) => line.includes('text "Hello! Welcome to our test agent."'));

      if (textMessageLine === -1) throw new Error('Text message not found');

      const range = new vscode.Range(
        new vscode.Position(textMessageLine, 0),
        new vscode.Position(textMessageLine, document.lineAt(textMessageLine).text.length),
      );

      const actions = await testHelpers.getCodeActions(document, range);

      const convertAction = actions.find(
        (action) =>
          action.title.includes('Convert to rich card') || action.title.includes('rich card'),
      );

      expect(convertAction).to.exist;
      expect(convertAction?.kind).to.equal(vscode.CodeActionKind.RefactorRewrite);
    });
  });

  describe('Extract Message', () => {
    it('should offer to extract inline message to Messages section', async () => {
      const content = `agent TestAgent

displayName "Test Agent"
brandName "Test Brand"

start MainFlow

flow MainFlow {
  message {
    text "This is an inline message"
    suggestions [
      reply "OK"
    ]
  }
  end
}

messages Messages {
  // Existing messages
}`;

      const uri = vscode.Uri.parse('untitled:test-extract.rcl');
      const doc = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(doc);
      await editor.edit((editBuilder) => {
        editBuilder.insert(new vscode.Position(0, 0), content);
      });

      await testHelpers.waitForLanguageServer();

      // Find the inline message
      const inlinePos = testHelpers.findFirstOccurrence(doc, 'message {');
      if (!inlinePos) throw new Error('Inline message not found');

      const range = new vscode.Range(inlinePos, inlinePos.translate(0, 10));
      const actions = await testHelpers.getCodeActions(doc, range);

      const extractAction = actions.find(
        (action) =>
          action.title.includes('Extract message') || action.title.includes('Extract to Messages'),
      );

      expect(extractAction).to.exist;
      expect(extractAction?.kind).to.equal(vscode.CodeActionKind.RefactorExtract);
    });
  });

  describe('Create Missing Flow', () => {
    it('should offer to create missing flow definition', async () => {
      document = await testHelpers.openDocument('error-cases.rcl');
      await testHelpers.waitForLanguageServer();
      await testHelpers.sleep(1000);

      // Find reference to non-existent state
      const errorPos = testHelpers.findFirstOccurrence(document, 'NonExistentState');
      if (!errorPos) throw new Error('Non-existent state not found');

      const range = new vscode.Range(errorPos, errorPos.translate(0, 'NonExistentState'.length));
      const actions = await testHelpers.getCodeActions(document, range);

      const createFlowAction = actions.find(
        (action) => action.title.includes('Create state') || action.title.includes('Create flow'),
      );

      expect(createFlowAction).to.exist;
    });
  });

  describe('Multi-file edits', () => {
    it('should support creating resources in separate files when needed', async () => {
      // This would test multi-file scenarios if the extension supports it
      // For now, we'll test that the actions properly modify the current file

      document = await testHelpers.openDocument('error-cases.rcl');
      await testHelpers.waitForLanguageServer();
      await testHelpers.sleep(1000);

      const diagnostics = await testHelpers.getActiveDiagnostics(document.uri);
      expect(diagnostics.length).to.be.greaterThan(0);

      // Get actions for the first diagnostic
      if (diagnostics.length > 0) {
        const firstDiagnostic = diagnostics[0];
        const actions = await testHelpers.getCodeActions(document, firstDiagnostic.range);

        expect(actions.length).to.be.greaterThan(0);

        // Verify that actions have proper edits
        const actionWithEdit = actions.find((action) => action.edit !== undefined);
        expect(actionWithEdit).to.exist;

        if (actionWithEdit?.edit) {
          expect(actionWithEdit.edit.size).to.be.greaterThan(0);
        }
      }
    });
  });
});
