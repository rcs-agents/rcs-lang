/**
 * @file Flow definitions for RCL grammar
 * @author Saulo Vallory <saulo@tokilabs.io>
 * @license MIT
 */

const flows = {
  // Flow section (per specification: flow IDENTIFIER + indented block)
  flow_section: $ => seq(
    'flow',
    $.identifier,
    $._newline,
    $._indent,
    repeat($.flow_rule),
    $._dedent
  ),

  flow_rule: $ => seq(
    $.flow_operand_or_expression,
    repeat1(seq('->', $.flow_operand_or_expression)),
    optional($.with_clause),
    repeat($.when_clause),
    $._newline
  ),

  flow_operand: $ => choice(
    $.atom,
    $.identifier,
    $.string
  ),

  flow_action_text: $ => seq('text', $.enhanced_simple_value),

  flow_operand_or_expression: $ => choice(
    $.flow_operand,
    $.flow_action_text,
    // $.embedded_code, // disabled for simplicity
    seq('start', $.identifier)
  ),

  with_clause: $ => seq(
    'with',
    $._indent,
    repeat1(seq($.attribute_key, ':', $.value)),
    $._dedent
  ),

  when_clause: $ => seq('when', $.string),
};

module.exports = flows;