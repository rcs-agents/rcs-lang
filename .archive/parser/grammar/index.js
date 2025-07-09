/**
 * @file Modular RCL grammar for tree-sitter
 * @author Saulo Vallory <saulo@tokilabs.io>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Import all grammar modules
const lexical = require('./lexical');
const values = require('./values'); 
const collections = require('./collections');
const agent = require('./agent');
const flows = require('./flows');
const messages = require('./messages');
const richCards = require('./rich_cards');

module.exports = grammar({
  name: "rcl",

  externals: $ => [
    $._newline,
    $._indent,
    $._dedent,
  ],

  extras: $ => [
    /[ \t]/,
    $.comment,
  ],

  word: $ => $.import_identifier,

  rules: {
    // Main entry point
    source_file: $ => seq(
      repeat($.import_statement),
      optional($.agent_definition)
    ),

    // Combine all rule modules
    ...lexical,
    ...values,
    ...collections,
    ...agent,
    ...flows,
    ...messages,
    ...richCards,
  }
});