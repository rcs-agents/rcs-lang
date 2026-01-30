# @rcs-lang/playground

Interactive playground component for the RCL (Rich Communication Language).

## Features

- Monaco Editor with RCL syntax highlighting
- Real-time compilation and error reporting
- Interactive diagram visualization
- Conversation simulator
- URL state persistence
- Customizable themes (light/dark/system)

## Installation

```bash
bun add @rcs-lang/playground
```

## Usage

```tsx
import { Playground } from "@rcs-lang/playground";
import "@rcs-lang/playground/styles";

function App() {
  return (
    <Playground
      initialCode={`flow Greeting {
  initial state Start

  state Start {
    message "Hello! How can I help you?"
    on text -> Response
  }

  state Response {
    message "I received: {{ input.text }}"
  }
}`}
      theme="dark"
      height="800px"
      onCodeChange={(code) => console.log("Code changed:", code)}
      onCompile={(result) => console.log("Compilation result:", result)}
    />
  );
}
```

## Props

### `PlaygroundProps`

- `initialCode?: string` - Initial RCL code to display in the editor (default: `""`)
- `theme?: "light" | "dark" | "system"` - Theme for the playground UI (default: `"system"`)
- `height?: string | number` - Height of the playground container (default: `"600px"`)
- `width?: string | number` - Width of the playground container (default: `"100%"`)
- `showDiagram?: boolean` - Whether to show the diagram panel (default: `true`)
- `showSimulator?: boolean` - Whether to show the simulator panel (default: `true`)
- `enableUrlState?: boolean` - Whether to enable URL state persistence (default: `true`)
- `onCodeChange?: (code: string) => void` - Callback when the code changes
- `onCompile?: (result) => void` - Callback when compilation completes
- `className?: string` - Custom CSS class name for the container

## Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build the library
bun run build

# Run type checking
bun run typecheck

# Run linting
bun run lint

# Format code
bun run format
```

## License

MIT
