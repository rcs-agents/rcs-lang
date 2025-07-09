# RCL Grammar Modules

This directory contains the modular structure of the RCL tree-sitter grammar, organized by language features for better maintainability and clarity.

## Module Structure

### Core Modules

- **`index.js`** - Main grammar entry point that combines all modules
- **`lexical.js`** - Lexical rules (terminals) like identifiers, strings, numbers

### Language Feature Modules

- **`values.js`** - Value types, type tags, parameters, and simple values
- **`collections.js`** - Lists, dictionaries, and mapped types
- **`agent.js`** - Agent definitions, configuration, and imports
- **`flows.js`** - Flow definitions and rules
- **`messages.js`** - Message definitions and shortcuts
- **`rich_cards.js`** - Rich card and carousel definitions

## Benefits of Modular Structure

1. **Maintainability** - Each feature is contained in its own file
2. **Readability** - Easier to understand specific language features
3. **Collaboration** - Different developers can work on different features
4. **Testing** - Can focus testing on specific language areas
5. **Documentation** - Each module can have feature-specific documentation

## Usage

The grammar is automatically loaded from `grammar.js` which imports `grammar/index.js`. The modular structure is transparent to tree-sitter - it still generates a single grammar file.

## Adding New Features

To add a new language feature:

1. Create a new module file (e.g., `templates.js`)
2. Export an object with the grammar rules
3. Import and spread it in `index.js`
4. Update this README

Example:

```javascript
// grammar/templates.js
const templates = {
  template_definition: $ => seq(
    'template',
    $.identifier,
    // ... rules
  ),
};

module.exports = templates;
```

```javascript
// grammar/index.js
const templates = require('./templates');

module.exports = grammar({
  // ...
  rules: {
    // ...
    ...templates,
  }
});
```

## Module Dependencies

The modules have some interdependencies:

- `values.js` depends on `lexical.js` and `collections.js`
- `agent.js` depends on `values.js`
- `messages.js` depends on `values.js` and `rich_cards.js`
- `flows.js` depends on `values.js`

These dependencies are resolved through the main `index.js` file which combines all rules into a single namespace.