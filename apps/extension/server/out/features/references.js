"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferencesProvider = void 0;
class ReferencesProvider {
    constructor(parser) {
        this.parser = parser;
    }
    async getReferences(_document, _position, _context) {
        // Basic implementation - can be enhanced later
        return [];
    }
}
exports.ReferencesProvider = ReferencesProvider;
//# sourceMappingURL=references.js.map