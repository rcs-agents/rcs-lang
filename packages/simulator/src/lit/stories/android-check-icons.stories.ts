import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import '../components/messages/user-text-message.js'

const meta: Meta = {
  title: 'Android Messages/Check Icons',
  component: 'rbx-user-text-message',
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'android-chat',
      values: [
        { name: 'android-chat', value: '#f0f0f0' },
        { name: 'android-dark', value: '#1a1a1a' },
      ],
    },
  },
  argTypes: {
    isAndroid: { control: 'boolean' },
    isDarkMode: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj

export const Circular_Check_Icons: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
        
        <!-- Single word message - should show circular icon -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '1',
              sendTime: new Date(Date.now() - 180000).toISOString(),
              agentId: 'user',
              text: 'Ok',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Short message - should show circular icon -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '2',
              sendTime: new Date(Date.now() - 120000).toISOString(),
              agentId: 'user',
              text: 'Hello',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Medium message - should show circular icon -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '3',
              sendTime: new Date(Date.now() - 60000).toISOString(),
              agentId: 'user',
              text: 'How are you doing today?',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Long message - should show circular icon -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '4',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'I need help with my order that was placed yesterday and still shows as processing',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
      </div>
    </div>
  `,
}

export const Icon_Size_Comparison: Story = {
  render: () =>
    html`
    <div style="display: flex; gap: 2rem;">
      <!-- Light background -->
      <div style="width: 300px;">
        <h3 style="text-align: center; margin-bottom: 1rem; font-family: sans-serif; color: #333;">Light Mode</h3>
        <div style="padding: 1rem; background: #f0f0f0; border-radius: 8px;">
          <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
            <rbx-user-text-message 
              .message=${{
                userMessage: {
                  senderPhoneNumber: '+1234567890',
                  messageId: '1',
                  sendTime: new Date().toISOString(),
                  agentId: 'user',
                  text: 'Sent ✓',
                },
              }}
              .isAndroid=${true}
              .isDarkMode=${false}
            ></rbx-user-text-message>
            
            <rbx-user-text-message 
              .message=${{
                userMessage: {
                  senderPhoneNumber: '+1234567890',
                  messageId: '2',
                  sendTime: new Date().toISOString(),
                  agentId: 'user',
                  text: 'Delivered ✓✓',
                },
              }}
              .isAndroid=${true}
              .isDarkMode=${false}
            ></rbx-user-text-message>
            
            <rbx-user-text-message 
              .message=${{
                userMessage: {
                  senderPhoneNumber: '+1234567890',
                  messageId: '3',
                  sendTime: new Date().toISOString(),
                  agentId: 'user',
                  text: 'Read - Perfect circles!',
                },
              }}
              .isAndroid=${true}
              .isDarkMode=${false}
            ></rbx-user-text-message>
          </div>
        </div>
      </div>
      
      <!-- Dark background -->
      <div style="width: 300px;">
        <h3 style="text-align: center; margin-bottom: 1rem; font-family: sans-serif; color: #333;">Dark Mode</h3>
        <div style="padding: 1rem; background: #1a1a1a; border-radius: 8px;">
          <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
            <rbx-user-text-message 
              .message=${{
                userMessage: {
                  senderPhoneNumber: '+1234567890',
                  messageId: '1',
                  sendTime: new Date().toISOString(),
                  agentId: 'user',
                  text: 'Dark mode ✓',
                },
              }}
              .isAndroid=${true}
              .isDarkMode=${true}
            ></rbx-user-text-message>
            
            <rbx-user-text-message 
              .message=${{
                userMessage: {
                  senderPhoneNumber: '+1234567890',
                  messageId: '2',
                  sendTime: new Date().toISOString(),
                  agentId: 'user',
                  text: 'Circular icons ⭕',
                },
              }}
              .isAndroid=${true}
              .isDarkMode=${true}
            ></rbx-user-text-message>
            
            <rbx-user-text-message 
              .message=${{
                userMessage: {
                  senderPhoneNumber: '+1234567890',
                  messageId: '3',
                  sendTime: new Date().toISOString(),
                  agentId: 'user',
                  text: 'Not oval anymore! 🎯',
                },
              }}
              .isAndroid=${true}
              .isDarkMode=${true}
            ></rbx-user-text-message>
          </div>
        </div>
      </div>
    </div>
  `,
}

export const Focus_on_Icons: Story = {
  render: () =>
    html`
    <div style="width: 500px; padding: 2rem; background: #f0f0f0; border-radius: 8px;">
      <h2 style="text-align: center; margin-bottom: 2rem; font-family: sans-serif; color: #333;">
        Check Icon Focus Test
      </h2>
      <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-end;">
        
        <!-- Various text lengths to test icon consistency -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '1',
              sendTime: new Date(Date.now() - 240000).toISOString(),
              agentId: 'user',
              text: 'A',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '2',
              sendTime: new Date(Date.now() - 180000).toISOString(),
              agentId: 'user',
              text: 'Short',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '3',
              sendTime: new Date(Date.now() - 120000).toISOString(),
              agentId: 'user',
              text: 'Medium length message',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '4',
              sendTime: new Date(Date.now() - 60000).toISOString(),
              agentId: 'user',
              text: 'This is a longer message to test how the circular check icon behaves with multi-line text content',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '5',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'Very long message that should wrap to multiple lines and still maintain a perfect circular check icon that does not appear oval or egg-shaped in any way. The icon should remain consistently round regardless of the message length or container height.',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
      </div>
      
      <div style="margin-top: 2rem; padding: 1rem; background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; border-radius: 8px;">
        <p style="margin: 0; color: #15803d; font-family: sans-serif; font-size: 0.875rem; text-align: center;">
          ✅ All check icons should appear perfectly circular, not oval-shaped
        </p>
      </div>
    </div>
  `,
}

export const Before_After_Comparison: Story = {
  render: () =>
    html`
    <div style="width: 600px; padding: 2rem; background: #f9fafb; border-radius: 8px;">
      <h2 style="text-align: center; margin-bottom: 2rem; font-family: sans-serif; color: #111827;">
        Icon Shape Fix: Before vs After
      </h2>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <!-- Before (simulated with inline styling issues) -->
        <div>
          <h3 style="text-align: center; margin-bottom: 1rem; font-family: sans-serif; color: #6b7280;">
            ❌ Before (Oval-shaped)
          </h3>
          <div style="padding: 1rem; background: #f0f0f0; border-radius: 8px; opacity: 0.7;">
            <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
              <div style="color: #6b7280; font-family: sans-serif; font-size: 0.75rem; text-align: center; padding: 0.5rem;">
                Icons were appearing oval due to:<br>
                • Inconsistent padding<br>
                • No min-width/height<br>
                • Missing flex-shrink: 0
              </div>
            </div>
          </div>
        </div>
        
        <!-- After (current implementation) -->
        <div>
          <h3 style="text-align: center; margin-bottom: 1rem; font-family: sans-serif; color: #059669;">
            ✅ After (Perfectly Circular)
          </h3>
          <div style="padding: 1rem; background: #f0f0f0; border-radius: 8px;">
            <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
              <rbx-user-text-message 
                .message=${{
                  userMessage: {
                    senderPhoneNumber: '+1234567890',
                    messageId: '1',
                    sendTime: new Date().toISOString(),
                    agentId: 'user',
                    text: 'Fixed! ⭕',
                  },
                }}
                .isAndroid=${true}
                .isDarkMode=${false}
              ></rbx-user-text-message>
              
              <rbx-user-text-message 
                .message=${{
                  userMessage: {
                    senderPhoneNumber: '+1234567890',
                    messageId: '2',
                    sendTime: new Date().toISOString(),
                    agentId: 'user',
                    text: 'Perfect circles now! 🎯',
                  },
                }}
                .isAndroid=${true}
                .isDarkMode=${false}
              ></rbx-user-text-message>
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 2rem; padding: 1.5rem; background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px;">
        <h4 style="margin: 0 0 0.5rem 0; color: #1e40af; font-family: sans-serif;">CSS Changes Made:</h4>
        <ul style="margin: 0; color: #1e40af; font-family: monospace; font-size: 0.875rem;">
          <li>Removed padding: 2px (was causing distortion)</li>
          <li>Increased size: 16px → 18px for better visibility</li>
          <li>Added min-width/min-height: 18px</li>
          <li>Added flex-shrink: 0 to prevent compression</li>
        </ul>
      </div>
    </div>
  `,
}
