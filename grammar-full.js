/**
 * @file Rcl grammar for tree-sitter
 * @author Saulo Vallory <saulo@tokilabs.io>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "rcl",

  externals: $ => [
    // $._indent,
    // $._dedent,
    // $._newline,
    // $.identifier,
  ],

  extras: $ => [
    /[\t ]+/,
    $.comment,
  ],

  word: $ => $.identifier,

  rules: {
    // Main entry point
    source_file: $ => seq(
      repeat($.import_statement),
      $.agent_definition
    ),

    // Comments
    comment: $ => /#.*/,

    // Lexical rules (terminals)
    identifier: $ => /[A-Z][A-Za-z0-9\-_ ]*/,
    attribute_key: $ => /[a-z][a-zA-Z0-9_]*/,
    section_type: $ => /[a-z][a-zA-Z0-9]*/,
    
    string: $ => /"(\\.|[^"\\])*"/,
    number: $ => /[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/,
    atom: $ => /:([_a-zA-Z][\w_]*|"[^"\\]*")/,
    iso_duration: $ => /(P((\d+Y)|(\d+M)|(\d+W)|(\d+D)|(T((\d+H)|(\d+M)|(\d+(\.\d+)?S))+))+)|([0-9]+(\.[0-9]+)?s)/,

    // Boolean and null literals
    boolean_literal: $ => choice(
      'True', 'Yes', 'On', 'Enabled', 'Active',
      'False', 'No', 'Off', 'Disabled', 'Inactive'
    ),
    null_literal: $ => choice('Null', 'None', 'Void'),

    // Embedded code
    embedded_code: $ => choice(
      $.single_line_embedded_code,
      $.multi_line_embedded_code
    ),

    single_line_embedded_code: $ => /\$((js|ts)?>)\s*[^\r\n]*/,
    
    multi_line_embedded_code: $ => seq(
      /\$((js|ts)?)>>>/,
      $._indent,
      repeat(/.*/),
      $._dedent
    ),

    // Multi-line strings
    multi_line_string: $ => seq(
      choice(
        '|',         // clean
        '|-',        // trim
        '+|',        // preserve
        '+|+'        // preserve all
      ),
      $._indent,
      repeat(/.*/),
      $._dedent
    ),

    // Type tags
    type_tag: $ => seq(
      '<',
      /[a-zA-Z]+/,
      choice(
        $.string,
        $.number,
        $.boolean_literal,
        $.null_literal,
        $.atom,
        $.identifier,
        $.iso_duration
      ),
      optional(seq('|', /[^>]+/)),
      '>'
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
      $.embedded_code,
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

    // Collections
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

    // Import statements
    import_statement: $ => seq(
      'import',
      $.import_path,
      optional(seq('as', $.identifier))
    ),

    import_path: $ => seq(
      $.identifier,
      repeat(seq('/', $.identifier))
    ),

    // Agent definition (simplified without indentation for now)
    agent_definition: $ => seq(
      'agent',
      $.identifier,
      seq('displayName', ':', $.string),
      optional(seq('brandName', ':', $.string)),
      optional($.config_section),
      optional($.defaults_section),
      repeat1($.flow_section),
      $.messages_section
    ),

    // Defaults section
    defaults_section: $ => seq(
      'agentDefaults',
      'Defaults',
      $._indent,
      repeat($.default_property),
      $._dedent
    ),

    default_property: $ => choice(
      seq('fallbackMessage', ':', $.enhanced_simple_value),
      seq('messageTrafficType', ':', $.atom),
      seq('ttl', ':', $.string),
      seq('postbackData', ':', $.embedded_code),
      seq('expressions', ':', $._indent, seq('language', ':', $.atom), $._dedent)
    ),

    // Config section
    config_section: $ => seq(
      'agentConfig',
      'Config',
      $._indent,
      repeat($.config_property),
      $._dedent
    ),

    config_property: $ => choice(
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

    phone_number_property: $ => seq(
      'phoneNumberEntry',
      $._indent,
      seq('number', ':', $.typed_value),
      optional(seq('label', ':', $.enhanced_simple_value)),
      $._dedent
    ),

    email_property: $ => seq(
      'emailEntry',
      $._indent,
      seq('address', ':', $.typed_value),
      optional(seq('label', ':', $.enhanced_simple_value)),
      $._dedent
    ),

    website_property: $ => seq(
      'websiteEntry',
      $._indent,
      seq('url', ':', $.typed_value),
      optional(seq('label', ':', $.enhanced_simple_value)),
      $._dedent
    ),

    privacy_property: $ => seq(
      'privacy',
      $._indent,
      seq('url', ':', $.typed_value),
      optional(seq('label', ':', $.enhanced_simple_value)),
      $._dedent
    ),

    terms_conditions_property: $ => seq(
      'termsConditions',
      $._indent,
      seq('url', ':', $.typed_value),
      optional(seq('label', ':', $.enhanced_simple_value)),
      $._dedent
    ),

    billing_config_property: $ => seq(
      'billingConfig',
      $._indent,
      optional(seq('billingCategory', ':', $.atom)),
      $._dedent
    ),

    // Flow section (simplified)
    flow_section: $ => seq(
      'flow',
      $.identifier
    ),

    flow_rule: $ => seq(
      $.flow_operand_or_expression,
      repeat1(seq('->', $.flow_operand_or_expression)),
      optional($.with_clause),
      repeat($.when_clause)
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
      $.embedded_code,
      seq('start', $.identifier)
    ),

    with_clause: $ => seq(
      'with',
      $._indent,
      repeat1(seq($.attribute_key, ':', $.value)),
      $._dedent
    ),

    when_clause: $ => seq('when', $.embedded_code),

    // Messages section (simplified)
    messages_section: $ => seq(
      'messages',
      'Messages',
      repeat1($.message_shortcut)
    ),

    // Agent messages
    agent_message: $ => seq(
      'agentMessage',
      optional($.identifier),
      $._indent,
      optional(seq('messageTrafficType', ':', $.atom)),
      optional(choice(
        seq('expireTime', ':', $.string),
        seq('ttl', ':', $.string)
      )),
      $.content_message,
      $._dedent
    ),

    content_message: $ => seq(
      'contentMessage',
      $._indent,
      choice(
        seq('text', ':', choice($.enhanced_simple_value, $.embedded_value)),
        seq('fileName', ':', $.string),
        seq('uploadedRbmFile', $.uploaded_rbm_file),
        seq('richCard', $.rich_card),
        seq('contentInfo', $.content_info)
      ),
      repeat($.suggestion),
      $._dedent
    ),

    suggestion: $ => seq(
      'suggestion',
      $._indent,
      choice(
        seq('reply', $.suggested_reply),
        seq('action', $.suggested_action)
      ),
      $._dedent
    ),

    suggested_reply: $ => $.inline_parameter_list,

    suggested_action: $ => seq(
      optional($.inline_parameter_list),
      $._indent,
      choice(
        $.dial_action,
        $.view_location_action,
        $.create_calendar_event_action,
        $.open_url_action,
        $.share_location_action,
        $.compose_action
      ),
      $._dedent
    ),

    dial_action: $ => seq(
      'dialAction',
      $._indent,
      seq('phoneNumber', ':', $.typed_value),
      $._dedent
    ),

    view_location_action: $ => seq(
      'viewLocationAction',
      $._indent,
      optional(seq('label', ':', $.enhanced_simple_value)),
      choice(
        seq('latLong', $.lat_long_object),
        seq('query', ':', $.enhanced_simple_value)
      ),
      $._dedent
    ),

    create_calendar_event_action: $ => seq(
      'createCalendarEventAction',
      $._indent,
      $.inline_parameter_list,
      $._dedent
    ),

    share_location_action: $ => 'shareLocationAction',

    open_url_action: $ => seq(
      'openUrlAction',
      $._indent,
      seq('url', ':', $.typed_value),
      $._dedent
    ),

    compose_action: $ => seq(
      'composeAction',
      $._indent,
      choice(
        $.compose_text_message,
        $.compose_recording_message
      ),
      $._dedent
    ),

    compose_text_message: $ => seq(
      'composeTextMessage',
      $._indent,
      $.inline_parameter_list,
      $._dedent
    ),

    compose_recording_message: $ => seq(
      'composeRecordingMessage',
      $._indent,
      $.inline_parameter_list,
      $._dedent
    ),

    lat_long_object: $ => $.inline_parameter_list,

    uploaded_rbm_file: $ => choice(
      $.inline_parameter_list,
      $.dictionary
    ),

    content_info: $ => choice(
      $.inline_parameter_list,
      $.dictionary
    ),

    // Rich cards
    rich_card: $ => seq(
      'richCard',
      $._indent,
      choice(
        $.standalone_card,
        $.carousel_card
      ),
      $._dedent
    ),

    standalone_card: $ => seq(
      'standaloneCard',
      $._indent,
      optional(seq('cardOrientation', ':', $.atom)),
      optional(seq('thumbnailImageAlignment', ':', $.atom)),
      $.card_content,
      $._dedent
    ),

    carousel_card: $ => seq(
      'carouselCard',
      $._indent,
      optional(seq('cardWidth', ':', $.atom)),
      $.card_content,
      repeat1($.card_content),
      $._dedent
    ),

    card_content: $ => seq(
      'cardContent',
      $._indent,
      optional(seq('title', ':', $.enhanced_simple_value)),
      optional(seq('description', ':', $.enhanced_simple_value)),
      optional($.media),
      repeat($.card_suggestion),
      $._dedent
    ),

    card_suggestion: $ => seq(
      'suggestion',
      $._indent,
      choice(
        seq('reply', $.suggested_reply),
        seq('action', $.suggested_action)
      ),
      $._dedent
    ),

    media: $ => seq(
      'media',
      $._indent,
      optional(seq('height', ':', $.atom)),
      choice(
        seq('file', $.uploaded_rbm_file),
        seq('contentInfo', $.content_info)
      ),
      $._dedent
    ),

    // Message shortcuts (simplified to avoid conflicts)
    message_shortcut: $ => seq(
      optional(choice('transactional', 'promotional')),
      $.text_shortcut
      // TODO: Add file_shortcut, rich_card_shortcut and carousel_shortcut after resolving conflicts
    ),

    text_shortcut: $ => seq(
      'text',
      choice($.enhanced_simple_value, $.embedded_value),
      optional(seq(
        $._indent,
        repeat($.suggestion_shortcut),
        $._dedent
      ))
    ),

    // TODO: Fix file_shortcut conflicts
    // file_shortcut: $ => seq(
    //   choice(
    //     seq('rbmFile', $.string, optional($.string)),
    //     seq('file', $.typed_value, optional($.typed_value), prec(-1, optional($.atom)))
    //   ),
    //   optional(seq(
    //     $._indent,
    //     repeat($.suggestion_shortcut),
    //     $._dedent
    //   ))
    // ),

    // TODO: Fix conflicts in rich_card_shortcut and carousel_shortcut
    // rich_card_shortcut: $ => seq(
    //   'richCard',
    //   $.enhanced_simple_value,
    //   prec(-1, repeat(choice($.atom, $.typed_value))),
    //   optional(seq(
    //     $._indent,
    //     optional(seq('description', ':', $.enhanced_simple_value)),
    //     repeat($.suggestion_shortcut),
    //     $._dedent
    //   ))
    // ),

    // carousel_shortcut: $ => seq(
    //   'carousel',
    //   optional($.atom),
    //   $._indent,
    //   repeat1($.rich_card_shortcut),
    //   $._dedent
    // ),

    // Suggestion shortcuts
    suggestion_shortcut: $ => choice(
      $.reply_shortcut,
      $.dial_shortcut,
      $.open_url_shortcut,
      $.share_location_shortcut,
      $.create_calendar_event_shortcut,
      $.view_location_shortcut
    ),

    reply_shortcut: $ => seq(
      'reply',
      $.enhanced_simple_value,
      optional($.string)
    ),

    dial_shortcut: $ => seq(
      'dial',
      $.enhanced_simple_value,
      $.typed_value
    ),

    open_url_shortcut: $ => seq(
      'openUrl',
      $.enhanced_simple_value,
      $.typed_value,
      optional($.enhanced_simple_value),
      optional(seq(
        choice(':browser', ':webview'),
        optional(choice(':full', ':half', ':tall'))
      ))
    ),

    share_location_shortcut: $ => seq(
      'shareLocation',
      $.enhanced_simple_value
    ),

    create_calendar_event_shortcut: $ => seq(
      'saveEvent',
      $.enhanced_simple_value,
      choice(
        seq(
          $._indent,
          repeat(choice(
            seq('title', ':', $.enhanced_simple_value),
            seq('startTime', ':', $.typed_value),
            seq('endTime', ':', $.typed_value),
            seq('description', ':', $.enhanced_simple_value)
          )),
          $._dedent
        ),
        seq(
          $.enhanced_simple_value,
          $.typed_value,
          $.typed_value,
          $.enhanced_simple_value
        )
      )
    ),

    view_location_shortcut: $ => seq(
      'viewLocation',
      $.enhanced_simple_value,
      $._indent,
      choice(
        seq('latLong', ':', $.number, $.number),
        seq('query', ':', $.enhanced_simple_value)
      ),
      optional(seq('label', ':', $.enhanced_simple_value)),
      $._dedent
    ),
  }
});
