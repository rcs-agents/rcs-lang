# The new RCL Language

- Simplified language AST
- Offloads work to the semantic analysis
- Will allow the construction of different agents in the future by replacing schemas
- For now, only supports RCS / Google's RBM agents, always using the same schemas

We are embracing the "data language" strategy and trying to separate syntax from the data and the semantic analysis. Whatever isn't defined in this document, remains the same as defined in the [rcl-formal-specification.md](./rcl-formal-specification.md)

## Syntax

NOTE: `[]` means optional

### Comments
- `#` single-line comments

### Basic Values
- **Strings**: `"hello"` or `"""multi-line"""`
- **Numbers**: `123`, `3.14`, `1.23e5`
- **Booleans**: `True`, `Yes`, `On`, `False`, `No`, `Off`
- **Null**: `Null`, `None`, `Void`
- **Atoms**: `:start`, `:transactional`, `:default`

### Type Tags
`<TYPE VALUE [| MODIFIER]>` - Examples:
- `<email user@example.com>`
- `<phone +1234567890>`
- `<time 4pm | UTC>`
- `<date 2024-07-26>`
- `<url https://example.com>`
- `<datetime +5m>` (relative time)

### Collections
**Lists**: 
- Inline: `(1, 2, 3)` - parentheses required for inline lists
- Block (indented): 
  ```
  - item1
  - item2
  ```

**Dictionaries**:
- Inline: `{key: value, key2: value2}`
- Block (indented):
  ```
  key: value
  key2: value2
  ```

### String Features
- `"""` triple-quoted strings with interpolation support
- `|` multi-line with whitespace control (terminated by line with only `|`):
  - `|` - clean text with single newline at end
  - `|-` - clean text with no trailing newline  
  - `+|` - preserve leading space, single newline at end
  - `+|+` - preserve all whitespace exactly
- `#{}` interpolation in triple-quoted strings for variables/values

### Embedded Code
- Single-line: `$js> console.log('hi')` or `$> expression`
- Multi-line:
  ```
  $js>>>
  function test() {
    return 42;
  }
  <$
  ```

### Spread Operator
`...ID` - Include all attributes from another section (works with imports)

### Tokens

- `PRIMITIVE_VALUE`: string, number, boolean, null, or atom
- `COMMON_NAME`: lowerCamelCase starting with lowercase letter
- `KV`: key-value pair `COMMON_NAME ':' VALUE`
- `ID`: Title Case with spaces allowed
- `PARAM_LIST`: comma-separated list of parameters
- `VAR`: `@variable` or `@object.property` (property access with `.`)

### Value: `(PRIMITIVE_VALUE | ID | VAR) + ['with' KV (',' + KV)*]`

In Rcl, any value can be contextualized via the `with` keyword, which attaches a "context" to the value.
A `Value` without a `with` keyword will still be "contextualized", but its `context` will be an empty `Map`.

```ts
type Atom<Label extends string> = Label & { kind: 'atom' }

type PrimitiveValue = boolean | number | string | null | Atom<string>

interface Value<TValue extends PrimitiveValue> {
    value: TValue;
    /**
     * this is pseudo code, TS does not allowing getting the name of types like this
     * We are just indicating we want the name of the type, which may not even be necessary
     * as the AST node in `value` may already contain it
     **/
    type: NameOfType<TValue>;
    context: Map<string, Value>
}
```

### Param: `VALUE | KV`

The matching of a `VALUE | KV` will only be a `Param` when it is part of parameter list.
When a `VALUE` (without a name) is matched in a param list, a `Param` is created with `name: null`.

`VALUE | KV`
```ts
interface Param {
    name: string | null;
    value: Value;
}
```

### Section: `TYPE + [ID] + [PARAM_LIST] + [INDENT (...ID | ATTRIBUTE | SECTION | MATCH)*]`

```ts
interface Section {
    type: string;
    id: string;
    args: Param[]
    attributes: Record<string, Value>
    children: Section[];
}
```

#### Implicit ID

When a section doesn't specify an ID after its type, the type name is title cased to generate the section id. This means that writing `agentConfig` is equivalent to `agentConfig Agent Config`

With this new definition for a `Section`, we can make the previous `Flow Rule` and `Shortcuts` simply `Sections`. A flow rule will be a Section of type `on` and a shortcut is a Section where the type is the shortcut name.

### Common Section Types (by convention, not enforced):

- `agent` - Agent definition
- `config` - Configuration settings
- `defaults` - Default values
- `flow` - Conversation flow
- `messages` - Message definitions
- `on` - Flow state (within flow sections)

### Match Operator and Match Clauses

**Match Operator**: `'match' + VALUE + INDENT + ...MATCH_CLAUSE`
**Match Clause**: `VALUE + '->' VALUE [with ]`

The `match` operator replaces the `when` conditional we had. It is less powerful on purpose to make the implementation of the first language version simpler.

**Interface:**

```ts
interface Clause<TCondition extends Value, TResult extends Value = Value> {
    /**
     * The value to be compared
     */
    condition: TCondition;
    /**
     * The 
     */
    action: Value<TValue>;
}

interface Match<TSubject extends Value> {
    subject: TSubject;
    clauses: Clause<Value, TResult>[];
}
```

### Semantics

- A file can contain imports and any number of sections at the top level
- Sections are generic - any lowercase identifier can be a section type
- All semantic validation (required sections, valid attributes, etc.) happens at a higher level
- The language is purely structural - it defines how to represent data, not what data is valid

### Indentation

- Uses Python-style indentation (no explicit block terminators)
- Indent with spaces (2 or 4 spaces recommended)
- Child content must be consistently indented relative to parent