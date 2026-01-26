"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefinitionProvider = void 0;
class DefinitionProvider {
    constructor(parser) {
        this.parser = parser;
    }
    async getDefinition(_document, _position) {
        // Basic implementation - can be enhanced later
        return null;
    }
}
exports.DefinitionProvider = DefinitionProvider;
//# sourceMappingURL=definition.js.map