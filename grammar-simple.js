/**
 * @file Simple Rcl grammar for tree-sitter (minimal version)
 * @author Saulo Vallory <saulo@tokilabs.io>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "rcl",

  extras: $ => [
    /[\t ]+/,
    /[\r\n]+/,
    $.comment,
  ],

  word: $ => $.identifier,

  rules: {
    // Main entry point
    source_file: $ => $.agent_definition,

    // Comments
    comment: $ => /#.*/,

    // Lexical rules (terminals)
    identifier: $ => /[A-Z][A-Za-z0-9\-_ ]*/,
    attribute_key: $ => /[a-z][a-zA-Z0-9_]*/,
    
    string: $ => /"(\\.|[^"\\])*"/,
    number: $ => /[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/,
    atom: $ => /:([_a-zA-Z][\w_]*|"[^"\\]*")/,

    // Boolean and null literals
    boolean_literal: $ => choice(
      'True', 'Yes', 'On', 'Enabled', 'Active',
      'False', 'No', 'Off', 'Disabled', 'Inactive'
    ),
    null_literal: $ => choice('Null', 'None', 'Void'),

    // Core value types
    simple_value: $ => choice(
      $.string,
      $.number,
      $.boolean_literal,
      $.null_literal,
      $.atom
    ),

    // Agent definition (minimal)
    agent_definition: $ => seq(
      'agent',
      $.identifier,
      'displayName',
      ':',
      $.string,
      'flow',
      $.identifier,
      'messages',
      'Messages',
      $.message_shortcut
    ),

    // Message shortcuts (minimal)
    message_shortcut: $ => seq(
      'text',
      $.simple_value
    ),
  }
});