import { beforeAll, describe, expect, it } from 'vitest';
import { RCLCompiler } from '../src/compiler';
import { CompilationPipeline } from '../src/pipeline/compilationPipeline';
import { ParseStage, TransformStage, ValidateStage } from '../src/stages';

describe('Semantic Validation', () => {
  let compiler: RCLCompiler;

  beforeAll(() => {
    // Set up compiler with pipeline
    const pipeline = new CompilationPipeline();
    pipeline.addStage(new ParseStage());
    pipeline.addStage(new ValidateStage());
    pipeline.addStage(new TransformStage());

    compiler = new RCLCompiler(pipeline);
  });

  describe('Context Variable Requirements', () => {
    it('should parse context variables without syntax errors', async () => {
      const input = `
agent TestAgent
  displayName: "Test Agent"
  
flow MainFlow
  start: Welcome
  
  on Welcome
    match @reply.text
      "Yes" -> ProcessState
      "No" -> InvalidOption with next: Welcome
      
  on InvalidOption
    @next
    
  on ProcessState
    match @reply.text
      "Done" -> End
      
  on End
    # End state
`;

      const result = await compiler.compile({
        source: input,
        uri: 'test://context-variables.rcl',
        options: {
          outputFormat: 'json',
        },
      });

      // Should parse without syntax errors (semantic validation may come later)
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it.skip('should validate that states using @next require next parameter', async () => {
      const input = `
agent TestAgent
  displayName: "Test Agent"
  
flow MainFlow
  start: Welcome
  
  on Welcome
    match @reply.text
      "Yes" -> ProcessState
      "No" -> InvalidOption
      
  on InvalidOption
    @next
    
  on ProcessState
    # This should cause an error - using InvalidOption without 'next' parameter
    match @reply.text
      "Retry" -> InvalidOption
      "Done" -> End
      
  on End
    # End state
`;

      const result = await compiler.compile({
        source: input,
        uri: 'test://semantic-test.rcl',
        options: {
          outputFormat: 'json',
        },
      });

      // Should have validation error about missing 'next' parameter
      expect(result.diagnostics).toBeDefined();
      const errors = result.diagnostics?.filter((d) => d.severity === 'error') || [];
      expect(errors.length).toBeGreaterThan(0);

      const missingNextError = errors.find(
        (e) =>
          e.message.includes('next') &&
          (e.message.includes('required') || e.message.includes('missing')),
      );
      expect(missingNextError).toBeDefined();
    });

    it.skip('should accept states with required context variables when provided', async () => {
      const input = `
agent TestAgent
  displayName: "Test Agent"
  
flow MainFlow
  start: Welcome
  
  on Welcome
    match @reply.text
      "Yes" -> ProcessState
      "No" -> InvalidOption with next: Welcome
      
  on InvalidOption
    @next
    
  on ProcessState
    match @reply.text
      "Retry" -> InvalidOption with next: ProcessState
      "Done" -> End
      
  on End
    # End state
`;

      const result = await compiler.compile({
        source: input,
        uri: 'test://semantic-test.rcl',
        options: {
          outputFormat: 'json',
        },
      });

      // Should compile without errors
      const errors = result.diagnostics?.filter((d) => d.severity === 'error') || [];
      expect(errors).toHaveLength(0);
      expect(result.output).toBeDefined();
    });

    it.skip('should validate context variable usage in messages', async () => {
      const input = `
agent TestAgent
  displayName: "Test Agent"
  
flow MainFlow
  start: ShowMessage
  
  on ShowMessage
    # This message uses @userName but it's not provided
    message WelcomeUser
    -> End
    
  on End
    message Complete
    
messages Messages
  text WelcomeUser "Hello #{@userName}! Welcome to our service."
  text Complete "Thank you!"
`;

      const result = await compiler.compile({
        source: input,
        uri: 'test://semantic-test.rcl',
        options: {
          outputFormat: 'json',
        },
      });

      // Should have warning about undefined context variable
      const warnings = result.diagnostics?.filter((d) => d.severity === 'warning') || [];
      const contextVarWarning = warnings.find(
        (w) => w.message.includes('@userName') || w.message.includes('context variable'),
      );

      // Note: This might be a warning rather than error depending on implementation
      expect(result.output).toBeDefined(); // Should still compile
    });

    it.skip('should track context variables through flow transitions', async () => {
      const input = `
agent CoffeeShop
  displayName: "Coffee Shop"
  
flow OrderFlow
  start: Welcome
  
  on Welcome
    match @reply.text
      "Order" -> ChooseSize
      
  on ChooseSize
    match @reply.text
      "Small" -> ChooseDrink with size: "small", price: 3.50
      "Large" -> ChooseDrink with size: "large", price: 5.50
      :default -> InvalidOption with property: "size", next: ChooseSize
      
  on ChooseDrink
    # Should have access to @size and @price from previous state
    match @reply.text
      "Espresso" -> Confirm with drink: "espresso"
      "Latte" -> Confirm with drink: "latte"
      :default -> InvalidOption with property: "drink", next: ChooseDrink
      
  on InvalidOption
    # Uses @property and @next from context
    message InvalidMessage
    -> @next
    
  on Confirm
    # Should have @size, @price, and @drink available
    message ConfirmOrder
    
messages Messages
  text InvalidMessage "Sorry, '#{@reply.text}' is not a valid #{@property}. Please try again."
  text ConfirmOrder "Your #{@size} #{@drink} costs $#{@price}. Confirm?"
`;

      const result = await compiler.compile({
        source: input,
        uri: 'test://semantic-test.rcl',
        options: {
          outputFormat: 'json',
        },
      });

      // Should compile successfully as context flows through states
      const errors = result.diagnostics?.filter((d) => d.severity === 'error') || [];
      expect(errors).toHaveLength(0);
      expect(result.output).toBeDefined();
    });
  });

  describe('State Flow Validation', () => {
    it.skip('should validate that all referenced states exist', async () => {
      const input = `
agent TestAgent
  displayName: "Test Agent"
  
flow MainFlow
  start: Welcome
  
  on Welcome
    match @reply.text
      "Yes" -> NonExistentState  # This state doesn't exist
      "No" -> End
      
  on End
    # End state
`;

      const result = await compiler.compile({
        source: input,
        uri: 'test://semantic-test.rcl',
        options: {
          outputFormat: 'json',
        },
      });

      const errors = result.diagnostics?.filter((d) => d.severity === 'error') || [];
      const stateNotFoundError = errors.find(
        (e) =>
          e.message.includes('NonExistentState') ||
          e.message.includes('not found') ||
          e.message.includes('undefined'),
      );
      expect(stateNotFoundError).toBeDefined();
    });

    it.skip('should validate message references', async () => {
      const input = `
agent TestAgent
  displayName: "Test Agent"
  
flow MainFlow
  start: Welcome
  
  on Welcome
    message NonExistentMessage  # This message doesn't exist
    
messages Messages
  text Welcome "Welcome!"
`;

      const result = await compiler.compile({
        source: input,
        uri: 'test://semantic-test.rcl',
        options: {
          outputFormat: 'json',
        },
      });

      const errors = result.diagnostics?.filter((d) => d.severity === 'error') || [];
      const messageNotFoundError = errors.find(
        (e) =>
          e.message.includes('NonExistentMessage') ||
          e.message.includes('not found') ||
          e.message.includes('undefined'),
      );
      expect(messageNotFoundError).toBeDefined();
    });
  });
});
