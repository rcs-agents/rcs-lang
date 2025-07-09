import * as monaco from 'monaco-editor';

// Simple test to see if the IDE loads
console.log('IDE Test: Starting...');

// Create a simple editor
const container = document.getElementById('editor-container');
if (container) {
  const editor = monaco.editor.create(container, {
    value: '// RCL IDE is loading...\n// If you see this, Monaco is working!',
    language: 'javascript',
    theme: 'vs-dark',
  });

  console.log('IDE Test: Monaco editor created successfully');
} else {
  console.error('IDE Test: No editor container found');
  document.body.innerHTML =
    '<div style="padding: 20px; color: red;">Error: No editor container found in HTML</div>';
}
