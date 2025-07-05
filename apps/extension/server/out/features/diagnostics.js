"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticsProvider = void 0;
class DiagnosticsProvider {
    constructor(parser, syntaxValidator) {
        this.parser = parser;
        this.syntaxValidator = syntaxValidator;
    }
    async getDiagnostics(document, settings) {
        const diagnostics = [];
        // Syntax validation
        diagnostics.push(...this.syntaxValidator.validateDocument(document));
        // Additional semantic validation can be added here
        return diagnostics;
    }
}
exports.DiagnosticsProvider = DiagnosticsProvider;
//# sourceMappingURL=diagnostics.js.map