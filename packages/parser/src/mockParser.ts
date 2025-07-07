import { RCLNode, RCLASTNode } from './astTypes';

/**
 * Mock parser for development when WASM file is not available
 * This provides basic parsing functionality for testing
 */
export class MockParser {
  parse(text: string): RCLASTNode {
    console.warn(
      'Using mock parser - for development only. Build WASM file for full functionality.',
    );

    // Create a basic AST structure
    const lines = text.split('\n');
    const children: RCLNode[] = [];

    let currentNode: RCLNode | null = null;
    let currentSection: RCLNode | null = null;
    let currentIndent = 0;
    let inConfigSection = false;
    let inMessagesSection = false;

    // Stack to track nested structures
    const nodeStack: { node: RCLNode; indent: number }[] = [];

    // Simple parsing logic
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const indent = line.length - line.trimStart().length;
      const trimmed = line.trim();

      if (!trimmed) continue;

      // Pop from stack if we've dedented
      while (nodeStack.length > 0 && indent <= nodeStack[nodeStack.length - 1].indent) {
        nodeStack.pop();
      }

      // Agent definition
      if (trimmed.startsWith('agent ')) {
        const agentName = trimmed.substring(6).trim();
        const agentNode: RCLNode = {
          type: 'agent_definition',
          text: trimmed,
          startPosition: { row: i, column: 0 },
          endPosition: { row: i, column: line.length },
          children: [
            // Add identifiers as children
            {
              type: 'identifier',
              text: 'agent',
              startPosition: { row: i, column: 0 },
              endPosition: { row: i, column: 5 },
              children: [],
              parent: null,
            },
            {
              type: 'identifier',
              text: agentName,
              startPosition: { row: i, column: 6 },
              endPosition: { row: i, column: 6 + agentName.length },
              children: [],
              parent: null,
            },
          ],
          parent: null,
        } as RCLNode;

        // Set parent references
        agentNode.children!.forEach((child) => (child.parent = agentNode));

        children.push(agentNode);
        currentNode = agentNode;
        nodeStack.push({ node: agentNode, indent });
        currentIndent = indent;
        inConfigSection = false;
        inMessagesSection = false;
      }
      // Config section
      else if (trimmed === 'config') {
        const configSection: RCLNode = {
          type: 'config_section',
          text: trimmed,
          startPosition: { row: i, column: indent },
          endPosition: { row: i, column: line.length },
          children: [],
          parent: currentNode,
        };
        if (currentNode) {
          currentNode.children!.push(configSection);
        }
        currentSection = configSection;
        nodeStack.push({ node: configSection, indent });
        inConfigSection = true;
      }
      // Messages section
      else if (trimmed === 'messages') {
        const messagesSection: RCLNode = {
          type: 'messages_section',
          text: trimmed,
          startPosition: { row: i, column: indent },
          endPosition: { row: i, column: line.length },
          children: [],
          parent: currentNode,
        };
        if (currentNode) {
          currentNode.children!.push(messagesSection);
        }
        currentSection = messagesSection;
        nodeStack.push({ node: messagesSection, indent });
        inMessagesSection = true;
      }
      // Flow section
      else if (trimmed.startsWith('flow ')) {
        const flowName = trimmed.substring(5).trim();
        const flowSection: RCLNode = {
          type: 'flow_section',
          text: trimmed,
          startPosition: { row: i, column: indent },
          endPosition: { row: i, column: line.length },
          children: [
            {
              type: 'identifier',
              text: 'flow',
              startPosition: { row: i, column: indent },
              endPosition: { row: i, column: indent + 4 },
              children: [],
              parent: null,
            },
            {
              type: 'identifier',
              text: flowName,
              startPosition: { row: i, column: indent + 5 },
              endPosition: { row: i, column: line.length },
              children: [],
              parent: null,
            },
          ],
          parent: currentNode,
        };

        // Set parent references
        flowSection.children!.forEach((child) => (child.parent = flowSection));

        if (currentNode) {
          currentNode.children!.push(flowSection);
        } else {
          children.push(flowSection);
        }
      }
      // Flow definition (standalone) - create both flow_definition and flow_section
      else if (trimmed.startsWith('flow ') && !inMessagesSection && !inConfigSection) {
        const flowName = trimmed.substring(5).trim();

        // Create a flow_section node (which the compiler expects)
        const flowSection: RCLNode = {
          type: 'flow_section',
          text: trimmed,
          startPosition: { row: i, column: 0 },
          endPosition: { row: i, column: line.length },
          children: [
            {
              type: 'identifier',
              text: 'flow',
              startPosition: { row: i, column: 0 },
              endPosition: { row: i, column: 4 },
              children: [],
              parent: null,
            },
            {
              type: 'identifier',
              text: flowName,
              startPosition: { row: i, column: 5 },
              endPosition: { row: i, column: 5 + flowName.length },
              children: [],
              parent: null,
            },
          ],
          parent: null,
        };

        // Set parent references
        flowSection.children!.forEach((child) => (child.parent = flowSection));

        children.push(flowSection);
        currentNode = flowSection;
        nodeStack.push({ node: flowSection, indent });
        currentIndent = indent;
      }
      // Flow rules
      else if (
        currentNode &&
        (currentNode.type === 'flow_body' || currentNode.type === 'flow_section') &&
        trimmed.includes('->')
      ) {
        const flowRule: RCLNode = {
          type: 'flow_rule',
          text: trimmed,
          startPosition: { row: i, column: indent },
          endPosition: { row: i, column: line.length },
          children: [],
          parent: currentNode,
        };

        // Parse the flow rule parts
        const parts = trimmed.split('->').map((p) => p.trim());
        if (parts.length >= 2) {
          // Source state
          const sourceState: RCLNode = {
            type: parts[0].startsWith(':') ? 'flow_state_ref' : 'identifier',
            text: parts[0],
            startPosition: { row: i, column: indent },
            endPosition: { row: i, column: indent + parts[0].length },
            children: [],
            parent: flowRule,
          };
          flowRule.children!.push(sourceState);

          // Handle multi-part transitions
          for (let j = 1; j < parts.length; j++) {
            const part = parts[j];
            if (part.startsWith('"') && part.endsWith('"')) {
              // Event
              const event: RCLNode = {
                type: 'string_literal',
                text: part,
                startPosition: { row: i, column: 0 },
                endPosition: { row: i, column: part.length },
                children: [],
                parent: flowRule,
              } as RCLNode;
              (event as any).value = part.slice(1, -1);
              flowRule.children!.push(event);
            } else if (part) {
              // Target state
              const targetState: RCLNode = {
                type: part.startsWith(':') ? 'flow_state_ref' : 'identifier',
                text: part,
                startPosition: { row: i, column: 0 },
                endPosition: { row: i, column: part.length },
                children: [],
                parent: flowRule,
              };
              flowRule.children!.push(targetState);
            }
          }
        }

        currentNode.children!.push(flowRule);
      }
      // Message definitions (text shortcut) in messages section
      else if (inMessagesSection && trimmed.startsWith('text ')) {
        const parts = trimmed.match(/text\s+(\w+)\s+"(.*)"/);
        if (parts) {
          const textShortcut: RCLNode = {
            type: 'text_shortcut',
            text: trimmed,
            startPosition: { row: i, column: indent },
            endPosition: { row: i, column: line.length },
            children: [
              {
                type: 'identifier',
                text: 'text',
                startPosition: { row: i, column: indent },
                endPosition: { row: i, column: indent + 4 },
                children: [],
                parent: null,
              },
              {
                type: 'identifier',
                text: parts[1],
                startPosition: { row: i, column: indent + 5 },
                endPosition: { row: i, column: indent + 5 + parts[1].length },
                children: [],
                parent: null,
              },
              {
                type: 'string',
                text: `"${parts[2]}"`,
                startPosition: { row: i, column: trimmed.indexOf('"') + indent },
                endPosition: { row: i, column: line.length },
                children: [],
                parent: null,
              },
            ],
            parent: currentSection,
          };

          // Set parent references
          textShortcut.children!.forEach((child) => (child.parent = textShortcut));

          if (currentSection) {
            currentSection.children!.push(textShortcut);
          }
        }
      }
      // Agent message in messages section
      else if (inMessagesSection && trimmed.startsWith('agentMessage ')) {
        const messageName = trimmed.substring(13).trim();
        const agentMessage: RCLNode = {
          type: 'agent_message',
          text: trimmed,
          startPosition: { row: i, column: indent },
          endPosition: { row: i, column: line.length },
          children: [
            {
              type: 'identifier',
              text: 'agentMessage',
              startPosition: { row: i, column: indent },
              endPosition: { row: i, column: indent + 12 },
              children: [],
              parent: null,
            },
            {
              type: 'identifier',
              text: messageName,
              startPosition: { row: i, column: indent + 13 },
              endPosition: { row: i, column: line.length },
              children: [],
              parent: null,
            },
          ],
          parent: currentSection,
        };

        // Set parent references
        agentMessage.children!.forEach((child) => (child.parent = agentMessage));

        if (currentSection) {
          currentSection.children!.push(agentMessage);
        }
      }
      // Message definitions (text shortcut) at root level
      else if (!inMessagesSection && trimmed.startsWith('text ')) {
        const parts = trimmed.match(/text\s+(\w+)\s+"(.*)"/);
        if (parts) {
          const textShortcut: RCLNode = {
            type: 'text_shortcut',
            text: trimmed,
            startPosition: { row: i, column: 0 },
            endPosition: { row: i, column: line.length },
            children: [
              {
                type: 'identifier',
                text: 'text',
                startPosition: { row: i, column: 0 },
                endPosition: { row: i, column: 4 },
                children: [],
                parent: null,
              },
              {
                type: 'identifier',
                text: parts[1],
                startPosition: { row: i, column: 5 },
                endPosition: { row: i, column: 5 + parts[1].length },
                children: [],
                parent: null,
              },
              {
                type: 'string',
                text: `"${parts[2]}"`,
                startPosition: { row: i, column: trimmed.indexOf('"') },
                endPosition: { row: i, column: line.length },
                children: [],
                parent: null,
              },
            ],
            parent: null,
          };

          // Set parent references
          textShortcut.children!.forEach((child) => (child.parent = textShortcut));

          children.push(textShortcut);
        }
      }
      // Regular message definition
      else if (trimmed.startsWith('message ')) {
        const messageName = trimmed.substring(8).trim();
        currentNode = {
          type: 'message_definition',
          text: trimmed,
          startPosition: { row: i, column: 0 },
          endPosition: { row: i, column: line.length },
          children: [],
          parent: null,
        } as RCLNode;
        (currentNode as any).name = messageName;
        children.push(currentNode);
        currentIndent = indent;
      }
      // Handle special config properties
      else if (inConfigSection && trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        const cleanKey = key.trim();

        // Determine property type based on key
        let propType = 'config_property';

        // Handle special property types
        if (cleanKey === 'phoneNumbers') {
          propType = 'phone_numbers_property';
        } else if (cleanKey === 'emails') {
          propType = 'emails_property';
        } else if (cleanKey === 'websites') {
          propType = 'websites_property';
        } else if (cleanKey === 'privacy') {
          propType = 'privacy_property';
        } else if (cleanKey === 'termsConditions') {
          propType = 'terms_conditions_property';
        } else if (cleanKey === 'billingConfig') {
          propType = 'billing_config_property';
        }

        const propNode: RCLNode = {
          type: propType,
          text: trimmed,
          startPosition: { row: i, column: indent },
          endPosition: { row: i, column: line.length },
          children: [],
          parent: currentSection,
        };

        if (currentSection) {
          currentSection.children!.push(propNode);
        }

        // For complex properties, push onto stack for nested parsing
        if (
          [
            'phone_numbers_property',
            'emails_property',
            'websites_property',
            'privacy_property',
            'terms_conditions_property',
            'billing_config_property',
          ].includes(propType)
        ) {
          nodeStack.push({ node: propNode, indent });
        }
      }
      // Handle nested properties (like entries in phoneNumbers, emails, etc.)
      else if (nodeStack.length > 0 && trimmed.startsWith('-')) {
        const parentNode = nodeStack[nodeStack.length - 1].node;

        let entryType = 'entry';
        if (parentNode.type === 'phone_numbers_property') {
          entryType = 'phone_entry';
        } else if (parentNode.type === 'emails_property') {
          entryType = 'email_entry';
        } else if (parentNode.type === 'websites_property') {
          entryType = 'web_entry';
        }

        const entryNode: RCLNode = {
          type: entryType,
          text: trimmed,
          startPosition: { row: i, column: indent },
          endPosition: { row: i, column: line.length },
          children: [],
          parent: parentNode,
        };

        parentNode.children!.push(entryNode);
        nodeStack.push({ node: entryNode, indent });
      }
      // Properties (displayName, phoneNumbers, etc.)
      else if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();

        // Determine where to attach the property
        let parentNode = currentNode;
        if (nodeStack.length > 0) {
          parentNode = nodeStack[nodeStack.length - 1].node;
        }

        const propNode: RCLNode = {
          type: 'property',
          text: trimmed,
          startPosition: { row: i, column: indent },
          endPosition: { row: i, column: line.length },
          children: [],
          parent: parentNode,
        } as RCLNode;
        (propNode as any).key = key.trim();
        (propNode as any).value = value;

        if (parentNode) {
          parentNode.children!.push(propNode);
        }
      }
      // Import statements
      else if (trimmed.startsWith('import ')) {
        children.push({
          type: 'import_statement',
          text: trimmed,
          startPosition: { row: i, column: 0 },
          endPosition: { row: i, column: line.length },
          children: [],
          parent: null,
        });
      }
    }

    const rootNode: RCLASTNode = {
      type: 'source_file',
      text: text,
      startPosition: { row: 0, column: 0 },
      endPosition: { row: lines.length - 1, column: lines[lines.length - 1]?.length || 0 },
      children,
      parent: null,
    } as RCLASTNode;

    // Set parent references
    const setParent = (node: RCLNode, parent: RCLNode | null) => {
      node.parent = parent;
      if (node.children) {
        node.children.forEach((child) => setParent(child, node));
      }
    };

    children.forEach((child) => setParent(child, rootNode));

    return rootNode;
  }
}
