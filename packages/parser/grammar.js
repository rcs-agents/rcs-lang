/**
 * @file Main grammar entry point for RCL tree-sitter parser
 * 
 * This file loads the stack-based grammar that works without external scanner.
 * This makes the parser compatible with browser environments via WASM.
 * 
 * @author Saulo Vallory <saulo@tokilabs.io>
 * @license MIT
 */

// Use the stack-based grammar that works without external scanner
module.exports = require('./grammar/index-stack-based.js');