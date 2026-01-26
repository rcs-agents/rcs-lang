/**
 * @file Lexical rules (terminals) for RCL grammar
 * @author Saulo Vallory <saulo@tokilabs.io>
 * @license MIT
 */

// Lexical rules - these define the basic tokens
const lexical = {
  // Basic identifier for keywords
  import_identifier: _$ => /[a-zA-Z][a-zA-Z0-9_-]*/,

  // Simplified identifier - supports basic spaced identifiers (Title Case)
  // Now supports numbers starting words like "Travel Assistant 2000"
  identifier: _$ => /[A-Z][A-Za-z0-9\-_]*(\s[A-Z0-9][A-Za-z0-9\-_]*)*/, 
  
  // Attribute keys (lowercase)
  attribute_key: _$ => /[a-z][a-zA-Z0-9_]*/,
  
  // Section types (lowercase)
  section_type: _$ => /[a-z][a-zA-Z0-9]*/,
  
  // String literals
  string: _$ => /"(\\.|[^"\\])*"/,
  
  // Numbers
  number: _$ => /[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/,
  
  // Atoms (symbols starting with :)
  atom: _$ => /:([_a-zA-Z][\w_]*|"[^"\\]*")/,
  
  // ISO duration literals
  iso_duration: _$ => /(P((\d+Y)|(\d+M)|(\d+W)|(\d+D)|(T((\d+H)|(\d+M)|(\d+(\.\d+)?S))+))+)|([0-9]+(\.[0-9]+)?s)/,

  // Boolean literals
  boolean_literal: _$ => choice(
    'True', 'Yes', 'On', 'Enabled', 'Active',
    'False', 'No', 'Off', 'Disabled', 'Inactive'
  ),
  
  // Null literals
  null_literal: _$ => choice('Null', 'None', 'Void'),

  // Comments
  comment: _$ => /#.*/,
};

module.exports = lexical;