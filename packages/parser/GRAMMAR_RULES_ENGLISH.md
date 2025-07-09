# RCL Grammar Rules (English Description)

## File Structure
```
RCL File = (Import Statement)* + Agent Definition
```

## Import Rules
```
Import Statement = "import" + Import Path + (Optional Alias)
Import Path = IDENTIFIER + ("/" + IDENTIFIER)*
Optional Alias = "as" + IDENTIFIER

Examples:
- import Shared/Utils
- import Shared / Utils
- import My Brand / Common Flows / Support as Support Flow  
- import Utils / Message Templates as Sample One
```

**CRITICAL**: Both import path segments and aliases MUST be IDENTIFIERs (Title Case with spaces allowed between words).

## Agent Structure  
```
Agent Definition = "agent" + Title Case Identifier + Agent Body + "end"

Agent Body = 
  + displayName: String (REQUIRED)
  + brandName: String (OPTIONAL)  
  + Config Section (OPTIONAL)
  + Defaults Section (OPTIONAL)
  + Flow Section+ (ONE OR MORE - agents can have many flows)
  + Messages Section (REQUIRED)
```

## Flow Rules
```
Flow Section = "flow" + Title Case Identifier + Start Rule + Flow Rule* + "end"

Start Rule = :start + "->" + (Flow Target | Match Block)

Flow Rule = Message::Identifier + "->" + (Flow Target | Match Block)

Flow Target = (Message::Identifier | Flow::Identifier) + Optional With Clause

Match Block = "match" + Context Property Access + "..." + Match Case* + Default Case + "end"

Context Property Access = "@" + Attribute Key + ("'s" + Attribute Key)*

Match Case = (String | Number | Regex | Boolean) + "->" + Flow Target

Default Case = ":default" + "->" + Flow Target

With Clause = "with" + (Attribute Key + ":" + Value)+
```

## Messages Rules
```
Messages Section = "messages" + "Messages" + (Message Shortcut | Agent Message)+ + "end"

Message Shortcut = 
  + Text Shortcut
  + Rich Card Shortcut  
  + Carousel Shortcut
  + File Shortcut
  + Full Agent Message

Text Shortcut = ("transactional" | "promotional")? + "text" + IDENTIFIER + (Enhanced Simple Value | Embedded Value) + Suggestions Block?

Rich Card Shortcut = "richCard" + Enhanced Simple Value (title) + (Atom | Type Tag)* + Optional Description + Suggestions Block?

Carousel Shortcut = "carousel" + IDENTIFIER + Enhanced Simple Value (title) + Atom? + Rich Card Shortcut+ + "end"

File Shortcut = "file" + Enhanced Simple Value (caption) + Type Tag (file reference)

Agent Message = Traffic Type? + "message" + IDENTIFIER + Message Properties + "end"

Traffic Type = "transactional" | "promotional" | "authentication" | "transaction" | "promotion" | "serviceRequest" | "acknowledgement"

Suggestions Block = "suggestions" + Suggestion Shortcut+ + "end"

Suggestion Shortcut = Reply | Dial | Open URL | Share Location | View Location | Save Event
```

**Note**: Messages section requires AT LEAST ONE message or shortcut.

## Config & Defaults Rules
```
Config Section = "agentConfig" + "Config" + Config Property* + "end"

Defaults Section = "agentDefaults" + "Defaults" + Default Property* + "end"

Default Property = 
  + "fallbackMessage" + ":" + Value
  + "messageTrafficType" + ":" + Traffic Type Atom
  + "ttl" + ":" + Duration (String or Type Tag)  
  + "postbackData" + ":" + Embedded Code
  + "expressions" + ":" + "language" + ":" + Language Atom

Traffic Type Atom = :authentication | :transaction | :promotion | :serviceRequest | :acknowledgement

Language Atom = :js | :ts
```

## Identifier Rules
```
Title Case Identifier = [A-Z] + [A-Za-z0-9\-_]* + (Space + [A-Z] + [A-Za-z0-9\-_]*)*
  Examples: TravelBot, Customer Service Bot, API Gateway Manager

Attribute Key = [a-z] + [a-zA-Z0-9_]*  (lowerCamelCase)
  Examples: displayName, messageTrafficType, fallbackMessage
```

## Value Types
```
Simple Value = String | Number | Boolean | Null | Atom | Type Tag

Enhanced Simple Value = Simple Value | Multi-line String
  Used where both regular and multi-line strings are acceptable

Embedded Value = Enhanced Simple Value | Embedded Code

Value = Simple Value | Multi-line String | List | Dictionary | Type Tag | Embedded Code | Identifier Reference

Boolean = True | Yes | On | Enabled | Active | False | No | Off | Disabled | Inactive

Null = Null | None | Void

Atom = ":" + (identifier | quoted_string)
  Examples: :start, :transactional, :promotional, :otp, :"complex atom"

Multi-line String = ("|" | "|-" | "+|" | "+|+") + Content + "|" (on its own line)
  | = Clean text with single newline at end
  |- = Clean text with no trailing newline  
  +| = Preserve leading space, single newline at end
  +|+ = Preserve all whitespace exactly

Embedded Code = Single Line Code | Multi-line Code Block
Single Line Code = "$" + Language? + ">" + Code Content  
Multi-line Code Block = "$" + Language? + ">>>" + Code Content + "<$" (on its own line)
Language = "js" | "ts" (optional, defaults to Defaults.expressions.language)

Type Tag = "<" + Type Name + Type Value + ("|" + Modifier)? + ">"
  
Supported Type Tags:
  - email (e.g., <email user@domain.com>)
  - phone | msisdn (e.g., <phone +1234567890>)
  - url (e.g., <url https://example.com>)
  - time | t (e.g., <time 4pm | Z>, <t 09:15am>)
  - datetime | date | dt (e.g., <date 2024-07-26>, <dt Jul 4th>)
  - zipcode | zip (e.g., <zip 94103>, <zip 25585-460 | BR>)
  - duration | ttl (e.g., <duration 3600s>, <ttl P1Y2M3DT4H5M6S>)
```

## Block Delimiters
```
All blocks use explicit "end" keywords:
- Agent Definition: "end"
- Flow Section: "end" 
- Messages Section: "end"
- Config Section: "end"
- Defaults Section: "end"
- Match Block: "end"
- Suggestions Block: "end"
- Carousel: "end"
- Save Event: "end"

Special terminators:
- Multi-line String: "|" on its own line
- Embedded Code Block: "<$" on its own line
```

## Key Findings from Specification:

1. **Import Alias**: ✅ YES - `as Support Flow` supports Title Case with spaces (IDENTIFIER type)
2. **Multiple Flows**: ✅ At least ONE flow is REQUIRED per agent
3. **Messages Content**: ✅ Messages section requires at least ONE message/shortcut 
4. **Identifier Pattern**: `/[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9]))*/` - spaces allowed between Title Case words
5. **Reserved Names**: Config, Defaults, Messages - can only be used in their specific contexts

## Additional Message Shortcuts

```
Full Agent Message = Traffic Type? + "message" + IDENTIFIER + Message Property* + "end"

Message Property = 
  + "text" + ":" + Enhanced Simple Value
  + "contentInfo" + ":" + Content Info Block
  + "richCard" + ":" + Rich Card Block
  + "file" + ":" + File Block
  + "ttl" + ":" + Duration
  + Other standard properties...
```

## Message Traffic Types (from RCS specification)
```
Traffic Types:
  - AUTHENTICATION - Messages used for user authentication (OTP, verification codes)
  - TRANSACTION - Transactional messages (order confirmations, shipping updates)
  - PROMOTION - Promotional messages (marketing, offers)
  - SERVICEREQUEST - Service-related messages (support, inquiries)
  - ACKNOWLEDGEMENT - Acknowledgement messages (receipt confirmations)
  - MESSAGE_TRAFFIC_TYPE_UNSPECIFIED - Default/unspecified type
```

## Grammar Implementation Status:

### ✅ CORRECT in index-stack-based.js:
1. **Flow Section** - Uses `repeat1` (at least one required)
2. **Identifier Regex** - Supports Title Case with spaces: `/[A-Z][A-Za-z0-9\-_]*(\s+[A-Z][A-Za-z0-9\-_]*)*/`
3. **Stack-based blocks** - Uses explicit 'end' keywords
4. **Agent definition** - Works correctly after recent fixes

### ❌ NEEDS FIXING in index-stack-based.js:
1. **Messages Section** - Currently uses `repeat` but spec requires `repeat1` (at least one message)
2. **Import Alias** - Currently: `field('alias', $.identifier)` - already supports spaces!

### ⚠️ OUTDATED FILES:
1. **grammar/agent.js** - Uses old indentation-based approach with `$._indent`/`$._dedent`
2. **grammar/agent.js** - Import rule doesn't match stack-based approach

## Summary:
The main grammar file (index-stack-based.js) is mostly correct. The import alias ALREADY supports spaces because `$.identifier` includes the full Title Case pattern. The only required fix is changing Messages section from `repeat` to `repeat1`.