import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import '../../imported/register-components.js'

const meta: Meta = {
  title: 'Test/Component Registration',
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj

export const ComponentCheck: Story = {
  render: () => {
    const components = ['rbx-card-business', 'rbx-carousel', 'rbx-conversation-header', 'rbx-smart-chips']

    const results = components.map((name) => {
      const isDefined = customElements.get(name) !== undefined
      return { name, isDefined }
    })

    return html`
      <div style="font-family: monospace; padding: 2rem;">
        <h2>Component Registration Status</h2>
        <ul>
          ${results.map(
            ({ name, isDefined }) =>
              html`
            <li style="margin: 0.5rem 0;">
              ${isDefined ? html`<span style="color: green;">✅</span>` : html`<span style="color: red;">❌</span>`}
              ${name}: ${isDefined ? 'Registered' : 'Not registered'}
            </li>
          `
          )}
        </ul>
        
        <h3>Test Render</h3>
        <div style="margin-top: 1rem; padding: 1rem; border: 1px solid #ccc;">
          <rbx-card-business 
            .card=${{
              id: 'test',
              content: {
                title: 'Test Card',
                description: 'If you see this, the component is working!',
              },
            }}
          ></rbx-card-business>
        </div>
      </div>
    `
  },
}

export const SimpleCardTest: Story = {
  render: () =>
    html`
    <rbx-card-business 
      .card=${{
        id: '1',
        header: {
          brandName: 'Test Brand',
          subtitle: 'Test Subtitle',
        },
        content: {
          title: 'Test Business Card',
          description: 'This is a test to see if the component renders',
        },
        actions: [
          {
            text: 'Test Action',
            type: 'action',
            postbackData: 'test',
          },
        ],
      }}
    ></rbx-card-business>
  `,
}
