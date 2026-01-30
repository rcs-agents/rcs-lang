import { Thread } from "../../types";

export const GIF_SAMPLE: Thread = [
  {
    "agentMessage": {
      "messageTrafficType": "PROMOTION",
      "contentMessage": {
        "contentInfo": {
          "fileUrl": "https://rcsmaker.com/assets/sample_gif.gif",
          "forceRefresh": true
        }
      }
    }
  }
]

export const JPG_SAMPLE: Thread = [
  {
    "agentMessage": {
      "messageTrafficType": "PROMOTION",
      "contentMessage": {
        "contentInfo": {
          "fileUrl": "https://rcsmaker.com/assets/sample_image.jpg",
          "forceRefresh": true
        }
      }
    }
  }
]

export const OTP_SAMPLE: Thread = [
  {
    "agentMessage": {
      "messageTrafficType": "AUTHENTICATION",
      "contentMessage": {
        "text": "Your code is 123456 M8tue43FGT."
      }
    }
  }
]

export const PDF_SAMPLE: Thread = [
  {
    "agentMessage": {
      "messageTrafficType": "PROMOTION",
      "contentMessage": {
        "contentInfo": {
          "fileUrl": "https://rcsmaker.com/assets/rbm_and_verified_sms.pdf",
          "forceRefresh": true
        }
      }
    }
  }
]

export const TEXT_SAMPLE: Thread = [
  {
    "agentMessage": {
      "messageTrafficType": "PROMOTION",
      "contentMessage": {
        "text": "Hey there! 👋 Those fresh Nike kicks you were eyeing are practically flying off the shelves! Imagine the spring in your step and the envious glances you'll get rocking the latest innovation in comfort and style. Don't miss out on experiencing the ultimate fusion of performance and street cred. Tap here to grab your pair before they're gone! 🔥👟",
        "suggestions": [
          {
            "reply": {
              "text": "🛒 Shop Now",
              "postbackData": "shop_now"
            }
          },
          {
            "action": {
              "text": "View Location",
              "postbackData": "view_location",
              "fallbackUrl": "https://google.com",
              "viewLocationAction": {
                "query": "Nike near me"
              }
            }
          },
          {
            "action": {
              "text": "Call Now",
              "postbackData": "call_now",
              "fallbackUrl": "https://example.com/call_now",
              "dialAction": {
                "phoneNumber": "+1234567890"
              }
            }
          },
          {
            "action": {
              "text": "New Arrivals",
              "postbackData": "new_arrivals",
              "fallbackUrl": "https://example.com/new_arrivals",
              "openUrlAction": {
                "url": "https://example.com/new_arrivals",
                "application": "BROWSER",
                "description": "View new arrivals"
              }
            }
          },
          {
            "action": {
              "text": "Add to calendar",
              "postbackData": "add_to_calendar",
              "fallbackUrl": "https://example.com/add_to_calendar",
              "createCalendarEventAction": {
                "startTime": "2025-04-13T13:00:00Z",
                "endTime": "2025-04-13T14:00:00Z",
                "title": "Event Title",
                "description": "Event Description"
              }
            }
          }
        ]
      }
    }
  }
]

export const VIDEO_SAMPLE: Thread = [
  {
    "agentMessage": {
      "messageTrafficType": "PROMOTION",
      "contentMessage": {
        "contentInfo": {
          "fileUrl": "https://rcsmaker.com/assets/sample_video_720x480_2mb.mp4",
          "forceRefresh": true
        }
      }
    }
  }
]

export const WEBVIEW_SAMPLE: Thread = [
  {
    "agentMessage": {
      "messageTrafficType": "PROMOTION",
      "contentMessage": {
        "richCard": {
          "standaloneCard": {
            "cardOrientation": "VERTICAL",
            "thumbnailImageAlignment": "LEFT",
            "cardContent": {
              "title": "Nike Vomero 18",
              "description": "Maximum cushioning in the Vomero provides a comfortable ride for everyday runs. Our softest, most cushioned ride has lightweight ZoomX foam stacked on top of responsive ReactX foam in the midsole.",
              "media": {
                "height": "TALL",
                "contentInfo": {
                  "fileUrl": "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/4d677534-954f-483e-a765-5bcb76775cb2/NIKE+VOMERO+18+%28GS%29.png",
                  "forceRefresh": true
                }
              },
              "suggestions": [
                {
                  "action": {
                    "text": "Open webview (half)",
                    "postbackData": "new_arrivals",
                    "fallbackUrl": "https://nike.com/new_arrivals",
                    "openUrlAction": {
                      "url": "https://nike.com/new_arrivals",
                      "application": "WEBVIEW",
                      "webviewViewMode": "HALF",
                      "description": "View new arrivals"
                    }
                  }
                },
                {
                  "action": {
                    "text": "Open webview (tall)",
                    "postbackData": "new_arrivals",
                    "fallbackUrl": "https://nike.com/new_arrivals",
                    "openUrlAction": {
                      "url": "https://nike.com/new_arrivals",
                      "application": "WEBVIEW",
                      "webviewViewMode": "TALL",
                      "description": "View new arrivals"
                    }
                  }
                },
                {
                  "action": {
                    "text": "Open webview (full)",
                    "postbackData": "new_arrivals",
                    "fallbackUrl": "https://nike.com/new_arrivals",
                    "openUrlAction": {
                      "url": "https://nike.com/new_arrivals",
                      "application": "WEBVIEW",
                      "webviewViewMode": "FULL",
                      "description": "View new arrivals"
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  }
]

export const RICH_CARD_CARROUSEL_SAMPLE: Thread = [
  {
    "agentMessage": {
      "messageTrafficType": "PROMOTION",
      "contentMessage": {
        "suggestions": [
          {
            "reply": {
              "text": "🛒 Shop Now!",
              "postbackData": "shop_now"
            }
          },
          {
            "action": {
              "text": "View Location",
              "postbackData": "view_location",
              "fallbackUrl": "https://google.com",
              "viewLocationAction": {
                "query": "Nike near me"
              }
            }
          },
          {
            "action": {
              "text": "Call Now",
              "postbackData": "call_now",
              "fallbackUrl": "https://example.com/call_now",
              "dialAction": {
                "phoneNumber": "+1234567890"
              }
            }
          },
          {
            "action": {
              "text": "New Arrivals",
              "postbackData": "new_arrivals",
              "fallbackUrl": "https://example.com/new_arrivals",
              "openUrlAction": {
                "url": "https://example.com/new_arrivals",
                "application": "BROWSER",
                "description": "View new arrivals"
              }
            }
          },
          {
            "action": {
              "text": "Add to calendar",
              "postbackData": "add_to_calendar",
              "fallbackUrl": "https://example.com/add_to_calendar",
              "createCalendarEventAction": {
                "startTime": "2025-04-13T13:00:00Z",
                "endTime": "2025-04-13T14:00:00Z",
                "title": "Event Title",
                "description": "Event Description"
              }
            }
          }
        ],
        "richCard": {
          "carouselCard": {
            "cardWidth": "MEDIUM",
            "cardContents": [
              {
                "title": "Air Zoom AlphaFly 3 Flyknit  sneakers",
                "description": "Made from breathable Flyknit, they're fitted with an extra set of 'Air Zoom' units",
                "media": {
                  "height": "MEDIUM",
                  "contentInfo": {
                    "fileUrl": "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/da305c39-bc62-426e-8529-2566232c2145/W+AIR+ZOOM+ALPHAFLY+NEXT%25+3.png",
                    "forceRefresh": true
                  }
                },
                "suggestions": [
                  {
                    "action": {
                      "text": "Call Now",
                      "postbackData": "call_now",
                      "fallbackUrl": "https://example.com/call_now",
                      "dialAction": {
                        "phoneNumber": "+1234567890"
                      }
                    }
                  },
                  {
                    "action": {
                      "text": "Add to calendar",
                      "postbackData": "add_to_calendar",
                      "fallbackUrl": "https://example.com/add_to_calendar",
                      "createCalendarEventAction": {
                        "startTime": "2025-04-13T13:00:00Z",
                        "endTime": "2025-04-13T14:00:00Z",
                        "title": "Event Title",
                        "description": "Event Description"
                      }
                    }
                  }
                ]
              },
              {
                "title": "Air Zoom AlphaFly 3 Flyknit sneakers",
                "description": "Fine-tuned for marathon speed, the Alphafly 3 helps push you beyond what you thought possible",
                "media": {
                  "height": "MEDIUM",
                  "contentInfo": {
                    "fileUrl": "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/ad573250-ae8d-4194-b957-3865e590c00b/W+AIR+ZOOM+ALPHAFLY+NEXT%25+3.png",
                    "forceRefresh": true
                  }
                },
                "suggestions": [
                  {
                    "action": {
                      "text": "Call Now",
                      "postbackData": "call_now",
                      "fallbackUrl": "https://example.com/call_now",
                      "dialAction": {
                        "phoneNumber": "+1234567890"
                      }
                    }
                  },
                  {
                    "action": {
                      "text": "Add to calendar",
                      "postbackData": "add_to_calendar",
                      "fallbackUrl": "https://example.com/add_to_calendar",
                      "createCalendarEventAction": {
                        "startTime": "2025-04-13T13:00:00Z",
                        "endTime": "2025-04-13T14:00:00Z",
                        "title": "Event Title",
                        "description": "Event Description"
                      }
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    }
  }
]

export const RICH_CARD_STANDALONE_SAMPLE: Thread = [
  {
    "agentMessage": {
      "messageTrafficType": "PROMOTION",
      "contentMessage": {
        "suggestions": [
          {
            "reply": {
              "text": "🛒 Shop Now!",
              "postbackData": "shop_now"
            }
          },
          {
            "action": {
              "text": "View Location",
              "postbackData": "view_location",
              "fallbackUrl": "https://google.com",
              "viewLocationAction": {
                "query": "Nike near me"
              }
            }
          },
          {
            "action": {
              "text": "Call Now",
              "postbackData": "call_now",
              "fallbackUrl": "https://example.com/call_now",
              "dialAction": {
                "phoneNumber": "+1234567890"
              }
            }
          },
          {
            "action": {
              "text": "New Arrivals",
              "postbackData": "new_arrivals",
              "fallbackUrl": "https://example.com/new_arrivals",
              "openUrlAction": {
                "url": "https://example.com/new_arrivals",
                "application": "BROWSER",
                "description": "View new arrivals"
              }
            }
          },
          {
            "action": {
              "text": "Add to calendar",
              "postbackData": "add_to_calendar",
              "fallbackUrl": "https://example.com/add_to_calendar",
              "createCalendarEventAction": {
                "startTime": "2025-04-13T13:00:00Z",
                "endTime": "2025-04-13T14:00:00Z",
                "title": "Event Title",
                "description": "Event Description"
              }
            }
          }
        ],
        "richCard": {
          "standaloneCard": {
            "cardOrientation": "VERTICAL",
            "thumbnailImageAlignment": "LEFT",
            "cardContent": {
              "title": "Nike Vomero 18",
              "description": "Maximum cushioning in the Vomero provides a comfortable ride for everyday runs. Our softest, most cushioned ride.",
              "media": {
                "height": "TALL",
                "contentInfo": {
                  "fileUrl": "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/4d677534-954f-483e-a765-5bcb76775cb2/NIKE+VOMERO+18+%28GS%29.png",
                  "forceRefresh": true
                }
              },
              "suggestions": [
                {
                  "action": {
                    "text": "View Location",
                    "postbackData": "view_location",
                    "fallbackUrl": "https://google.com",
                    "viewLocationAction": {
                      "query": "Nike near me"
                    }
                  }
                },
                {
                  "action": {
                    "text": "Call Now",
                    "postbackData": "call_now",
                    "fallbackUrl": "https://example.com/call_now",
                    "dialAction": {
                      "phoneNumber": "+1234567890"
                    }
                  }
                },
                {
                  "action": {
                    "text": "New Arrivals",
                    "postbackData": "new_arrivals",
                    "fallbackUrl": "https://example.com/new_arrivals",
                    "openUrlAction": {
                      "url": "https://example.com/new_arrivals",
                      "application": "BROWSER",
                      "description": "View new arrivals"
                    }
                  }
                },
                {
                  "action": {
                    "text": "Add to calendar",
                    "postbackData": "add_to_calendar",
                    "fallbackUrl": "https://example.com/add_to_calendar",
                    "createCalendarEventAction": {
                      "startTime": "2025-04-13T13:00:00Z",
                      "endTime": "2025-04-13T14:00:00Z",
                      "title": "Event Title",
                      "description": "Event Description"
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  }
]

const USER_TEXT_SAMPLE: Thread = [
  {
    "userMessage": {
      "senderPhoneNumber": "+1234567890",
      "messageId": "1234567890",
      "sendTime": "2025-06-12T21:05:21Z",
      "agentId": "1234567890",
      "text": "Hello"
    }
  }
]

export const TEXT1: Thread = [
  {
    "agentMessage": {
      "messageTrafficType": "PROMOTION",
      "contentMessage": {
        "text": "Hey there! 👋 This is a message from the agent — unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto"
      }
    }
  }
]

export const MockThread = [
  ...TEXT_SAMPLE,
  // ...TEXT1,
  // ...TEXT_SAMPLE,
  ...USER_TEXT_SAMPLE,
  ...VIDEO_SAMPLE,
  ...OTP_SAMPLE,
  ...PDF_SAMPLE,
  ...GIF_SAMPLE,
  ...JPG_SAMPLE,
  ...WEBVIEW_SAMPLE,
  ...RICH_CARD_CARROUSEL_SAMPLE,
  // ...RICH_CARD_STANDALONE_SAMPLE,
]
