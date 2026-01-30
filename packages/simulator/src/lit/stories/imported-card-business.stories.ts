import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'

// import { action } from '@storybook/addon-actions';
const action = (name: string) => (data: any) => console.log(name, data)
import '../../imported/register-components.js'
import type { BusinessCard } from '../../imported/index.js'

const meta: Meta = {
  title: 'Imported Components/Card Business',
  component: 'rbx-card-business',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Business service cards with branding, media, pricing, and action buttons for RCS Business Messaging',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    isAndroid: { control: 'boolean' },
    isDarkMode: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj

// Business card example from card-business-examples.md
const businessCard: BusinessCard = {
  id: 'baggage-policy-1',
  header: {
    logo: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=40&h=40&fit=crop&crop=center',
    brandName: 'SkyLine Airways',
    subtitle: 'Travel Information',
    eyebrow: 'IMPORTANT NOTICE',
  },
  media: {
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=225&fit=crop',
    altText: 'Baggage safety restrictions illustration',
  },
  content: {
    title: 'Baggage safety policy',
    description: 'Not permitted anywhere - Please review our updated safety guidelines for restricted items',
    features: [
      'No liquids over 100ml',
      'Electronics must be removable',
      'Sharp objects prohibited',
      '24/7 support available',
    ],
    pricing: {
      amount: 'Free',
      currency: '',
      period: 'consultation',
    },
  },
  actions: [
    {
      text: 'View Full Policy',
      type: 'action',
      postbackData: 'view_policy',
      openUrlAction: { url: 'https://skyline.com/baggage-policy' },
    },
    {
      text: 'Contact Support',
      type: 'reply',
      postbackData: 'contact_support',
    },
    {
      text: 'I Understand',
      type: 'reply',
      postbackData: 'acknowledge_policy',
    },
  ],
}

// BMW service card example
const businessServiceCard: BusinessCard = {
  id: 'service-card-1',
  header: {
    logo: 'https://www.bmw.com/etc/clientlibs/settings/wcm/designs/bmwcom/base/resources/ci2020/img/logo-light.svg',
    brandName: 'BMW Service Center',
    subtitle: 'Authorized Dealer',
    eyebrow: 'PREMIUM SERVICE',
    // isVerified: true // Not part of header interface
  },
  media: {
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=225&fit=crop',
    altText: 'BMW maintenance service',
  },
  content: {
    title: 'Complete Vehicle Inspection',
    description: 'Comprehensive 50-point inspection covering engine, brakes, transmission, and electrical systems',
    features: [
      'Engine diagnostics',
      'Brake system check',
      'Fluid level inspection',
      'Battery & electrical test',
      'Tire condition assessment',
    ],
    pricing: {
      amount: '129.99',
      currency: '$',
      period: 'per inspection',
    },
  },
  actions: [
    {
      text: 'Schedule Appointment',
      type: 'action',
      postbackData: 'schedule_inspection',
    },
    {
      text: 'Get Quote',
      type: 'view',
      postbackData: 'get_quote',
    },
    {
      text: 'Learn More',
      type: 'reply',
      postbackData: 'learn_more',
    },
  ],
}

// Restaurant card example
const restaurantCard: BusinessCard = {
  id: 'restaurant-card-1',
  header: {
    logo: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=40&h=40&fit=crop&crop=center',
    brandName: 'Bella Vista Restaurant',
    subtitle: 'Reservations & Orders',
    eyebrow: 'ITALIAN CUISINE',
  },
  media: {
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=225&fit=crop',
    altText: 'Italian restaurant interior',
  },
  content: {
    title: 'Special Dinner Menu',
    description:
      'Authentic Italian cuisine with fresh ingredients imported from Italy. Romantic atmosphere perfect for special occasions.',
    features: [
      'Fresh pasta made daily',
      'Wine from Italian vineyards',
      'Romantic candlelit ambiance',
      'Private dining available',
    ],
    pricing: {
      amount: '45',
      currency: '$',
      period: 'per person',
    },
  },
  actions: [
    {
      text: 'Make Reservation',
      type: 'action',
      postbackData: 'make_reservation',
    },
    {
      text: 'View Menu',
      type: 'view',
      postbackData: 'view_menu',
    },
    {
      text: 'Call Restaurant',
      type: 'action',
      postbackData: 'call_restaurant',
    },
  ],
}

// Card without media
const textOnlyCard: BusinessCard = {
  id: 'text-only-card',
  header: {
    logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=40&h=40&fit=crop&crop=center',
    brandName: 'TechSupport Pro',
    subtitle: 'Technical Support',
    eyebrow: 'URGENT NOTIFICATION',
  },
  content: {
    title: 'System Update Required',
    description:
      'Your system requires an urgent security update. Please install the latest updates to ensure optimal performance and security.',
    features: [
      'Enhanced security protocols',
      'Performance improvements',
      'Bug fixes included',
      'Free technical support',
    ],
  },
  actions: [
    {
      text: 'Update Now',
      type: 'action',
      postbackData: 'update_now',
    },
    {
      text: 'Schedule Later',
      type: 'reply',
      postbackData: 'schedule_later',
    },
  ],
}

export const Default: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-card-business 
        .card=${businessCard} 
        size="medium"
        .onAction=${action('card-action')}
      ></rbx-card-business>
    </div>
  `,
}

export const Small_Size: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 300px;">
      <rbx-card-business 
        .card=${businessCard} 
        size="small"
        .onAction=${action('card-action')}
      ></rbx-card-business>
    </div>
  `,
}

export const Large_Size: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 500px;">
      <rbx-card-business 
        .card=${businessCard} 
        size="large"
        .onAction=${action('card-action')}
      ></rbx-card-business>
    </div>
  `,
}

export const BMW_Service_Card: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-card-business 
        .card=${businessServiceCard} 
        size="medium"
        .onAction=${action('card-action')}
      ></rbx-card-business>
    </div>
  `,
}

export const Restaurant_Card: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-card-business 
        .card=${restaurantCard} 
        size="medium"
        .onAction=${action('card-action')}
      ></rbx-card-business>
    </div>
  `,
}

export const Text_Only: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-card-business 
        .card=${textOnlyCard} 
        size="medium"
        .onAction=${action('card-action')}
      ></rbx-card-business>
    </div>
  `,
}

export const Android_Style: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 400px;">
      <rbx-card-business 
        .card=${businessCard} 
        size="medium"
        isAndroid=${true}
        .onAction=${action('card-action')}
      ></rbx-card-business>
    </div>
  `,
}

export const Dark_Mode: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 400px;">
      <rbx-card-business 
        .card=${businessCard} 
        size="medium"
        isDarkMode=${true}
        .onAction=${action('card-action')}
      ></rbx-card-business>
    </div>
  `,
}

export const Android_Dark: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 400px;">
      <rbx-card-business 
        .card=${businessCard} 
        size="medium"
        isAndroid=${true}
        isDarkMode=${true}
        .onAction=${action('card-action')}
      ></rbx-card-business>
    </div>
  `,
}

export const Side_by_Side_Comparison: Story = {
  render: () =>
    html`
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 1rem;">
      <div>
        <h3 style="margin-bottom: 1rem;">iOS Style</h3>
        <div style="background: #f2f2f7; padding: 1rem; max-width: 350px;">
          <rbx-card-business
            .card=${businessCard}
            size="medium"
            isAndroid=${false}
            .onAction=${action('iOS-card-action')}
          ></rbx-card-business>
        </div>
      </div>
      <div>
        <h3 style="margin-bottom: 1rem;">Android Style</h3>
        <div style="background: #f2f2f7; padding: 1rem; max-width: 350px;">
          <rbx-card-business
            .card=${businessCard}
            size="medium"
            isAndroid=${true}
            .onAction=${action('Android-card-action')}
          ></rbx-card-business>
        </div>
      </div>
    </div>
  `,
}

export const All_Sizes_Comparison: Story = {
  render: () =>
    html`
    <div style="padding: 1rem; background: #f2f2f7;">
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <div>
          <h3 style="margin-bottom: 1rem;">Small</h3>
          <div style="max-width: 300px;">
            <rbx-card-business
              .card=${businessServiceCard}
              size="small"
              .onAction=${action('small-card-action')}
            ></rbx-card-business>
          </div>
        </div>
        <div>
          <h3 style="margin-bottom: 1rem;">Medium</h3>
          <div style="max-width: 400px;">
            <rbx-card-business
              .card=${businessServiceCard}
              size="medium"
              .onAction=${action('medium-card-action')}
            ></rbx-card-business>
          </div>
        </div>
        <div>
          <h3 style="margin-bottom: 1rem;">Large</h3>
          <div style="max-width: 500px;">
            <rbx-card-business
              .card=${businessServiceCard}
              size="large"
              .onAction=${action('large-card-action')}
            ></rbx-card-business>
          </div>
        </div>
      </div>
    </div>
  `,
}
