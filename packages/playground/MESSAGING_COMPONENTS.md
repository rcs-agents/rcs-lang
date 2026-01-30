# Messaging Components

This document describes the RCS messaging components available in the playground package. These components allow users to configure RCS agent settings, send test messages, and view API request/response logs.

## Overview

The messaging functionality is composed of:

1. **Hooks** - React hooks for managing state and API calls
2. **Components** - React components for the UI
3. **Storage** - Browser localStorage persistence with `rcsmaker_` prefix for compatibility

## Hooks

### `useSettings()`

Manages test settings with localStorage persistence.

```typescript
import { useSettings } from '@rcs-lang/playground';

const {
  settings,              // Current settings object
  saveSettings,          // Save settings to state and localStorage
  clearSettings,         // Clear all settings
  loadSettings,          // Reload settings from localStorage
  getPhoneNumberList,    // Get array of phone numbers
  hasValidPhoneNumbers   // Check if at least one valid phone number exists
} = useSettings();
```

**Settings Object:**

```typescript
interface TestSettings {
  serviceAccountKey: string;
  agentId: string;
  recipientPhoneNumbers: string; // Comma-separated list
  agentType: 'default_agent' | 'custom_agent';
}
```

### `useMessaging()`

Manages messaging functionality and request logging.

```typescript
import { useMessaging } from '@rcs-lang/playground';

const {
  logs,                   // Array of log entries
  isLogsVisible,          // Whether logs panel is visible
  clearLogs,              // Clear all logs
  toggleLogsVisibility,   // Toggle logs panel visibility
  sendPlayback,           // Send RCS message playback
  inviteTester            // Invite phone number as tester
} = useMessaging();
```

**API Methods:**

```typescript
// Send a playback (RCS message sequence)
await sendPlayback({
  playback: any,
  recipientPhoneNumber: string,
  agentType: 'default_agent' | 'custom_agent',
  agentId?: string,
  serviceAccountKey?: string
});

// Invite a tester
await inviteTester({
  msisdn: string,
  agentType: 'default_agent' | 'custom_agent',
  agentId?: string,
  serviceAccountKey?: string
});
```

## Components

### `SendControls`

Button controls for sending messages and opening settings.

```typescript
import { SendControls } from '@rcs-lang/playground';

<SendControls
  recipientPhoneNumber={settings.recipientPhoneNumbers}
  onRecipientChange={(phone) => {}} // Optional
  onSend={handleSend}
  onOpenSettings={() => setIsSettingsOpen(true)}
  isLoading={isSending}
  disabled={false}
/>
```

### `SettingsDialog`

Modal dialog for configuring RCS agent credentials and managing test devices.

```typescript
import { SettingsDialog } from '@rcs-lang/playground';

<SettingsDialog
  open={isSettingsOpen}
  onOpenChange={setIsSettingsOpen}
  settings={settings}
  onSave={handleSaveSettings}
  onClear={clearSettings}
  onInviteTester={handleInviteTester}
/>
```

**Features:**
- Agent type selection (default/custom)
- Agent ID and Service Account Key inputs
- Phone number list management
- Invite tester functionality
- Input validation
- Browser storage management

### `LoggingPanel`

Collapsible panel displaying API request/response logs.

```typescript
import { LoggingPanel } from '@rcs-lang/playground';

<LoggingPanel
  logs={logs}
  isVisible={isLogsVisible}
  onClear={clearLogs}
/>
```

**Features:**
- Displays method, URL, status, and timestamp
- Expandable entries showing full request/response JSON
- Color-coded success/failure states
- Auto-expands first log
- Keeps last 50 logs

### `Button`

Reusable button component with loading states.

```typescript
import { Button } from '@rcs-lang/playground';

<Button
  intent="primary"      // 'primary' | 'secondary' | 'danger'
  size="md"             // 'xs' | 'sm' | 'md' | 'lg'
  format="button"       // 'button' | 'link'
  loading={false}
  disabled={false}
  onClick={handleClick}
>
  Click me
</Button>
```

## Utility Functions

### Phone Number Validation

```typescript
import { isValidPhoneNumber, cleanPhoneNumbers } from '@rcs-lang/playground';

// Validate a phone number (E.164 format)
const isValid = isValidPhoneNumber('+1234567890'); // true

// Clean phone numbers (remove invalid characters)
const cleaned = cleanPhoneNumbers('+123-456-7890, +098 765 4321');
// Result: '+1234567890,+0987654321'
```

**Validation Rules:**
- Must start with `+`
- Minimum 8 digits
- E.164 format recommended

## Complete Example

See `examples/messaging-example.tsx` for a complete integration example:

```typescript
import { useState } from 'react';
import {
  useSettings,
  useMessaging,
  SendControls,
  SettingsDialog,
  LoggingPanel
} from '@rcs-lang/playground';

export function MyPlayground() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { settings, saveSettings, clearSettings, getPhoneNumberList } = useSettings();
  const { logs, isLogsVisible, clearLogs, sendPlayback, inviteTester } = useMessaging();

  const handleSend = async () => {
    setIsSending(true);
    try {
      const phoneNumbers = getPhoneNumberList();
      const playback = [/* your RCS message data */];

      for (const phoneNumber of phoneNumbers) {
        await sendPlayback({
          playback,
          recipientPhoneNumber: phoneNumber,
          agentType: settings.agentType,
          agentId: settings.agentId,
          serviceAccountKey: settings.serviceAccountKey,
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      {/* Your editor/content */}

      <SendControls
        recipientPhoneNumber={settings.recipientPhoneNumbers}
        onSend={handleSend}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isLoading={isSending}
      />

      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={settings}
        onSave={saveSettings}
        onClear={clearSettings}
        onInviteTester={(msisdn) => inviteTester({
          msisdn,
          agentType: settings.agentType,
          agentId: settings.agentId,
          serviceAccountKey: settings.serviceAccountKey,
        })}
      />

      <LoggingPanel
        logs={logs}
        isVisible={isLogsVisible}
        onClear={clearLogs}
      />
    </div>
  );
}
```

## API Endpoints

The components expect the following API endpoints to be available:

### `POST /api/playbacks`

Send an RCS message playback.

**Request:**
```json
{
  "playback": [...],
  "recipientPhoneNumber": "+1234567890",
  "agentType": "custom_agent",
  "agentId": "my_agent_123",
  "serviceAccountKey": "{...}"
}
```

**Response:**
```json
{
  "ok": true,
  "messageId": "msg_1234567890",
  "timestamp": "2024-01-29T10:30:00.000Z"
}
```

### `POST /api/tester/invite`

Invite a phone number as a tester.

**Request:**
```json
{
  "msisdn": "+1234567890",
  "agentType": "custom_agent",
  "agentId": "my_agent_123",
  "serviceAccountKey": "{...}"
}
```

**Response:**
```json
{
  "ok": true
}
```

## Browser Storage

All settings are persisted to `localStorage` with the `rcsmaker_` prefix for compatibility with RCS Maker:

- `rcsmaker_serviceAccountKey`
- `rcsmaker_agentId`
- `rcsmaker_recipientPhoneNumbers`
- `rcsmaker_agentType`

## Styling

Components use Tailwind CSS classes. Ensure your project has Tailwind CSS configured.

## Requirements

- React 18+
- @ark-ui/react (for Dialog component)
- tailwind-merge (for class merging)
- Tailwind CSS

## Notes

- The `default_agent` option is only visible in development (localhost)
- Phone numbers must be in E.164 format (+XXXXXXXXXXX)
- T-Mobile numbers are not allowed (per RCS BM restrictions)
- iOS numbers from Brazil and Mexico are not allowed
- Maximum 50 logs are kept in memory
