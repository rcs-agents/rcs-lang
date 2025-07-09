# RCL CLI Test Plan & Implementation Strategy

## Overview
This document outlines a comprehensive test plan for implementing complete message handling and schema compliance in the RCL CLI package, with integration into the parser and language service packages.

## Test Coverage Goals

### 1. Message Handling Tests
- **Text Shortcuts**: `text MsgId "content"` → AgentMessage with text content
- **Transactional Shortcuts**: `transactional MsgId "content"` → TRANSACTION traffic type
- **Agent Messages**: Full `agentMessage` definitions with all properties
- **Rich Cards**: Both standalone and carousel cards with all properties
- **Media Content**: Files, contentInfo, uploaded RBM files
- **Suggestions**: All suggestion types (replies, actions with all action subtypes)

### 2. Schema Compliance Tests
- **AgentMessage Schema**: Validate against `@schemas/agent-message.schema.json`
- **AgentConfig Schema**: Validate against `@schemas/agent-config.schema.json`
- **Field Validation**: Required fields, optional fields, field constraints
- **OneOf Constraints**: Ensure mutually exclusive fields are handled correctly
- **Length Limits**: Text (2048), suggestion text (25), postback data (2048)

### 3. Agent Configuration Tests
- **Agent Definition**: Parse agent name, displayName, brandName
- **Agent Config**: Parse description, logoUri, color, contact info
- **Default Values**: Apply appropriate defaults for optional fields

### 4. Flow Compilation Tests
- **Flow Definitions**: Parse flow syntax and state transitions
- **XState Generation**: Generate valid XState machine configurations
- **State Validation**: Ensure all referenced states exist

### 5. Integration Tests
- **End-to-End**: Complete RCL file compilation
- **Real-world Examples**: Test with realistic.rcl and complex scenarios
- **Error Handling**: Graceful handling of malformed RCL

## Implementation Strategy

### Phase 1: Test Infrastructure (Cycle 1)
```bash
# Setup Jest testing framework
npm install --save-dev jest @types/jest ts-jest
# Create test utilities and mocks
# Setup test data fixtures
```

### Phase 2: Message Normalizer Enhancement (Cycles 2-4)
```typescript
// Enhanced MessageNormalizer with full feature support
- Text shortcuts parsing
- Rich card parsing (standalone/carousel)
- Suggestion parsing (all types)
- Media content handling
- Schema validation integration
```

### Phase 3: Agent & Flow Processing (Cycles 5-6)
```typescript
// AgentExtractor improvements
- Parse agentConfig sections
- Extract branding information
- Apply schema validation

// FlowCompiler implementation
- Parse flow definitions
- Generate XState configurations
- Validate state references
```

### Phase 4: Schema Validation Integration (Cycle 7)
```typescript
// Schema validation utilities
- JSON schema validation functions
- Integration with language service
- Error reporting and diagnostics
```

### Phase 5: Integration & Polish (Cycle 8)
```bash
# End-to-end testing
# Performance optimization
# Documentation updates
```

## Test Categories

### Unit Tests
- **MessageNormalizer**: Individual method testing
- **AgentExtractor**: Configuration parsing
- **FlowCompiler**: Flow logic generation
- **Schema Validators**: Validation logic

### Integration Tests
- **CLI Compilation**: Full RCL → JS/JSON conversion
- **Parser Integration**: AST → normalized objects
- **Error Scenarios**: Invalid syntax handling

### Schema Compliance Tests
- **Valid Cases**: Ensure correct schemas are generated
- **Invalid Cases**: Proper error reporting
- **Edge Cases**: Boundary conditions and limits

## Success Criteria

### Functional Requirements
1. ✅ All message types compile correctly
2. ✅ Generated output validates against JSON schemas
3. ✅ Rich cards with all features supported
4. ✅ All suggestion types implemented
5. ✅ Agent configuration fully extracted
6. ✅ Flow definitions generate valid XState
7. ✅ Comprehensive test coverage (>90%)

### Quality Requirements
1. ✅ Semantic commits following conventional format
2. ✅ No breaking changes to existing APIs
3. ✅ Performance: Large files compile in <5s
4. ✅ Error handling: Clear, actionable error messages

## Test Data Fixtures

### Simple Cases
```rcl
# Text shortcuts
text Welcome "Hello World"
transactional Confirm "Please confirm"

# Basic agent message
agentMessage SimpleMsg
    messageTrafficType: :TRANSACTION
    contentMessage
        text: "Simple message"
```

### Complex Cases
```rcl
# Rich cards with suggestions
agentMessage ComplexCard
    contentMessage
        richCard
            standaloneCard
                cardOrientation: :VERTICAL
                cardContent
                    title: "Product Info"
                    description: "Detailed description"
                    media
                        height: :MEDIUM
                        contentInfo
                            fileUrl: "https://example.com/image.jpg"
                    suggestions
                        suggestion
                            reply
                                text: "Learn More"
                                postbackData: "learn_more"
                        suggestion
                            action
                                text: "Visit Website"
                                postbackData: "visit_site"
                                openUrlAction
                                    url: "https://example.com"
```

### Error Cases
```rcl
# Missing required fields
agentMessage InvalidMsg
    contentMessage
        text: "Valid text"
        richCard  # Invalid: cannot have both text and richCard

# Invalid suggestion
agentMessage InvalidSuggestion
    contentMessage
        text: "Message with invalid suggestion"
        suggestions
            suggestion
                reply
                    text: "This is way too long for a suggestion text field which has a 25 character limit"
```

## Implementation Cycles

Each cycle follows: **Plan → Code → Test → Commit**

### Cycle Structure
1. **Plan**: Define specific features and tests
2. **Code**: Implement features with TDD approach
3. **Test**: Run all tests, ensure coverage
4. **Commit**: Semantic commit with conventional format

### Commit Format
```
type(scope): description

feat(cli): implement rich card parsing in MessageNormalizer
test(cli): add comprehensive suggestion parsing tests
fix(parser): resolve schema validation edge case
docs(cli): update API documentation for new features
```

## Monitoring & Validation

### Continuous Validation
- JSON schema validation on every compilation
- AST structure validation
- Output format validation

### Performance Metrics
- Compilation time for realistic.rcl
- Memory usage during processing
- Test execution time

### Quality Metrics
- Test coverage percentage
- Schema compliance rate
- Error detection accuracy