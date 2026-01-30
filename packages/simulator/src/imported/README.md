# Imported Figma Components

This directory contains RCS Business Messaging components extracted from the Figma design system and converted to Lit Element web components.

## Components

### Smart Chips

- **Figma ID**: 14:12469
- **Description**: Smart reply and action chips for RCS Business Messaging conversations
- **Features**: Reply chips (neutral), Action chips (blue with icons), horizontal/vertical layouts
- **Files**: `smart-chips/smart-chips.ts`, component screenshot, component-info.json

### Carousel

- **Figma ID**: 245:20186
- **Description**: Horizontal scrolling carousel of business cards for RCS messaging
- **Features**: Small/medium/large card sizes, action buttons, platform styling
- **Files**: `carousel/carousel.ts`, component screenshot, component-info.json

### Card Business

- **Figma ID**: 245:20195
- **Description**: Business service cards with branding, media, pricing, and action buttons
- **Features**: Header branding, media section, pricing, feature lists, action buttons
- **Files**: `card-business/card-business.ts`, component screenshot, component-info.json

### Conversation Core

- **Figma ID**: 245:8523
- **Description**: Core conversation UI components including headers and branding elements
- **Features**: Brand logo, verification badges, navigation buttons, responsive design
- **Files**: `conversation-core/conversation-header.ts`, component screenshot, component-info.json

## Usage

```typescript
// Import individual components
import {
  CardBusiness,
  Carousel,
  ConversationHeader,
  SmartChips,
} from './imported/index.js'

// Import types
import type {
  BusinessCard,
  CarouselCard,
  ConversationHeaderConfig,
  SmartChip,
} from './imported/index.js'
```

## Component Structure

Each component folder contains:

- **TypeScript component file** (`*.ts`) - Lit Element implementation
- **Component screenshot** (`component-screenshot.png`) - Visual reference from Figma
- **Component info** (`component-info.json`) - Metadata, usage examples, design notes

## Design System Consistency

All components follow the RCS Business Messaging design patterns:

- Platform-specific styling (iOS vs Android)
- Dark mode support
- Consistent typography (SF Pro Display/Roboto)
- Material You color palette
- Responsive design principles
- Accessibility features (ARIA labels, keyboard navigation)

## Integration

These components are designed to integrate with the main simulator components and can be used in Storybook stories for documentation and testing.
