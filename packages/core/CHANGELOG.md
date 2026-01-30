# @rcs-lang/core

## 2.0.1

### Patch Changes

- Updated dependencies [a3adcda]
  - @rcs-lang/types@2.0.1
  - @rcs-lang/ast@2.0.1

## 2.0.0

### Major Changes

- Restructure compilation output interface

  BREAKING: `ICompilationOutput` now has a new structure:

  - `bundle: AgentBundle` - Runtime bundle containing agent config and messages
  - `csm: ICsmOutput` - Compiled CSM state machine with machine definition

  Previously the output had flat `agent`, `messages`, `flows`, and optional `csm` properties.

  Also adds `IMachineDefinition` and `ICsmOutput` interfaces for better type safety.

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @rcs-lang/ast@2.0.0
  - @rcs-lang/types@2.0.0

## 1.0.0

### Minor Changes

- Restructure compilation output interface

  BREAKING: `ICompilationOutput` now has a new structure:

  - `bundle: AgentBundle` - Runtime bundle containing agent config and messages
  - `csm: ICsmOutput` - Compiled CSM state machine with machine definition

  Previously the output had flat `agent`, `messages`, `flows`, and optional `csm` properties.

  Also adds `IMachineDefinition` and `ICsmOutput` interfaces for better type safety.

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @rcs-lang/ast@1.0.0
  - @rcs-lang/types@1.0.0

## 0.5.2

### Patch Changes

- Fixing "workspace:\*" versions
- Updated dependencies
  - @rcs-lang/ast@0.5.2

## 0.5.1

### Patch Changes

- Fixing broken dependencies
- Updated dependencies
  - @rcs-lang/ast@0.5.1

## 0.5.0

### Patch Changes

- @rcs-lang/ast@0.5.0
