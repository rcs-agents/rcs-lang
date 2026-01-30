import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './standalone-card.js'

const meta: Meta = {
  title: 'Messages/StandaloneCard',
  component: 'rbx-standalone-card',
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    isAndroid: { control: 'boolean' },
    isDarkMode: { control: 'boolean' },
    isPortrait: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj

const basicCard = {
  agentMessage: {
    messageId: '1',
    sendTime: new Date().toISOString(),
    contentMessage: {
      richCard: {
        standaloneCard: {
          cardContent: {
            title: 'BMW M4 Competition',
            description: 'Unleash 503 HP of pure performance. 0-60 in 3.8 seconds with precision M engineering.',
            media: {
              height: 'MEDIUM',
              contentInfo: {
                fileUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=200&fit=crop',
                altText: 'BMW M4 Competition',
              },
            },
            suggestions: [
              {
                action: {
                  text: 'Configure',
                  postbackData: 'configure',
                  openUrlAction: {
                    url: 'https://www.bmwusa.com/build-your-own.html#/series/m4',
                  },
                },
              },
              {
                reply: {
                  text: 'View specs',
                  postbackData: 'specs',
                },
              },
            ],
          },
        },
      },
    },
  },
}

const tallCard = {
  agentMessage: {
    messageId: '2',
    sendTime: new Date().toISOString(),
    contentMessage: {
      richCard: {
        standaloneCard: {
          cardContent: {
            title: 'BMW X5 xDrive40i',
            description:
              'The SAV that started it all. Luxurious comfort meets versatile capability with 335 HP inline-6 engine.',
            media: {
              height: 'TALL',
              contentInfo: {
                fileUrl: 'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=400&h=300&fit=crop',
                altText: 'BMW X5 SUV',
              },
            },
            suggestions: [
              {
                action: {
                  text: 'View Details',
                  postbackData: 'details',
                  openUrlAction: {
                    url: 'https://example.com/product',
                  },
                },
              },
              {
                action: {
                  text: 'Call Sales',
                  postbackData: 'call',
                  dialAction: {
                    phoneNumber: '+1234567890',
                  },
                },
              },
              {
                reply: {
                  text: 'Not interested',
                  postbackData: 'decline',
                },
              },
            ],
          },
        },
      },
    },
  },
}

const shortCard = {
  agentMessage: {
    messageId: '3',
    sendTime: new Date().toISOString(),
    contentMessage: {
      richCard: {
        standaloneCard: {
          cardContent: {
            title: 'BMW Service Reminder',
            description: 'Your BMW is due for its scheduled maintenance. Book your appointment today.',
            media: {
              height: 'SHORT',
              contentInfo: {
                fileUrl: 'https://images.unsplash.com/photo-1632823469850-2f77dd9c7f93?w=400&h=150&fit=crop',
                altText: 'BMW Service',
              },
            },
            suggestions: [
              {
                action: {
                  text: 'Book Service',
                  postbackData: 'book',
                  openUrlAction: {
                    url: 'https://www.bmwusa.com/owners/service.html',
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
}

const textOnlyCard = {
  agentMessage: {
    messageId: '4',
    sendTime: new Date().toISOString(),
    contentMessage: {
      richCard: {
        standaloneCard: {
          cardContent: {
            title: 'Information Card',
            description:
              'This card contains only text content without any media. It should still display properly with all the text formatting.',
            suggestions: [
              {
                reply: {
                  text: 'Got it',
                  postbackData: 'acknowledge',
                },
              },
              {
                reply: {
                  text: 'More info',
                  postbackData: 'more',
                },
              },
            ],
          },
        },
      },
    },
  },
}

export const iOS_Light: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-standalone-card
        .message=${basicCard}
        .isAndroid=${false}
        .isDarkMode=${false}
        .isPortrait=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-standalone-card>
    </div>
  `,
}

export const iOS_Dark: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 400px;">
      <rbx-standalone-card
        .message=${basicCard}
        .isAndroid=${false}
        .isDarkMode=${true}
        .isPortrait=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-standalone-card>
    </div>
  `,
}

export const Android_Light: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-standalone-card
        .message=${basicCard}
        .isAndroid=${true}
        .isDarkMode=${false}
        .isPortrait=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-standalone-card>
    </div>
  `,
}

export const Android_Dark: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 400px;">
      <rbx-standalone-card
        .message=${basicCard}
        .isAndroid=${true}
        .isDarkMode=${true}
        .isPortrait=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-standalone-card>
    </div>
  `,
}

export const Tall_Media: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-standalone-card
        .message=${tallCard}
        .isAndroid=${false}
        .isDarkMode=${false}
        .isPortrait=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-standalone-card>
    </div>
  `,
}

export const Short_Media: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-standalone-card
        .message=${shortCard}
        .isAndroid=${false}
        .isDarkMode=${false}
        .isPortrait=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-standalone-card>
    </div>
  `,
}

export const Text_Only: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-standalone-card
        .message=${textOnlyCard}
        .isAndroid=${false}
        .isDarkMode=${false}
        .isPortrait=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-standalone-card>
    </div>
  `,
}

export const Side_by_Side_Comparison: Story = {
  render: () =>
    html`
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 1rem;">
      <div>
        <h3>iOS</h3>
        <div style="background: #f2f2f7; padding: 1rem; max-width: 350px;">
          <rbx-standalone-card
            .message=${basicCard}
            .isAndroid=${false}
            .isDarkMode=${false}
            .isPortrait=${true}
            .onSendMessage=${(payload: any) => console.log('iOS:', payload)}
          ></rbx-standalone-card>
        </div>
      </div>
      <div>
        <h3>Android</h3>
        <div style="background: #f2f2f7; padding: 1rem; max-width: 350px;">
          <rbx-standalone-card
            .message=${basicCard}
            .isAndroid=${true}
            .isDarkMode=${false}
            .isPortrait=${true}
            .onSendMessage=${(payload: any) => console.log('Android:', payload)}
          ></rbx-standalone-card>
        </div>
      </div>
    </div>
  `,
}
