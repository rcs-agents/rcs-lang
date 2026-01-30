// Exported Figma RCS Business Messaging Components
// Auto-generated from Figma design system

// Card Business Component
export { type BusinessCard, CardBusiness } from './card-business/card-business.js'

// Carousel Component
export { Carousel, type CarouselCard } from './carousel/carousel.js'
// Conversation Core Components
export { ConversationHeader, type ConversationHeaderConfig } from './conversation-core/conversation-header.js'
// Smart Chips Component
export { type SmartActionChip, type SmartChip, SmartChips, type SmartReplyChip } from './smart-chips/smart-chips.js'

// Component metadata for Storybook and documentation
export const FIGMA_COMPONENTS = {
  'smart-chips': {
    name: 'Smart Chips',
    figmaId: '14:12469',
    description: 'Smart reply and action chips for RCS Business Messaging conversations',
    path: './smart-chips/',
  },
  carousel: {
    name: 'Carousel',
    figmaId: '245:20186',
    description: 'Horizontal scrolling carousel of business cards for RCS messaging',
    path: './carousel/',
  },
  'card-business': {
    name: 'Card Business',
    figmaId: '245:20195',
    description: 'Business service cards with branding, media, pricing, and action buttons',
    path: './card-business/',
  },
  'conversation-core': {
    name: 'Conversation Core',
    figmaId: '245:8523',
    description: 'Core conversation UI components including headers and branding elements',
    path: './conversation-core/',
  },
} as const

export type FigmaComponentKey = keyof typeof FIGMA_COMPONENTS
