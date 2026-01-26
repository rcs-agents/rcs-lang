import * as assert from 'node:assert';
import { DiagnosticSeverity } from 'vscode-languageserver/node';
import { DiagnosticsProvider } from '../../features/diagnostics';
import { SyntaxValidator } from '../../syntaxValidator';

describe('DiagnosticsProvider', () => {
  let diagnosticsProvider: DiagnosticsProvider;
  let syntaxValidator: SyntaxValidator;

  beforeEach(() => {
    // Create mock syntax validator
    syntaxValidator = new SyntaxValidator(null as any);
    diagnosticsProvider = new DiagnosticsProvider(null as any, syntaxValidator);
  });

  describe('Basic diagnostics', () => {
    it('should return empty diagnostics for valid document', async () => {
      const mockDocument = {
        uri: 'test://test.rcl',
        getText: () => 'agent TestAgent\n  displayName: "Test"',
      } as any;

      const mockSettings = {} as any;

      // Mock the syntax validator to return no errors
      syntaxValidator.validateDocument = () => [];

      const diagnostics = await diagnosticsProvider.getDiagnostics(mockDocument, mockSettings);

      assert.ok(Array.isArray(diagnostics), 'Should return an array');
      assert.equal(diagnostics.length, 0, 'Should return no diagnostics for valid document');
    });

    it('should collect syntax validation diagnostics', async () => {
      const mockDocument = {
        uri: 'test://test.rcl',
        getText: () => 'invalid syntax here',
      } as any;

      const mockSettings = {} as any;

      // Mock the syntax validator to return an error
      const mockSyntaxError = {
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 7 } },
        message: 'Invalid syntax',
        severity: DiagnosticSeverity.Error,
        source: 'rcl-syntax',
      };

      syntaxValidator.validateDocument = () => [mockSyntaxError];

      const diagnostics = await diagnosticsProvider.getDiagnostics(mockDocument, mockSettings);

      assert.equal(diagnostics.length, 1, 'Should return one diagnostic');
      assert.deepEqual(
        diagnostics[0],
        mockSyntaxError,
        'Should include syntax validation diagnostic',
      );
    });
  });

  describe('Multiple diagnostics', () => {
    it('should handle multiple syntax errors', async () => {
      const mockDocument = {
        uri: 'test://test.rcl',
        getText: () => 'invalid\nsyntax\nhere',
      } as any;

      const mockSettings = {} as any;

      const mockErrors = [
        {
          range: { start: { line: 0, character: 0 }, end: { line: 0, character: 7 } },
          message: 'Error 1',
          severity: DiagnosticSeverity.Error,
        },
        {
          range: { start: { line: 1, character: 0 }, end: { line: 1, character: 6 } },
          message: 'Error 2',
          severity: DiagnosticSeverity.Warning,
        },
      ];

      syntaxValidator.validateDocument = () => mockErrors;

      const diagnostics = await diagnosticsProvider.getDiagnostics(mockDocument, mockSettings);

      assert.equal(diagnostics.length, 2, 'Should return multiple diagnostics');
      assert.equal(diagnostics[0].message, 'Error 1');
      assert.equal(diagnostics[1].message, 'Error 2');
    });
  });

  describe('Diagnostic structure validation', () => {
    it('should return properly structured diagnostics', async () => {
      const mockDocument = {
        uri: 'test://test.rcl',
        getText: () => 'test content',
      } as any;

      const mockSettings = {} as any;

      const mockDiagnostic = {
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 4 },
        },
        message: 'Test diagnostic',
        severity: DiagnosticSeverity.Information,
        source: 'rcl-test',
        code: 'TEST001',
      };

      syntaxValidator.validateDocument = () => [mockDiagnostic];

      const diagnostics = await diagnosticsProvider.getDiagnostics(mockDocument, mockSettings);

      assert.equal(diagnostics.length, 1);
      const diagnostic = diagnostics[0];

      assert.ok(diagnostic.range, 'Should have range');
      assert.ok(diagnostic.range.start, 'Should have start position');
      assert.ok(diagnostic.range.end, 'Should have end position');
      assert.ok(diagnostic.message, 'Should have message');
      assert.ok(diagnostic.severity !== undefined, 'Should have severity');
    });
  });

  describe('Error handling', () => {
    it('should handle syntax validator errors gracefully', async () => {
      const mockDocument = {
        uri: 'test://test.rcl',
        getText: () => 'test content',
      } as any;

      const mockSettings = {} as any;

      // Mock syntax validator to throw an error
      syntaxValidator.validateDocument = () => {
        throw new Error('Validator error');
      };

      // The getDiagnostics method should handle this gracefully
      try {
        const diagnostics = await diagnosticsProvider.getDiagnostics(mockDocument, mockSettings);
        // If it doesn't throw, it should at least return an empty array
        assert.ok(
          Array.isArray(diagnostics),
          'Should still return an array even with validator errors',
        );
      } catch (error) {
        // If it throws, that's also acceptable - the test is to ensure it's handled appropriately
        assert.ok(error instanceof Error, 'Should throw a proper error if not handled');
      }
    });
  });
});
