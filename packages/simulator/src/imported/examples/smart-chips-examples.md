# Smart Chips Examples

## Smart Reply Carousel Example

![Smart Reply Carousel](./smart-chips-carousel-example.png)

**Figma ID**: 14:12478

**Example Content**:

- Text: "Smart reply" (repeated for multiple chips)
- Type: Reply chips in horizontal carousel layout
- Use case: Quick response suggestions for customers

**Implementation**:

```typescript
const smartReplyChips: SmartReplyChip[] = [
  { type: 'reply', text: 'Yes, please', postbackData: 'yes' },
  { type: 'reply', text: 'No, thanks', postbackData: 'no' },
  { type: 'reply', text: 'Maybe later', postbackData: 'maybe' },
  { type: 'reply', text: 'Tell me more', postbackData: 'more_info' },
  { type: 'reply', text: "I'm interested", postbackData: 'interested' },
]
```

## Smart Action Carousel Example

![Smart Action Carousel](./smart-action-carousel-example.png)

**Figma ID**: 14:12498

**Example Content**:

- Text: "Location"
- Icon: "location_on" (Material Design icon)
- Type: Action chips with location functionality
- Use case: Quick actions like location sharing, calling, web links

**Implementation**:

```typescript
const smartActionChips: SmartActionChip[] = [
  {
    type: 'action',
    text: 'Location',
    icon: 'location',
    postbackData: 'share_location',
    action: { shareLocationAction: {} },
  },
  {
    type: 'action',
    text: 'Call',
    icon: 'phone',
    postbackData: 'call',
    action: { dialAction: { phoneNumber: '+1234567890' } },
  },
  {
    type: 'action',
    text: 'Website',
    icon: 'web',
    postbackData: 'website',
    action: { openUrlAction: { url: 'https://example.com' } },
  },
  {
    type: 'action',
    text: 'Schedule',
    icon: 'calendar',
    postbackData: 'schedule',
    action: {
      createCalendarEventAction: {
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
        title: 'Meeting',
      },
    },
  },
]
```

## Usage in Stories

```typescript
// Storybook story example
export const SmartReplies = () =>
  html`
  <rbx-smart-chips 
    .chips=${smartReplyChips} 
    layout="horizontal"
    .onChipClick=${action('chip-clicked')}
  ></rbx-smart-chips>
`

export const SmartActions = () =>
  html`
  <rbx-smart-chips 
    .chips=${smartActionChips} 
    layout="horizontal"
    .onChipClick=${action('chip-clicked')}
  ></rbx-smart-chips>
`
```
