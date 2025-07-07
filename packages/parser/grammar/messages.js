/**
 * @file Message definitions and shortcuts for RCL grammar
 * @author Saulo Vallory <saulo@tokilabs.io>
 * @license MIT
 */

const messages = {
  // Messages section (per specification: messages Messages + indented block)
  messages_section: $ => seq(
    'messages',
    'Messages',
    $._newline,
    $._indent,
    repeat1(choice($.agent_message, $.message_shortcut)),
    $._dedent
  ),

  // Agent messages
  agent_message: $ => seq(
    'agentMessage',
    optional($.identifier),
    $._newline,
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

  // Action types
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

  // Message shortcuts - each shortcut has message ID after keyword
  message_shortcut: $ => seq(
    optional(choice('transactional', 'promotional')),
    choice(
      $.text_shortcut,
      $.file_shortcut,
      $.rich_card_shortcut,
      $.carousel_shortcut
    )
  ),

  text_shortcut: $ => seq(
    'text',
    $.identifier,  // Message ID comes after keyword
    choice($.enhanced_simple_value, $.embedded_value),  // Then text parameter
    optional(seq(
      $._indent,
      repeat($.suggestion_shortcut),
      $._dedent
    ))
  ),

  file_shortcut: $ => prec(4, seq(
    choice(
      seq('rbmFile', $.identifier, $.string, optional($.string)),
      seq('file', $.identifier, $.typed_value, optional($.typed_value), optional($.atom))
    ),
    optional(seq(
      $._indent,
      repeat($.suggestion_shortcut),
      $._dedent
    ))
  )),

  rich_card_shortcut: $ => seq(
    'richCard',
    $.identifier, // Message ID after keyword
    $.enhanced_simple_value, // title
    repeat(prec(3, choice($.atom, $.typed_value))), // Optional parameters with higher precedence
    optional(seq(
      $._indent,
      optional(seq('description', ':', $.enhanced_simple_value)),
      repeat($.suggestion_shortcut),
      $._dedent
    ))
  ),

  carousel_shortcut: $ => seq(
    'carousel',
    $.identifier, // Message ID after keyword
    optional($.atom), // Optional width
    $._newline,
    $._indent,
    repeat1($.rich_card_shortcut),
    $._dedent
  ),

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
};

module.exports = messages;