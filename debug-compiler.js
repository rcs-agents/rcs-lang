import { RCLCompiler } from '@rcs-lang/compiler';

console.log('Creating compiler...');
const compiler = new RCLCompiler();

const source = `
agent TestAgent
  displayName: "Test Agent"

  flow MainFlow
    start: Welcome

    on Welcome
      match @reply.text
        "hello" -> Welcome
        :default -> Welcome

  messages Messages
    text Welcome "Hello there!"
      suggestions
        reply "hello"
`;

console.log('Compiling with new interface...');
try {
  const result1 = await compiler.compile({ source, uri: 'test.rcl' });
  console.log('New interface result:', {
    success: result1.success,
    hasValue: !!result1.value,
    valueKeys: result1.success ? Object.keys(result1.value) : 'N/A'
  });
  
  if (result1.success) {
    console.log('Compilation result:', {
      success: result1.value.success,
      hasOutput: !!result1.value.output,
      diagnostics: result1.value.diagnostics?.length || 0
    });
  }
} catch (error) {
  console.error('New interface error:', error.message);
}

console.log('Compiling with legacy interface...');
try {
  const result3 = await compiler.compile(source, 'test.rcl');
  console.log('Legacy interface result:', {
    success: result3.success,
    hasOutput: !!result3.output,
    hasJson: !!(result3.output && result3.output.json),
    hasJs: !!(result3.output && result3.output.js),
    errors: result3.errors?.length || 0
  });
} catch (error) {
  console.error('Legacy interface error:', error.message);
}