/**
 * @file Rich card definitions for RCL grammar
 * @author Saulo Vallory <saulo@tokilabs.io>
 * @license MIT
 */

const richCards = {
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
};

module.exports = richCards;