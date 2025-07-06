"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RCL_NULL_VALUES = exports.RCL_BOOLEAN_VALUES = exports.RCL_TYPE_TAGS = exports.RCL_MESSAGE_TYPES = exports.RCL_SECTION_TYPES = exports.RCL_KEYWORDS = exports.SymbolKind = void 0;
var SymbolKind;
(function (SymbolKind) {
    SymbolKind["Agent"] = "agent";
    SymbolKind["Flow"] = "flow";
    SymbolKind["State"] = "state";
    SymbolKind["Message"] = "message";
    SymbolKind["Action"] = "action";
    SymbolKind["Configuration"] = "configuration";
    SymbolKind["Defaults"] = "defaults";
    SymbolKind["Import"] = "import";
    SymbolKind["Parameter"] = "parameter";
    SymbolKind["Expression"] = "expression";
})(SymbolKind || (exports.SymbolKind = SymbolKind = {}));
exports.RCL_KEYWORDS = [
    'agent', 'flow', 'messages', 'defaults', 'configuration', 'import',
    'True', 'False', 'Yes', 'No', 'On', 'Off', 'Enabled', 'Disabled',
    'Active', 'Inactive', 'Null', 'None', 'Void'
];
exports.RCL_SECTION_TYPES = [
    'agent', 'flow', 'messages', 'defaults', 'configuration'
];
exports.RCL_MESSAGE_TYPES = [
    'text', 'rich_card', 'carousel', 'suggestion'
];
exports.RCL_TYPE_TAGS = [
    'phone', 'email', 'url', 'date', 'time', 'duration', 'zip', 'currency'
];
exports.RCL_BOOLEAN_VALUES = [
    'True', 'False', 'Yes', 'No', 'On', 'Off', 'Enabled', 'Disabled', 'Active', 'Inactive'
];
exports.RCL_NULL_VALUES = [
    'Null', 'None', 'Void'
];
//# sourceMappingURL=rclTypes.js.map