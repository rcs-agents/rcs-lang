# @rcs-lang/types

TypeScript type definitions for RCS Business Messaging (RBM) based on Google's official API reference.

## Installation

```bash
npm install @rcs-lang/types
# or
yarn add @rcs-lang/types
# or
bun add @rcs-lang/types
```

## Overview

This package provides comprehensive TypeScript types for working with RCS Business Messaging APIs. All types are based on the official Google RBM API reference documentation.

### Key Features

- 🎯 **Complete Type Coverage** - All RBM API types including agents, messages, brands, testers, events, files, and integrations
- 📘 **Fully Documented** - Extensive TSDoc comments with links to official documentation
- 🔒 **Type Safety** - Branded types for enhanced type safety (PhoneNumber, EmailAddress, etc.)
- 🚀 **Zero Runtime** - Pure TypeScript types with no runtime overhead
- ✅ **Official Spec** - Based directly on Google's RBM API reference

## Usage

### Basic Import

```typescript
import type {
  AgentMessage,
  RcsBusinessMessagingAgent,
  Brand,
  Tester,
  AgentEvent,
} from '@rcs-lang/types';
```

### Agent Messages

```typescript
import type { AgentMessage, AgentContentMessage, Suggestion } from '@rcs-lang/types';

// Create a text message with suggestions
const message: AgentMessage = {
  contentMessage: {
    text: 'Hello! How can I help you today?',
    suggestions: [
      {
        reply: {
          text: 'Check order status',
          postbackData: 'CHECK_ORDER_STATUS',
        },
      },
      {
        action: {
          text: 'Call support',
          postbackData: 'CALL_SUPPORT',
          dialAction: {
            phoneNumber: '+1234567890',
          },
        },
      },
    ],
  },
  messageTrafficType: 'TRANSACTION',
};
```

### Rich Cards

```typescript
import type { RichCard, StandaloneCard, CarouselCard } from '@rcs-lang/types';

// Standalone card
const standaloneCard: RichCard = {
  standaloneCard: {
    cardOrientation: 'VERTICAL',
    cardContent: {
      title: 'Product Name',
      description: 'Product description here',
      media: {
        height: 'MEDIUM',
        contentInfo: {
          fileUrl: 'https://example.com/image.jpg',
        },
      },
      suggestions: [
        {
          reply: {
            text: 'Buy now',
            postbackData: 'BUY_PRODUCT_123',
          },
        },
      ],
    },
  },
};

// Carousel with multiple cards
const carousel: RichCard = {
  carouselCard: {
    cardWidth: 'MEDIUM',
    cardContents: [
      {
        title: 'Product 1',
        description: 'Description 1',
        media: {
          height: 'MEDIUM',
          contentInfo: {
            fileUrl: 'https://example.com/product1.jpg',
          },
        },
      },
      {
        title: 'Product 2',
        description: 'Description 2',
        media: {
          height: 'MEDIUM',
          contentInfo: {
            fileUrl: 'https://example.com/product2.jpg',
          },
        },
      },
    ],
  },
};
```

### Agent Configuration

```typescript
import type { RcsBusinessMessagingAgent, HostingRegion, AgentUseCase } from '@rcs-lang/types';

const agent: RcsBusinessMessagingAgent = {
  description: 'Customer support agent for ACME Corp',
  logoUri: 'https://example.com/logo.png',
  heroUri: 'https://example.com/hero.jpg',
  phoneNumbers: [
    {
      phoneNumber: '+1234567890',
      label: 'Support',
    },
  ],
  emails: [
    {
      address: 'support@example.com',
      label: 'Customer Support',
    },
  ],
  websites: [
    {
      uri: 'https://example.com',
      label: 'Main Website',
    },
  ],
  privacy: {
    uri: 'https://example.com/privacy',
    label: 'Privacy Policy',
  },
  termsConditions: {
    uri: 'https://example.com/terms',
    label: 'Terms of Service',
  },
  color: '#0000FF',
  billingConfig: {
    billingCategory: 'CONVERSATIONAL',
  },
  agentUseCase: 'MULTI_USE',
  hostingRegion: 'NORTH_AMERICA',
};
```

### Branded Types

The package includes branded types for enhanced type safety:

```typescript
import type { PhoneNumber, EmailAddress, Url, HexColor } from '@rcs-lang/types';

// These provide compile-time type safety
const phone: PhoneNumber = '+1234567890' as PhoneNumber;
const email: EmailAddress = 'user@example.com' as EmailAddress;
const url: Url = 'https://example.com' as Url;
const color: HexColor = '#FF0000' as HexColor;
```

## Type Categories

### Agent Types
- `RcsBusinessMessagingAgent` - Complete agent configuration
- `AgentUseCase` - Agent use case enumeration
- `HostingRegion` - Hosting region enumeration
- `BillingCategory` - Billing category enumeration

### Message Types
- `AgentMessage` - Complete agent message structure
- `AgentContentMessage` - Message content with various formats
- `MessageTrafficType` - Message traffic type enumeration
- `Suggestion` - Reply suggestions and actions
- `RichCard` - Rich card messages (standalone or carousel)

### Action Types
- `DialAction` - Phone dialing action
- `ViewLocationAction` - Location viewing action
- `CreateCalendarEventAction` - Calendar event creation
- `OpenUrlAction` - URL opening action
- `ShareLocationAction` - Location sharing request

### Event Types
- `AgentEvent` - Agent-initiated events (typing, read receipts)
- `EventType` - Event type enumeration

### Brand & Testing
- `Brand` - Brand configuration
- `BrandState` - Brand state enumeration
- `Tester` - Tester configuration
- `InvitationStatus` - Tester invitation status

### Integration Types
- `Integration` - Dialogflow integration configuration
- `IntegrationType` - Integration type enumeration

## API Reference Documentation

Full API documentation with detailed type information is available at:
- [TypeDoc Documentation](https://rcs-lang.github.io/rcl/packages/types/) (when published)

### Official Google RBM References
- [Agent Messages](https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages)
- [Agent Configuration](https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents)
- [Brands](https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands)
- [Testers](https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.testers)
- [Agent Events](https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentEvents)
- [File Operations](https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/files)
- [Integrations](https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents.integrations)

## Contributing

Contributions are welcome! Please ensure all types match the official Google RBM API specification.

## License

MIT