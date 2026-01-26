# RCL Formal Specification - Quick Reference Guide

This document summarizes the key rules from the 976-line RCL formal specification to ensure grammar compliance without re-reading the full document.

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
    ('displayName' ':' STRING)      // REQUIRED
    ('brandName' ':' STRING)?       // OPTIONAL
    (ConfigSection)?                // OPTIONAL
    (DefaultsSection)?              // OPTIONAL  
    (FlowSection)+                  // AT LEAST ONE required
    MessagesSection                 // MANDATORY
    'end'                          // Explicit end keyword
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
    (AgentMessage | MessageShortcut)+
    'end'                          // Explicit end keyword
```

### 4.2 Flow Section (AT LEAST ONE required)
```ebnf
FlowSection ::=
    'flow' IDENTIFIER               // Flow name
    (FlowRule)*
    'end'                          // Explicit end keyword
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

## 6. Block Structure Rules (Stack-based)
- **Explicit Delimiters**: Blocks use explicit 'end' keywords instead of indentation
- **Special Terminators**: 
  - Multi-line strings: End with `|` on a line by itself
  - Embedded code blocks: End with `<$`
- **Readability**: Use consistent indentation for readability (not structurally required)

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
- **Example**: `$js>>>` followed by code block
- **Termination**: End with `<$` on a line by itself

## 9. String and Value Rules

### 9.1 Strings
- **Regular**: `"text content"` (double quotes only)
- **Multi-line**: Start with `|`, `|-`, `+|`, or `+|+` followed by content
- **Multi-line termination**: End with a line containing only `|`

### 9.2 ATOMs (Enums)
- **Pattern**: `/:([_a-zA-Z][\w_]*|"[^"\\]*")/`
- **Examples**: `:transactional`, `:promotional`, `:start`, `:end`

## 10. Critical Grammar Compliance Points

### 10.1 Agent Name MUST be IDENTIFIER
❌ `agent "Travel Assistant"`  
✅ `agent TravelAssistant`

### 10.2 Suggestions Block (plural only)
❌ Multiple `suggestion` entries
✅ Single `suggestions` block with multiple items inside

### 10.3 Section Names MUST follow reserved name rules
❌ `messages MyMessages`  
✅ `messages Messages`

### 10.4 Flow Rules MUST have proper structure
✅ `flow MainFlow`  
✅ `:start -> Welcome`  
✅ `Welcome -> Planning`  

### 10.5 Type Tags MUST NOT have quoted values
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

### 11.3 Block Structure
- Every section MUST be properly terminated with 'end' keyword
- Special blocks have their own terminators (`|` for strings, `<$` for code)
- Indentation is for readability, not structure

## 12. Stack-Based Parsing Updates (CRITICAL)

### 12.1 Block Termination with 'end' Keywords
- **OLD**: Blocks terminated by DEDENT tokens (indentation-based)
- **NEW**: Blocks terminated by explicit 'end' keywords
- **Examples**:
  ```rcl
  agent TravelBot
    displayName: "Travel Assistant"
    flow Main
      :start -> Welcome
    end
    messages Messages
      text Welcome "Hello!"
    end
  end
  ```

### 12.2 Multi-line String Termination
- **Termination**: Line containing only `|`
- **Example**:
  ```rcl
  description: |
    This is a multi-line string
    with multiple lines of content
  |
  ```

### 12.3 Embedded Code Block Termination  
- **Termination**: `<$` on a line by itself
- **Example**:
  ```rcl
  postbackData: $js>>>
    const data = {
      user: context.user,
      selection: context.reply.text
    };
    return JSON.stringify(data);
  <$
  ```

### 12.4 When Block Structure
- **NEW**: When blocks also use 'end' keyword
- **Example**:
  ```rcl
  :start -> when @reply's text is ...
    "Yes" -> Confirm
    "No" -> Cancel
    :default -> Unknown
  end
  ```

### 12.5 Suggestions Block
- **Structure**: Uses 'end' keyword
- **Example**:
  ```rcl
  suggestions
    reply "Yes"
    reply "No" 
    openUrl "Learn More" <url https://example.com>
  end
  ```

### 12.6 Special Blocks Summary
| Block Type | Start | End |
|------------|-------|-----|
| Agent | `agent Name` | `end` |
| Flow | `flow Name` | `end` |
| Messages | `messages Messages` | `end` |
| Config | `agentConfig Config` | `end` |
| Defaults | `agentDefaults Defaults` | `end` |
| When | `when @var is ...` | `end` |
| Suggestions | `suggestions` | `end` |
| List | `list` | `end` |
| Object | `object` | `end` |
| Carousel | `carousel ID Title` | `end` |
| Save Event | `saveEvent "Title"` | `end` |
| Multi-line String | `\|` | `\|` (line by itself) |
| Embedded Code | `$js>>>` | `<$` |

## 13. Error Prevention Checklist

Before implementing any grammar rule, verify:
- [ ] IDENTIFIER patterns follow `/[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9]))*/`
- [ ] Reserved names used only in correct contexts
- [ ] Required sections are present
- [ ] Type tag syntax is correct (no quotes around values)
- [ ] All blocks end with proper terminators ('end', '|', or '<$')
- [ ] Multi-line strings end with `|` on a line by itself
- [ ] Embedded code blocks end with `<$` on a line by itself
- [ ] When blocks end with 'end' keyword
- [ ] Only `suggestions` (plural) blocks are used
- [ ] postbackData only contains EmbeddedCode
- [ ] Case sensitivity is respected
- [ ] Message shortcuts have proper IDs

This quick reference ensures all grammar implementations comply with the formal specification without needing to re-read the full 976-line document.