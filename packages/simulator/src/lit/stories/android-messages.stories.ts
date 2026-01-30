import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import '../components/messages/text-message.js'
import '../components/messages/user-text-message.js'
import '../components/messages/standalone-card.js'
import '../components/messages/suggestions.js'
import type { Suggestion, ThreadEntry } from '../types/index.js'

const meta: Meta = {
  title: 'Android Messages/Complete Conversation',
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
}

export default meta
type Story = StoryObj

// Mock messages for demonstration
const mockAgentMessage: ThreadEntry = {
  agentMessage: {
    messageId: '1',
    sendTime: new Date().toISOString(),
    text: 'Hello! Welcome to BMW Service Center. How can I help you today?',
  },
}

const mockUserMessage: ThreadEntry = {
  userMessage: {
    senderPhoneNumber: '+1234567890',
    messageId: '2',
    sendTime: new Date().toISOString(),
    agentId: 'user',
    text: 'I need to schedule a service appointment for my BMW X5',
  },
}

const mockAgentMessageWithCard: ThreadEntry = {
  agentMessage: {
    messageId: '3',
    sendTime: new Date().toISOString(),
    text: 'Sure! I can help you schedule a service appointment. Here are our available services:',
    richCard: {
      standaloneCard: {
        cardOrientation: 'VERTICAL',
        cardContent: {
          title: 'BMW Service Options',
          description: 'Choose from our comprehensive service packages',
          media: {
            height: 'MEDIUM',
            contentInfo: {
              fileUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=225&fit=crop',
              mimeType: 'image/jpeg',
            },
          },
          suggestions: [
            {
              reply: {
                text: 'Oil Change',
                postbackData: 'service_oil_change',
              },
            },
            {
              reply: {
                text: 'Brake Service',
                postbackData: 'service_brake',
              },
            },
            {
              action: {
                text: 'Call Service Center',
                postbackData: 'call_service',
                dialAction: {
                  phoneNumber: '+1-800-BMW-SERVICE',
                },
              },
            },
          ],
        },
      },
    },
  },
}

const mockSuggestions: Suggestion[] = [
  {
    reply: {
      text: 'View Available Times',
      postbackData: 'view_times',
    },
  },
  {
    reply: {
      text: 'Service History',
      postbackData: 'service_history',
    },
  },
  {
    action: {
      text: 'Call Now',
      postbackData: 'call_now',
      dialAction: {
        phoneNumber: '+1-800-BMW-SERVICE',
      },
    },
  },
  {
    action: {
      text: 'Find Location',
      postbackData: 'find_location',
      viewLocationAction: {
        query: 'BMW Service Center near me',
      },
    },
  },
]

export const Simple_Text_Conversation: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <!-- Agent Message -->
        <rbx-text-message 
          .message=${mockAgentMessage}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-text-message>
        
        <!-- User Message -->
        <rbx-user-text-message 
          .message=${mockUserMessage}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Agent Response -->
        <rbx-text-message 
          .message=${{
            agentMessage: {
              messageId: '3',
              sendTime: new Date().toISOString(),
              text: 'I can check availability for you. What type of service do you need?',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-text-message>
      </div>
    </div>
  `,
}

export const User_Message_With_Status: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
        <!-- Sent Message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '1',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'Hello',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Delivered Message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '2',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'Is anyone there?',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Read Message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '3',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'I need help with my order',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
      </div>
    </div>
  `,
}

export const Message_With_Rich_Card: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <rbx-text-message 
          .message=${mockAgentMessageWithCard}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-text-message>
      </div>
    </div>
  `,
}

export const Message_With_Suggestions: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <rbx-text-message 
          .message=${{
            agentMessage: {
              messageId: '1',
              sendTime: new Date().toISOString(),
              text: 'How can I assist you today?',
              suggestions: mockSuggestions,
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
          .onSendMessage=${(payload: any) => console.log('Suggestion clicked:', payload)}
        ></rbx-text-message>
      </div>
    </div>
  `,
}

export const Full_Conversation_Flow: Story = {
  render: () =>
    html`
    <div style="width: 375px; max-height: 600px; overflow-y: auto; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <!-- Initial greeting -->
        <rbx-text-message 
          .message=${{
            agentMessage: {
              messageId: '1',
              sendTime: new Date(Date.now() - 300000).toISOString(),
              text: "Welcome to BMW Service! I'm here to help you with all your service needs.",
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-text-message>
        
        <!-- User inquiry -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '2',
              sendTime: new Date(Date.now() - 240000).toISOString(),
              agentId: 'user',
              text: 'Hi! My car is making a strange noise when I brake',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Agent response with card -->
        <rbx-text-message 
          .message=${{
            agentMessage: {
              messageId: '3',
              sendTime: new Date(Date.now() - 180000).toISOString(),
              text: 'I understand your concern. Brake issues should be addressed promptly. Let me show you our brake service options:',
              richCard: {
                standaloneCard: {
                  cardOrientation: 'VERTICAL',
                  cardContent: {
                    title: 'Brake Service Package',
                    description: 'Comprehensive brake inspection and service',
                    media: {
                      height: 'MEDIUM',
                      contentInfo: {
                        fileUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop',
                        mimeType: 'image/jpeg',
                      },
                    },
                    suggestions: [
                      {
                        reply: {
                          text: 'Schedule Now',
                          postbackData: 'schedule_brake_service',
                        },
                      },
                      {
                        reply: {
                          text: 'Learn More',
                          postbackData: 'brake_service_info',
                        },
                      },
                      {
                        action: {
                          text: 'Call Service',
                          postbackData: 'call_service',
                          dialAction: {
                            phoneNumber: '+1-800-BMW-SERVICE',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-text-message>
        
        <!-- User response -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '4',
              sendTime: new Date(Date.now() - 120000).toISOString(),
              agentId: 'user',
              text: 'Schedule Now',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Agent with suggestions -->
        <rbx-text-message 
          .message=${{
            agentMessage: {
              messageId: '5',
              sendTime: new Date(Date.now() - 60000).toISOString(),
              text: 'Perfect! I can help you schedule your brake service. Please select your preferred time:',
              suggestions: [
                {
                  reply: {
                    text: 'Tomorrow 9AM',
                    postbackData: 'time_tomorrow_9am',
                  },
                },
                {
                  reply: {
                    text: 'Tomorrow 2PM',
                    postbackData: 'time_tomorrow_2pm',
                  },
                },
                {
                  reply: {
                    text: 'Friday 10AM',
                    postbackData: 'time_friday_10am',
                  },
                },
                {
                  action: {
                    text: 'View Calendar',
                    postbackData: 'view_calendar',
                    createCalendarEventAction: {
                      startTime: new Date(Date.now() + 86400000).toISOString(),
                      endTime: new Date(Date.now() + 90000000).toISOString(),
                      title: 'BMW Brake Service',
                    },
                  },
                },
              ],
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
          .onSendMessage=${(payload: any) => console.log('Action:', payload)}
        ></rbx-text-message>
      </div>
    </div>
  `,
}

export const Dark_Mode_Conversation: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #1a1a1a; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <!-- Agent Message -->
        <rbx-text-message 
          .message=${{
            agentMessage: {
              messageId: '1',
              sendTime: new Date().toISOString(),
              text: 'Good evening! How can I help you today?',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${true}
        ></rbx-text-message>
        
        <!-- User Message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '2',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'I need to check my service history',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${true}
        ></rbx-user-text-message>
        
        <!-- Agent Response with suggestions -->
        <rbx-text-message 
          .message=${{
            agentMessage: {
              messageId: '3',
              sendTime: new Date().toISOString(),
              text: 'I can help you access your service history. Please choose an option:',
              suggestions: [
                {
                  reply: {
                    text: 'Last Service',
                    postbackData: 'last_service',
                  },
                },
                {
                  reply: {
                    text: 'Full History',
                    postbackData: 'full_history',
                  },
                },
                {
                  action: {
                    text: 'Download PDF',
                    postbackData: 'download_pdf',
                    openUrlAction: {
                      url: 'https://bmw.com/service-history',
                    },
                  },
                },
              ],
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${true}
          .onSendMessage=${(payload: any) => console.log('Action:', payload)}
        ></rbx-text-message>
      </div>
    </div>
  `,
}

export const Long_Messages: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <!-- Long agent message -->
        <rbx-text-message 
          .message=${{
            agentMessage: {
              messageId: '1',
              sendTime: new Date().toISOString(),
              text: 'Thank you for contacting BMW Service Center. We offer a comprehensive range of services including regular maintenance, repairs, genuine parts replacement, and specialized BMW performance upgrades. Our certified technicians are trained to handle all BMW models with the expertise and care your vehicle deserves.',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-text-message>
        
        <!-- Long user message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '2',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'I have a 2023 BMW X5 that needs its 10,000 mile service. I also noticed a slight vibration when braking at high speeds and would like that checked. Can you schedule both services for the same appointment?',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
      </div>
    </div>
  `,
}

export const Multiple_Quick_Messages: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.25rem;">
        <!-- Multiple user messages sent quickly -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '1',
              sendTime: new Date(Date.now() - 5000).toISOString(),
              agentId: 'user',
              text: 'Hi',
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
              sendTime: new Date(Date.now() - 4000).toISOString(),
              agentId: 'user',
              text: 'Are you there?',
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
              sendTime: new Date(Date.now() - 3000).toISOString(),
              agentId: 'user',
              text: 'I need help',
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
              sendTime: new Date(Date.now() - 2000).toISOString(),
              agentId: 'user',
              text: "My car won't start",
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Agent response -->
        <rbx-text-message 
          .message=${{
            agentMessage: {
              messageId: '5',
              sendTime: new Date().toISOString(),
              text: "I'm here to help! I see your car won't start. Let me connect you with our emergency roadside assistance right away.",
              suggestions: [
                {
                  action: {
                    text: 'Call Roadside Assistance',
                    postbackData: 'call_roadside',
                    dialAction: {
                      phoneNumber: '+1-800-BMW-HELP',
                    },
                  },
                },
                {
                  reply: {
                    text: 'Troubleshooting Tips',
                    postbackData: 'troubleshooting',
                  },
                },
              ],
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
          .onSendMessage=${(payload: any) => console.log('Emergency action:', payload)}
        ></rbx-text-message>
      </div>
    </div>
  `,
}
