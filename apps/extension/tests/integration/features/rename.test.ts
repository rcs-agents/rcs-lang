import { expect } from 'chai';
import * as vscode from 'vscode';
import * as testHelpers from '../../utils/testHelpers.js';

describe('Rename Provider', () => {
  let document: vscode.TextDocument;

  beforeEach(async () => {
    await testHelpers.closeAllEditors();
  });

  afterEach(async () => {
    await testHelpers.closeAllEditors();
  });

  describe('prepares rename for valid identifiers', () => {
    it('should prepare rename for agent names', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      await testHelpers.waitForLanguageServer();

      const agentPos = testHelpers.findFirstOccurrence(document, 'SimpleAgent');
      if (!agentPos) throw new Error('Agent name not found');

      // Try to prepare rename
      const prepareResult = await vscode.commands.executeCommand<vscode.Range>(
        'vscode.prepareRename',
        document.uri,
        agentPos,
      );

      expect(prepareResult).to.not.be.null;
      expect(prepareResult).to.be.instanceOf(vscode.Range);
    });

    it('should prepare rename for flow names', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      await testHelpers.waitForLanguageServer();

      const flowPos = testHelpers.findFirstOccurrence(document, 'GreetingFlow');
      if (!flowPos) throw new Error('Flow name not found');

      const prepareResult = await vscode.commands.executeCommand<vscode.Range>(
        'vscode.prepareRename',
        document.uri,
        flowPos,
      );

      expect(prepareResult).to.not.be.null;
      expect(prepareResult).to.be.instanceOf(vscode.Range);
    });

    it('should prepare rename for message identifiers', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      await testHelpers.waitForLanguageServer();

      const messagePos = testHelpers.findFirstOccurrence(document, 'WelcomeMessage');
      if (!messagePos) throw new Error('Message name not found');

      const prepareResult = await vscode.commands.executeCommand<vscode.Range>(
        'vscode.prepareRename',
        document.uri,
        messagePos,
      );

      expect(prepareResult).to.not.be.null;
      expect(prepareResult).to.be.instanceOf(vscode.Range);
    });

    it('should prepare rename for state names', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      await testHelpers.waitForLanguageServer();

      const statePos = testHelpers.findFirstOccurrence(document, 'UserResponseState');
      if (!statePos) throw new Error('State name not found');

      const prepareResult = await vscode.commands.executeCommand<vscode.Range>(
        'vscode.prepareRename',
        document.uri,
        statePos,
      );

      expect(prepareResult).to.not.be.null;
      expect(prepareResult).to.be.instanceOf(vscode.Range);
    });

    it('should not prepare rename for keywords', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      await testHelpers.waitForLanguageServer();

      const keywordPos = testHelpers.findFirstOccurrence(document, 'agent');
      if (!keywordPos) throw new Error('Keyword not found');

      const prepareResult = await vscode.commands.executeCommand<vscode.Range | null>(
        'vscode.prepareRename',
        document.uri,
        keywordPos,
      );

      expect(prepareResult).to.be.null;
    });
  });

  describe('validates new identifier names', () => {
    it('should accept valid RCL identifiers', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      await testHelpers.waitForLanguageServer();

      const agentPos = testHelpers.findFirstOccurrence(document, 'SimpleAgent');
      if (!agentPos) throw new Error('Agent name not found');

      const workspaceEdit = await testHelpers.getRenameEdits(document, agentPos, 'MyNewAgent');

      expect(workspaceEdit).to.not.be.null;
      expect(workspaceEdit.size).to.be.greaterThan(0);
    });

    it('should reject invalid identifier names', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      await testHelpers.waitForLanguageServer();

      const agentPos = testHelpers.findFirstOccurrence(document, 'SimpleAgent');
      if (!agentPos) throw new Error('Agent name not found');

      try {
        await testHelpers.getRenameEdits(
          document,
          agentPos,
          '123Invalid', // Invalid identifier starting with number
        );
        expect.fail('Should have thrown an error');
      } catch (error) {
        // Expected to fail
        expect(error).to.exist;
      }
    });
  });

  describe('renames symbols across document', () => {
    it('should rename all occurrences of a flow name', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      await testHelpers.waitForLanguageServer();

      const flowPos = testHelpers.findFirstOccurrence(document, 'GreetingFlow');
      if (!flowPos) throw new Error('Flow name not found');

      const workspaceEdit = await testHelpers.getRenameEdits(document, flowPos, 'WelcomeFlow');

      // Apply the edit
      const success = await vscode.workspace.applyEdit(workspaceEdit);
      expect(success).to.be.true;

      // Verify the document was updated
      const updatedText = document.getText();
      expect(updatedText).to.not.include('GreetingFlow');
      expect(updatedText).to.include('WelcomeFlow');

      // Check that both occurrences were renamed (in flow definition and start declaration)
      const firstIndex = updatedText.indexOf('WelcomeFlow');
      const lastIndex = updatedText.lastIndexOf('WelcomeFlow');
      expect(firstIndex).to.not.equal(lastIndex); // Should appear at least twice
    });

    it('should rename message references in flows and messages section', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      await testHelpers.waitForLanguageServer();

      const messagePos = testHelpers.findFirstOccurrence(document, 'WelcomeMessage');
      if (!messagePos) throw new Error('Message name not found');

      const workspaceEdit = await testHelpers.getRenameEdits(
        document,
        messagePos,
        'GreetingMessage',
      );

      const success = await vscode.workspace.applyEdit(workspaceEdit);
      expect(success).to.be.true;

      const updatedText = document.getText();
      expect(updatedText).to.not.include('WelcomeMessage');
      expect(updatedText).to.include('GreetingMessage');
    });

    it('should rename state references in transitions', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      await testHelpers.waitForLanguageServer();

      const statePos = testHelpers.findFirstOccurrence(document, 'UserResponseState');
      if (!statePos) throw new Error('State name not found');

      const workspaceEdit = await testHelpers.getRenameEdits(document, statePos, 'UserReplyState');

      const success = await vscode.workspace.applyEdit(workspaceEdit);
      expect(success).to.be.true;

      const updatedText = document.getText();
      expect(updatedText).to.not.include('UserResponseState');
      expect(updatedText).to.include('UserReplyState');
    });
  });

  describe('handles edge cases', () => {
    it('should not rename partial matches', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      await testHelpers.waitForLanguageServer();

      // Add a text that contains the flow name as substring
      const editor = await vscode.window.showTextDocument(document);
      await editor.edit((editBuilder) => {
        const lastLine = document.lineCount - 1;
        const lastChar = document.lineAt(lastLine).text.length;
        editBuilder.insert(
          new vscode.Position(lastLine, lastChar),
          '\n\n// This is a GreetingFlowExample comment',
        );
      });

      const flowPos = testHelpers.findFirstOccurrence(document, 'GreetingFlow');
      if (!flowPos) throw new Error('Flow name not found');

      const workspaceEdit = await testHelpers.getRenameEdits(document, flowPos, 'WelcomeFlow');

      const success = await vscode.workspace.applyEdit(workspaceEdit);
      expect(success).to.be.true;

      const updatedText = document.getText();
      expect(updatedText).to.include('GreetingFlowExample'); // Partial match should not be renamed
      expect(updatedText).to.include('WelcomeFlow'); // Actual identifier should be renamed
    });

    it('should handle undo/redo correctly', async () => {
      document = await testHelpers.openDocument('simple-agent.rcl');
      await testHelpers.waitForLanguageServer();

      const originalText = document.getText();

      const agentPos = testHelpers.findFirstOccurrence(document, 'SimpleAgent');
      if (!agentPos) throw new Error('Agent name not found');

      const workspaceEdit = await testHelpers.getRenameEdits(document, agentPos, 'RenamedAgent');

      await vscode.workspace.applyEdit(workspaceEdit);
      expect(document.getText()).to.include('RenamedAgent');

      // Undo
      await vscode.commands.executeCommand('undo');
      expect(document.getText()).to.equal(originalText);

      // Redo
      await vscode.commands.executeCommand('redo');
      expect(document.getText()).to.include('RenamedAgent');
    });
  });
});
