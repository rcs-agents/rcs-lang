import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import * as vscode from 'vscode';

export class TestClient {
  private documents: Map<string, vscode.TextDocument> = new Map();

  async init(): Promise<void> {
    // Initialize the test client
    await this.closeAllEditors();
  }

  async dispose(): Promise<void> {
    await this.closeAllEditors();
    this.documents.clear();
  }

  async openFile(filePath: string): Promise<vscode.TextDocument> {
    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);
    this.documents.set(filePath, document);
    return document;
  }

  async getDiagnostics(filePath: string): Promise<vscode.Diagnostic[]> {
    const uri = vscode.Uri.file(filePath);
    // Wait for diagnostics to be updated
    await this.sleep(1000);
    return vscode.languages.getDiagnostics(uri);
  }

  async getDocumentContent(filePath: string): Promise<string> {
    const document = this.documents.get(filePath);
    if (document) {
      return document.getText();
    }

    const uri = vscode.Uri.file(filePath);
    const doc = await vscode.workspace.openTextDocument(uri);
    return doc.getText();
  }

  async executeCommand(command: string, ...args: any[]): Promise<any> {
    return await vscode.commands.executeCommand(command, ...args);
  }

  async createFile(filePath: string, content: string): Promise<void> {
    await fs.promises.writeFile(filePath, content, 'utf8');
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      // File may not exist, ignore error
    }
  }

  async closeAllEditors(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export async function openDocument(filename: string): Promise<vscode.TextDocument> {
  const fixturePath = path.join(__dirname, '..', 'fixtures', filename);
  const document = await vscode.workspace.openTextDocument(fixturePath);
  await vscode.window.showTextDocument(document);
  return document;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeCommand(command: string, ...args: any[]): Promise<any> {
  return await vscode.commands.executeCommand(command, ...args);
}

export async function getActiveDiagnostics(uri: vscode.Uri): Promise<vscode.Diagnostic[]> {
  // Wait for diagnostics to be updated
  await sleep(500);
  return vscode.languages.getDiagnostics(uri);
}

export async function typeText(text: string): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    throw new Error('No active text editor');
  }

  await editor.edit((editBuilder) => {
    editBuilder.insert(editor.selection.active, text);
  });
}

export async function setCursorPosition(line: number, character: number): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    throw new Error('No active text editor');
  }

  const position = new vscode.Position(line, character);
  editor.selection = new vscode.Selection(position, position);
}

export async function waitForLanguageServer(maxWait = 5000): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    try {
      // Try to get hover info as a test that language server is ready
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const hover = await vscode.commands.executeCommand<vscode.Hover[]>(
          'vscode.executeHoverProvider',
          editor.document.uri,
          new vscode.Position(0, 0),
        );
        if (hover && hover.length > 0) {
          return;
        }
      }
    } catch (e) {
      // Language server not ready yet
    }
    await sleep(100);
  }

  throw new Error('Language server did not start within timeout');
}

export function getCodeActions(
  document: vscode.TextDocument,
  range: vscode.Range,
): Thenable<vscode.CodeAction[]> {
  return vscode.commands.executeCommand<vscode.CodeAction[]>(
    'vscode.executeCodeActionProvider',
    document.uri,
    range,
  );
}

export function getRenameEdits(
  document: vscode.TextDocument,
  position: vscode.Position,
  newName: string,
): Thenable<vscode.WorkspaceEdit> {
  return vscode.commands.executeCommand<vscode.WorkspaceEdit>(
    'vscode.executeDocumentRenameProvider',
    document.uri,
    position,
    newName,
  );
}

export function getSignatureHelp(
  document: vscode.TextDocument,
  position: vscode.Position,
): Thenable<vscode.SignatureHelp> {
  return vscode.commands.executeCommand<vscode.SignatureHelp>(
    'vscode.executeSignatureHelpProvider',
    document.uri,
    position,
  );
}

export async function closeAllEditors(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.closeAllEditors');
}

export function findFirstOccurrence(
  document: vscode.TextDocument,
  searchText: string,
): vscode.Position | null {
  const text = document.getText();
  const index = text.indexOf(searchText);

  if (index === -1) {
    return null;
  }

  return document.positionAt(index);
}
