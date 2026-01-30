import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import type { Thread } from '../../core/types.js'
import { Simulator } from './simulator'

const meta: Meta<typeof Simulator> = {
  component: Simulator,
  title: 'React/Simulator',
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    isVisible: {
      control: 'boolean',
      description: 'Whether the simulator is visible',
    },
    showControls: {
      control: 'boolean',
      description: 'Whether to show the control buttons',
    },
    agentName: {
      control: 'text',
      description: 'Agent display name',
    },
    agentIconUrl: {
      control: 'text',
      description: 'Agent icon URL',
    },
  },
}

export default meta
type Story = StoryObj<typeof Simulator>

// Sample thread data for static mode demos
const sampleThread: Thread = [
  {
    agentMessage: {
      messageId: '1',
      sendTime: '2024-01-15T10:00:00Z',
      contentMessage: {
        text: 'Welcome to Coffee Bot! How can I help you today?',
        suggestions: [
          { reply: { text: 'Order a coffee', postbackData: 'order_coffee' } },
          { reply: { text: 'View menu', postbackData: 'view_menu' } },
          { reply: { text: 'Store hours', postbackData: 'hours' } },
        ],
      },
    },
  },
  {
    userMessage: {
      messageId: '2',
      sendTime: '2024-01-15T10:00:30Z',
      senderPhoneNumber: '+1234567890',
      agentId: 'coffee-bot',
      text: 'Order a coffee',
    },
  },
  {
    agentMessage: {
      messageId: '3',
      sendTime: '2024-01-15T10:00:31Z',
      contentMessage: {
        text: 'Great choice! What size would you like?',
        suggestions: [
          { reply: { text: 'Small', postbackData: 'size_small' } },
          { reply: { text: 'Medium', postbackData: 'size_medium' } },
          { reply: { text: 'Large', postbackData: 'size_large' } },
        ],
      },
    },
  },
]

const conversationWithRichCard: Thread = [
  {
    agentMessage: {
      messageId: '1',
      sendTime: '2024-01-15T10:00:00Z',
      contentMessage: {
        text: 'Here is our featured item today:',
      },
    },
  },
  {
    agentMessage: {
      messageId: '2',
      sendTime: '2024-01-15T10:00:01Z',
      contentMessage: {
        richCard: {
          standaloneCard: {
            cardContent: {
              title: 'Caramel Macchiato',
              description: 'Freshly brewed espresso with vanilla-flavored syrup, milk and caramel drizzle.',
              media: {
                height: 'MEDIUM',
                contentInfo: {
                  fileUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400',
                  thumbnailUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=200',
                },
              },
              suggestions: [
                { reply: { text: 'Order now', postbackData: 'order_caramel' } },
                { reply: { text: 'See more', postbackData: 'more_drinks' } },
              ],
            },
          },
        },
      },
    },
  },
]

// Wrapper to center the simulator
const CenteredWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#e5e7eb',
      padding: '20px',
    }}
  >
    {children}
  </div>
)

/**
 * Static mode - displays a pre-recorded conversation thread.
 * No CSM engine is needed.
 */
export const StaticMode: Story = {
  render: (args) => (
    <CenteredWrapper>
      <Simulator {...args} />
    </CenteredWrapper>
  ),
  args: {
    thread: sampleThread,
    agentName: 'Coffee Bot',
    agentIconUrl: 'https://via.placeholder.com/50/8B4513/ffffff?text=CB',
    isVisible: true,
    showControls: true,
  },
}

/**
 * Static mode with rich card content.
 */
export const StaticWithRichCard: Story = {
  render: (args) => (
    <CenteredWrapper>
      <Simulator {...args} />
    </CenteredWrapper>
  ),
  args: {
    thread: conversationWithRichCard,
    agentName: 'Coffee Bot',
    agentIconUrl: 'https://via.placeholder.com/50/8B4513/ffffff?text=CB',
    isVisible: true,
    showControls: true,
  },
}

/**
 * Static mode without control buttons.
 */
export const NoControls: Story = {
  render: (args) => (
    <CenteredWrapper>
      <Simulator {...args} />
    </CenteredWrapper>
  ),
  args: {
    thread: sampleThread,
    agentName: 'Demo Agent',
    isVisible: true,
    showControls: false,
  },
}

/**
 * Static mode with dark theme initial setting.
 */
export const DarkThemeInitial: Story = {
  render: (args) => (
    <CenteredWrapper>
      <Simulator {...args} />
    </CenteredWrapper>
  ),
  args: {
    thread: sampleThread,
    agentName: 'Coffee Bot',
    isVisible: true,
    showControls: true,
    initialDisplaySettings: {
      isDarkMode: true,
    },
  },
}

/**
 * Static mode in landscape orientation.
 */
export const LandscapeInitial: Story = {
  render: (args) => (
    <CenteredWrapper>
      <Simulator {...args} />
    </CenteredWrapper>
  ),
  args: {
    thread: sampleThread,
    agentName: 'Coffee Bot',
    isVisible: true,
    showControls: true,
    initialDisplaySettings: {
      isPortrait: false,
    },
  },
}

/**
 * Static mode showing iOS device.
 */
export const IOSDevice: Story = {
  render: (args) => (
    <CenteredWrapper>
      <Simulator {...args} />
    </CenteredWrapper>
  ),
  args: {
    thread: sampleThread,
    agentName: 'Coffee Bot',
    isVisible: true,
    showControls: true,
    initialDisplaySettings: {
      isAndroid: false,
    },
  },
}

/**
 * Empty thread state.
 */
export const EmptyThread: Story = {
  render: (args) => (
    <CenteredWrapper>
      <Simulator {...args} />
    </CenteredWrapper>
  ),
  args: {
    thread: [],
    agentName: 'New Conversation',
    isVisible: true,
    showControls: true,
  },
}

/**
 * With user interaction callback.
 */
export const WithInteractionCallback: Story = {
  render: (args) => (
    <CenteredWrapper>
      <Simulator {...args} />
    </CenteredWrapper>
  ),
  args: {
    thread: sampleThread,
    agentName: 'Coffee Bot',
    isVisible: true,
    showControls: true,
    onUserInteraction: (input) => {
      console.log('User interaction:', input)
      alert(`User sent: ${input.text}${input.postbackData ? ` (postback: ${input.postbackData})` : ''}`)
    },
  },
}
