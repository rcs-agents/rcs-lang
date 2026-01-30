import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'

// import { action } from '@storybook/addon-actions';
const action = (name: string) => (data: any) => console.log(name, data)
import '../../imported/register-components.js'
import type { ConversationHeaderConfig } from '../../imported/index.js'

const meta: Meta = {
  title: 'Imported Components/Conversation Core',
  component: 'rbx-conversation-header',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Business conversation header with branding, verification badge, and navigation for RCS Business Messaging',
      },
    },
  },
  argTypes: {
    isAndroid: { control: 'boolean' },
    isDarkMode: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj

// Default conversation header config
const headerConfig: ConversationHeaderConfig = {
  logo: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=40&h=40&fit=crop&crop=center',
  brandName: 'ABC Corporation',
  isVerified: true,
  subtitle: 'Customer Support',
  eyebrow: 'VERIFIED BUSINESS',
  showBackButton: true,
  showMenuButton: true,
}

// BMW Service header example
const bmwServiceHeader: ConversationHeaderConfig = {
  logo: 'https://www.bmw.com/etc/clientlibs/settings/wcm/designs/bmwcom/base/resources/ci2020/img/logo-light.svg',
  brandName: 'BMW Service Center',
  isVerified: true,
  subtitle: 'Downtown Location',
  eyebrow: 'AUTHORIZED DEALER',
  showBackButton: true,
  showMenuButton: true,
}

// Restaurant header example
const restaurantHeader: ConversationHeaderConfig = {
  logo: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=40&h=40&fit=crop&crop=center',
  brandName: 'Bella Vista Restaurant',
  isVerified: false,
  subtitle: 'Reservations & Orders',
  eyebrow: 'ITALIAN CUISINE',
  showBackButton: true,
  showMenuButton: false,
}

// E-commerce header example
const ecommerceHeader: ConversationHeaderConfig = {
  logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=40&h=40&fit=crop&crop=center',
  brandName: 'TechMart Electronics',
  isVerified: true,
  subtitle: 'Sales & Support',
  eyebrow: 'ELECTRONICS STORE',
  showBackButton: false,
  showMenuButton: true,
}

// Bank header example
const bankHeader: ConversationHeaderConfig = {
  logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=40&h=40&fit=crop&crop=center',
  brandName: 'First National Bank',
  isVerified: true,
  subtitle: 'Personal Banking',
  eyebrow: 'SECURE BANKING',
  showBackButton: true,
  showMenuButton: true,
}

// Airline header example
const airlineHeader: ConversationHeaderConfig = {
  logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=40&h=40&fit=crop&crop=center',
  brandName: 'SkyLine Airways',
  isVerified: true,
  subtitle: 'Flight Support',
  eyebrow: 'TRAVEL ASSISTANCE',
  showBackButton: true,
  showMenuButton: true,
}

// Minimal header (no subtitle/eyebrow)
const minimalHeader: ConversationHeaderConfig = {
  logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=40&h=40&fit=crop&crop=center',
  brandName: 'Simple Business',
  isVerified: false,
  showBackButton: true,
  showMenuButton: false,
}

// Long name header (test text truncation)
const longNameHeader: ConversationHeaderConfig = {
  logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=40&h=40&fit=crop&crop=center',
  brandName: 'Very Long Business Name That Should Truncate Gracefully',
  isVerified: true,
  subtitle: 'This is also a very long subtitle that should truncate properly',
  eyebrow: 'EXTREMELY LONG EYEBROW TEXT THAT MIGHT NEED TRUNCATION',
  showBackButton: true,
  showMenuButton: true,
}

export const Default: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; max-width: 400px;">
      <rbx-conversation-header 
        .config=${headerConfig}
        .onBackClick=${action('back-clicked')}
        .onMenuClick=${action('menu-clicked')}
      ></rbx-conversation-header>
    </div>
  `,
}

export const BMW_Service_Header: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; max-width: 400px;">
      <rbx-conversation-header 
        .config=${bmwServiceHeader}
        .onBackClick=${action('back-clicked')}
        .onMenuClick=${action('menu-clicked')}
      ></rbx-conversation-header>
    </div>
  `,
}

export const Restaurant_Header: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; max-width: 400px;">
      <rbx-conversation-header 
        .config=${restaurantHeader}
        .onBackClick=${action('back-clicked')}
      ></rbx-conversation-header>
    </div>
  `,
}

export const Ecommerce_Header: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; max-width: 400px;">
      <rbx-conversation-header 
        .config=${ecommerceHeader}
        .onMenuClick=${action('menu-clicked')}
      ></rbx-conversation-header>
    </div>
  `,
}

export const Bank_Header: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; max-width: 400px;">
      <rbx-conversation-header 
        .config=${bankHeader}
        .onBackClick=${action('back-clicked')}
        .onMenuClick=${action('menu-clicked')}
      ></rbx-conversation-header>
    </div>
  `,
}

export const Airline_Header: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; max-width: 400px;">
      <rbx-conversation-header 
        .config=${airlineHeader}
        .onBackClick=${action('back-clicked')}
        .onMenuClick=${action('menu-clicked')}
      ></rbx-conversation-header>
    </div>
  `,
}

export const Minimal_Header: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; max-width: 400px;">
      <rbx-conversation-header 
        .config=${minimalHeader}
        .onBackClick=${action('back-clicked')}
      ></rbx-conversation-header>
    </div>
  `,
}

export const Long_Text_Truncation: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; max-width: 320px;">
      <rbx-conversation-header 
        .config=${longNameHeader}
        .onBackClick=${action('back-clicked')}
        .onMenuClick=${action('menu-clicked')}
      ></rbx-conversation-header>
    </div>
  `,
}

export const Without_Verification_Badge: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; max-width: 400px;">
      <rbx-conversation-header 
        .config=${restaurantHeader}
        .onBackClick=${action('back-clicked')}
      ></rbx-conversation-header>
    </div>
  `,
}

export const Android_Style: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; max-width: 400px;">
      <rbx-conversation-header 
        .config=${headerConfig}
        isAndroid=${true}
        .onBackClick=${action('android-back-clicked')}
        .onMenuClick=${action('android-menu-clicked')}
      ></rbx-conversation-header>
    </div>
  `,
}

export const Dark_Mode: Story = {
  render: () =>
    html`
    <div style="background: #000; max-width: 400px;">
      <rbx-conversation-header 
        .config=${headerConfig}
        isDarkMode=${true}
        .onBackClick=${action('dark-back-clicked')}
        .onMenuClick=${action('dark-menu-clicked')}
      ></rbx-conversation-header>
    </div>
  `,
}

export const Android_Dark: Story = {
  render: () =>
    html`
    <div style="background: #000; max-width: 400px;">
      <rbx-conversation-header 
        .config=${headerConfig}
        isAndroid=${true}
        isDarkMode=${true}
        .onBackClick=${action('android-dark-back-clicked')}
        .onMenuClick=${action('android-dark-menu-clicked')}
      ></rbx-conversation-header>
    </div>
  `,
}

export const Side_by_Side_Comparison: Story = {
  render: () =>
    html`
    <div style="display: grid; grid-template-columns: 1fr; gap: 2rem; padding: 1rem;">
      <div>
        <h3 style="margin-bottom: 1rem;">iOS Style</h3>
        <div style="background: #f2f2f7; max-width: 400px;">
          <rbx-conversation-header
            .config=${headerConfig}
            isAndroid=${false}
            .onBackClick=${action('iOS-back-clicked')}
            .onMenuClick=${action('iOS-menu-clicked')}
          ></rbx-conversation-header>
        </div>
      </div>
      <div>
        <h3 style="margin-bottom: 1rem;">Android Style</h3>
        <div style="background: #f2f2f7; max-width: 400px;">
          <rbx-conversation-header
            .config=${headerConfig}
            isAndroid=${true}
            .onBackClick=${action('Android-back-clicked')}
            .onMenuClick=${action('Android-menu-clicked')}
          ></rbx-conversation-header>
        </div>
      </div>
    </div>
  `,
}

export const Navigation_Variations: Story = {
  render: () =>
    html`
    <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem; background: #f2f2f7;">
      <div>
        <h4 style="margin-bottom: 0.5rem;">Back + Menu</h4>
        <div style="max-width: 400px;">
          <rbx-conversation-header
            .config=${headerConfig}
            .onBackClick=${action('both-back-clicked')}
            .onMenuClick=${action('both-menu-clicked')}
          ></rbx-conversation-header>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: 0.5rem;">Back Only</h4>
        <div style="max-width: 400px;">
          <rbx-conversation-header
            .config=${restaurantHeader}
            .onBackClick=${action('back-only-clicked')}
          ></rbx-conversation-header>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: 0.5rem;">Menu Only</h4>
        <div style="max-width: 400px;">
          <rbx-conversation-header
            .config=${ecommerceHeader}
            .onMenuClick=${action('menu-only-clicked')}
          ></rbx-conversation-header>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: 0.5rem;">No Navigation</h4>
        <div style="max-width: 400px;">
          <rbx-conversation-header
            .config=${minimalHeader}
          ></rbx-conversation-header>
        </div>
      </div>
    </div>
  `,
}

export const Business_Types_Showcase: Story = {
  render: () =>
    html`
    <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem; background: #f2f2f7;">
      <div>
        <h4 style="margin-bottom: 0.5rem;">Service Center</h4>
        <div style="max-width: 400px;">
          <rbx-conversation-header
            .config=${bmwServiceHeader}
            .onBackClick=${action('service-back')}
            .onMenuClick=${action('service-menu')}
          ></rbx-conversation-header>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: 0.5rem;">Restaurant</h4>
        <div style="max-width: 400px;">
          <rbx-conversation-header
            .config=${restaurantHeader}
            .onBackClick=${action('restaurant-back')}
          ></rbx-conversation-header>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: 0.5rem;">Bank</h4>
        <div style="max-width: 400px;">
          <rbx-conversation-header
            .config=${bankHeader}
            .onBackClick=${action('bank-back')}
            .onMenuClick=${action('bank-menu')}
          ></rbx-conversation-header>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: 0.5rem;">Airline</h4>
        <div style="max-width: 400px;">
          <rbx-conversation-header
            .config=${airlineHeader}
            .onBackClick=${action('airline-back')}
            .onMenuClick=${action('airline-menu')}
          ></rbx-conversation-header>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: 0.5rem;">E-commerce</h4>
        <div style="max-width: 400px;">
          <rbx-conversation-header
            .config=${ecommerceHeader}
            .onMenuClick=${action('ecommerce-menu')}
          ></rbx-conversation-header>
        </div>
      </div>
    </div>
  `,
}

export const Responsive_Widths: Story = {
  render: () =>
    html`
    <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem; background: #f2f2f7;">
      <div>
        <h4 style="margin-bottom: 0.5rem;">Mobile (320px)</h4>
        <div style="max-width: 320px;">
          <rbx-conversation-header
            .config=${longNameHeader}
            .onBackClick=${action('mobile-back')}
            .onMenuClick=${action('mobile-menu')}
          ></rbx-conversation-header>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: 0.5rem;">Standard (400px)</h4>
        <div style="max-width: 400px;">
          <rbx-conversation-header
            .config=${longNameHeader}
            .onBackClick=${action('standard-back')}
            .onMenuClick=${action('standard-menu')}
          ></rbx-conversation-header>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: 0.5rem;">Wide (600px)</h4>
        <div style="max-width: 600px;">
          <rbx-conversation-header
            .config=${longNameHeader}
            .onBackClick=${action('wide-back')}
            .onMenuClick=${action('wide-menu')}
          ></rbx-conversation-header>
        </div>
      </div>
    </div>
  `,
}
