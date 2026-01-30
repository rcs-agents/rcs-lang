import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './user-text-message.js'

const meta: Meta = {
  title: 'Messages/UserTextMessage',
  component: 'rbx-user-text-message',
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    isAndroid: { control: 'boolean' },
    isDarkMode: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj

const userTextMessage = {
  userMessage: {
    senderPhoneNumber: '+1234567890',
    messageId: '1',
    sendTime: new Date().toISOString(),
    agentId: 'user',
    text: 'Hi there! I need help with my account.',
  },
}

const userSuggestionMessage = {
  userMessage: {
    senderPhoneNumber: '+1234567890',
    messageId: '2',
    sendTime: new Date().toISOString(),
    agentId: 'user',
    suggestionResponse: {
      postbackData: 'support',
      text: 'Get Support',
      type: 'REPLY',
    },
  },
}

const longUserMessage = {
  userMessage: {
    senderPhoneNumber: '+1234567890',
    messageId: '3',
    sendTime: new Date().toISOString(),
    agentId: 'user',
    text: 'This is a longer user message to test how text wrapping works in user messages. It should maintain proper styling and readability.',
  },
}

export const iOS_Light: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-user-text-message
        .message=${userTextMessage}
        .isAndroid=${false}
        .isDarkMode=${false}
      ></rbx-user-text-message>
    </div>
  `,
}

export const iOS_Dark: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 400px;">
      <rbx-user-text-message
        .message=${userTextMessage}
        .isAndroid=${false}
        .isDarkMode=${true}
      ></rbx-user-text-message>
    </div>
  `,
}

export const Android_Light: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-user-text-message
        .message=${userTextMessage}
        .isAndroid=${true}
        .isDarkMode=${false}
      ></rbx-user-text-message>
    </div>
  `,
}

export const Android_Dark: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 400px;">
      <rbx-user-text-message
        .message=${userTextMessage}
        .isAndroid=${true}
        .isDarkMode=${true}
      ></rbx-user-text-message>
    </div>
  `,
}

export const Suggestion_Response: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-user-text-message
        .message=${userSuggestionMessage}
        .isAndroid=${true}
        .isDarkMode=${false}
      ></rbx-user-text-message>
    </div>
  `,
}

export const Long_Message: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-user-text-message
        .message=${longUserMessage}
        .isAndroid=${false}
        .isDarkMode=${false}
      ></rbx-user-text-message>
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
          <rbx-user-text-message
            .message=${userTextMessage}
            .isAndroid=${false}
            .isDarkMode=${false}
          ></rbx-user-text-message>
        </div>
      </div>
      <div>
        <h3>Android (with checkmark)</h3>
        <div style="background: #f2f2f7; padding: 1rem; max-width: 350px;">
          <rbx-user-text-message
            .message=${userTextMessage}
            .isAndroid=${true}
            .isDarkMode=${false}
          ></rbx-user-text-message>
        </div>
      </div>
    </div>
  `,
}
