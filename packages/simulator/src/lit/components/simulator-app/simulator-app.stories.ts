import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './simulator-app.js'

const meta: Meta = {
  title: 'Components/SimulatorApp',
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

const mockThread = [
  {
    agentMessage: {
      messageId: '1',
      sendTime: new Date(Date.now() - 300000).toISOString(),
      contentMessage: {
        text: 'Welcome to BMW! How can I assist you today?',
        suggestions: [
          {
            reply: {
              text: 'View Models',
              postbackData: 'models',
            },
          },
          {
            reply: {
              text: 'Book Service',
              postbackData: 'service',
            },
          },
        ],
      },
    },
  },
  {
    userMessage: {
      senderPhoneNumber: '+1234567890',
      messageId: '2',
      sendTime: new Date(Date.now() - 240000).toISOString(),
      agentId: 'user',
      text: "Hi! I'm interested in the new electric models.",
    },
  },
  {
    agentMessage: {
      messageId: '3',
      sendTime: new Date(Date.now() - 180000).toISOString(),
      contentMessage: {
        richCard: {
          standaloneCard: {
            cardContent: {
              title: 'BMW iX xDrive50',
              description:
                'Experience luxury electric driving with up to 324 miles range and 516 HP dual-motor AWD performance.',
              media: {
                height: 'MEDIUM',
                contentInfo: {
                  fileUrl: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400&h=200&fit=crop',
                  altText: 'BMW iX Electric SUV',
                },
              },
              suggestions: [
                {
                  action: {
                    text: 'Build & Price',
                    postbackData: 'build',
                    openUrlAction: {
                      url: 'https://www.bmwusa.com/build-your-own.html',
                    },
                  },
                },
                {
                  action: {
                    text: 'Contact Dealer',
                    postbackData: 'contact',
                    dialAction: {
                      phoneNumber: '+18002194BMW',
                    },
                  },
                },
                {
                  reply: {
                    text: 'Compare models',
                    postbackData: 'compare',
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
  {
    userMessage: {
      senderPhoneNumber: '+1234567890',
      messageId: '4',
      sendTime: new Date(Date.now() - 120000).toISOString(),
      agentId: 'user',
      suggestionResponse: {
        postbackData: 'more',
        text: 'Tell me more',
        type: 'REPLY',
      },
    },
  },
]

export const Default: Story = {
  render: () =>
    html`
    <rbx-simulator-app
      .agent=${mockAgent}
      .initialThread=${[]}
    ></rbx-simulator-app>
  `,
}

export const WithMessages: Story = {
  render: () =>
    html`
    <rbx-simulator-app
      .agent=${mockAgent}
      .initialThread=${mockThread}
    ></rbx-simulator-app>
  `,
}

export const InteractiveDemo: Story = {
  render: () =>
    html`
    <rbx-simulator-app
      .agent=${mockAgent}
      .initialThread=${[]}
      .onSendMessage=${(message: any) => {
        console.log('Message sent:', message)
      }}
    ></rbx-simulator-app>
  `,
}
