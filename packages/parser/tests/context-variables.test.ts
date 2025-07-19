import { describe, expect, test } from 'bun:test';
import { AntlrRclParser } from '../src/parser';

// Helper function to parse RCL content
async function parseRcl(input: string) {
  const parser = new AntlrRclParser();
  await parser.initialize();
  const result = await parser.parse(input);

  if (result.success) {
    return {
      ast: result.value.ast,
      errors: result.value.diagnostics.filter((d) => d.severity === 'error'),
    };
  }

  return {
    ast: null,
    errors: [{ message: result.error.message }],
  };
}

describe('Context Variables (@variable syntax)', async () => {
  test('should parse simple context variable reference', async () => {
    const input = `
flow TestFlow
  on StateA
    @next
`;
    const result = await parseRcl(input);
    expect(result.errors).toHaveLength(0);
    expect(result.ast).toBeTruthy();
  });

  test('should parse context variable with property access', async () => {
    const input = `
flow TestFlow
  on StateA
    match @reply.text
      "Yes" -> StateB
      "No" -> StateC
`;
    const result = await parseRcl(input);
    expect(result.errors).toHaveLength(0);
    expect(result.ast).toBeTruthy();
  });

  test('should parse context variable in string interpolation', async () => {
    const input = `
messages Messages
  text Welcome "Hello #{@userName}!"
  text OrderConfirm "Your #{@size} #{@drink} is ready!"
`;
    const result = await parseRcl(input);
    expect(result.errors).toHaveLength(0);
    expect(result.ast).toBeTruthy();
  });

  test('should parse nested property access', async () => {
    const input = `
flow TestFlow
  on ProcessOrder
    match @order.item.type
      "coffee" -> PrepareCoffee
      "tea" -> PrepareTea
`;
    const result = await parseRcl(input);
    expect(result.errors).toHaveLength(0);
    expect(result.ast).toBeTruthy();
  });

  test('should parse context variable in with clause', async () => {
    const input = `
flow TestFlow
  on StateA
    match @reply.text
      "Small" -> StateB with size: "small", price: @prices.small
      "Large" -> StateB with size: "large", price: @prices.large
`;
    const result = await parseRcl(input);
    expect(result.errors).toHaveLength(0);
    expect(result.ast).toBeTruthy();
  });

  test('should parse the Invalid Option pattern from coffee-shop example', async () => {
    const input = `
flow OrderFlow
  on Invalid Option
    @next
    
  on Choose Size
    match @reply.text
      "Small" -> Choose Drink with size: "small"
      :default -> Invalid Option with property: "size", next: Choose Size
`;
    const result = await parseRcl(input);
    expect(result.errors).toHaveLength(0);
    expect(result.ast).toBeTruthy();
  });
});

describe('Context Variable Edge Cases', async () => {
  test('should handle context variables in various positions', async () => {
    const input = `
agent TestAgent
  displayName: "Test #{@env.name}"
  
flow TestFlow
  on StateA
    # As a direct state reference
    @fallbackState
    
  on StateB
    # In match expression - match values must be literals
    match @user.preference
      "option1" -> StateC
      "option2" -> StateD
      
  on StateC
    # In transition with parameters
    -> StateD with data: @currentData, user: @user.id
`;
    const result = await parseRcl(input);

    // Debug: print errors if any
    if (result.errors.length > 0) {
      console.log('Parsing errors:', result.errors);
    }

    expect(result.errors).toHaveLength(0);
    expect(result.ast).toBeTruthy();
  });

  test('should parse multiline content with context variables', async () => {
    const input = `
messages Messages
  text LongMessage """
    Thank you #{@user.name}!
    Your order of #{@order.quantity} #{@order.item} 
    will be delivered to #{@user.address}.
  """
`;
    const result = await parseRcl(input);
    expect(result.errors).toHaveLength(0);
    expect(result.ast).toBeTruthy();
  });
});
