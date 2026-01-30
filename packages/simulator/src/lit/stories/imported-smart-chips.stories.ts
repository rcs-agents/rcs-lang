import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'

// import { action } from '@storybook/addon-actions';
const action = (name: string) => (data: any) => console.log(name, data)
import '../../imported/register-components.js'
import type { SmartActionChip, SmartChip, SmartReplyChip } from '../../imported/index.js'

const meta: Meta = {
  title: 'Imported Components/Smart Chips',
  component: 'rbx-smart-chips',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Smart reply and action chips for RCS Business Messaging conversations',
      },
    },
  },
  argTypes: {
    layout: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
    },
    isAndroid: { control: 'boolean' },
    isDarkMode: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj

// Smart reply chips example from smart-chips-examples.md
const smartReplyChips: SmartReplyChip[] = [
  { type: 'reply', text: 'Yes, please', postbackData: 'yes' },
  { type: 'reply', text: 'No, thanks', postbackData: 'no' },
  { type: 'reply', text: 'Maybe later', postbackData: 'maybe' },
  { type: 'reply', text: 'Tell me more', postbackData: 'more_info' },
  { type: 'reply', text: "I'm interested", postbackData: 'interested' },
]

// Smart action chips example from smart-chips-examples.md
const smartActionChips: SmartActionChip[] = [
  {
    type: 'action',
    text: 'Location',
    icon: 'location',
    postbackData: 'share_location',
    action: { shareLocationAction: {} },
  },
  {
    type: 'action',
    text: 'Call',
    icon: 'phone',
    postbackData: 'call',
    action: { dialAction: { phoneNumber: '+1234567890' } },
  },
  {
    type: 'action',
    text: 'Website',
    icon: 'web',
    postbackData: 'website',
    action: { openUrlAction: { url: 'https://example.com' } },
  },
  {
    type: 'action',
    text: 'Schedule',
    icon: 'calendar',
    postbackData: 'schedule',
    action: {
      createCalendarEventAction: {
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
        title: 'Meeting',
      },
    },
  },
]

// Restaurant quick replies
const restaurantReplies: SmartReplyChip[] = [
  { type: 'reply', text: 'Table for 2', postbackData: 'table_2' },
  { type: 'reply', text: 'Table for 4', postbackData: 'table_4' },
  { type: 'reply', text: 'Table for 6', postbackData: 'table_6' },
  { type: 'reply', text: 'Private dining', postbackData: 'private' },
  { type: 'reply', text: 'Cancel reservation', postbackData: 'cancel' },
]

// Support quick replies
const supportReplies: SmartReplyChip[] = [
  { type: 'reply', text: 'Yes', postbackData: 'yes' },
  { type: 'reply', text: 'No', postbackData: 'no' },
  { type: 'reply', text: 'Help', postbackData: 'help' },
  { type: 'reply', text: 'More info', postbackData: 'info' },
]

// BMW service actions
const bmwServiceActions: SmartActionChip[] = [
  {
    type: 'action',
    text: 'Call Service',
    icon: 'phone',
    postbackData: 'call_service',
    action: { dialAction: { phoneNumber: '+1555-BMW-SERV' } },
  },
  {
    type: 'action',
    text: 'Find Location',
    icon: 'location',
    postbackData: 'find_location',
    action: { shareLocationAction: {} },
  },
  {
    type: 'action',
    text: 'Book Online',
    icon: 'web',
    postbackData: 'book_online',
    action: { openUrlAction: { url: 'https://bmwservice.com/book' } },
  },
  {
    type: 'action',
    text: 'Add to Calendar',
    icon: 'calendar',
    postbackData: 'add_calendar',
    action: {
      createCalendarEventAction: {
        startTime: '2024-02-15T09:00:00Z',
        endTime: '2024-02-15T11:00:00Z',
        title: 'BMW Service Appointment',
      },
    },
  },
]

// Mixed reply and action chips
const mixedChips: SmartChip[] = [
  { type: 'reply', text: 'Yes, book it', postbackData: 'confirm_booking' },
  { type: 'reply', text: 'Not now', postbackData: 'decline' },
  {
    type: 'action',
    text: 'Call to confirm',
    icon: 'phone',
    postbackData: 'call_confirm',
    action: { dialAction: { phoneNumber: '+1234567890' } },
  },
  {
    type: 'action',
    text: 'View details',
    icon: 'web',
    postbackData: 'view_details',
    action: { openUrlAction: { url: 'https://example.com/details' } },
  },
]

// Long text chips (test overflow)
const longTextChips: SmartReplyChip[] = [
  { type: 'reply', text: 'This is a very long reply chip text that might overflow', postbackData: 'long_1' },
  { type: 'reply', text: 'Another extremely long text for testing', postbackData: 'long_2' },
  { type: 'reply', text: 'Short', postbackData: 'short' },
  { type: 'reply', text: 'Medium length text', postbackData: 'medium' },
]

// Single chip examples
const singleReply: SmartReplyChip[] = [{ type: 'reply', text: 'Got it', postbackData: 'acknowledge' }]

const singleAction: SmartActionChip[] = [
  {
    type: 'action',
    text: 'Call Now',
    icon: 'phone',
    postbackData: 'call_now',
    action: { dialAction: { phoneNumber: '+1234567890' } },
  },
]

export const Smart_Replies: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-smart-chips 
        .chips=${smartReplyChips} 
        layout="horizontal"
        .onChipClick=${action('reply-chip-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Smart_Actions: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-smart-chips 
        .chips=${smartActionChips} 
        layout="horizontal"
        .onChipClick=${action('action-chip-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Restaurant_Replies: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-smart-chips 
        .chips=${restaurantReplies} 
        layout="horizontal"
        .onChipClick=${action('restaurant-chip-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const BMW_Service_Actions: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-smart-chips 
        .chips=${bmwServiceActions} 
        layout="horizontal"
        .onChipClick=${action('bmw-service-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Mixed_Chips: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-smart-chips 
        .chips=${mixedChips} 
        layout="horizontal"
        .onChipClick=${action('mixed-chip-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Support_Quick_Replies: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-smart-chips 
        .chips=${supportReplies} 
        layout="horizontal"
        .onChipClick=${action('support-chip-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Long_Text_Overflow: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-smart-chips 
        .chips=${longTextChips} 
        layout="horizontal"
        .onChipClick=${action('long-text-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Vertical_Layout: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 300px;">
      <rbx-smart-chips 
        .chips=${smartReplyChips} 
        layout="vertical"
        .onChipClick=${action('vertical-chip-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Vertical_Actions: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 300px;">
      <rbx-smart-chips 
        .chips=${smartActionChips} 
        layout="vertical"
        .onChipClick=${action('vertical-action-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Single_Reply: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-smart-chips 
        .chips=${singleReply} 
        layout="horizontal"
        .onChipClick=${action('single-reply-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Single_Action: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-smart-chips 
        .chips=${singleAction} 
        layout="horizontal"
        .onChipClick=${action('single-action-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Android_Style: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-smart-chips 
        .chips=${smartReplyChips} 
        layout="horizontal"
        isAndroid=${true}
        .onChipClick=${action('android-chip-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Android_Actions: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-smart-chips 
        .chips=${smartActionChips} 
        layout="horizontal"
        isAndroid=${true}
        .onChipClick=${action('android-action-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Dark_Mode: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 600px;">
      <rbx-smart-chips 
        .chips=${smartReplyChips} 
        layout="horizontal"
        isDarkMode=${true}
        .onChipClick=${action('dark-chip-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Dark_Mode_Actions: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 600px;">
      <rbx-smart-chips 
        .chips=${smartActionChips} 
        layout="horizontal"
        isDarkMode=${true}
        .onChipClick=${action('dark-action-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Android_Dark: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 600px;">
      <rbx-smart-chips 
        .chips=${mixedChips} 
        layout="horizontal"
        isAndroid=${true}
        isDarkMode=${true}
        .onChipClick=${action('android-dark-clicked')}
      ></rbx-smart-chips>
    </div>
  `,
}

export const Side_by_Side_Comparison: Story = {
  render: () =>
    html`
    <div style="display: grid; grid-template-columns: 1fr; gap: 2rem; padding: 1rem;">
      <div>
        <h3 style="margin-bottom: 1rem;">iOS Style</h3>
        <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
          <rbx-smart-chips
            .chips=${smartReplyChips}
            layout="horizontal"
            isAndroid=${false}
            .onChipClick=${action('iOS-chip-clicked')}
          ></rbx-smart-chips>
        </div>
      </div>
      <div>
        <h3 style="margin-bottom: 1rem;">Android Style</h3>
        <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
          <rbx-smart-chips
            .chips=${smartReplyChips}
            layout="horizontal"
            isAndroid=${true}
            .onChipClick=${action('Android-chip-clicked')}
          ></rbx-smart-chips>
        </div>
      </div>
    </div>
  `,
}

export const Layout_Comparison: Story = {
  render: () =>
    html`
    <div style="display: grid; grid-template-columns: 1fr 300px; gap: 2rem; padding: 1rem; background: #f2f2f7;">
      <div>
        <h3 style="margin-bottom: 1rem;">Horizontal Layout</h3>
        <div style="max-width: 600px;">
          <rbx-smart-chips
            .chips=${smartReplyChips}
            layout="horizontal"
            .onChipClick=${action('horizontal-clicked')}
          ></rbx-smart-chips>
        </div>
      </div>
      <div>
        <h3 style="margin-bottom: 1rem;">Vertical Layout</h3>
        <div>
          <rbx-smart-chips
            .chips=${smartReplyChips}
            layout="vertical"
            .onChipClick=${action('vertical-clicked')}
          ></rbx-smart-chips>
        </div>
      </div>
    </div>
  `,
}

export const Chip_Types_Showcase: Story = {
  render: () =>
    html`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem; background: #f2f2f7;">
      <div>
        <h3 style="margin-bottom: 1rem; color: #666;">Reply Chips (Gray)</h3>
        <div style="max-width: 600px;">
          <rbx-smart-chips
            .chips=${smartReplyChips}
            layout="horizontal"
            .onChipClick=${action('reply-showcase-clicked')}
          ></rbx-smart-chips>
        </div>
      </div>
      
      <div>
        <h3 style="margin-bottom: 1rem; color: #1976d2;">Action Chips (Blue with Icons)</h3>
        <div style="max-width: 600px;">
          <rbx-smart-chips
            .chips=${smartActionChips}
            layout="horizontal"
            .onChipClick=${action('action-showcase-clicked')}
          ></rbx-smart-chips>
        </div>
      </div>
      
      <div>
        <h3 style="margin-bottom: 1rem; color: #333;">Mixed Chips</h3>
        <div style="max-width: 600px;">
          <rbx-smart-chips
            .chips=${mixedChips}
            layout="horizontal"
            .onChipClick=${action('mixed-showcase-clicked')}
          ></rbx-smart-chips>
        </div>
      </div>
    </div>
  `,
}

export const Business_Use_Cases: Story = {
  render: () =>
    html`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem; background: #f2f2f7;">
      <div>
        <h4 style="margin-bottom: 0.5rem;">Restaurant Reservations</h4>
        <div style="max-width: 600px;">
          <rbx-smart-chips
            .chips=${restaurantReplies}
            layout="horizontal"
            .onChipClick=${action('restaurant-use-case')}
          ></rbx-smart-chips>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: 0.5rem;">BMW Service Center</h4>
        <div style="max-width: 600px;">
          <rbx-smart-chips
            .chips=${bmwServiceActions}
            layout="horizontal"
            .onChipClick=${action('bmw-use-case')}
          ></rbx-smart-chips>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: 0.5rem;">Customer Support</h4>
        <div style="max-width: 600px;">
          <rbx-smart-chips
            .chips=${supportReplies}
            layout="horizontal"
            .onChipClick=${action('support-use-case')}
          ></rbx-smart-chips>
        </div>
      </div>
    </div>
  `,
}

export const Responsive_Behavior: Story = {
  render: () =>
    html`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem; background: #f2f2f7;">
      <div>
        <h4 style="margin-bottom: 0.5rem;">Mobile Width (320px)</h4>
        <div style="max-width: 320px; border: 1px dashed #ccc;">
          <rbx-smart-chips
            .chips=${smartReplyChips}
            layout="horizontal"
            .onChipClick=${action('mobile-responsive')}
          ></rbx-smart-chips>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: 0.5rem;">Tablet Width (600px)</h4>
        <div style="max-width: 600px; border: 1px dashed #ccc;">
          <rbx-smart-chips
            .chips=${smartReplyChips}
            layout="horizontal"
            .onChipClick=${action('tablet-responsive')}
          ></rbx-smart-chips>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: 0.5rem;">Full Width</h4>
        <div style="border: 1px dashed #ccc;">
          <rbx-smart-chips
            .chips=${smartReplyChips}
            layout="horizontal"
            .onChipClick=${action('full-responsive')}
          ></rbx-smart-chips>
        </div>
      </div>
    </div>
  `,
}
