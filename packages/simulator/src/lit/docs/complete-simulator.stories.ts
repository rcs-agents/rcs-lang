import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import '../components/simulator-app/simulator-app.js'

const meta: Meta = {
  title: 'Documentation/Complete Simulator',
  component: 'rbx-simulator-app',
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj

const mockAgent = {
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/40px-BMW.svg.png',
  brandName: 'BMW',
}

const comprehensiveThread = [
  // Welcome message with suggestions
  {
    agentMessage: {
      messageId: '1',
      sendTime: new Date(Date.now() - 600000).toISOString(),
      contentMessage: {
        text: "Welcome to BMW! I'm your personal BMW assistant. How can I help you today?",
        suggestions: [
          {
            reply: {
              text: 'Explore vehicles',
              postbackData: 'vehicles',
            },
          },
          {
            reply: {
              text: 'Book service',
              postbackData: 'service',
            },
          },
          {
            reply: {
              text: 'Current offers',
              postbackData: 'offers',
            },
          },
        ],
      },
    },
  },
  // User reply
  {
    userMessage: {
      senderPhoneNumber: '+1234567890',
      messageId: '2',
      sendTime: new Date(Date.now() - 540000).toISOString(),
      agentId: 'user',
      suggestionResponse: {
        postbackData: 'vehicles',
        text: 'Explore vehicles',
        type: 'REPLY',
      },
    },
  },
  // Rich card with BMW i4 M50 showcase
  {
    agentMessage: {
      messageId: '3',
      sendTime: new Date(Date.now() - 480000).toISOString(),
      contentMessage: {
        richCard: {
          standaloneCard: {
            cardContent: {
              title: 'BMW i4 M50',
              description:
                'Experience electric performance at its finest. 536 HP, 0-60 mph in 3.3 seconds, up to 245 miles range.',
              media: {
                height: 'MEDIUM',
                contentInfo: {
                  fileUrl: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400&h=200&fit=crop',
                  altText: 'BMW i4 M50 Electric Vehicle',
                },
              },
              suggestions: [
                {
                  action: {
                    text: 'Configure',
                    postbackData: 'configure_i4',
                    openUrlAction: {
                      url: 'https://www.bmwusa.com/build-your-own.html#/series/i4',
                    },
                  },
                },
                {
                  action: {
                    text: 'Schedule Test Drive',
                    postbackData: 'test_drive',
                    dialAction: {
                      phoneNumber: '+18002194BMW',
                    },
                  },
                },
                {
                  reply: {
                    text: 'View more models',
                    postbackData: 'more_models',
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
  // User text message
  {
    userMessage: {
      senderPhoneNumber: '+1234567890',
      messageId: '4',
      sendTime: new Date(Date.now() - 420000).toISOString(),
      agentId: 'user',
      text: 'This looks incredible! What about the interior features?',
    },
  },
  // Text message with suggestions
  {
    agentMessage: {
      messageId: '5',
      sendTime: new Date(Date.now() - 360000).toISOString(),
      contentMessage: {
        text: 'The BMW i4 M50 features a luxurious interior with Sport Seats, M Leather Steering Wheel, and BMW Operating System 8.5 with a 14.9" curved display.',
        suggestions: [
          {
            reply: {
              text: 'View interior',
              postbackData: 'interior',
            },
          },
          {
            reply: {
              text: 'Tech features',
              postbackData: 'technology',
            },
          },
          {
            reply: {
              text: 'Pricing info',
              postbackData: 'pricing',
            },
          },
        ],
      },
    },
  },
  // User suggestion response
  {
    userMessage: {
      senderPhoneNumber: '+1234567890',
      messageId: '6',
      sendTime: new Date(Date.now() - 300000).toISOString(),
      agentId: 'user',
      suggestionResponse: {
        postbackData: 'pricing',
        text: 'Pricing info',
        type: 'REPLY',
      },
    },
  },
  // BMW Service Center card
  {
    agentMessage: {
      messageId: '7',
      sendTime: new Date(Date.now() - 240000).toISOString(),
      contentMessage: {
        richCard: {
          standaloneCard: {
            cardContent: {
              title: 'BMW Service Special',
              description:
                'Save 15% on your next maintenance service. Our certified technicians use genuine BMW parts and the latest diagnostic technology.',
              media: {
                height: 'TALL',
                contentInfo: {
                  fileUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=300&fit=crop',
                  altText: 'BMW Service Center',
                },
              },
              suggestions: [
                {
                  action: {
                    text: 'Book Service',
                    postbackData: 'book_service',
                    openUrlAction: {
                      url: 'https://www.bmwusa.com/owners/service.html',
                    },
                  },
                },
                {
                  reply: {
                    text: 'View details',
                    postbackData: 'service_details',
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
  // OTP example for BMW ConnectedDrive
  {
    agentMessage: {
      messageId: '8',
      sendTime: new Date(Date.now() - 180000).toISOString(),
      messageTrafficType: 'AUTHENTICATION',
      contentMessage: {
        text: 'Your BMW ConnectedDrive verification code is 425789. Tap to copy!',
      },
    },
  },
  // User text
  {
    userMessage: {
      senderPhoneNumber: '+1234567890',
      messageId: '9',
      sendTime: new Date(Date.now() - 120000).toISOString(),
      agentId: 'user',
      text: 'Thanks! Can I schedule a test drive for the i4?',
    },
  },
  // Final response with comprehensive suggestions
  {
    agentMessage: {
      messageId: '10',
      sendTime: new Date(Date.now() - 60000).toISOString(),
      contentMessage: {
        text: 'Absolutely! I can help you schedule a test drive at your nearest BMW center.',
        suggestions: [
          {
            action: {
              text: 'Schedule Today',
              postbackData: 'schedule_today',
              createCalendarEventAction: {
                startTime: new Date(Date.now() + 86400000).toISOString(),
                endTime: new Date(Date.now() + 90000000).toISOString(),
                title: 'BMW i4 Test Drive',
              },
            },
          },
          {
            action: {
              text: 'Call Dealer',
              postbackData: 'call_dealer',
              dialAction: {
                phoneNumber: '+18002194BMW',
              },
            },
          },
          {
            action: {
              text: 'Find Dealer',
              postbackData: 'find_dealer',
              viewLocationAction: {
                query: 'BMW dealership near me',
              },
            },
          },
          {
            reply: {
              text: 'Email me details',
              postbackData: 'email_details',
            },
          },
        ],
      },
    },
  },
]

export const Complete_iOS_Light: Story = {
  render: () =>
    html`
    <rbx-simulator-app
      .agent=${mockAgent}
      .initialThread=${comprehensiveThread}
      .onSendMessage=${(message: any) => {
        console.log('Message sent:', message)
        // In a real app, this would send the message to your backend
      }}
    ></rbx-simulator-app>
  `,
}

export const Complete_Android_Light: Story = {
  render: () =>
    html`
    <style>
      rbx-simulator-app {
        --initial-android: true;
      }
    </style>
    <rbx-simulator-app
      .agent=${mockAgent}
      .initialThread=${comprehensiveThread}
      .onSendMessage=${(message: any) => {
        console.log('Message sent:', message)
      }}
    ></rbx-simulator-app>
  `,
}

export const Complete_iOS_Dark: Story = {
  render: () =>
    html`
    <div style="background: #000; min-height: 100vh;">
      <rbx-simulator-app
        .agent=${mockAgent}
        .initialThread=${comprehensiveThread}
        .onSendMessage=${(message: any) => {
          console.log('Message sent:', message)
        }}
      ></rbx-simulator-app>
    </div>
  `,
}

export const Empty_Simulator: Story = {
  render: () =>
    html`
    <rbx-simulator-app
      .agent=${mockAgent}
      .initialThread=${[]}
      .onSendMessage=${(message: any) => {
        console.log('Message sent:', message)
        // This would be where you integrate with your RCS backend
      }}
    ></rbx-simulator-app>
  `,
}
