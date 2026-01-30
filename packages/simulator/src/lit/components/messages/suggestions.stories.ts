import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './suggestions.js'

const meta: Meta = {
  title: 'Messages/Suggestions',
  component: 'rbx-suggestions',
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    isAndroid: { control: 'boolean' },
    isDarkMode: { control: 'boolean' },
    isPortrait: { control: 'boolean' },
    isOuter: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj

const basicSuggestions = [
  {
    reply: {
      text: 'Yes, please',
      postbackData: 'yes',
    },
  },
  {
    reply: {
      text: 'No, thanks',
      postbackData: 'no',
    },
  },
  {
    reply: {
      text: 'Tell me more',
      postbackData: 'more',
    },
  },
]

const actionSuggestions = [
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
    action: {
      text: 'Visit Website',
      postbackData: 'website',
      openUrlAction: {
        url: 'https://example.com',
      },
    },
  },
  {
    action: {
      text: 'Find Location',
      postbackData: 'location',
      viewLocationAction: {
        query: 'stores near me',
      },
    },
  },
]

const mixedSuggestions = [
  {
    reply: {
      text: 'Get Support',
      postbackData: 'support',
    },
  },
  {
    action: {
      text: 'Call Now',
      postbackData: 'call',
      dialAction: {
        phoneNumber: '+1234567890',
      },
    },
  },
  {
    action: {
      text: 'Visit Store',
      postbackData: 'store',
      openUrlAction: {
        url: 'https://example.com/store',
      },
    },
  },
  {
    reply: {
      text: 'Maybe later',
      postbackData: 'later',
    },
  },
]

const singleSuggestion = [
  {
    reply: {
      text: 'Continue',
      postbackData: 'continue',
    },
  },
]

export const iOS_Outer_Light: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-suggestions
        .suggestions=${basicSuggestions}
        .isAndroid=${false}
        .isDarkMode=${false}
        .isPortrait=${true}
        .isOuter=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-suggestions>
    </div>
  `,
}

export const iOS_Outer_Dark: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 400px;">
      <rbx-suggestions
        .suggestions=${basicSuggestions}
        .isAndroid=${false}
        .isDarkMode=${true}
        .isPortrait=${true}
        .isOuter=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-suggestions>
    </div>
  `,
}

export const Android_Outer_Light: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-suggestions
        .suggestions=${basicSuggestions}
        .isAndroid=${true}
        .isDarkMode=${false}
        .isPortrait=${true}
        .isOuter=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-suggestions>
    </div>
  `,
}

export const Android_Outer_Dark: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 400px;">
      <rbx-suggestions
        .suggestions=${basicSuggestions}
        .isAndroid=${true}
        .isDarkMode=${true}
        .isPortrait=${true}
        .isOuter=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-suggestions>
    </div>
  `,
}

export const Inner_Suggestions_Light: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <div style="background: white; padding: 1rem; border-radius: 0.75rem;">
        <h4 style="margin-top: 0;">Card Actions</h4>
        <rbx-suggestions
          .suggestions=${actionSuggestions}
          .isAndroid=${true}
          .isDarkMode=${false}
          .isPortrait=${true}
          .isOuter=${false}
          .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
        ></rbx-suggestions>
      </div>
    </div>
  `,
}

export const Inner_Suggestions_Dark: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 400px;">
      <div style="background: #27272a; padding: 1rem; border-radius: 0.75rem;">
        <h4 style="margin-top: 0; color: white;">Card Actions</h4>
        <rbx-suggestions
          .suggestions=${actionSuggestions}
          .isAndroid=${true}
          .isDarkMode=${true}
          .isPortrait=${true}
          .isOuter=${false}
          .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
        ></rbx-suggestions>
      </div>
    </div>
  `,
}

export const Action_Suggestions: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-suggestions
        .suggestions=${actionSuggestions}
        .isAndroid=${true}
        .isDarkMode=${false}
        .isPortrait=${true}
        .isOuter=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-suggestions>
    </div>
  `,
}

export const Mixed_Suggestions: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-suggestions
        .suggestions=${mixedSuggestions}
        .isAndroid=${true}
        .isDarkMode=${false}
        .isPortrait=${true}
        .isOuter=${true}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-suggestions>
    </div>
  `,
}

export const Single_Suggestion: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-suggestions
        .suggestions=${singleSuggestion}
        .isAndroid=${true}
        .isDarkMode=${false}
        .isPortrait=${true}
        .isOuter=${false}
        .onSendMessage=${(payload: any) => console.log('Message sent:', payload)}
      ></rbx-suggestions>
    </div>
  `,
}

export const Side_by_Side_Comparison: Story = {
  render: () =>
    html`
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 1rem;">
      <div>
        <h3>iOS Outer Suggestions</h3>
        <div style="background: #f2f2f7; padding: 1rem; max-width: 350px;">
          <rbx-suggestions
            .suggestions=${basicSuggestions}
            .isAndroid=${false}
            .isDarkMode=${false}
            .isPortrait=${true}
            .isOuter=${true}
            .onSendMessage=${(payload: any) => console.log('iOS:', payload)}
          ></rbx-suggestions>
        </div>
      </div>
      <div>
        <h3>Android Outer Suggestions</h3>
        <div style="background: #f2f2f7; padding: 1rem; max-width: 350px;">
          <rbx-suggestions
            .suggestions=${basicSuggestions}
            .isAndroid=${true}
            .isDarkMode=${false}
            .isPortrait=${true}
            .isOuter=${true}
            .onSendMessage=${(payload: any) => console.log('Android:', payload)}
          ></rbx-suggestions>
        </div>
      </div>
    </div>
  `,
}
