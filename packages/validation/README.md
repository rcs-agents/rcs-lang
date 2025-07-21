# @rcs-lang/validation

Comprehensive validation pipeline for RCL (Rich Communication Language) with modular validators and configurable rules.

## Overview

This package provides a flexible validation system for RCL code. It includes built-in validators for syntax, semantics, naming conventions, and RCS compliance, plus a framework for building custom validators.

## Installation

```bash
npm install @rcs-lang/validation
```

## Quick Start

```typescript
import { ValidationPipeline, createDefaultPipeline } from '@rcs-lang/validation';

// Use default validation pipeline
const pipeline = createDefaultPipeline();

const result = await pipeline.validate(ast, {
  strictMode: true,
  rcsCompliance: true
});

if (!result.isValid) {
  result.diagnostics.forEach(diagnostic => {
    console.log(`${diagnostic.severity}: ${diagnostic.message}`);
  });
}
```

## Validation Pipeline

The validation pipeline processes AST nodes through multiple validators:

```typescript
import { 
  ValidationPipeline,
  SyntaxValidator,
  SemanticValidator,
  NamingValidator,
  RequiredFieldsValidator
} from '@rcs-lang/validation';

const pipeline = new ValidationPipeline([
  new SyntaxValidator(),
  new RequiredFieldsValidator(),
  new SemanticValidator(),
  new NamingValidator()
]);

const result = await pipeline.validate(ast);
```

## Built-in Validators

### SyntaxValidator

Validates basic syntax correctness:

```typescript
import { SyntaxValidator } from '@rcs-lang/validation';

const validator = new SyntaxValidator();

// Checks for:
// - Parse errors and malformed syntax
// - Unclosed blocks or missing tokens
// - Invalid character sequences
```

### SemanticValidator

Validates semantic correctness:

```typescript
import { SemanticValidator } from '@rcs-lang/validation';

const validator = new SemanticValidator({
  checkUnusedMessages: true,
  checkUnreachableStates: true,
  validateTypeCompatibility: true
});

// Checks for:
// - Undefined message references
// - Unreachable flow states
// - Type mismatches
// - Circular dependencies
```

### RequiredFieldsValidator

Ensures required fields are present:

```typescript
import { RequiredFieldsValidator } from '@rcs-lang/validation';

const validator = new RequiredFieldsValidator();

// Validates:
// - Agent has displayName
// - Flows have start states
// - Messages have required content
// - RCS agent configuration
```

### NamingValidator

Enforces naming conventions:

```typescript
import { NamingValidator } from '@rcs-lang/validation';

const validator = new NamingValidator({
  agentNames: 'PascalCase',
  messageNames: 'PascalCase',
  flowNames: 'PascalCase',
  stateNames: 'PascalCase'
});

// Enforces:
// - Consistent naming patterns
// - Reserved word avoidance
// - Character restrictions
```

### RcsAgentValidator

Validates RCS Business Messaging compliance:

```typescript
import { RcsAgentValidator } from '@rcs-lang/validation';

const validator = new RcsAgentValidator({
  strictCompliance: true,
  requireVerifiedSender: true
});

// Validates:
// - RCS agent configuration schema
// - Message format compliance
// - Business messaging requirements
```

## Custom Validators

Create custom validators by extending `BaseValidator`:

```typescript
import { BaseValidator, Diagnostic } from '@rcs-lang/validation';

class CustomBusinessRulesValidator extends BaseValidator {
  name = 'business-rules';
  
  async validate(ast: IASTNode): Promise<IValidationResult> {
    const diagnostics: Diagnostic[] = [];
    
    // Walk AST and apply business rules
    walkAST(ast, (node) => {
      if (node.type === 'MessageDefinition') {
        if (this.violatesBusinessRule(node)) {
          diagnostics.push(
            this.createError(
              'Message violates business rule',
              node,
              'BUSINESS_RULE_VIOLATION'
            )
          );
        }
      }
    });
    
    return this.createResult(diagnostics);
  }
  
  private violatesBusinessRule(message: MessageDefinition): boolean {
    // Implement custom business logic
    return false;
  }
}
```

## Validation Presets

Pre-configured validation setups for common scenarios:

```typescript
import { 
  createStrictPreset,
  createLenientPreset,
  createRcsCompliantPreset
} from '@rcs-lang/validation';

// Strict validation for production
const strictPipeline = createStrictPreset();

// Lenient validation for development
const lenientPipeline = createLenientPreset();

// RCS compliance validation
const rcsPipeline = createRcsCompliantPreset();
```

## Configuration

Configure validators through options:

```typescript
import { ValidationConfig } from '@rcs-lang/validation';

const config: ValidationConfig = {
  // Global settings
  strictMode: true,
  maxErrors: 50,
  
  // Validator-specific settings
  syntax: {
    allowExperimentalFeatures: false
  },
  
  semantic: {
    checkUnusedMessages: true,
    checkUnreachableStates: true,
    allowImplicitTransitions: false
  },
  
  naming: {
    agentNames: 'PascalCase',
    enforceConsistency: true,
    reservedWords: ['Config', 'Messages', 'Flow']
  },
  
  rcs: {
    strictCompliance: true,
    validateAgentSchema: true,
    requireBusinessMessaging: true
  }
};

const pipeline = createDefaultPipeline(config);
```

## Error Reporting

Rich diagnostic information with source locations:

```typescript
interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  message: string;
  code: string;
  category: string;
  range?: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  source: string;
  relatedInformation?: DiagnosticRelatedInformation[];
  quickFixes?: QuickFix[];
}
```

## Quick Fixes

Some validators provide automatic fixes:

```typescript
const result = await pipeline.validate(ast);

result.diagnostics.forEach(diagnostic => {
  if (diagnostic.quickFixes) {
    diagnostic.quickFixes.forEach(fix => {
      console.log(`Quick fix available: ${fix.title}`);
      // Apply fix: fix.edit
    });
  }
});
```

## Integration Examples

### With Compiler

```typescript
import { RCLCompiler } from '@rcs-lang/compiler';
import { createStrictPreset } from '@rcs-lang/validation';

const compiler = new RCLCompiler({
  validation: createStrictPreset()
});

const result = await compiler.compile(source);
// Compilation includes validation
```

### With Language Server

```typescript
import { LanguageService } from '@rcs-lang/language-service';
import { createDefaultPipeline } from '@rcs-lang/validation';

const service = new LanguageService({
  validation: createDefaultPipeline({
    semantic: { checkUnusedMessages: true },
    naming: { enforceConsistency: true }
  })
});
```

### In CI/CD

```typescript
import { validateFiles } from '@rcs-lang/validation';

// Validate all RCL files in CI
const files = await glob('src/**/*.rcl');
const results = await validateFiles(files, {
  strictMode: true,
  failOnWarnings: false
});

if (!results.every(r => r.isValid)) {
  process.exit(1);
}
```

## Performance

The validation pipeline is optimized for performance:

- **Incremental validation** - Only re-validate changed parts
- **Parallel validation** - Run independent validators concurrently  
- **Caching** - Cache validation results for unchanged files
- **Early termination** - Stop on first error in strict mode

```typescript
const pipeline = createDefaultPipeline({
  performance: {
    parallel: true,
    cache: true,
    maxConcurrency: 4
  }
});
```

## Contributing

See the main repository README for contribution guidelines.

## License

MIT