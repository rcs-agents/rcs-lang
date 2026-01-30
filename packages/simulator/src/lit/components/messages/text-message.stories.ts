import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './text-message.js'

const meta: Meta = {
  title: 'Messages/TextMessage',
  component: 'rbx-text-message',
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

const basicTextMessage = {
  agentMessage: {
    messageId: '1',
    sendTime: new Date().toISOString(),
    contentMessage: {
      text: 'Welcome to BMW! I can help you explore our vehicles, schedule service, or find special offers.',
    },
  },
}

const textWithSuggestions = {
  agentMessage: {
    messageId: '2',
    sendTime: new Date().toISOString(),
    contentMessage: {
      text: 'What type of BMW are you interested in?',
      suggestions: [
        {
          reply: {
            text: 'Electric',
            postbackData: 'electric',
          },
        },
        {
          reply: {
            text: 'M Performance',
            postbackData: 'm_series',
          },
        },
        {
          action: {
            text: 'Visit Website',
            postbackData: 'website',
            openUrlAction: {
              url: 'https://example.com',
            },
          },
        },
      ],
    },
  },
}

const otpMessage = {
  agentMessage: {
    messageId: '3',
    sendTime: new Date().toISOString(),
    messageTrafficType: 'AUTHENTICATION',
    contentMessage: {
      text: 'Your BMW ConnectedDrive verification code is 847263. Please enter this code to complete your login.',
    },
  },
}

const longTextMessage = {
  agentMessage: {
    messageId: '4',
    sendTime: new Date().toISOString(),
    contentMessage: {
      text: "Thank you for choosing BMW! Your new BMW i4 M50 order has been confirmed. You'll receive updates throughout the production process. Expected delivery is in 8-10 weeks. Your BMW Genius will contact you soon to discuss delivery options and any additional features you'd like to add.",
    },
  },
}

export const iOS_Light: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-text-message
        .message=${basicTextMessage}
        .isAndroid=${false}
        .isDarkMode=${false}
        .isPortrait=${true}
      ></rbx-text-message>
    </div>
  `,
}

export const iOS_Dark: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 400px;">
      <rbx-text-message
        .message=${basicTextMessage}
        .isAndroid=${false}
        .isDarkMode=${true}
        .isPortrait=${true}
      ></rbx-text-message>
    </div>
  `,
}

export const Android_Light: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-text-message
        .message=${basicTextMessage}
        .isAndroid=${true}
        .isDarkMode=${false}
        .isPortrait=${true}
      ></rbx-text-message>
    </div>
  `,
}

export const Android_Dark: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 400px;">
      <rbx-text-message
        .message=${basicTextMessage}
        .isAndroid=${true}
        .isDarkMode=${true}
        .isPortrait=${true}
      ></rbx-text-message>
    </div>
  `,
}

export const With_Suggestions_iOS: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-text-message
        .message=${textWithSuggestions}
        .isAndroid=${false}
        .isDarkMode=${false}
        .isPortrait=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-text-message>
    </div>
  `,
}

export const With_Suggestions_Android: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-text-message
        .message=${textWithSuggestions}
        .isAndroid=${true}
        .isDarkMode=${false}
        .isPortrait=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-text-message>
    </div>
  `,
}

export const OTP_Message: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-text-message
        .message=${otpMessage}
        .isAndroid=${false}
        .isDarkMode=${false}
        .isPortrait=${true}
      ></rbx-text-message>
    </div>
  `,
}

export const Long_Text: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-text-message
        .message=${longTextMessage}
        .isAndroid=${false}
        .isDarkMode=${false}
        .isPortrait=${true}
      ></rbx-text-message>
    </div>
  `,
}

export const Side_by_Side_Comparison: Story = {
  render: () =>
    html`
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 1rem;">
      <div>
        <h3>iOS Light</h3>
        <div style="background: #f2f2f7; padding: 1rem; max-width: 350px;">
          <rbx-text-message
            .message=${textWithSuggestions}
            .isAndroid=${false}
            .isDarkMode=${false}
            .isPortrait=${true}
            .onSendMessage=${(payload: any) => console.log('iOS:', payload)}
          ></rbx-text-message>
        </div>
      </div>
      <div>
        <h3>Android Light</h3>
        <div style="background: #f2f2f7; padding: 1rem; max-width: 350px;">
          <rbx-text-message
            .message=${textWithSuggestions}
            .isAndroid=${true}
            .isDarkMode=${false}
            .isPortrait=${true}
            .onSendMessage=${(payload: any) => console.log('Android:', payload)}
          ></rbx-text-message>
        </div>
      </div>
    </div>
  `,
}
