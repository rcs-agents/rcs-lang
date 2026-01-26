# RCL Examples

This directory contains example RCL (Rich Communication Language) files that showcase the language's features and capabilities.

## Examples

### [`minimal.rcl`](./minimal.rcl)
The simplest possible RCL agent with basic flow and text message.
- Basic agent definition
- Simple linear flow
- Single text message

### [`simple.rcl`](./simple.rcl) 
A customer service bot demonstrating common patterns.
- Agent configuration with branding
- Conditional flow logic with JavaScript
- Interactive messages with reply suggestions

### [`realistic.rcl`](./realistic.rcl)
A comprehensive travel assistant showcasing advanced features.
- Complete agent configuration (logo, contact info, defaults)
- Multiple flows for different user journeys
- Rich cards, carousels, and file attachments
- Type-tagged values (URLs, phone numbers, dates)
- Embedded JavaScript for dynamic content

### [`shortcuts.rcl`](./shortcuts.rcl)
Demonstrates RCL's message shortcut syntax vs verbose syntax.
- Text, rich card, file, and carousel shortcuts
- Comparison with traditional verbose message definitions
- Various message types and styling options

## Language Features Showcased

- **Agent Definitions**: Basic structure, configuration, branding
- **Flow Systems**: Linear flows, conditional branching, multiple flows
- **Message Types**: Text, rich cards, carousels, files
- **Shortcut Syntax**: Concise message definitions
- **Type System**: URLs, phone numbers, durations, dates
- **Embedded Code**: JavaScript expressions for dynamic content
- **Rich Content**: Cards with images, buttons, and actions
- **User Interactions**: Reply suggestions, action buttons, calendar events

## Getting Started

1. Open any `.rcl` file in a text editor with RCL language support
2. Use the RCL CLI to compile and validate:
   ```bash
   npx @rcl/cli compile example.rcl
   ```
3. Explore the VSCode extension for syntax highlighting and live preview

## Learn More

- [RCL Language Specification](../docs/rcl-formal-specification.md)
- [CLI Documentation](../packages/cli/README.md)
- [VSCode Extension](../apps/extension/README.md)