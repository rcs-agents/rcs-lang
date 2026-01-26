/**
 * @file Lexical rules (terminals) for RCL grammar
 * @author Saulo Vallory <saulo@tokilabs.io>
 * @license MIT
 */

// Lexical rules - these define the basic tokens
const lexical = {
  // Basic identifier for keywords
  import_identifier: $ => /[a-zA-Z][a-zA-Z0-9_-]*/,

  // Simplified identifier - supports basic spaced identifiers (Title Case)
  identifier: $ => /[A-Z][A-Za-z0-9\-_]*(\s[A-Z][A-Za-z0-9\-_]*)*/, 
  
  // Attribute keys (lowercase)
  attribute_key: $ => /[a-z][a-zA-Z0-9_]*/,
  
  // Section types (lowercase)
  section_type: $ => /[a-z][a-zA-Z0-9]*/,
  
  // String literals
  string: $ => /"(\\.|[^"\\])*"/,
  
  // Numbers
  number: $ => /[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/,
  
  // Atoms (symbols starting with :)
  atom: $ => /:([_a-zA-Z][\w_]*|"[^"\\]*")/,
  
  // ISO duration literals
  iso_duration: $ => /(P((\d+Y)|(\d+M)|(\d+W)|(\d+D)|(T((\d+H)|(\d+M)|(\d+(\.\d+)?S))+))+)|([0-9]+(\.[0-9]+)?s)/,

  // Boolean literals
  boolean_literal: $ => choice(
    'True', 'Yes', 'On', 'Enabled', 'Active',
    'False', 'No', 'Off', 'Disabled', 'Inactive'
  ),
  
  // Null literals
  null_literal: $ => choice('Null', 'None', 'Void'),

  // Comments
  comment: $ => /#.*/,
};

module.exports = lexical;