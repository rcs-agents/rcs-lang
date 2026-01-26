// Generated from coffee-shop.rcl
export const agent = {
  name: 'CoffeeShop',
  displayName: 'Quick Coffee',
  rcsBusinessMessagingAgent: {
    logoUri: 'https://quickcoffee.com/logo.png',
    color: '#6F4E37',
    phoneNumbers: [
      {
        number: '+1-555-0123',
        label: 'Call Store',
      },
    ],
  },
};

export const messages = {
  ChooseSize: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      text: 'What size would you like?',
    },
  },
  InvalidSize: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      text: 'Please choose a valid size.',
    },
  },
  ChooseDrink: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      text: '""Great! A #{@size} coffee. What type would you like?""',
    },
  },
  InvalidDrink: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      text: 'Please choose from our available drinks.',
    },
  },
  Customize: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      text: '""Perfect! A #{@size} #{@drink}. How would you like your milk?""',
    },
  },
  InvalidMilk: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      text: 'Please choose a valid milk option.',
    },
  },
  ProcessPayment: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      text: 'Processing your payment...',
    },
  },
  OrderCancelled: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      text: 'Your order has been cancelled. Thank you!',
    },
  },
  ThankYou: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      text: '""\n      Thank you for your order!\n      Your order will be ready for pickup in 5-7 minutes.\n      Show this confirmation at the counter.\n    ""',
    },
  },
  StoreInfo: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      text: "We're open Monday-Friday 6am-7pm, weekends 7am-6pm.",
    },
  },
  Welcome: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      richCard: {
        standaloneCard: {
          cardOrientation: 'CARD_ORIENTATION_UNSPECIFIED',
          cardContent: {
            title: 'Welcome to Quick Coffee!',
            description: 'Get your favorite coffee ready for pickup in minutes!',
          },
        },
      },
    },
  },
  ConfirmOrder: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      richCard: {
        standaloneCard: {
          cardOrientation: 'CARD_ORIENTATION_UNSPECIFIED',
          cardContent: {
            title: 'Confirm Your Order',
          },
        },
      },
    },
  },
  OrderComplete: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      richCard: {
        standaloneCard: {
          cardOrientation: 'CARD_ORIENTATION_UNSPECIFIED',
          cardContent: {
            title: 'Order Confirmed!',
          },
        },
      },
    },
  },
  ShowMenu: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      richCard: {
        carouselCard: {
          cardWidth: 'CARD_WIDTH_UNSPECIFIED',
          cardContents: [],
        },
      },
    },
  },
  CappuccinoCard: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      richCard: {
        standaloneCard: {
          cardOrientation: 'CARD_ORIENTATION_UNSPECIFIED',
          cardContent: {
            title: 'Cappuccino',
            description: 'Espresso with steamed milk foam',
          },
        },
      },
    },
  },
  LatteCard: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      richCard: {
        standaloneCard: {
          cardOrientation: 'CARD_ORIENTATION_UNSPECIFIED',
          cardContent: {
            title: 'Latte',
            description: 'Espresso with steamed milk',
          },
        },
      },
    },
  },
  AmericanoCard: {
    messageTrafficType: 'PROMOTION',
    contentMessage: {
      richCard: {
        standaloneCard: {
          cardOrientation: 'CARD_ORIENTATION_UNSPECIFIED',
          cardContent: {
            title: 'Americano',
            description: 'Espresso with hot water',
          },
        },
      },
    },
  },
  EspressoCard: {
    messageTrafficType: 'TRANSACTIONAL',
    contentMessage: {
      richCard: {
        standaloneCard: {
          cardOrientation: 'CARD_ORIENTATION_UNSPECIFIED',
          cardContent: {
            title: 'Espresso',
            description: 'Rich, bold shot of coffee',
          },
        },
      },
    },
  },
};

export const flows = {
  OrderFlow: {
    id: 'OrderFlow',
    initial: 'Welcome',
    states: {
      Welcome: {
        entry: {
          type: 'sendParent',
          event: {
            type: 'DISPLAY_MESSAGE',
            messageId: 'Welcome',
          },
        },
        on: {
          view_menu: {
            target: 'ShowMenu',
          },
          store_hours: {
            target: 'StoreInfo',
          },
          '*': {
            target: 'Welcome',
          },
        },
      },
      ChooseSize: {
        entry: {
          type: 'sendParent',
          event: {
            type: 'DISPLAY_MESSAGE',
            messageId: 'ChooseSize',
          },
        },
        on: {
          '*': {
            target: 'InvalidSize',
          },
        },
      },
      InvalidSize: {
        entry: {
          type: 'sendParent',
          event: {
            type: 'DISPLAY_MESSAGE',
            messageId: 'InvalidSize',
          },
        },
      },
      ChooseDrink: {
        entry: {
          type: 'sendParent',
          event: {
            type: 'DISPLAY_MESSAGE',
            messageId: 'ChooseDrink',
          },
        },
        on: {
          '*': {
            target: 'InvalidDrink',
          },
        },
      },
      InvalidDrink: {
        entry: {
          type: 'sendParent',
          event: {
            type: 'DISPLAY_MESSAGE',
            messageId: 'InvalidDrink',
          },
        },
      },
      Customize: {
        entry: {
          type: 'sendParent',
          event: {
            type: 'DISPLAY_MESSAGE',
            messageId: 'Customize',
          },
        },
        on: {
          '*': {
            target: 'InvalidMilk',
          },
        },
      },
      InvalidMilk: {
        entry: {
          type: 'sendParent',
          event: {
            type: 'DISPLAY_MESSAGE',
            messageId: 'InvalidMilk',
          },
        },
      },
      ConfirmOrder: {
        entry: {
          type: 'sendParent',
          event: {
            type: 'DISPLAY_MESSAGE',
            messageId: 'ConfirmOrder',
          },
        },
        on: {
          cancel: {
            target: 'OrderCancelled',
          },
          '*': {
            target: 'ConfirmOrder',
          },
        },
      },
      ProcessPayment: {
        entry: {
          type: 'sendParent',
          event: {
            type: 'DISPLAY_MESSAGE',
            messageId: 'ProcessPayment',
          },
        },
      },
      OrderCancelled: {
        entry: {
          type: 'sendParent',
          event: {
            type: 'DISPLAY_MESSAGE',
            messageId: 'OrderCancelled',
          },
        },
      },
      OrderComplete: {
        entry: {
          type: 'sendParent',
          event: {
            type: 'DISPLAY_MESSAGE',
            messageId: 'OrderComplete',
          },
        },
      },
      ThankYou: {
        entry: {
          type: 'sendParent',
          event: {
            type: 'DISPLAY_MESSAGE',
            messageId: 'ThankYou',
          },
        },
      },
      ShowMenu: {
        entry: {
          type: 'sendParent',
          event: {
            type: 'DISPLAY_MESSAGE',
            messageId: 'ShowMenu',
          },
        },
      },
      StoreInfo: {
        entry: {
          type: 'sendParent',
          event: {
            type: 'DISPLAY_MESSAGE',
            messageId: 'StoreInfo',
          },
        },
      },
    },
    context: {},
  },
};

// Convenience export
export default {
  agent,
  messages,
  flows,
};
