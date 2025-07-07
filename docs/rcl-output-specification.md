# RCL Compiler Output Specification

## Overview

The RCL compiler transforms RCL files into two output formats: JSON and JavaScript/TypeScript modules. This document defines the expected structure and schema for these outputs.

## Output Formats

### 1. JSON Output (`-f json`)

The JSON output contains three main sections:

```json
{
  "agent": {
    "name": "AgentName",
    "displayName": "Agent Display Name",
    "flows": ["FlowId"],
    "messages": ["MessageId"]
  },
  "flows": {
    "FlowId": {
      "id": "FlowId",
      "initial": "start",
      "states": {
        "stateName": {
          "on": {
            "NEXT": "nextState"
          }
        }
      },
      "context": {}
    }
  },
  "messages": {
    "MessageId": {
      "contentMessage": {
        "text": "Message content"
      },
      "messageTrafficType": "TRANSACTION"
    }
  }
}
```

### 2. JavaScript Output (`-f js`)

The JavaScript output is an ES module with named exports:

```javascript
// Messages dictionary - Maps message IDs to normalized AgentMessage objects
export const messages = { /* ... */ };

// Flow configurations - XState machine definitions
export const flows = { /* ... */ };

// Agent configuration
export const agent = { /* ... */ };

// Utility functions
export function getMessage(messageId) { /* ... */ }
export function getFlow(flowId) { /* ... */ }
export function createMachine(flowId, options = {}) { /* ... */ }

// Default export
export default { messages, flows, agent, getMessage, getFlow, createMachine };
```

## Schema Compliance

### Messages
- Must conform to `@schemas/agent-message.schema.json`
- Required fields: `contentMessage`, `messageTrafficType`
- Text content limited to 2048 characters
- Suggestions limited to 11 items
- Suggestion text limited to 25 characters

### Agent Configuration
- Must conform to `@schemas/agent-config.schema.json`
- Required field: `displayName`
- Optional fields: `name`, `brandName`, `rcsBusinessMessagingAgent`

### Flows
- XState-compatible machine configurations
- Must have `id`, `initial`, and `states` properties
- State transitions follow XState format

## Current Implementation Status

### Working Examples
- **simple.rcl**: Basic text messages and flows
- **travel-agent.rcl**: Multi-message example with replies

### Complex Features (In Progress)
- **realistic.rcl**: Contains advanced features that require grammar improvements:
  - URLs with dots (travel.example.com)
  - Embedded JavaScript expressions ($js>)
  - Complex multi-line strings
  - Advanced type tags
  - Rich cards and carousels

## Testing

Test fixtures are located in `/apps/extension/test-fixtures/` with expected output files:
- `simple.rcl` + `simple-expected.json`
- `travel-agent.rcl` + `travel-agent-expected.json`

The extension test suite validates that compiler output matches expected JSON structures.

## Future Enhancements

1. **Grammar Improvements**: Support for complex URLs, embedded expressions
2. **Rich Content**: Full rich card and carousel support
3. **Type Tags**: Complete type tag validation and processing
4. **Interactive Diagrams**: Flow visualization with Sprotty integration