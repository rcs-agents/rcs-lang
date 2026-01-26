/**
 * @file Collection types (lists, dictionaries, mapped types) for RCL grammar
 * @author Saulo Vallory <saulo@tokilabs.io>
 * @license MIT
 */

const collections = {
  // Lists
  list: $ => choice(
    $.parentheses_list,
    $.inline_list,
    $.indented_list
  ),

  parentheses_list: $ => prec(5, seq(
    '(',
    optional(seq(
      $.list_item,
      repeat(seq(',', $.list_item))
    )),
    ')'
  )),

  inline_list: $ => prec.left(seq(
    $.list_item,
    repeat1(seq(',', $.list_item))
  )),

  indented_list: $ => seq(
    $._newline,
    $._indent,
    repeat1($.indented_list_item),
    $._dedent
  ),

  indented_list_item: $ => seq('-', $.list_item),

  list_item: $ => prec(4, choice(
    $.simple_value,
    $.nested_list,
    $.type_tag
  )),

  nested_list: $ => seq('(', $.inline_list, ')'),

  // Dictionaries
  dictionary: $ => choice(
    $.brace_object,
    $.indented_object
  ),

  brace_object: $ => seq(
    '{',
    optional(seq(
      $.object_entry,
      repeat(seq(',', $.object_entry))
    )),
    '}'
  ),

  indented_object: $ => seq(
    $._newline,
    $._indent,
    repeat1($.object_entry),
    $._dedent
  ),

  object_entry: $ => seq(
    choice($.string, $.identifier),
    ':',
    $.value
  ),

  // Mapped types
  mapped_type: $ => seq(
    $.identifier,
    'list',
    'of',
    '(',
    $.mapped_type_schema,
    ')',
    ':',
    $._indent,
    repeat1($.mapped_type_item),
    $._dedent
  ),

  mapped_type_schema: $ => seq(
    $.mapped_type_field,
    repeat(seq(',', $.mapped_type_field))
  ),

  mapped_type_field: $ => choice(
    $.attribute_key,
    $.type_tag
  ),

  mapped_type_item: $ => seq('-', $.inline_list),
};

module.exports = collections;