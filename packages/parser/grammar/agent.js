/**
 * @file Agent definition and configuration for RCL grammar
 * @author Saulo Vallory <saulo@tokilabs.io>
 * @license MIT
 */

const agent = {
  // Import statements
  import_statement: $ => seq(
    'import',
    $.import_path,
    optional(seq('as', $.identifier))
  ),

  import_path: $ => seq(
    $.import_identifier,
    repeat(seq('/', $.import_identifier))
  ),

  // Agent definition (per specification: agent IDENTIFIER + indented block)
  agent_definition: $ => seq(
    'agent',
    field('name', $.identifier),
    $._newline,
    field('body', $.agent_body)
  ),
  
  agent_body: $ => seq(
    $._indent,
    repeat1(choice(
      seq('displayName', ':', $.string, $._newline),
      seq('brandName', ':', $.string, $._newline),
      $.config_section,
      $.defaults_section,
      $.flow_section,
      $.messages_section
    )),
    $._dedent
  ),

  // Defaults section
  defaults_section: $ => seq(
    'agentDefaults',
    'Defaults',
    $._newline,
    $._indent,
    repeat($.default_property),
    $._dedent
  ),

  default_property: $ => seq(
    choice(
      seq('fallbackMessage', ':', $.enhanced_simple_value),
      seq('messageTrafficType', ':', $.atom),
      seq('ttl', ':', $.string),
      seq('postbackData', ':', $.string),
      seq('expressions', ':', $._indent, seq('language', ':', $.atom), $._dedent)
    ),
    optional($._newline)
  ),

  // Config section
  config_section: $ => seq(
    'agentConfig',
    'Config',
    $._newline,
    $._indent,
    repeat($.config_property),
    $._dedent
  ),

  config_property: $ => seq(
    choice(
      seq('description', ':', $.enhanced_simple_value),
      seq('logoUri', ':', $.string),
      seq('heroUri', ':', $.string),
      $.phone_number_property,
      $.email_property,
      $.website_property,
      $.privacy_property,
      $.terms_conditions_property,
      seq('color', ':', $.string),
      $.billing_config_property,
      seq('agentUseCase', ':', $.atom),
      seq('hostingRegion', ':', $.atom)
    ),
    $._newline
  ),

  phone_number_property: $ => seq(
    'phoneNumberEntry',
    $._newline,
    $._indent,
    seq('number', ':', $.typed_value),
    optional(seq('label', ':', $.enhanced_simple_value)),
    $._dedent
  ),

  email_property: $ => seq(
    'emailEntry',
    $._newline,
    $._indent,
    seq('address', ':', $.typed_value),
    optional(seq('label', ':', $.enhanced_simple_value)),
    $._dedent
  ),

  website_property: $ => seq(
    'websiteEntry',
    $._newline,
    $._indent,
    seq('url', ':', $.typed_value),
    optional(seq('label', ':', $.enhanced_simple_value)),
    $._dedent
  ),

  privacy_property: $ => seq(
    'privacy',
    $._newline,
    $._indent,
    seq('url', ':', $.typed_value),
    optional(seq('label', ':', $.enhanced_simple_value)),
    $._dedent
  ),

  terms_conditions_property: $ => seq(
    'termsConditions',
    $._newline,
    $._indent,
    seq('url', ':', $.typed_value),
    optional(seq('label', ':', $.enhanced_simple_value)),
    $._dedent
  ),

  billing_config_property: $ => seq(
    'billingConfig',
    $._newline,
    $._indent,
    optional(seq('billingCategory', ':', $.atom)),
    $._dedent
  ),
};

module.exports = agent;