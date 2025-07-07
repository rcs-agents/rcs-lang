/**
 * @file Value types and type tags for RCL grammar
 * @author Saulo Vallory <saulo@tokilabs.io>
 * @license MIT
 */

const values = {
  // Type tags
  type_tag: $ => seq(
    '<',
    /[a-zA-Z]+/,
    /\s+/,  // Required space after tag name
    /[^\s\|>][^\|>]*/,  // Unquoted content until | or > (no leading space)
    optional(seq(/\s*\|\s*/, /[^>]+/)),
    '>'
  ),

  // Multi-line strings
  multi_line_string: $ => seq(
    choice(
      '|',         // clean
      '|-',        // trim
      '+|',        // preserve
      '+|+'        // preserve all
    ),
    $._newline,
    $._indent,
    repeat(/.*/),
    $._dedent
  ),

  // Core value types
  simple_value: $ => choice(
    $.string,
    $.number,
    $.boolean_literal,
    $.null_literal,
    $.atom,
    $.type_tag
  ),

  enhanced_simple_value: $ => choice(
    $.simple_value,
    $.multi_line_string
  ),

  embedded_value: $ => prec(1, choice(
    // $.embedded_code, // disabled for simplicity
    $.simple_value
  )),

  typed_value: $ => prec(2, choice(
    $.type_tag,
    $.enhanced_simple_value
  )),

  // Parameters and properties
  parameter: $ => seq(
    $.attribute_key,
    ':',
    $.simple_value
  ),

  property_assignment: $ => seq(
    $.attribute_key,
    ':',
    $.value
  ),

  inline_parameter_list: $ => prec.left(seq(
    $.parameter,
    repeat(seq(',', $.parameter))
  )),

  // Qualified names and references
  qualified_name: $ => seq(
    $.identifier,
    repeat(seq('.', $.identifier))
  ),

  ref: $ => $.identifier,

  // Main value type
  value: $ => prec(3, choice(
    $.simple_value,
    $.inline_parameter_list,
    $.list,
    $.dictionary,
    $.mapped_type,
    $.type_tag,
    $.ref
  )),
};

module.exports = values;