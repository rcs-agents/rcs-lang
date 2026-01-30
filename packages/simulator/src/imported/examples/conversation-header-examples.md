# Conversation Header Examples

## Business Messaging Header Example

![Conversation Header](./conversation-header-example.png)

**Figma ID**: 245:8523

**Example Content**:

- Brand: "ABC Corporation"
- Logo: Company logo with verification badge
- Subtitle: "Customer Support"
- Eyebrow: "VERIFIED BUSINESS"
- Navigation: Back button and menu options
- Type: Business conversation header
- Use case: RCS Business Messaging conversation interface

**Implementation**:

```typescript
const headerConfig: ConversationHeaderConfig = {
  logo: '/images/logos/abc-corp-logo.svg',
  brandName: 'ABC Corporation',
  isVerified: true,
  subtitle: 'Customer Support',
  eyebrow: 'VERIFIED BUSINESS',
  showBackButton: true,
  showMenuButton: true,
}
```

## BMW Service Header Example

```typescript
const bmwServiceHeader: ConversationHeaderConfig = {
  logo: '/images/logos/bmw-logo.svg',
  brandName: 'BMW Service Center',
  isVerified: true,
  subtitle: 'Downtown Location',
  eyebrow: 'AUTHORIZED DEALER',
  showBackButton: true,
  showMenuButton: true,
}
```

## Restaurant Header Example

```typescript
const restaurantHeader: ConversationHeaderConfig = {
  logo: '/images/logos/restaurant-logo.svg',
  brandName: 'Bella Vista Restaurant',
  isVerified: false,
  subtitle: 'Reservations & Orders',
  eyebrow: 'ITALIAN CUISINE',
  showBackButton: true,
  showMenuButton: false,
}
```

## E-commerce Header Example

```typescript
const ecommerceHeader: ConversationHeaderConfig = {
  logo: '/images/logos/store-logo.svg',
  brandName: 'TechMart Electronics',
  isVerified: true,
  subtitle: 'Sales & Support',
  eyebrow: 'ELECTRONICS STORE',
  showBackButton: false,
  showMenuButton: true,
}
```

## Usage in Stories

```typescript
// Default conversation header
export const ConversationHeader = () =>
  html`
  <rbx-conversation-header 
    .config=${headerConfig}
    .onBackClick=${action('back-clicked')}
    .onMenuClick=${action('menu-clicked')}
  ></rbx-conversation-header>
`

// BMW Service header
export const BMWServiceHeader = () =>
  html`
  <rbx-conversation-header 
    .config=${bmwServiceHeader}
    .onBackClick=${action('back-clicked')}
    .onMenuClick=${action('menu-clicked')}
  ></rbx-conversation-header>
`

// Restaurant header
export const RestaurantHeader = () =>
  html`
  <rbx-conversation-header 
    .config=${restaurantHeader}
    .onBackClick=${action('back-clicked')}
  ></rbx-conversation-header>
`

// Android styling
export const AndroidHeader = () =>
  html`
  <rbx-conversation-header 
    .config=${headerConfig}
    isAndroid=${true}
    .onBackClick=${action('back-clicked')}
    .onMenuClick=${action('menu-clicked')}
  ></rbx-conversation-header>
`

// Dark mode
export const DarkHeader = () =>
  html`
  <rbx-conversation-header 
    .config=${headerConfig}
    isDarkMode=${true}
    .onBackClick=${action('back-clicked')}
    .onMenuClick=${action('menu-clicked')}
  ></rbx-conversation-header>
`

// Without verification badge
export const UnverifiedHeader = () =>
  html`
  <rbx-conversation-header 
    .config=${restaurantHeader}
    .onBackClick=${action('back-clicked')}
  ></rbx-conversation-header>
`

// Minimal header (no subtitle/eyebrow)
export const MinimalHeader = () =>
  html`
  <rbx-conversation-header 
    .config=${{
    logo: '/images/logos/simple-logo.svg',
    brandName: 'Simple Business',
    isVerified: false,
    showBackButton: true,
    showMenuButton: false,
  }}
    .onBackClick=${action('back-clicked')}
  ></rbx-conversation-header>
`
```

## Header States and Variations

### With Verification Badge

- Displays blue checkmark icon next to brand name
- Indicates verified business account
- Builds trust with customers

### Without Verification Badge

- Standard layout without verification indicator
- Used for unverified or personal accounts

### Platform Variants

- **iOS**: Larger spacing, SF Pro Display font
- **Android**: Compact spacing, Roboto font, smaller border radius

### Navigation Options

- **Back Button**: For conversation navigation
- **Menu Button**: For additional options and settings
- **Both**: Full navigation capability
- **Neither**: Minimal header for embedded contexts
