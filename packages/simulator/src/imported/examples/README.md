# Figma Component Examples

This directory contains real-world examples of RCS Business Messaging components extracted from Figma designs, including actual text content, images, and implementation code.

## Examples Overview

### [Smart Chips Examples](./smart-chips-examples.md)

- **Smart Reply Carousel**: "Smart reply" text with horizontal layout
- **Smart Action Carousel**: Location, call, website, and calendar actions with icons
- Real implementation code with proper TypeScript types

### [Carousel Examples](./carousel-examples.md)

- **Business Product Carousel**: "Very White" Google Pixel showcase
- Shopping cart emoji actions and product descriptions
- Small/medium/large sizing variations

### [Card Business Examples](./card-business-examples.md)

- **Baggage Policy Card**: "Baggage safety policy" with airplane icon
- **BMW Service Card**: Vehicle inspection services with pricing
- Complete business card structure with headers, media, and actions

### [Conversation Header Examples](./conversation-header-examples.md)

- **ABC Corporation Header**: Verified business with customer support
- **BMW Service Center**: Authorized dealer with location subtitle
- Navigation options and verification badge examples

## File Structure

```
examples/
├── README.md                           # This file
├── smart-chips-examples.md            # Smart chips with real text
├── carousel-examples.md               # Product carousels
├── card-business-examples.md          # Business service cards
├── conversation-header-examples.md    # Business conversation headers
├── smart-chips-carousel-example.png   # Smart reply carousel image
├── smart-action-carousel-example.png  # Smart action carousel image
├── carousel-business-example.png      # Product carousel image  
├── card-business-horizontal-example.png # Business card image
└── conversation-header-example.png    # Conversation header image
```

## Usage in Storybook

These examples provide ready-to-use content for Storybook stories:

```typescript
// Import example data
import {
  smartActionChips,
  smartReplyChips,
} from './examples/smart-chips-examples.md'

import { businessCard } from './examples/card-business-examples.md'
import { carouselCards } from './examples/carousel-examples.md'
import { headerConfig } from './examples/conversation-header-examples.md'

// Use in stories
export const SmartChipsStory = () =>
  html`
  <rbx-smart-chips .chips=${smartReplyChips}></rbx-smart-chips>
`
```

## Design Patterns Observed

### Text Content Patterns

- **Smart Replies**: Short, conversational responses ("Yes, please", "No, thanks")
- **Smart Actions**: Action-oriented labels ("Location", "Call", "Website")
- **Product Titles**: Branded names with descriptive subtitles
- **Service Descriptions**: Clear, benefit-focused messaging

### Visual Patterns

- **Icons**: Material Design icons for actions (location_on, phone, etc.)
- **Emojis**: Shopping cart (🛍️), airplane mode icons for context
- **Branding**: Logos with verification badges for trust
- **Typography**: Hierarchical information with eyebrows, titles, descriptions

### Interaction Patterns

- **Reply Chips**: Gray styling for passive responses
- **Action Chips**: Blue styling for primary actions with icons
- **Card Actions**: Multiple CTA buttons (primary action, secondary options)
- **Navigation**: Back buttons and menu options in headers

## Integration Notes

All examples follow the RCS Business Messaging specification and include:

- Platform-specific styling (iOS/Android)
- Dark mode color schemes
- Accessibility features (ARIA labels)
- Responsive design principles
- Proper TypeScript typing

These examples serve as the foundation for creating realistic Storybook stories that demonstrate the components in real-world scenarios.
