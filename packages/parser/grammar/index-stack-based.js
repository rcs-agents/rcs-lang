/**
 * @file Stack-based RCL grammar for tree-sitter (No External Scanner)
 * @author Saulo Vallory <saulo@tokilabs.io>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "rcl",

  // No external scanner needed!
  extras: $ => [
    /[ \t]/,
    $.comment,
    /\r?\n/,
  ],

  conflicts: $ => [
    [$.value, $.list_item],
    [$.list, $.list_item],
  ],

  rules: {
    // Main entry point
    source_file: $ => seq(
      repeat($.import_statement),
      optional($.agent_definition)
    ),

    // Import statement
    import_statement: $ => seq(
      'import',
      $.import_path,
      optional(seq('as', field('alias', $.identifier)))
    ),

    import_path: $ => seq(
      $.identifier,
      repeat(seq('/', $.identifier))
    ),

    // Agent definition with explicit end
    agent_definition: $ => seq(
      'agent',
      field('name', $.identifier),
      $.agent_body,
      'end'
    ),

    agent_body: $ => seq(
      seq('displayName', ':', field('display_name', $.string)),
      optional(seq('brandName', ':', field('brand_name', $.string))),
      optional($.config_section),
      optional($.defaults_section),
      repeat1($.flow_section),
      $.messages_section
    ),

    // Config section with explicit end
    config_section: $ => seq(
      'agentConfig',
      'Config',
      repeat($.property_assignment),
      'end'
    ),

    // Defaults section with explicit end
    defaults_section: $ => seq(
      'agentDefaults', 
      'Defaults',
      repeat($.default_property),
      'end'
    ),

    default_property: $ => choice(
      seq('fallbackMessage', ':', $.value),
      seq('messageTrafficType', ':', $.atom),
      seq('ttl', ':', $.string),
      seq('postbackData', ':', $.embedded_code),
      seq('expressions', ':', 'language', ':', $.atom)
    ),

    // Flow section with explicit end
    flow_section: $ => seq(
      'flow',
      field('name', $.identifier),
      repeat($.flow_rule),
      'end'
    ),

    flow_rule: $ => seq(
      $.flow_operand,
      '->',
      choice(
        $.flow_transition,
        $.match_block
      )
    ),

    flow_transition: $ => seq(
      $.flow_operand,
      optional($.with_clause)
    ),

    match_block: $ => seq(
      'match',
      '@',
      $.identifier,
      repeat(seq("'s", $.identifier)),
      '...',
      repeat1($.match_case),
      'end'
    ),

    match_case: $ => seq(
      choice(
        seq($.string, '->', $.flow_operand, optional($.with_clause)),
        seq(':default', '->', $.flow_operand, optional($.with_clause))
      )
    ),

    with_clause: $ => seq(
      'with',
      repeat1(seq($.attribute_key, ':', $.value))
    ),

    flow_operand: $ => choice(
      $.atom,
      $.identifier,
      $.string,
      $.embedded_code,
      seq('start', $.identifier)
    ),

    // Messages section with explicit end - requires at least one message
    messages_section: $ => seq(
      'messages',
      'Messages',
      repeat1(choice(
        $.message_shortcut,
        $.agent_message
      )),
      'end'
    ),

    // Message shortcuts (the common forms)
    message_shortcut: $ => choice(
      $.text_shortcut,
      $.richcard_shortcut,
      $.carousel_shortcut
    ),

    // Text message shortcut
    text_shortcut: $ => seq(
      optional($.message_traffic_type),
      'text',
      field('id', $.identifier),
      field('content', choice($.string, $.embedded_code, $.multiline_string)),
      optional($.suggestions_block)
    ),

    // Rich card shortcut
    richcard_shortcut: $ => prec(1, seq(
      'richCard',
      field('id', $.identifier),
      field('title', choice($.string, $.embedded_code)),
      optional(choice(
        // Single atom or type tag
        seq(
          choice($.atom, $.type_tag),
          optional(seq('description', ':', $.value)),
          optional($.suggestions_block)
        ),
        // Multiple atoms/type tags with mandatory properties
        seq(
          repeat1(choice($.atom, $.type_tag)),
          optional(seq('description', ':', $.value)),
          optional($.suggestions_block)
        )
      ))
    )),

    // Carousel shortcut
    carousel_shortcut: $ => seq(
      'carousel',
      field('id', $.identifier),
      field('title', choice($.string, $.embedded_code)),
      optional($.atom),
      repeat1($.richcard_shortcut),
      'end'
    ),

    // Full agent message (with message...end block)
    agent_message: $ => seq(
      optional($.message_traffic_type),
      'message',
      field('id', $.identifier),
      repeat($.message_property),
      optional($.suggestions_block),
      'end'
    ),

    message_property: $ => seq(
      field('key', $.attribute_key),
      ':',
      $.value
    ),

    // Suggestions block
    suggestions_block: $ => seq(
      'suggestions',
      repeat1($.suggestion_shortcut),
      'end'
    ),

    suggestion_shortcut: $ => choice(
      $.reply_shortcut,
      $.dial_shortcut,
      $.open_url_shortcut,
      $.view_location_shortcut,
      $.share_location_shortcut,
      $.save_event_shortcut
    ),

    reply_shortcut: $ => seq(
      'reply',
      $.string,
      optional($.string)
    ),

    dial_shortcut: $ => seq(
      'dial',
      $.string,
      $.type_tag
    ),

    open_url_shortcut: $ => seq(
      choice('openURL', 'openUrl'),
      $.string,
      optional($.string),
      repeat($.atom)
    ),

    view_location_shortcut: $ => seq(
      'viewLocation',
      $.string,
      choice(
        seq('latLong', $.number, ',', $.number),
        seq('query', ':', $.string)
      )
    ),

    share_location_shortcut: $ => seq(
      'shareLocation',
      $.string
    ),

    save_event_shortcut: $ => seq(
      'saveEvent',
      $.string,
      repeat($.event_property),
      optional(seq('description', ':', $.value)),
      'end'
    ),

    event_property: $ => seq(
      field('key', $.attribute_key),
      ':',
      $.value
    ),

    // Property assignment
    property_assignment: $ => seq(
      $.attribute_key,
      ':',
      $.value
    ),

    // Value types
    value: $ => choice(
      $.string,
      $.number,
      $.boolean,
      $.null,
      $.atom,
      $.multiline_string,
      $.list,
      $.dictionary,
      $.type_tag,
      $.embedded_code,
      $.identifier  // references
    ),

    // Multi-line strings
    multiline_string: $ => seq(
      choice('|', '|-', '+|', '+|+'),
      field('content', $.multiline_content)
    ),

    multiline_content: $ => repeat1(
      choice(
        seq('|', /[^\n]+/, '\n'),  // Line with | followed by more content
        '|'  // Final terminator
      )
    ),

    // Embedded code
    embedded_code: $ => choice(
      $.single_line_code,
      $.multi_line_code
    ),

    single_line_code: $ => seq(
      '$',
      optional(field('language', choice('js', 'ts'))),
      '>',
      field('code', $.single_line_code_content)
    ),

    single_line_code_content: $ => /[^\n]+/,

    multi_line_code: $ => seq(
      '$',
      optional(field('language', choice('js', 'ts'))),
      '>>>',
      $.code_content,
      '<$'
    ),

    code_content: $ => repeat1(
      choice(
        /[^<\n]+/,  // Regular content
        seq('<', /[^$\n]/)  // < not followed by $
      )
    ),

    // Lists
    list: $ => choice(
      $.inline_list,
      $.block_list
    ),

    inline_list: $ => seq(
      '(',
      optional(seq(
        $.list_item,
        repeat(seq(',', $.list_item))
      )),
      ')'
    ),


    block_list: $ => seq(
      ':list',
      repeat1(seq('-', $.list_item)),
      'end'
    ),

    list_item: $ => choice(
      $.value,
      $.type_tag
    ),

    // Dictionaries
    dictionary: $ => choice(
      $.brace_object,
      $.block_object
    ),

    brace_object: $ => seq(
      '{',
      optional(seq(
        $.object_entry,
        repeat(seq(',', $.object_entry))
      )),
      '}'
    ),

    block_object: $ => seq(
      ':object',
      repeat1($.object_entry),
      'end'
    ),

    object_entry: $ => seq(
      field('key', choice($.attribute_key, $.string)),
      ':',
      $.value
    ),

    // Type tags
    type_tag: $ => seq(
      '<',
      field('type', $.type_tag_type),
      field('value', $.type_tag_value),
      optional(seq('|', field('modifier', $.type_tag_modifier))),
      '>'
    ),

    type_tag_type: $ => choice(
      'email',
      'phone', 'msisdn',
      'url',
      'time', 't',
      'datetime', 'date', 'dt',
      'zipcode', 'zip',
      'duration', 'ttl'
    ),

    type_tag_value: $ => /[^|>]+/,
    
    type_tag_modifier: $ => /[^>]+/,

    // Atoms
    atom: $ => seq(
      ':',
      choice(
        $._word,
        $.string
      )
    ),

    // Message traffic types
    message_traffic_type: $ => choice(
      'transactional',
      'promotional',
      'authentication',
      'transaction',
      'promotion',
      'serviceRequest',
      'acknowledgement'
    ),

    // Comments
    comment: $ => token(choice(
      seq('//', /.*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/'
      )
    )),

    // Boolean values
    boolean: $ => choice(
      'True', 'Yes', 'On', 'Enabled', 'Active',
      'False', 'No', 'Off', 'Disabled', 'Inactive'
    ),

    // Null values
    null: $ => choice('Null', 'None', 'Void'),

    // Literals
    string: $ => /"(\\.|[^"\\])*"/,
    
    number: $ => /-?\d+(\.\d+)?/,
    
    _word: $ => /[a-zA-Z][a-zA-Z0-9_\-]*/,
    
    // IDENTIFIER: Always Title Case (each word starts with uppercase letter or number)
    identifier: $ => /[A-Z][A-Za-z0-9\-_]*(\s+[A-Z0-9][A-Za-z0-9\-_]*)*/,
    
    // attribute_key: Always lowerCamelCase (starts with lowercase)
    attribute_key: $ => /[a-z][a-zA-Z0-9_]*/,
    
    // Atoms like :start, :end, :default, :transactional
    ':start': $ => ':start',
    ':end': $ => ':end',
    ':default': $ => ':default',
    
    // Standalone keywords/operators
    'reply': $ => 'reply',
    'match': $ => 'match',
    'is': $ => 'is',
    '...': $ => '...',
    '@': $ => '@',
    "'s": $ => "'s",
    '->': $ => '->',
    ':': $ => ':',
    ',': $ => ',',
    '-': $ => '-',
  }
});