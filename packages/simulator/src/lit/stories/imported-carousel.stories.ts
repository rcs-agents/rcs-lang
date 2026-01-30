import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'

// import { action } from '@storybook/addon-actions';
const action = (name: string) => (data: any) => console.log(name, data)
import '../../imported/register-components.js'
import type { CarouselCard } from '../../imported/index.js'

const meta: Meta = {
  title: 'Imported Components/Carousel',
  component: 'rbx-carousel',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Horizontal scrolling carousel of business cards for RCS messaging',
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

// Carousel cards example from carousel-examples.md
const carouselCards: CarouselCard[] = [
  {
    id: '1',
    title: 'Very White',
    description: 'Available with Pixel and Pixel XL',
    media: {
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=225&fit=crop',
      altText: 'Google Pixel in Very White',
    },
    actions: [
      {
        text: '🛍️ Shop Now',
        type: 'action',
        postbackData: 'shop_pixel_white',
        openUrlAction: { url: 'https://store.google.com/pixel' },
      },
      {
        text: 'Learn More',
        type: 'reply',
        postbackData: 'learn_more_pixel',
      },
    ],
  },
  {
    id: '2',
    title: 'Quite Black',
    description: 'Premium finish, flagship performance',
    media: {
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=225&fit=crop&sat=-100&bri=-20',
      altText: 'Google Pixel in Quite Black',
    },
    actions: [
      {
        text: '🛍️ Shop Now',
        type: 'action',
        postbackData: 'shop_pixel_black',
        openUrlAction: { url: 'https://store.google.com/pixel' },
      },
      {
        text: 'Compare Models',
        type: 'reply',
        postbackData: 'compare_pixels',
      },
    ],
  },
  {
    id: '3',
    title: 'Really Blue',
    description: 'Limited edition color option',
    media: {
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=225&fit=crop&hue=240&sat=50',
      altText: 'Google Pixel in Really Blue',
    },
    actions: [
      {
        text: '🛍️ Shop Now',
        type: 'action',
        postbackData: 'shop_pixel_blue',
        openUrlAction: { url: 'https://store.google.com/pixel' },
      },
      {
        text: 'Check Availability',
        type: 'reply',
        postbackData: 'check_availability',
      },
    ],
  },
  {
    id: '4',
    title: 'Rose Gold',
    description: 'Elegant premium design',
    media: {
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=225&fit=crop&hue=15&sat=30',
      altText: 'Google Pixel in Rose Gold',
    },
    actions: [
      {
        text: '🛍️ Shop Now',
        type: 'action',
        postbackData: 'shop_pixel_rose',
        openUrlAction: { url: 'https://store.google.com/pixel' },
      },
      {
        text: 'View Gallery',
        type: 'reply',
        postbackData: 'view_gallery',
      },
    ],
  },
]

// BMW Service carousel
const bmwServiceCards: CarouselCard[] = [
  {
    id: 'oil-change',
    title: 'Oil Change Service',
    description: 'Quick 30-minute oil change with genuine BMW oil',
    media: {
      imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=225&fit=crop',
      altText: 'BMW Oil Change Service',
    },
    actions: [
      {
        text: 'Book Now',
        type: 'action',
        postbackData: 'book_oil_change',
      },
      {
        text: 'Learn More',
        type: 'reply',
        postbackData: 'oil_change_info',
      },
    ],
  },
  {
    id: 'brake-service',
    title: 'Brake Inspection',
    description: 'Comprehensive brake system check and service',
    media: {
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop',
      altText: 'BMW Brake Service',
    },
    actions: [
      {
        text: 'Schedule',
        type: 'action',
        postbackData: 'schedule_brake',
      },
      {
        text: 'Get Quote',
        type: 'reply',
        postbackData: 'brake_quote',
      },
    ],
  },
  {
    id: 'tire-service',
    title: 'Tire Replacement',
    description: 'Premium BMW approved tires and installation',
    media: {
      imageUrl: 'https://images.unsplash.com/photo-1558617047-f64b4a2c86f1?w=400&h=225&fit=crop',
      altText: 'BMW Tire Service',
    },
    actions: [
      {
        text: 'Shop Tires',
        type: 'action',
        postbackData: 'shop_tires',
      },
      {
        text: 'Check Prices',
        type: 'reply',
        postbackData: 'tire_prices',
      },
    ],
  },
]

// Restaurant menu carousel
const restaurantCards: CarouselCard[] = [
  {
    id: 'pasta',
    title: 'Fresh Pasta Dishes',
    description: 'Handmade pasta with authentic Italian sauces',
    media: {
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=225&fit=crop',
      altText: 'Fresh Italian Pasta',
    },
    actions: [
      {
        text: 'Order Now',
        type: 'action',
        postbackData: 'order_pasta',
      },
      {
        text: 'View Menu',
        type: 'reply',
        postbackData: 'pasta_menu',
      },
    ],
  },
  {
    id: 'pizza',
    title: 'Wood-Fired Pizza',
    description: 'Traditional Neapolitan pizza from our wood oven',
    media: {
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=225&fit=crop',
      altText: 'Wood-Fired Pizza',
    },
    actions: [
      {
        text: 'Order Pizza',
        type: 'action',
        postbackData: 'order_pizza',
      },
      {
        text: 'Customize',
        type: 'reply',
        postbackData: 'customize_pizza',
      },
    ],
  },
  {
    id: 'desserts',
    title: 'Italian Desserts',
    description: 'Tiramisu, gelato, and traditional sweets',
    media: {
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d271?w=400&h=225&fit=crop',
      altText: 'Italian Desserts',
    },
    actions: [
      {
        text: 'Order Dessert',
        type: 'action',
        postbackData: 'order_dessert',
      },
      {
        text: 'See All',
        type: 'reply',
        postbackData: 'dessert_menu',
      },
    ],
  },
]

// Text-only cards (no media)
const textOnlyCards: CarouselCard[] = [
  {
    id: 'support-1',
    title: 'Technical Support',
    description: '24/7 support for all your technical needs',
    actions: [
      {
        text: 'Contact Support',
        type: 'action',
        postbackData: 'contact_tech_support',
      },
      {
        text: 'FAQ',
        type: 'reply',
        postbackData: 'tech_faq',
      },
    ],
  },
  {
    id: 'support-2',
    title: 'Billing Support',
    description: 'Help with billing questions and account management',
    actions: [
      {
        text: 'View Bill',
        type: 'action',
        postbackData: 'view_bill',
      },
      {
        text: 'Payment Help',
        type: 'reply',
        postbackData: 'payment_help',
      },
    ],
  },
  {
    id: 'support-3',
    title: 'General Inquiries',
    description: 'Questions about products and services',
    actions: [
      {
        text: 'Ask Question',
        type: 'action',
        postbackData: 'ask_question',
      },
      {
        text: 'Live Chat',
        type: 'reply',
        postbackData: 'live_chat',
      },
    ],
  },
]

export const Default: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-carousel 
        .cards=${carouselCards} 
        size="medium"
        .onCardAction=${action('card-action')}
      ></rbx-carousel>
    </div>
  `,
}

export const Small_Carousel: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 500px;">
      <rbx-carousel 
        .cards=${carouselCards} 
        size="small"
        .onCardAction=${action('card-action')}
      ></rbx-carousel>
    </div>
  `,
}

export const Large_Carousel: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 800px;">
      <rbx-carousel 
        .cards=${carouselCards} 
        size="large"
        .onCardAction=${action('card-action')}
      ></rbx-carousel>
    </div>
  `,
}

export const BMW_Service_Carousel: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-carousel 
        .cards=${bmwServiceCards} 
        size="medium"
        .onCardAction=${action('service-action')}
      ></rbx-carousel>
    </div>
  `,
}

export const Restaurant_Menu_Carousel: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-carousel 
        .cards=${restaurantCards} 
        size="medium"
        .onCardAction=${action('menu-action')}
      ></rbx-carousel>
    </div>
  `,
}

export const Text_Only_Cards: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-carousel 
        .cards=${textOnlyCards} 
        size="medium"
        .onCardAction=${action('text-card-action')}
      ></rbx-carousel>
    </div>
  `,
}

export const Android_Style: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-carousel 
        .cards=${carouselCards} 
        size="medium"
        isAndroid=${true}
        .onCardAction=${action('android-action')}
      ></rbx-carousel>
    </div>
  `,
}

export const Dark_Mode: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 600px;">
      <rbx-carousel 
        .cards=${carouselCards} 
        size="medium"
        isDarkMode=${true}
        .onCardAction=${action('dark-action')}
      ></rbx-carousel>
    </div>
  `,
}

export const Android_Dark: Story = {
  render: () =>
    html`
    <div style="background: #000; padding: 1rem; max-width: 600px;">
      <rbx-carousel 
        .cards=${carouselCards} 
        size="medium"
        isAndroid=${true}
        isDarkMode=${true}
        .onCardAction=${action('android-dark-action')}
      ></rbx-carousel>
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
          <rbx-carousel
            .cards=${carouselCards}
            size="medium"
            isAndroid=${false}
            .onCardAction=${action('iOS-carousel-action')}
          ></rbx-carousel>
        </div>
      </div>
      <div>
        <h3 style="margin-bottom: 1rem;">Android Style</h3>
        <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
          <rbx-carousel
            .cards=${carouselCards}
            size="medium"
            isAndroid=${true}
            .onCardAction=${action('Android-carousel-action')}
          ></rbx-carousel>
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
          <h3 style="margin-bottom: 1rem;">Small (160px cards)</h3>
          <div style="max-width: 500px;">
            <rbx-carousel
              .cards=${bmwServiceCards}
              size="small"
              .onCardAction=${action('small-carousel-action')}
            ></rbx-carousel>
          </div>
        </div>
        <div>
          <h3 style="margin-bottom: 1rem;">Medium (240px cards)</h3>
          <div style="max-width: 600px;">
            <rbx-carousel
              .cards=${bmwServiceCards}
              size="medium"
              .onCardAction=${action('medium-carousel-action')}
            ></rbx-carousel>
          </div>
        </div>
        <div>
          <h3 style="margin-bottom: 1rem;">Large (320px cards)</h3>
          <div style="max-width: 800px;">
            <rbx-carousel
              .cards=${bmwServiceCards}
              size="large"
              .onCardAction=${action('large-carousel-action')}
            ></rbx-carousel>
          </div>
        </div>
      </div>
    </div>
  `,
}

export const Single_Card: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-carousel 
        .cards=${[carouselCards[0]]} 
        size="medium"
        .onCardAction=${action('single-card-action')}
      ></rbx-carousel>
    </div>
  `,
}

export const Many_Cards: Story = {
  render: () =>
    html`
    <div style="background: #f2f2f7; padding: 1rem; max-width: 600px;">
      <rbx-carousel 
        .cards=${[...carouselCards, ...bmwServiceCards, ...restaurantCards]} 
        size="medium"
        .onCardAction=${action('many-cards-action')}
      ></rbx-carousel>
    </div>
  `,
}
