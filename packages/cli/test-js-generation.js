#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function testJsGeneration() {
  console.log('Testing JavaScript code generation...\n');
  
  // Import the output generator
  const { OutputGenerator } = require('./dist/generators/outputGenerator');
  
  // Create test data
  const testOutput = {
    messages: {
      welcome: {
        contentMessage: {
          text: "Welcome to our service!",
          suggestions: [
            {
              reply: {
                text: "Get Started",
                postbackData: '{"action":"start","timestamp":1234567890}'
              }
            },
            {
              action: {
                text: "View Website",
                postbackData: '{"action":"openUrl","timestamp":1234567890}',
                openUrlAction: {
                  url: "https://example.com"
                }
              }
            }
          ]
        },
        messageTrafficType: "TRANSACTION"
      },
      confirmation: {
        contentMessage: {
          richCard: {
            standaloneCard: {
              cardOrientation: "VERTICAL",
              cardContent: {
                title: "Booking Confirmed",
                description: "Your trip has been booked successfully",
                suggestions: [
                  {
                    reply: {
                      text: "View Details",
                      postbackData: '{"action":"details"}'
                    }
                  }
                ]
              }
            }
          }
        },
        messageTrafficType: "TRANSACTION"
      }
    },
    flows: {
      MainFlow: {
        id: "MainFlow",
        initial: "start",
        states: {
          start: {
            on: {
              NEXT: "welcome"
            }
          },
          welcome: {
            entry: ["send_welcome_message"],
            on: {
              REPLY: "processing"
            }
          },
          processing: {
            on: {
              SUCCESS: "confirmation",
              ERROR: "error"
            }
          },
          confirmation: {
            entry: ["send_confirmation_message"],
            on: {
              NEXT: "end"
            }
          },
          error: {
            entry: ["send_error_message"],
            on: {
              RETRY: "welcome"
            }
          },
          end: {
            type: "final"
          }
        },
        context: {
          retryCount: 0
        }
      }
    },
    agent: {
      name: "TestAgent",
      displayName: "Test Service Agent",
      brandName: "Test Corp",
      rcsBusinessMessagingAgent: {
        description: "A test agent for RCS messaging",
        logoUri: "https://example.com/logo.png",
        color: "#0066CC",
        agentUseCase: "TRANSACTIONAL"
      },
      flows: ["MainFlow"],
      messages: ["welcome", "confirmation"]
    }
  };
  
  // Generate JavaScript output
  const generator = new OutputGenerator();
  const jsOutputPath = 'test-output.js';
  const jsonOutputPath = 'test-output-pretty.json';
  
  await generator.generate(testOutput, jsOutputPath, { format: 'js' });
  await generator.generate(testOutput, jsonOutputPath, { format: 'json', pretty: true });
  
  console.log('Generated files:');
  console.log('- test-output.js');
  console.log('- test-output-pretty.json\n');
  
  // Test the generated JavaScript
  console.log('Testing generated JavaScript module...\n');
  
  // Clear require cache
  delete require.cache[require.resolve(path.resolve(jsOutputPath))];
  
  // Import the generated module
  const generatedModule = require(path.resolve(jsOutputPath));
  
  // Test the exports
  console.log('Testing exports:');
  console.log('- messages:', Object.keys(generatedModule.messages));
  console.log('- flows:', Object.keys(generatedModule.flows));
  console.log('- agent name:', generatedModule.agent.name);
  console.log('- agent display name:', generatedModule.getAgentDisplayName());
  
  // Test utility functions
  console.log('\nTesting utility functions:');
  
  const welcomeMsg = generatedModule.getMessage('welcome');
  console.log('- getMessage("welcome"):', welcomeMsg ? 'Found' : 'Not found');
  
  const mainFlow = generatedModule.getFlow('MainFlow');
  console.log('- getFlow("MainFlow"):', mainFlow ? 'Found' : 'Not found');
  
  const messageIds = generatedModule.getMessageIds();
  console.log('- getMessageIds():', messageIds);
  
  const flowIds = generatedModule.getFlowIds();
  console.log('- getFlowIds():', flowIds);
  
  // Test validation
  console.log('\nTesting message validation:');
  const validationResult = generatedModule.validateMessage(welcomeMsg);
  console.log('- Welcome message validation:', validationResult);
  
  // Test postback data generation
  console.log('\nTesting postback data generation:');
  const postbackData = generatedModule.generatePostbackData('test_action', { userId: '123' });
  console.log('- Generated postback data:', postbackData);
  
  // Test XState machine creation
  console.log('\nTesting XState machine creation:');
  const machine = generatedModule.createMachine('MainFlow', { actions: { custom: () => {} } });
  console.log('- Machine created:', machine ? 'Success' : 'Failed');
  console.log('- Machine has custom actions:', !!machine?.actions);
  
  console.log('\n✅ JavaScript code generation test completed successfully!');
  
} 

testJsGeneration().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});