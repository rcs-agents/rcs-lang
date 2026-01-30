import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './device.js'
import logoSvg from '../../logo.svg?raw'

const meta: Meta = {
  title: 'Components/Device',
  component: 'rbx-device',
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj

const mockAgent = {
  iconUrl: `data:image/svg+xml;base64,${btoa(logoSvg)}`,
  brandName: 'RBX Platform',
}

const mockThread = [
  {
    agentMessage: {
      messageId: '1',
      sendTime: new Date().toISOString(),
      text: 'Welcome! How can I help you today?',
    },
  },
  {
    userMessage: {
      senderPhoneNumber: '+1234567890',
      messageId: '2',
      sendTime: new Date().toISOString(),
      agentId: 'user',
      text: 'Hello, I need some assistance.',
    },
  },
]

export const iPhone_Portrait_Light: Story = {
  render: () =>
    html`
    <rbx-device
      .agent=${mockAgent}
      .isPortrait=${true}
      .isDarkMode=${false}
      .isAndroid=${false}
      .thread=${mockThread}
    ></rbx-device>
  `,
}

export const iPhone_Portrait_Dark: Story = {
  render: () =>
    html`
    <rbx-device
      .agent=${mockAgent}
      .isPortrait=${true}
      .isDarkMode=${true}
      .isAndroid=${false}
      .thread=${mockThread}
    ></rbx-device>
  `,
}

export const Android_Portrait_Light: Story = {
  render: () =>
    html`
    <rbx-device
      .agent=${mockAgent}
      .isPortrait=${true}
      .isDarkMode=${false}
      .isAndroid=${true}
      .thread=${mockThread}
    ></rbx-device>
  `,
}

export const iPhone_Landscape: Story = {
  render: () =>
    html`
    <rbx-device
      .agent=${mockAgent}
      .isPortrait=${false}
      .isDarkMode=${false}
      .isAndroid=${false}
      .thread=${mockThread}
    ></rbx-device>
  `,
}

export const Empty_Thread: Story = {
  render: () =>
    html`
    <rbx-device
      .agent=${mockAgent}
      .isPortrait=${true}
      .isDarkMode=${false}
      .isAndroid=${false}
      .thread=${[]}
    ></rbx-device>
  `,
}
