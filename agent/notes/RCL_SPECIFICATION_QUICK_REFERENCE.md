# RCL Formal Specification - Quick Reference Guide

This document summarizes the key rules from the 951-line RCL formal specification to ensure grammar compliance without re-reading the full document.

## 1. Core Structure Requirements

### 1.1 File Structure (MUST follow exactly)
```ebnf
RclFile ::=
    (ImportStatement)*
    AgentDefinition
```

### 1.2 Agent Definition (MANDATORY)
```ebnf
AgentDefinition ::=
    'agent' IDENTIFIER              // IDENTIFIER only, NOT string
    INDENT
    ('displayName' ':' STRING)      // REQUIRED
    ('brandName' ':' STRING)?       // OPTIONAL
    (ConfigSection)?                // OPTIONAL
    (DefaultsSection)?              // OPTIONAL  
    (FlowSection)+                  // AT LEAST ONE required
    MessagesSection                 // MANDATORY
    DEDENT
```

## 2. Identifier Rules (CRITICAL - Must enforce strictly)

### 2.1 IDENTIFIER (Title Case)
- **Pattern**: `/[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9]))*/`
- **Start**: Must start with uppercase letter (A-Z)
- **Words**: Each word starts with uppercase letter or number
- **Spaces**: Allowed between words
- **Examples**: `TravelAgent`, `Welcome Message`, `Contact Support Flow`
- **Used for**: Agent names, section names, flow names, message IDs

### 2.2 ATTRIBUTE_KEY (lowercase)
- **Pattern**: `/[a-z][a-zA-Z0-9_]*(?=\s*:)/`
- **Start**: Must start with lowercase letter
- **Used for**: Property names (`displayName`, `messageTrafficType`)

### 2.3 SECTION_TYPE (lowercase)
- **Pattern**: `/[a-z][a-zA-Z0-9]*/`
- **Examples**: `agent`, `agentDefaults`, `agentConfig`, `flow`, `messages`

## 3. Reserved Names (Cannot be used elsewhere)
- `Config` - Only for `agentConfig Config`
- `Defaults` - Only for `agentDefaults Defaults`  
- `Messages` - Only for `messages Messages`

## 4. Required Sections

### 4.1 Messages Section (MANDATORY)
```ebnf
MessagesSection ::=
    'messages' 'Messages'           // EXACT reserved name
    INDENT
    (AgentMessage | MessageShortcut)+
    DEDENT
```

### 4.2 Flow Section (AT LEAST ONE required)
```ebnf
FlowSection ::=
    'flow' IDENTIFIER               // Flow name
    INDENT
    (FlowRule)*
    DEDENT
```

## 5. Type Tags (Special syntax rules)

### 5.1 Type Tag Syntax
```ebnf
TypeTag ::=
    '<' TYPE_TAG_NAME TypeTagValue ('|' TYPE_TAG_MODIFIER_CONTENT)? '>'
```
- **Examples**: `<url https://example.com>`, `<phone +1234567890>`, `<email user@domain.com>`
- **NO QUOTES** around the value part

### 5.2 Supported Type Tags
- `email`, `phone`, `url`, `time`, `datetime`/`date`/`dt`, `zipcode`/`zip`, `duration`/`ttl`

## 6. Indentation Rules (Python-like)
- **INDENT**: Marks block start (increase in indentation)
- **DEDENT**: Marks block end (decrease in indentation)  
- **Consistency**: Use consistent spacing (2 or 4 spaces recommended)

## 7. Message Shortcuts (Common patterns)

### 7.1 Text Shortcut
```ebnf
TextShortcut ::=
    'text' IDENTIFIER (EnhancedSimpleValue | EmbeddedValue)
```
- **Example**: `text Welcome "Welcome to our service!"`
- **MUST** have message ID after `text` keyword

### 7.2 Rich Card Shortcut  
```ebnf
RichCardShortcut ::=
    'richCard' EnhancedSimpleValue  // title
    (ATOM | TypedValue)*            // optional params
```

## 8. Embedded Code Rules

### 8.1 Single Line
```ebnf
EMBEDDED_CODE ::= /\$((js|ts)?>)\s*[^\r\n]*/
```
- **Examples**: `$js> console.log('hello')`, `$ts> 1+1`, `$> someValue`

### 8.2 Multi-line
```ebnf
MULTI_LINE_EXPRESSION_START ::= /\$((js|ts)?)>>>/
```
- **Example**: `$js>>>` followed by indented code block

## 9. String and Value Rules

### 9.1 Strings
- **Regular**: `"text content"` (double quotes only)
- **Multi-line**: Start with `|`, `|-`, `+|`, or `+|+` followed by indented content

### 9.2 ATOMs (Enums)
- **Pattern**: `/:([_a-zA-Z][\w_]*|"[^"\\]*")/`
- **Examples**: `:transactional`, `:promotional`, `:start`, `:end`

## 10. Critical Grammar Compliance Points

### 10.1 Agent Name MUST be IDENTIFIER
❌ `agent "Travel Assistant"`  
✅ `agent TravelAssistant`

### 10.2 Section Names MUST follow reserved name rules
❌ `messages MyMessages`  
✅ `messages Messages`

### 10.3 Flow Rules MUST have proper structure
✅ `flow MainFlow`  
✅ `:start -> Welcome`  
✅ `Welcome -> Planning`  

### 10.4 Type Tags MUST NOT have quoted values
❌ `<url "https://example.com">`  
✅ `<url https://example.com>`

## 11. Common Mistake Prevention

### 11.1 Case Sensitivity
- All identifiers are case-sensitive
- Title Case for IDENTIFIERs
- lowercase for attribute keys and section types

### 11.2 Required vs Optional
- `displayName` is REQUIRED in agent definition
- At least one `flow` section is REQUIRED
- `messages Messages` section is REQUIRED

### 11.3 Indentation Structure
- Every section body MUST be properly indented
- INDENT/DEDENT tokens MUST match exactly
- No mixing of tabs and spaces

## 12. Error Prevention Checklist

Before implementing any grammar rule, verify:
- [ ] IDENTIFIER patterns follow `/[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9]))*/`
- [ ] Reserved names used only in correct contexts
- [ ] Required sections are present
- [ ] Type tag syntax is correct (no quotes around values)
- [ ] Indentation rules are properly enforced
- [ ] Case sensitivity is respected
- [ ] Message shortcuts have proper IDs

This quick reference ensures all grammar implementations comply with the formal specification without needing to re-read the full 951-line document.