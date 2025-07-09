text Magic Collectibles :promotion """
    Step into the magic! ✨

    The latest Disney collectibles you love are
    disappearing fast from our shelves!

    Don’t let the enchantment slip away.
    Click here to discover your new treasure before it’s gone! 🏰🎁
  """

  suggestions

    reply "🤔 What collectibles?"

    viewLocation "😱 Where can I by them?!"
      query: "Disney stores near me"
      fallbackUrl: "https://disney.com/stores"


agentMessage Magic Collectibles
  messageTrafficType: "PROMOTION"
  contentMessage:
    text: """
      Step into the magic! ✨

      The latest Disney collectibles you love are
      disappearing fast from our shelves!

      Don’t let the enchantment slip away.
      Click here to discover your new treasure before it’s gone! 🏰🎁
    """

    suggestions:
      reply:
        text: "🤔 What collectibles?"
        postbackData: "what_collectibles"

      action:
        text: "😱 Where can I by them?!"
        postbackData: "where_to_buy"
        fallbackUrl: "https://disney.com/stores"
        viewLocationAction:
          query: "Disney stores near me"
