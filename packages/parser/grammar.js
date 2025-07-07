/**
 * @file Main grammar entry point for RCL tree-sitter parser
 * 
 * This file loads the modular grammar structure from the grammar/ directory.
 * Each module focuses on specific language features for better organization
 * and maintainability.
 * 
 * @author Saulo Vallory <saulo@tokilabs.io>
 * @license MIT
 */

module.exports = require('./grammar/index.js');