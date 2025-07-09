# Stack-Based RCL Grammar Design (No External Scanner)

## Overview

This design eliminates the need for an external scanner by using explicit keywords and markers to delimit blocks instead of relying on Python-like indentation tokens (INDENT/DEDENT).

## Key Changes

### 1. Block Delimiters
- All blocks that previously used INDENT/DEDENT will use explicit delimiters
- Consistent use of `end` keyword to close blocks
- Multi-line strings end with `|`
- Embedded code blocks end with `<$`

### 2. Grammar Structure

#### Agent Definition
```ebnf
agent_definition ::= 
  'agent' IDENTIFIER _newline
  agent_body
  'end'

agent_body ::= 
  'displayName' ':' string _newline
  ('brandName' ':' string _newline)?
  config_section?
  defaults_section?
  flow_section+
  messages_section
```

#### Section Structure
```ebnf
config_section ::=
  'agentConfig' 'Config' _newline
  property_list
  'end'

defaults_section ::=
  'agentDefaults' 'Defaults' _newline
  property_list  
  'end'

flow_section ::=
  'flow' IDENTIFIER _newline
  flow_rule*
  'end'

messages_section ::=
  'messages' 'Messages' _newline
  (agent_message | message_shortcut)+
  'end'
```

#### Multi-line Strings
```ebnf
multiline_string ::=
  multiline_marker _newline
  string_content
  '|'

multiline_marker ::= '|' | '|-' | '+|' | '+|+'
string_content ::= /[^|]*(?:\|(?!\s*$)[^|]*)*/  // Match until line with only |
```

#### Embedded Code Blocks
```ebnf
embedded_code_block ::=
  multi_line_expression_start _newline
  code_content
  '<$'

multi_line_expression_start ::= '$' ('js' | 'ts')? '>>>'
code_content ::= /[^<]*(?:<(?!\$)[^<]*)*/  // Match until <$
```

#### When Blocks (Already stack-based)
```ebnf
when_block ::=
  'when' '@' identifier ("'s" identifier)* 'is' '...' _newline
  when_case+
  'end'
```

#### Suggestions Block
```ebnf
suggestions ::=
  'suggestions' _newline
  suggestion_item+
  'end'

suggestion_item ::=
  'reply' string string? _newline
  | 'action' _newline action_content 'end'
```

### 3. Property Lists
```ebnf
property_list ::= property_assignment*

property_assignment ::= 
  attribute_key ':' value _newline
```

### 4. Lists and Collections
```ebnf
indented_list ::=
  'list' _newline
  list_item+
  'end'

list_item ::= '-' value _newline
```

## Implementation Strategy

1. **Remove External Scanner**: No need for scanner.c
2. **Update Lexical Rules**: Add explicit terminators
3. **Modify All Block Rules**: Replace INDENT/DEDENT with explicit delimiters
4. **Update Examples**: Convert all examples to new syntax
5. **Test Browser Compatibility**: Ensure WASM build works

## Benefits

1. **Browser Compatible**: Works with web-tree-sitter without external scanner
2. **Explicit Structure**: Clear block boundaries
3. **Easier Parsing**: No complex indentation tracking
4. **Better Error Recovery**: Explicit end markers help with error boundaries

## Example Conversion

### Before (with INDENT/DEDENT):
```rcl
agent CoffeeShop
  displayName: "Quick Coffee"
  
  flow MainFlow
    :start -> Welcome
    
    Welcome ->
      when @reply's text is ...
        "Order" -> ChooseSize
        "Menu" -> ShowMenu
      end

  messages Messages
    text Welcome "Welcome!"
      suggestions
        reply "Order Coffee"
        reply "View Menu"
```

### After (stack-based):
```rcl
agent CoffeeShop
  displayName: "Quick Coffee"
  
  flow MainFlow
    :start -> Welcome
    
    Welcome ->
      when @reply's text is ...
        "Order" -> ChooseSize
        "Menu" -> ShowMenu
      end
  end

  messages Messages
    text Welcome "Welcome!"
      suggestions
        reply "Order Coffee"
        reply "View Menu"
      end
  end
end
```