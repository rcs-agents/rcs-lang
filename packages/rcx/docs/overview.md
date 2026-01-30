# RCX (Rich Communication Experience) Bundle Format

The RCX format is a comprehensive specification for defining, distributing, and executing RCS conversational agents. It serves as an intermediate representation between visual design tools and the runtime execution engine.

## Architecture

An RCX Bundle is a logical container (conceptually a ZIP file, though represented as a JSON structure in memory/API) that holds several distinct components:

### 1. Manifest (`manifest.json`)
The source of truth for the bundle. It defines metadata, versioning, and pointers to all other components.

### 2. Agent Configuration (`agent.json`)
Defines the agent's identity and capabilities:
- Branding (colors, logos)
- Business details (hours, website, privacy policy)
- Feature flags (fallback support, file uploads)

### 3. Conversation State Machine (`csm.json`)
The execution logic of the agent, based on the **CSM (Conversation State Machine)** specification (`@rcs-lang/csm`).
- **States**: Logical steps in the conversation (e.g., "Welcome", "AskName").
- **Transitions**: Rules for moving between states based on user input or events.
- **Flows**: Groupings of states for modular logic.

### 4. Messages (`messages.json`)
A separation of content from logic. Messages are defined here and referenced by ID in the CSM and Diagram.
- Supports rich RCS features: Cards, Carousels, Chips (Suggestions).
- Localization support.
- Personalization variables.

### 5. Diagram (`diagram.json`)
The visual representation of the agent flow, used by the Diagram Editor.
- **Nodes**: Visual blocks corresponding to states or messages.
- **Edges**: Visual connections corresponding to transitions.
- Based on React Flow data structure.

### 6. Assets (`assets.json`)
A manifest of all media used by the agent.
- **Three-Tier Storage**:
  - **Embedded**: Base64 data (for small icons).
  - **Referenced**: External public URLs.
  - **Bundled**: Relative paths to files inside the bundle (ZIP).

## Migration from RBX

RCX is the evolution of the RBX format. The core structure remains similar but cleaner and more standardized:

- **Naming**: All `RBX` prefixes are renamed to `RCX`.
- **Versioning**: Uses semantic versioning.
- **Organization**: Moved to `@rcs-lang/rcx` package.

## Usage in Development

The `RCXBuilder` class (`src/builder.ts`) allows converting between the visual Diagram format and the executable RCX Bundle format.

- **Diagram -> Bundle**: Used when "Publishing" or "Testing" an agent from the editor.
- **Bundle -> Diagram**: Used when loading an existing agent into the editor.
