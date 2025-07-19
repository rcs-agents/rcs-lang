# RCL Compiler Output Specification

## Overview

The RCL compiler transforms RCL files into two output formats: JSON and JavaScript/TypeScript modules. This document defines the expected structure and schema for these outputs.

## Output Formats

### 1. JSON Output (`-f json`)

The JSON output contains three main sections that must comply with their respective schemas:

```json
{
  "agent": {
    // Must comply with @schemas/agent-config.schema.json
    "name": "agents/AgentName",
    "displayName": "Coffee Shop Assistant",
    "brandName": "Acme Coffee",
    "rcsBusinessMessagingAgent": {
      "description": "Your friendly coffee ordering assistant",
      "logoUri": "https://example.com/logo.png",
      "heroUri": "https://example.com/hero.png",
      "color": "#FF5733",
      "phoneNumbers": [{
        "number": "+1234567890",
        "label": "Customer Support"
      }],
      "emails": [{
        "address": "support@example.com",
        "label": "Email Support"
      }],
      "websites": [{
        "url": "https://example.com",
        "label": "Our Website"
      }],
      "privacy": {
        "url": "https://example.com/privacy",
        "label": "Privacy Policy"
      },
      "termsConditions": {
        "url": "https://example.com/terms",
        "label": "Terms of Service"
      },
      "agentUseCase": "PROMOTIONAL",
      "hostingRegion": "NORTH_AMERICA"
    }
  },
  "flows": {
    // XState machine definitions for conversation flows
    "MainFlow": {
      "id": "MainFlow",
      "initial": "Welcome",
      "states": {
        "Welcome": {
          "entry": {
            "type": "sendParent",
            "event": {
              "type": "DISPLAY_MESSAGE",
              "messageId": "WelcomeMessage"
            }
          },
          "on": {
            "order_coffee": {
              "target": "OrderCoffee"
            },
            "view_menu": {
              "target": "ViewMenu"
            }
          }
        },
        "OrderCoffee": {
          "entry": {
            "type": "sendParent",
            "event": {
              "type": "DISPLAY_MESSAGE",
              "messageId": "CoffeeSelectionMessage"
            }
          }
        }
      },
      "context": {}
    }
  },
  "messages": {
    // Must comply with @schemas/agent-message.schema.json
    "WelcomeMessage": {
      "contentMessage": {
        "text": "Welcome to Acme Coffee! How can I help you today?",
        "suggestions": [{
          "reply": {
            "text": "Order Coffee",
            "postbackData": "order_coffee"
          }
        }, {
          "reply": {
            "text": "View Menu",
            "postbackData": "view_menu"
          }
        }]
      },
      "messageTrafficType": "PROMOTION"
    },
    "CoffeeSelectionMessage": {
      "contentMessage": {
        "richCard": {
          "standaloneCard": {
            "cardOrientation": "VERTICAL",
            "cardContent": {
              "title": "Select Your Coffee",
              "description": "Choose from our premium selection",
              "media": {
                "height": "MEDIUM",
                "contentInfo": {
                  "fileUrl": "https://example.com/coffee-selection.jpg"
                }
              },
              "suggestions": [{
                "reply": {
                  "text": "Espresso",
                  "postbackData": "select_espresso"
                }
              }, {
                "reply": {
                  "text": "Cappuccino",
                  "postbackData": "select_cappuccino"
                }
              }, {
                "reply": {
                  "text": "Latte",
                  "postbackData": "select_latte"
                }
              }]
            }
          }
        }
      },
      "messageTrafficType": "PROMOTION",
      "ttl": "3600s"
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

### Agent Configuration
- **MUST conform to `@schemas/agent-config.schema.json`**
- Required fields:
  - `displayName`: The agent's display name (max 100 chars)
  - `rcsBusinessMessagingAgent`: Nested object with agent details
- Optional fields:
  - `name`: Agent identifier (usually "agents/AgentName" format)
  - `brandName`: Brand name associated with the agent
- The `rcsBusinessMessagingAgent` object contains:
  - Contact info: `phoneNumbers[]`, `emails[]`, `websites[]` (all arrays)
  - Branding: `logoUri`, `heroUri`, `color` (hex format)
  - Legal: `privacy`, `termsConditions` (WebEntry objects)
  - Config: `agentUseCase`, `hostingRegion`, `billingConfig`

### Messages
- **MUST conform to `@schemas/agent-message.schema.json`**
- Required fields:
  - `contentMessage`: The message content
  - `messageTrafficType`: One of PROMOTION, TRANSACTION, etc.
- Optional fields:
  - `ttl`: Time-to-live in seconds format (e.g., "3600s")
  - `expireTime`: RFC3339 timestamp (mutually exclusive with ttl)
- Content types (only ONE per message):
  - `text`: Simple text message (max 2048 chars)
  - `uploadedRbmFile`: Previously uploaded file
  - `richCard`: Standalone or carousel card
  - `contentInfo`: External file reference
- Suggestions:
  - Max 11 suggestions per message
  - Max 4 suggestions per carousel card
  - Each suggestion is either:
    - `reply`: Text and postbackData (both required)
    - `action`: Text, postbackData, and action type (dial, url, etc.)
- **postbackData Generation**: 
  - Generated from suggestion text if not explicitly provided
  - Default pattern: lowercase text with non-alphanumeric replaced by underscore
  - Example: `"Order Coffee"` → `"order_coffee"`
  - Example: `"Small $3.50"` → `"small__3_50"`

### Flows
- **XState-compatible machine configurations**
- Required properties:
  - `id`: Flow identifier
  - `initial`: Starting state
  - `states`: State definitions
- State structure:
  - Each message ID corresponds to a state in the flow
  - States should have `entry` actions that send `DISPLAY_MESSAGE` events:
    ```json
    "entry": {
      "type": "sendParent",
      "event": {
        "type": "DISPLAY_MESSAGE",
        "messageId": "MessageId"
      }
    }
    ```
  - Transitions triggered by `postbackData` values from suggestions
  - Use `xstate.assign` for updating context variables
  - Use `after` for delayed transitions
  - Use `always` for immediate transitions

## Important Implementation Notes

### Rich Card Structure
For rich cards, the compiler output must follow the exact nested structure:
```json
{
  "contentMessage": {
    "richCard": {
      "standaloneCard": {
        "cardOrientation": "VERTICAL",
        "cardContent": {
          "title": "Card Title",
          "description": "Card description",
          "media": {
            "height": "MEDIUM",
            "contentInfo": {
              "fileUrl": "https://example.com/image.jpg"
            }
          }
        }
      }
    }
  },
  "messageTrafficType": "PROMOTION"
}
```

### Carousel Structure
For carousels, use the `carouselCard` structure:
```json
{
  "contentMessage": {
    "richCard": {
      "carouselCard": {
        "cardWidth": "MEDIUM",
        "cardContents": [{
          "title": "Card 1",
          "description": "First card",
          "media": {
            "height": "MEDIUM",
            "contentInfo": {
              "fileUrl": "https://example.com/image1.jpg"
            }
          },
          "suggestions": [{
            "reply": {
              "text": "Select 1",
              "postbackData": "select_1"
            }
          }]
        }, {
          "title": "Card 2",
          "description": "Second card",
          "media": {
            "height": "MEDIUM",
            "contentInfo": {
              "fileUrl": "https://example.com/image2.jpg"
            }
          },
          "suggestions": [{
            "reply": {
              "text": "Select 2",
              "postbackData": "select_2"
            }
          }]
        }]
      }
    }
  },
  "messageTrafficType": "PROMOTION"
}
```

### Action Suggestions
For action suggestions, the structure must include the action type:
```json
{
  "action": {
    "text": "Call Us",
    "postbackData": "action_call",
    "dialAction": {
      "phoneNumber": "+1234567890"
    }
  }
}
```

## Message Traffic Types

Valid values for `messageTrafficType`:
- `MESSAGE_TRAFFIC_TYPE_UNSPECIFIED`
- `AUTHENTICATION`
- `TRANSACTION`
- `PROMOTION`
- `SERVICEREQUEST`
- `ACKNOWLEDGEMENT`

## Agent Use Cases

Valid values for `agentUseCase`:
- `AGENT_USE_CASE_UNSPECIFIED`
- `TRANSACTIONAL`
- `PROMOTIONAL`
- `OTP`
- `MULTI_USE`

## Hosting Regions

Valid values for `hostingRegion`:
- `HOSTING_REGION_UNSPECIFIED`
- `NORTH_AMERICA`
- `EUROPE`
- `ASIA_PACIFIC`

## Default Values and Transformations

### postbackData Generation
When a suggestion doesn't specify `postbackData`, it should be generated from the text:
1. Convert to lowercase
2. Replace non-alphanumeric characters with underscores
3. Collapse multiple underscores to single
4. Trim leading/trailing underscores

Examples:
- `"Order Coffee"` → `"order_coffee"`
- `"Small ($3.50)"` → `"small__3_50"`
- `"Yes, please!"` → `"yes_please"`

### Message Defaults
If not specified in the RCL file:
- `messageTrafficType`: Defaults to `"PROMOTION"` (or from agent defaults)
- `ttl`: Optional, no default

## Testing and Validation

The compiler output should be validated against:
1. `@schemas/agent-config.schema.json` for the agent section
2. `@schemas/agent-message.schema.json` for each message
3. XState compatibility for flows

Test fixtures are located in `/apps/extension/test-fixtures/` with expected output files.