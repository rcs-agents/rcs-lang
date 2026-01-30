import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import '../components/messages/user-text-message.js'
import type { ThreadEntry } from '../types/index.js'

const meta: Meta = {
  title: 'Android Messages/User Message',
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

const helloMessage: ThreadEntry = {
  userMessage: {
    senderPhoneNumber: '+1234567890',
    messageId: '1',
    sendTime: new Date().toISOString(),
    agentId: 'user',
    text: 'Hello',
  },
}

// Exact replica of the image shown
export const Hello_Message: Story = {
  args: {
    isAndroid: true,
    isDarkMode: false,
  },
  render: (args) =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px; display: flex; justify-content: flex-end;">
      <rbx-user-text-message 
        .message=${helloMessage}
        .isAndroid=${args.isAndroid}
        .isDarkMode=${args.isDarkMode}
      ></rbx-user-text-message>
    </div>
  `,
}

export const Simple_Messages: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
        
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '1',
              sendTime: new Date(Date.now() - 120000).toISOString(),
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
              sendTime: new Date(Date.now() - 60000).toISOString(),
              agentId: 'user',
              text: 'Hello',
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
              text: 'How are you today?',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
      </div>
    </div>
  `,
}

export const Different_Message_Lengths: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
        
        <!-- Short message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '1',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'Ok',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Medium message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '2',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'Thanks for the help!',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Long message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '3',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'I really appreciate all the assistance you have provided today. The service has been excellent and I will definitely recommend this to my friends.',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
      </div>
    </div>
  `,
}

export const Dark_Mode: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #1a1a1a; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
        
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
          .isDarkMode=${true}
        ></rbx-user-text-message>
        
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '2',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'How can I get support?',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${true}
        ></rbx-user-text-message>
        
      </div>
    </div>
  `,
}

export const Two_Line_Messages: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
        
        <!-- Single line message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '1',
              sendTime: new Date(Date.now() - 120000).toISOString(),
              agentId: 'user',
              text: 'olá',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Two line message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '2',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'tudobem?',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Another two line example -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '3',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'como você está hoje?',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Multi-line message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '4',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'preciso de ajuda com meu pedido que foi feito ontem',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
      </div>
    </div>
  `,
}

export const Three_Line_Messages: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.25rem; align-items: flex-end;">
        
        <!-- Like the new image - with proper grouping -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '1',
              sendTime: new Date(Date.now() - 180000).toISOString(),
              agentId: 'user',
              text: 'tudo',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
          .groupPosition=${'first'}
        ></rbx-user-text-message>
        
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '2',
              sendTime: new Date(Date.now() - 120000).toISOString(),
              agentId: 'user',
              text: 'bem',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
          .groupPosition=${'middle'}
        ></rbx-user-text-message>
        
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '3',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'e vc?',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
          .groupPosition=${'last'}
        ></rbx-user-text-message>
        
      </div>
    </div>
  `,
}

export const Multi_Line_Long_Messages: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
        
        <!-- 3+ line message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '1',
              sendTime: new Date(Date.now() - 240000).toISOString(),
              agentId: 'user',
              text: 'Preciso de ajuda urgente com meu pedido que foi cancelado sem motivo aparente',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- 4+ line message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '2',
              sendTime: new Date(Date.now() - 180000).toISOString(),
              agentId: 'user',
              text: 'Gostaria de saber se é possível reagendar minha consulta para a próxima semana, preferencialmente na terça ou quarta-feira pela manhã',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- 5+ line message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '3',
              sendTime: new Date(Date.now() - 120000).toISOString(),
              agentId: 'user',
              text: 'Estou enfrentando problemas técnicos no aplicativo desde a última atualização. Não consigo acessar minha conta e quando tento fazer login aparece uma mensagem de erro. Já tentei reinstalar mas o problema persiste. Podem me ajudar?',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
        <!-- Very long message (6+ lines) -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '4',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'Olá, boa tarde! Estou entrando em contato porque preciso de uma informação importante sobre minha conta. Fiz uma compra na semana passada e até agora não recebi confirmação do pagamento nem do envio. O dinheiro já foi debitado do meu cartão mas o status do pedido ainda aparece como "processando". Isso é normal? Quanto tempo costuma demorar? Preciso dos produtos urgentemente para um evento no final de semana.',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
      </div>
    </div>
  `,
}

export const Example_From_Image: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.25rem; align-items: flex-end;">
        
        <!-- Exactly like the image -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '1',
              sendTime: new Date(Date.now() - 60000).toISOString(),
              agentId: 'user',
              text: 'olá',
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
              text: 'tudobem?',
            },
          }}
          .isAndroid=${true}
          .isDarkMode=${false}
        ></rbx-user-text-message>
        
      </div>
    </div>
  `,
}

export const iOS_Style_Messages: Story = {
  render: () =>
    html`
    <div style="width: 375px; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
        
        <!-- iOS Single message -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '1',
              sendTime: new Date(Date.now() - 120000).toISOString(),
              agentId: 'user',
              text: 'Hello',
            },
          }}
          .isAndroid=${false}
          .isDarkMode=${false}
          .groupPosition=${'single'}
        ></rbx-user-text-message>
        
        <!-- iOS message group -->
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '2',
              sendTime: new Date(Date.now() - 60000).toISOString(),
              agentId: 'user',
              text: 'How are you?',
            },
          }}
          .isAndroid=${false}
          .isDarkMode=${false}
          .groupPosition=${'first'}
        ></rbx-user-text-message>
        
        <rbx-user-text-message 
          .message=${{
            userMessage: {
              senderPhoneNumber: '+1234567890',
              messageId: '3',
              sendTime: new Date().toISOString(),
              agentId: 'user',
              text: 'Everything good?',
            },
          }}
          .isAndroid=${false}
          .isDarkMode=${false}
          .groupPosition=${'last'}
        ></rbx-user-text-message>
        
      </div>
    </div>
  `,
}

export const iOS_vs_Android_Comparison: Story = {
  render: () =>
    html`
    <div style="display: flex; gap: 2rem;">
      <!-- Android Style -->
      <div style="width: 300px;">
        <h3 style="text-align: center; margin-bottom: 1rem; font-family: sans-serif;">Android Style</h3>
        <div style="padding: 1rem; background: #f0f0f0; border-radius: 8px;">
          <div style="display: flex; flex-direction: column; gap: 0.25rem; align-items: flex-end;">
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
              .groupPosition=${'single'}
            ></rbx-user-text-message>
            
            <rbx-user-text-message 
              .message=${{
                userMessage: {
                  senderPhoneNumber: '+1234567890',
                  messageId: '2',
                  sendTime: new Date().toISOString(),
                  agentId: 'user',
                  text: 'How are you doing?',
                },
              }}
              .isAndroid=${true}
              .isDarkMode=${false}
              .groupPosition=${'single'}
            ></rbx-user-text-message>
          </div>
        </div>
      </div>
      
      <!-- iOS Style -->
      <div style="width: 300px;">
        <h3 style="text-align: center; margin-bottom: 1rem; font-family: sans-serif;">iOS Style</h3>
        <div style="padding: 1rem; background: #f0f0f0; border-radius: 8px;">
          <div style="display: flex; flex-direction: column; gap: 0.25rem; align-items: flex-end;">
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
              .isAndroid=${false}
              .isDarkMode=${false}
              .groupPosition=${'single'}
            ></rbx-user-text-message>
            
            <rbx-user-text-message 
              .message=${{
                userMessage: {
                  senderPhoneNumber: '+1234567890',
                  messageId: '2',
                  sendTime: new Date().toISOString(),
                  agentId: 'user',
                  text: 'How are you doing?',
                },
              }}
              .isAndroid=${false}
              .isDarkMode=${false}
              .groupPosition=${'single'}
            ></rbx-user-text-message>
          </div>
        </div>
      </div>
    </div>
  `,
}
