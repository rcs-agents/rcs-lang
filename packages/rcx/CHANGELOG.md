# @rcs-lang/rcx

## 0.2.2

### Patch Changes

- Updated dependencies [a3adcda]
  - @rcs-lang/types@2.0.1
  - @rcs-lang/csm@2.0.1

## 0.2.1

### Patch Changes

- RCXBundle now extends AgentBundle

  `RCXBundle` interface now extends `AgentBundle` from @rcs-lang/types,
  inheriting the standard `agent` and `messages` fields while adding
  RCX-specific extensions (manifest, csm, diagram, assets, validation).

- Updated dependencies
  - @rcs-lang/types@2.0.0
  - @rcs-lang/csm@2.0.0

## 0.2.0

### Minor Changes

- ef14a79: Add @rcs-lang/rcx package - The native format for RCS Language, bridging visual design and execution

### Patch Changes

- RCXBundle now extends AgentBundle

  `RCXBundle` interface now extends `AgentBundle` from @rcs-lang/types,
  inheriting the standard `agent` and `messages` fields while adding
  RCX-specific extensions (manifest, csm, diagram, assets, validation).

- Updated dependencies
  - @rcs-lang/types@1.0.0
  - @rcs-lang/csm@1.0.0
