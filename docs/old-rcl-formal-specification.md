# Rich Communication Language (RCL) - Formal Specification

## 1. Introduction

This document provides the formal specification for the Rich Communication Language (RCL) using an Extended Backus-Naur Form (EBNF)-like notation. This specification is derived from the Langium grammar files and the design decisions outlined in the RCL overview and data types documentation.

Its primary purpose is to define the valid syntax of an RCL document. Semantic rules, error recovery, and the precise behavior of the underlying expression language are outside the scope of this EBNF specification and are covered by other parts of the language design (e.g., validators, interpreter/transpiler logic).

### Notation Conventions:

-   `RuleName ::= Definition` : Defines a rule.
-   `'literal'` : Represents a literal string or keyword (e.g., `'agent'`, `':'`).
-   `TERMINAL_NAME` : Represents a terminal symbol, a basic token recognized by the lexer (e.g., `IDENTIFIER`, `STRING`).
-   `RuleName` : (When on the right-hand side) Represents a non-terminal symbol, a reference to another rule (e.g., `AgentDefinition`, `SimpleValue`).
-   `A | B` : Represents an alternative (A or B). Parsers typically attempt to match alternatives in the order they are listed or use lookahead to disambiguate.
-   `(A B)` : Represents a sequence of A followed by B.
-   `A?` : Represents zero or one occurrence of A (optional).
-   `A*` : Represents zero or more occurrences of A.
-   `A+` : Represents one or more occurrences of A.
-   `// comment` : Explanatory comments.

_Note on AST Mapping:_ While this EBNF does not explicitly use `property_name: RuleCall` syntax (common in some grammar tools like Langium), it is implied that in a corresponding Abstract Syntax Tree (AST), sequenced elements or named terminals/non-terminals would map to named properties of the AST node for the rule. For example, `Parameter ::= IDENTIFIER ':' SimpleValue` would likely result in an AST node for `Parameter` with properties corresponding to the captured `IDENTIFIER` and `SimpleValue`.

## 2. Lexical Specification (Terminals)

These are the fundamental building blocks (tokens) of the RCL, recognized by the lexer.

_Note on Identifier Types:_
- `IDENTIFIER` (Title/Proper Noun): Starts with an uppercase letter, used for section names, object types, function-like constructs, and references. Follows the pattern `/[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9]))*/` - allows spaces between words where each word starts with uppercase letter or number, and hyphens and underscores within words
- `ATTRIBUTE_KEY` (Common Noun): Starts with a lowercase letter, used for keys in key-value pairs (properties/attributes).
- `SECTION_TYPE` (Common Noun): Starts with a lowercase letter, used for section type keywords like `agent`, `flow`, etc.

### 2.1 Block Delimiters
RCL uses explicit 'end' keywords to delimit blocks instead of relying on indentation tokens. This makes the grammar compatible with browser environments without requiring an external scanner.
```ebnf
// No INDENT/DEDENT tokens - blocks are explicitly terminated with 'end' keyword
```

### 2.2 Hidden Terminals (Ignored by the parser but consumed by the lexer)
These tokens are recognized but do not form part of the structural syntax passed to the parser, except for their role in separating other tokens.
```ebnf
WS ::= /[\t ]+/                         // Whitespace (one or more spaces or tabs), does not include newlines.
NL ::= /[\r\n]+/                        // Newlines (one or more).
SL_COMMENT ::= /#.*/                    // Single-line comments (from '#' to end of line).
```
_Note on Whitespace within Rules:_ The `WS` hidden terminal allows for optional spaces and tabs between any adjacent non-hidden terminals or literal keywords within a parser rule sequence (e.g., between `'agent'` and `QualifiedName` in the `AgentDefinition` rule). Newlines (`NL`), also hidden, primarily act as statement or line terminators. This EBNF does not explicitly notate `WS?` or `WS*` between all elements, as this is implied by the hidden terminal definition.

### 2.3 Common Terminals
```ebnf
IDENTIFIER ::= /[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*/  // Title/Proper Noun names (TitleCase with spaces and hyphens). Each word starts with uppercase letter or number.
ATTRIBUTE_KEY ::= /[a-z][a-zA-Z0-9_]*(?=\s*:)/              // Used for common noun attribute/property keys (lowercase start, letters, numbers, underscore).
SECTION_TYPE ::= /[a-z][a-zA-Z0-9]*/               // Used for section type keywords (lowercase start).
ATOM ::= /:([_a-zA-Z][\w_]*|"[^"\\]*")/ // e.g., :symbol or :"quoted symbol". Enum values are lowercase (e.g., :transactional, :promotional).
STRING ::= /"(\\.|[^"\\])*"/           // Double-quoted strings with standard escape sequences. Single quotes are reserved for 's accessor operator.
NUMBER ::= /[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/ // Integer or floating-point numbers.
ISO_DURATION_LITERAL ::= /(P((\d+Y)|(\d+M)|(\d+W)|(\d+D)|(T((\d+H)|(\d+M)|(\d+(\.\d+)?S))+))+)|([0-9]+(\.[0-9]+)?s)/ // ISO 8601 duration or simple seconds (e.g., "3.5s"). At least one component required.
```

### 2.4 Embedded Code Terminals
The content within embedded code blocks is treated as raw text by the RCL parser and stored as literal strings.
```ebnf
EMBEDDED_CODE ::= /\$((js|ts)?>)\s*[^\r\n]*/               // e.g., $js> console.log('hello'), $ts> 1+1, $> someValue. Optional lang tag: js or ts. Goes to end of line.
MULTI_LINE_EXPRESSION_START ::= /\$((js|ts)?)>>>/          // e.g., $ts>>>, $js>>>, $>>>. Optional lang tag: js or ts.
MULTI_LINE_EXPRESSION_CONTENT ::= /[^]*/                 // Raw content of a multi-line block, terminated by <$.
```

### 2.5 Multi-line String Terminals
```ebnf
MULTILINE_STR_CLEAN ::= /\|\s*$/               // Marker: | (clean text with single newline at end)
MULTILINE_STR_TRIM ::= /\|-\s*$/               // Marker: |- (clean text with no trailing newline)
MULTILINE_STR_PRESERVE ::= /\+\|\s*$/          // Marker: +| (preserve leading space, single newline at end)
MULTILINE_STR_PRESERVE_ALL ::= /\+\|\+\s*$/    // Marker: +|+ (preserve all whitespace exactly)
STRING_CONTENT ::= /[^]*/                      // Raw content of a multi-line string, terminated by a line containing only |.
```

### 2.6 Collection Literals
```ebnf
// Literals '{', '}', '(', ')', and ',' are used directly in List and Dictionary rules.
// Parentheses '()' are used for inline list syntax (tuple-style) instead of square brackets.
```

### 2.7 Type Tag Terminals
```ebnf
// Literals '<', '>', and '|' are used directly in the TypeTag rule.
TYPE_TAG_NAME ::= /[a-zA-Z]+/                   // e.g., phone, email, date, time, url, zip (used within TypeTag rule).
TYPE_TAG_VALUE_CONTENT ::= /[^\|>]+/            // Raw string content of the tag's value, e.g., "user@example.com", "4pm", "Jul 4th". To be processed semantically.
TYPE_TAG_MODIFIER_CONTENT ::= /[^>]+/             // Raw string content of the tag's modifier (after '|'), e.g., "Z", "UTC-3", "BR". To be processed semantically.
```

## 3. Syntactic Specification (Parser Rules)

### 3.0 Core & Common Rules

```ebnf
QualifiedName ::= IDENTIFIER ('.' IDENTIFIER)*

BooleanLiteral ::= 'True' | 'Yes' | 'On' | 'Enabled' | 'Active' | 'False' | 'No' | 'Off' | 'Disabled' | 'Inactive'

NullLiteral ::= 'Null' | 'None' | 'Void'

SimpleValue ::=
    STRING
    | NUMBER
    | BooleanLiteral
    | NullLiteral
    | ATOM
    | TypeTag

Parameter ::= ATTRIBUTE_KEY ':' SimpleValue

PropertyAssignment ::= ATTRIBUTE_KEY ':' Value

InlineParameterList ::=
    Parameter (',' Parameter)*

List ::=
    ParenthesesList
    | InlineList
    | IndentedList

ParenthesesList ::= '(' (ListItem (',' ListItem)*)? ')' // Tuple-style parentheses notation: (item1, item2, item3)

InlineList ::= ListItem (',' ListItem)+ // Comma-separated flow notation: item1, item2, item3 (minimum 2 items, parentheses optional)

IndentedList ::=
    'list'
    (IndentedListItem)+
    'end'

IndentedListItem ::= '-' ListItem // YAML-style block notation with hyphens

ListItem ::= SimpleValue | NestedList | TypeTag

NestedList ::= '(' InlineList ')' // Parentheses for nested inline lists

Dictionary ::=
    BraceObject
    | IndentedObject

BraceObject ::= '{' (ObjectEntry (',' ObjectEntry)*)? '}' // YAML-style brace notation: {key1: value1, key2: value2}

IndentedObject ::=
    'object'
    (ObjectEntry)+
    'end'

ObjectEntry ::= (STRING | IDENTIFIER) ':' Value // YAML-style key-value pairs

MappedType ::=
    IDENTIFIER 'list' 'of' '(' MappedTypeSchema ')' ':'
    (MappedTypeItem)+
    'end'

MappedTypeSchema ::= MappedTypeField (',' MappedTypeField)*

MappedTypeField ::= 
    ATTRIBUTE_KEY
    | TypeTag

MappedTypeItem ::= '-' InlineList

Value ::= // Represents a value that can be assigned to a property or used elsewhere.
    SimpleValue
    | InlineParameterList
    | List
    | Dictionary
    | MappedType
    | TypeTag
    | Ref

Ref ::= IDENTIFIER // This IDENTIFIER references another named entity (AbstractNamedSection).
```

### 3.1 Embedded Code Rules

```ebnf
SingleLineEmbeddedCode ::= EMBEDDED_CODE

MultiLineEmbeddedCodeBlock ::=
    MULTI_LINE_EXPRESSION_START
    MULTI_LINE_EXPRESSION_CONTENT
    '<$'  // Embedded code block ends with <$

EmbeddedCode ::= SingleLineEmbeddedCode | MultiLineEmbeddedCodeBlock

EmbeddedValue ::= EmbeddedCode | SimpleValue // A value can be embedded code or a simple literal.
```

### 3.2 Multi-line String Rules

```ebnf
MultiLineString ::=
    ( MULTILINE_STR_CLEAN
    | MULTILINE_STR_TRIM
    | MULTILINE_STR_PRESERVE
    | MULTILINE_STR_PRESERVE_ALL
    )
    STRING_CONTENT
    '|'  // Multiline string ends with a line containing only |

EnhancedSimpleValue ::= // Used where a simple value or a multi-line string is acceptable.
    STRING
    | NUMBER
    | BooleanLiteral
    | NullLiteral
    | ATOM
    | MultiLineString
```

### 3.3 Type Tag Rules

```ebnf
TypeTagValue ::= STRING | NUMBER | BooleanLiteral | NullLiteral | ATOM | IDENTIFIER | ISO_DURATION_LITERAL // The raw value part inside a type tag.

TypeTag ::=
    '<' TYPE_TAG_NAME TypeTagValue ('|' TYPE_TAG_MODIFIER_CONTENT)? '>' // e.g., <email "user@example.com">, <time "10:00" | "UTC">, <phone "+1234567890">

TypedValue ::= TypeTag | EnhancedSimpleValue // A value can be a type tag or an enhanced simple value (which includes multi-line strings).
```

### 3.4 Main RCL Structure

```ebnf
RclFile ::=
    (ImportStatement)*
    AgentDefinition

ImportStatement ::=
    'import' ImportPath ('as' IDENTIFIER)?

ImportPath ::= IDENTIFIER ('/' IDENTIFIER)* // The import statement is composed of the 'import' keyword, a '/' (slash) separated path of Title identifiers, and optionally the 'as' keyword followed by a Title identifier

AgentDefinition ::=
    'agent' IDENTIFIER // Every section name, including the agent section, is a Title identifier (e.g., 'agent Agent Name')
    ('displayName' ':' STRING) // Required for the top-level agent object.
    ('brandName' ':' STRING)? // Optional
    (ConfigSection)?
    (DefaultsSection)?
    (FlowSection)+ // At least one flow is required for a functional agent.
    MessagesSection // Mandatory in RCL
    'end'

DefaultsSection ::=
    'agentDefaults' 'Defaults' // Reserved name "Defaults"
    ( DefaultProperty )* // Zero or more default properties
    'end'

DefaultProperty ::=
    ('fallbackMessage' ':' EnhancedSimpleValue)
    | ('messageTrafficType' ':' ATOM)
    | ('ttl' ':' STRING)
    | ('postbackData' ':' EmbeddedCode)  // Only EmbeddedCode allowed for postbackData
    | ('expressions' ':' 'language' ':' ATOM)

MessagesSection ::=
    'messages' 'Messages' // Reserved name "Messages"
    (AgentMessage | MessageShortcut)+ // One or more messages or shortcuts.
    'end'

// Note on traffic types: The keyword prefixes (transactional, promotional, etc.) map to the MessageTrafficType enum from the RCS specification (TRANSACTION, PROMOTION, etc.).
```

### 3.5 Flow System Rules

```ebnf
FlowSection ::=
    'flow' IDENTIFIER // Name of the flow.
    StartRule
    (FlowRule)*
    'end'

StartRule ::=
    ':start' '->' (FlowTransition | MatchBlock)

FlowRule ::=
    Ref '->' // Source: a message identifier
    ( FlowTransition
    | MatchBlock
    )

FlowTransition ::=
    FlowOperandOrExpression // Direct transition to target
    (WithClause)?

MatchBlock ::=
    'match' '@' IDENTIFIER ("'s" IDENTIFIER)*
    (MatchCase)+
    'end'

MatchCase ::=
    ( (STRING | NUMBER) '->' FlowOperandOrExpression (WithClause)?
    | ':default' '->' FlowOperandOrExpression (WithClause)?
    )


FlowOperand ::= ATOM | IDENTIFIER | STRING // Literal operands in a flow.

FlowActionText ::= 'text' EnhancedSimpleValue // A direct text output action in a flow.

FlowOperandOrExpression ::=
    FlowOperand
    | FlowActionText
    | EmbeddedCode
    | ('start' IDENTIFIER) // Reference to another flow (e.g., "start Support Flow").

WithClause ::=
    'with'
    (ATTRIBUTE_KEY ':' Value)+ // One or more parameter assignments as key-value pairs
```

### 3.6 Agent Configuration Rules

```ebnf
ConfigSection ::=
    'agentConfig' 'Config' // Reserved name "Config"
    ( ConfigProperty )* // Zero or more config properties
    'end'

ConfigProperty ::=
    ('description' ':' EnhancedSimpleValue)
    | ('logoUri' ':' STRING)
    | ('heroUri' ':' STRING)
    | PhoneNumberProperty
    | EmailProperty
    | WebsiteProperty
    | PrivacyProperty
    | TermsConditionsProperty
    | ('color' ':' STRING)
    | BillingConfigProperty
    | ('agentUseCase' ':' ATOM)
    | ('hostingRegion' ':' ATOM)

PhoneNumberProperty ::=
    'phoneNumberEntry' ':'
    ('number' ':' TypedValue)
    ('label' ':' EnhancedSimpleValue)?

EmailProperty ::=
    'emailEntry' ':'
    ('address' ':' TypedValue)
    ('label' ':' EnhancedSimpleValue)?

WebsiteProperty ::=
    'websiteEntry' ':'
    ('url' ':' TypedValue)
    ('label' ':' EnhancedSimpleValue)?

PrivacyProperty ::=
    'privacy' ':'
    ('url' ':' TypedValue)
    ('label' ':' EnhancedSimpleValue)?

TermsConditionsProperty ::=
    'termsConditions' ':'
    ('url' ':' TypedValue)
    ('label' ':' EnhancedSimpleValue)?

BillingConfigProperty ::=
    'billingConfig' ':'
    ('billingCategory' ':' ATOM)?
```

### 3.7 Agent Message Rules

```ebnf
AgentMessage ::=
    ('transactional' | 'promotional' | 'authentication' | 'serviceRequest' | 'acknowledgement')? // Optional traffic type prefix
    'message' IDENTIFIER // Required message ID
    ('messageTrafficType' ':' ATOM)?
    ( ('expireTime' ':' STRING) 
    | ('ttl' ':' STRING) )?
    ContentMessage
    'end'

ContentMessage ::=
    ( ('text' ':' (EnhancedSimpleValue | EmbeddedValue) ) // EmbeddedValue can include embedded code
    | ('fileName' ':' STRING)
    | ('uploadedRbmFile' UploadedRbmFile)
    | ('richCard' RichCard)
    | ('contentInfo' ContentInfo)
    )
    (Suggestions)?

Suggestions ::=
    'suggestions'
    ( ('reply' SuggestedReply)
    | ('action' SuggestedAction)
    )+
    'end'

SuggestedReply ::= InlineParameterList

SuggestedAction ::=
    (InlineParameterList)?
    ( DialAction
    | ViewLocationAction
    | CreateCalendarEventAction
    | OpenUrlAction
    | ShareLocationAction
    | ComposeAction
    )

DialAction ::= 'dialAction' ('phoneNumber' ':' TypedValue)

LatLongObject ::= InlineParameterList

ViewLocationAction ::=
    'viewLocationAction'
    ('label' ':' EnhancedSimpleValue)?
    ( ('latLong' LatLongObject)
    | ('query' ':' EnhancedSimpleValue)
    )

CreateCalendarEventAction ::= 'createCalendarEventAction' InlineParameterList

ShareLocationAction ::= 'shareLocationAction'

OpenUrlAction ::= 'openUrlAction' ('url' ':' TypedValue)

ComposeAction ::=
    'composeAction'
    ( ComposeTextMessage
    | ComposeRecordingMessage
    )

ComposeTextMessage ::= 'composeTextMessage' InlineParameterList

ComposeRecordingMessage ::= 'composeRecordingMessage' InlineParameterList

UploadedRbmFile ::= InlineParameterList | Dictionary

ContentInfo ::= InlineParameterList | Dictionary

RichCard ::=
    'richCard'
    ( StandaloneCard
    | CarouselCard
    )

StandaloneCard ::=
    'standaloneCard'
    ('cardOrientation' ':' ATOM)?
    ('thumbnailImageAlignment' ':' ATOM)?
    CardContent

CarouselCard ::=
    'carouselCard'
    ('cardWidth' ':' ATOM)?
    CardContent CardContent+
    'end'

CardContent ::=
    'cardContent'
    ('title' ':' EnhancedSimpleValue)?
    ('description' ':' EnhancedSimpleValue)?
    (Media)?
    (CardSuggestions)?

CardSuggestions ::=
    'suggestions'
    ( ('reply' SuggestedReply)
    | ('action' SuggestedAction)
    )+
    'end'

Media ::=
    'media'
    ('height' ':' ATOM)?
    ( ('file' UploadedRbmFile)
    | ('contentInfo' ContentInfo)
    )
```

### 3.8 RCS Message Shortcut Rules

```ebnf
MessageShortcut ::= 
    (('transactional' | 'promotional' | 'authentication' | 'serviceRequest' | 'acknowledgement'))? (TextShortcut | FileShortcut | RichCardShortcut | CarouselShortcut)

TextShortcut ::=
    'text' IDENTIFIER (EnhancedSimpleValue | EmbeddedValue) // Message ID first, then text parameter
    ( SuggestionsBlock )?

SuggestionsBlock ::=
    'suggestions'
    (SuggestionShortcut)+
    'end'

FileShortcut ::=
    ( 'rbmFile' IDENTIFIER STRING (STRING)? // Maps to UploadedRbmFile: messageId, fileName, optional thumbnailName
    | 'file' IDENTIFIER TypedValue (TypedValue)? (ATOM)? // Maps to ContentInfo: messageId, fileUrl, optional thumbnailUrl, optional :force-refresh
    )
    ( SuggestionsBlock )?

RichCardShortcut ::=
    'richCard' EnhancedSimpleValue // title
    (ATOM | TypedValue)* // Optional parameters: orientation, alignment, height, fileUrl
    ( 
        ('description' ':' EnhancedSimpleValue)?
        ( SuggestionsBlock )?
    )?

CarouselShortcut ::=
    'carousel' IDENTIFIER // Required carousel ID
    EnhancedSimpleValue // Title
    (ATOM)? // Optional width
    (RichCardShortcut)+
    'end'

SuggestionShortcut ::=
    ReplyShortcut
    | DialShortcut
    | OpenUrlShortcut
    | ShareLocationShortcut
    | CreateCalendarEventShortcut
    | ViewLocationShortcut

ReplyShortcut ::= 'reply' EnhancedSimpleValue (STRING)?

DialShortcut ::= 'dial' EnhancedSimpleValue TypedValue

OpenUrlShortcut ::=
    'openUrl' EnhancedSimpleValue TypedValue
    (EnhancedSimpleValue)?
    ( (':browser' | ':webview') ( (':full' | ':half' | ':tall') )? )?

ShareLocationShortcut ::= 'shareLocation' EnhancedSimpleValue

CreateCalendarEventShortcut ::=
    'saveEvent' EnhancedSimpleValue
    ( 
        ('title' ':' EnhancedSimpleValue)?
        ('startTime' ':' TypedValue)?
        ('endTime' ':' TypedValue)?
        ('description' ':' EnhancedSimpleValue)?
        'end'
    | (EnhancedSimpleValue TypedValue TypedValue EnhancedSimpleValue) // Positional args: title, startTime, endTime, description
    )

ViewLocationShortcut ::=
    'viewLocation' EnhancedSimpleValue
    (   ('latLong' NUMBER ',' NUMBER)
    |   ('query' ':' EnhancedSimpleValue)
    )
    ('label' ':' EnhancedSimpleValue)?
```

## 4. Identifier Rules

### 4.1 Valid Identifier Definition (Lexical Rule: `IDENTIFIER`)

Identifiers are Title-case names used for sections, flows, messages, and other named entities within RCL.

-   **Start**: Must start with an uppercase letter (A-Z).
-   **Subsequent Characters**: Can be uppercase letters (A-Z), lowercase letters (a-z), numbers (0-9), or hyphens (-).
-   **Spaces**: Allowed between words, where each word starts with an uppercase letter or number.
-   **Hyphens**: Allowed within identifiers but must be part of a continuous sequence of non-space characters.
-   **Pattern**: `/[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9]))*/` - allows spaces between words where each word starts with uppercase letter or number, and hyphens within words
-   **Examples**: `Welcome Message`, `User Profile`, `Contact Support Flow`, `Agent Name`, `Calculate-Total-Amount`, `Order-ID-123`
-   **Restrictions**: System reserved names (Config, Defaults, Messages) cannot be used as titles except in their designated contexts
-   **Case Sensitivity**: Identifiers are case-sensitive

### 4.2 Section Type Identifiers (Lexical Rule: `SECTION_TYPE`)

Section types are lowercase identifiers that define the type of a section.

-   **Start**: Must start with a lowercase letter (a-z).
-   **Subsequent Characters**: Can be lowercase letters (a-z), uppercase letters (A-Z), numbers (0-9).
-   **Examples**: `agent`, `agentDefaults`, `agentConfig`, `flow`, `messages`
-   **Must follow JavaScript identifier rules**: Starting with lowercase letter

### 4.3 Attribute Keys (Lexical Rule: `ATTRIBUTE_KEY`)

Attribute keys are lowercase identifiers used for property names.

-   **Start**: Must start with a lowercase letter (a-z).
-   **Subsequent Characters**: Can be lowercase letters (a-z), uppercase letters (A-Z), numbers (0-9), underscore (_).
-   **Examples**: `displayName`, `messageTrafficType`, `fallbackMessage`, `user_id`

## 5. Type System

### 5.1 Built-in Type Tags (Syntax Rule: `TypeTag`)
RCL supports explicit type tagging syntax for certain values using the `<TYPE_TAG VALUE>` syntax.

```ebnf
// Rule defined in 3.3:
// TypeTag ::= '<' TYPE_TAG_NAME TypeTagValue ('|' TYPE_TAG_MODIFIER_CONTENT)? '>'
// Examples:
// <email user@example.com>
// <phone +1234567890>
// <time 4pm | Z>
// <date 2024-07-26>
// <url https://my.domain.com/path>
// <zip 94103>
// <zip 25585-460 | BR>
```

### 5.2 Supported Type Tags (Semantic Interpretation)
The following type names are recognized by the RCL system for validation and potential transformation:

| Type         | Aliases | Example                                           | Notes |
|--------------|----------|---------------------------------------------------|-------|
| `email`      | -        | `<email user@domain.com>` | |
| `phone`      | `msisdn` | `<phone +1234567890>` | |
| `url`        | -        | `<url https://example.com>` | |
| `time`       | `t`      | `<time 10:00>`<br> `<time 4pm \| Z>`<br> `<t 23:59 \| UTC-3>`<br> `<t 09:15am>` | `Z` is a synonym for `UTC`.<br> Timezone defaults to `UTC` if not defined |
| `datetime`   | `date`, `dt` | `<date Jul 4th>`<br> `<date 2023-12-31T23:59:59Z>`<br> `<dt 2024-06-01 \| 15>` | Time defaults to `00:00:00 UTC` |
| `zipcode`    | `zip`    | `<zipcode 94103>`, `<zip 10001>`, `<zip 25585-460 \| BR>` | |
| `duration`   | `ttl`    | `<duration P1Y2M3DT4H5M6S>`, `<ttl 3600s>`, `<duration 2.5s>` | ISO 8601 duration format or simple seconds |

## 6. Data Types and Collections

### 6.1 Basic Types

#### 6.1.1 Text (Strings)
Text values can be defined in two ways:
1. **Double-quoted strings**: Enclosed in double quotes with standard escape sequences (e.g., `"Hello world"`). Single quotes are reserved for the `'s` accessor operator.
2. **Multi-line strings**: Starting with a `|` character followed by an indented block, with various whitespace handling options:
   - `|` - Clean text with single newline at end (most common)
   - `|-` - Clean text with no trailing newline (for concatenation)  
   - `+|` - Preserve leading space, single newline at end
   - `+|+` - Preserve all whitespace exactly

#### 6.1.2 Numbers
Numbers can be written without special syntax and support:
- Integer values: `123456`
- Decimal values: `123.45`
- Scientific notation: `1.23e5`
- Comma separators for readability: `123,456.78` (optional)

#### 6.1.3 Booleans
Boolean values have multiple aliases for improved readability:
- **True values**: `True`, `Yes`, `On`, `Enabled`, `Active`
- **False values**: `False`, `No`, `Off`, `Disabled`, `Inactive`

#### 6.1.4 Null Values
Nothingness (complete absence of value) can be represented using:
- `Null`
- `None` 
- `Void`

#### 6.1.5 Symbols
Symbols are special values that start with `:` and represent constants or enumeration values:
- Examples: `:start`, `:transactional`, `:promotional`, `:otp`
- Enumeration values from RCS specification are mapped to lowercase symbols
- Values ending with "_UNSPECIFIED" are mapped to `:unspecified`

### 6.2 Collections

#### 6.2.1 Lists

Lists are sequences of values that can be defined in two ways:

**1. Block Syntax** (indented with hyphens):
```rcl
phoneNumbers:
  - "+1234567890"
  - "+1234567891"
  - "+1234567892"
```

**2. Inline Syntax**:
```rcl
colors: ("red", "green", "blue")
numbers: (1, 2, 3, 4)
empty: ()
```

**Optional Parentheses**:

For inline lists with two or more items, the parentheses are optional

```rcl
colors: "red", "green", "blue"
numbers: 1, 2, 3, 4
mixed: "one", 2, "three"
```

**Design Rationale**: RCL uses parentheses `()` for inline lists instead of square brackets `[]` for several reasons:
- **Tuple semantics**: Parentheses align with the mathematical concept of tuples and ordered sequences
- **Function parameter consistency**: List syntax mirrors function parameter lists, creating conceptual unity (e.g., `processOrder(item1, item2, item3)` and `items: (item1, item2, item3)`)
- **English prose naturalness**: Parentheses are commonly used in English to enumerate items within text
- **RclScript compatibility**: This design supports future goals for the RclScript language where function calls and data structures share consistent syntax patterns

**Nested lists** (using parentheses in flow syntax):


```rcl
inline_list: ("Alice", "Bob"), ("Charlie", "David"), ("Eve", "Frank")
block_list:
  - ("Alice", "Bob")
  -
    - "Charlie"
    - "David"
  - "Eve", "Frank"

```

#### 6.2.2 Dictionaries (Maps/Objects)
Dictionaries are collections of key-value pairs defined using:

**1. Block Syntax** (indented key-value pairs):
```rcl
phoneNumbers:
  "John Doe": "+1234567890"
  "Jane Doe": "+1234567891"
  "Jim Doe": "+1234567892"
```

**2. Brace Syntax** (inline):
```rcl
person: {name: "John", age: 30, city: "New York"}
config: {debug: true, timeout: 5000}
empty: {}
```

**Important**: Dictionary keys are unique and NOT preceded by hyphens (unlike list items).

#### 6.2.3 Mapped Types
When creating lists of objects with consistent structure, mapped types avoid repetition:

**Syntax**:
```rcl
ListName list of (field1, <type field2>):
  - value1, value2
  - value3, value4
```

**Example**:
```rcl
phoneNumbers list of (label, <phone number>):
  - "John Doe", "+1234567890"
  - "Jane Doe", "+1234567891"
  - "Jim Doe", "+1234567892"
```

This transforms each tuple into an object with `label` and `number` properties, where `number` is processed as a phone type.

### 6.3 Emptiness vs. Nothingness
- **Null/None/Void**: Complete absence of value (`value is Null` → `true`, `value is Empty` → `true`)
- **Empty collections**: Still exist but contain no elements (`() is Null` → `false`, `() is Empty` → `true`)
- **Empty strings**: Still exist but contain no characters (`"" is Null` → `false`, `"" is Empty` → `true`)

## 7. Section Types and Structure

### 7.1 Required and Optional Sections

| Section Type     | Required? | Cardinality   | Reserved Name | Description |
|------------------|-----------|---------------|---------------|-------------|
| `agent`          | required  | one           | -             | Main agent definition |
| `agentDefaults`  | optional  | zero or one   | `Defaults`    | Default behaviors and settings |
| `agentConfig`    | optional  | zero or one   | `Config`      | Agent configuration properties |
| `flow`           | required  | at least one  | -             | Conversation flow definitions |
| `messages`       | required  | one           | `Messages`