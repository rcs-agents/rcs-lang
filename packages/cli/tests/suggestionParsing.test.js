const { MessageNormalizer } = require('../dist/normalizers/messageNormalizer');

// Note: This test file uses mock AST structures instead of real parser
// No conditional import needed as it doesn't directly use tree-sitter

describe('Comprehensive Suggestion Parsing', () => {
  let normalizer;

  beforeEach(() => {
    normalizer = new MessageNormalizer();
  });

  const createSimpleMessage = (suggestions) => ({
    type: 'agent_message',
    children: [
      { type: 'identifier', text: 'agentMessage' },
      { type: 'identifier', text: 'TestMessage' },
      {
        type: 'content_message',
        children: [
          {
            type: 'text_property',
            children: [
              { type: 'string', text: '"Message with suggestions"' }
            ]
          },
          {
            type: 'suggestions',
            children: suggestions
          }
        ]
      }
    ]
  });

  describe('Reply Suggestions', () => {
    it('should parse basic reply suggestions', () => {
      const suggestion = {
        type: 'suggestion',
        children: [
          {
            type: 'reply',
            children: [
              {
                type: 'text_property',
                children: [
                  { type: 'string', text: '"Yes"' }
                ]
              },
              {
                type: 'postback_data_property',
                children: [
                  { type: 'string', text: '"confirm_yes"' }
                ]
              }
            ]
          }
        ]
      };

      const messages = normalizer.extractAndNormalize(createSimpleMessage([suggestion]));

      expect(messages.TestMessage.contentMessage.suggestions).toEqual([
        {
          reply: {
            text: 'Yes',
            postbackData: 'confirm_yes'
          }
        }
      ]);
    });

    it('should generate postback data when missing', () => {
      const suggestion = {
        type: 'suggestion',
        children: [
          {
            type: 'reply',
            children: [
              {
                type: 'text_property',
                children: [
                  { type: 'string', text: '"Auto Generated"' }
                ]
              }
            ]
          }
        ]
      };

      const messages = normalizer.extractAndNormalize(createSimpleMessage([suggestion]));

      expect(messages.TestMessage.contentMessage.suggestions[0].reply.text).toBe('Auto Generated');
      expect(messages.TestMessage.contentMessage.suggestions[0].reply.postbackData).toContain('Auto Generated');
    });

    it('should limit reply text to 25 characters', () => {
      const suggestion = {
        type: 'suggestion',
        children: [
          {
            type: 'reply',
            children: [
              {
                type: 'text_property',
                children: [
                  { type: 'string', text: '"This is a very long reply text that exceeds the character limit"' }
                ]
              }
            ]
          }
        ]
      };

      const messages = normalizer.extractAndNormalize(createSimpleMessage([suggestion]));

      expect(messages.TestMessage.contentMessage.suggestions[0].reply.text.length).toBeLessThanOrEqual(25);
    });
  });

  describe('Open URL Actions', () => {
    it('should parse open URL actions', () => {
      const suggestion = {
        type: 'suggestion',
        children: [
          {
            type: 'action',
            children: [
              {
                type: 'text_property',
                children: [
                  { type: 'string', text: '"Visit Website"' }
                ]
              },
              {
                type: 'postback_data_property',
                children: [
                  { type: 'string', text: '"visit_site"' }
                ]
              },
              {
                type: 'open_url_action',
                children: [
                  {
                    type: 'url_property',
                    children: [
                      { type: 'string', text: '"https://example.com"' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const messages = normalizer.extractAndNormalize(createSimpleMessage([suggestion]));

      expect(messages.TestMessage.contentMessage.suggestions).toEqual([
        {
          action: {
            text: 'Visit Website',
            postbackData: 'visit_site',
            openUrlAction: {
              url: 'https://example.com'
            }
          }
        }
      ]);
    });

    it('should parse open URL actions with fallback URL', () => {
      const suggestion = {
        type: 'suggestion',
        children: [
          {
            type: 'action',
            children: [
              {
                type: 'text_property',
                children: [
                  { type: 'string', text: '"Open App"' }
                ]
              },
              {
                type: 'fallback_url_property',
                children: [
                  { type: 'string', text: '"https://fallback.com"' }
                ]
              },
              {
                type: 'open_url_action',
                children: [
                  {
                    type: 'url_property',
                    children: [
                      { type: 'string', text: '"myapp://open"' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const messages = normalizer.extractAndNormalize(createSimpleMessage([suggestion]));

      expect(messages.TestMessage.contentMessage.suggestions[0].action.fallbackUrl).toBe('https://fallback.com');
      expect(messages.TestMessage.contentMessage.suggestions[0].action.openUrlAction.url).toBe('myapp://open');
    });
  });

  describe('Dial Actions', () => {
    it('should parse dial actions', () => {
      const suggestion = {
        type: 'suggestion',
        children: [
          {
            type: 'action',
            children: [
              {
                type: 'text_property',
                children: [
                  { type: 'string', text: '"Call Support"' }
                ]
              },
              {
                type: 'dial_action',
                children: [
                  {
                    type: 'phone_number_property',
                    children: [
                      { type: 'string', text: '"+1-800-555-0123"' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const messages = normalizer.extractAndNormalize(createSimpleMessage([suggestion]));

      expect(messages.TestMessage.contentMessage.suggestions).toEqual([
        {
          action: {
            text: 'Call Support',
            postbackData: expect.stringContaining('Call Support'),
            dialAction: {
              phoneNumber: '+1-800-555-0123'
            }
          }
        }
      ]);
    });
  });

  describe('View Location Actions', () => {
    it('should parse view location actions with query', () => {
      const suggestion = {
        type: 'suggestion',
        children: [
          {
            type: 'action',
            children: [
              {
                type: 'text_property',
                children: [
                  { type: 'string', text: '"Find Store"' }
                ]
              },
              {
                type: 'view_location_action',
                children: [
                  {
                    type: 'query_property',
                    children: [
                      { type: 'string', text: '"BMW dealership near me"' }
                    ]
                  },
                  {
                    type: 'label_property',
                    children: [
                      { type: 'string', text: '"Nearest BMW Store"' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const messages = normalizer.extractAndNormalize(createSimpleMessage([suggestion]));

      expect(messages.TestMessage.contentMessage.suggestions[0].action.viewLocationAction).toEqual({
        query: 'BMW dealership near me',
        label: 'Nearest BMW Store'
      });
    });
  });

  describe('Create Calendar Event Actions', () => {
    it('should parse calendar event actions', () => {
      const suggestion = {
        type: 'suggestion',
        children: [
          {
            type: 'action',
            children: [
              {
                type: 'text_property',
                children: [
                  { type: 'string', text: '"Schedule Service"' }
                ]
              },
              {
                type: 'create_calendar_event_action',
                children: [
                  {
                    type: 'start_time_property',
                    children: [
                      { type: 'string', text: '"2024-03-15T10:00:00Z"' }
                    ]
                  },
                  {
                    type: 'end_time_property',
                    children: [
                      { type: 'string', text: '"2024-03-15T11:00:00Z"' }
                    ]
                  },
                  {
                    type: 'title_property',
                    children: [
                      { type: 'string', text: '"BMW Service Appointment"' }
                    ]
                  },
                  {
                    type: 'description_property',
                    children: [
                      { type: 'string', text: '"Regular maintenance service"' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const messages = normalizer.extractAndNormalize(createSimpleMessage([suggestion]));

      expect(messages.TestMessage.contentMessage.suggestions[0].action.createCalendarEventAction).toEqual({
        startTime: '2024-03-15T10:00:00Z',
        endTime: '2024-03-15T11:00:00Z',
        title: 'BMW Service Appointment',
        description: 'Regular maintenance service'
      });
    });

    it('should reject incomplete calendar events', () => {
      const suggestion = {
        type: 'suggestion',
        children: [
          {
            type: 'action',
            children: [
              {
                type: 'text_property',
                children: [
                  { type: 'string', text: '"Schedule"' }
                ]
              },
              {
                type: 'create_calendar_event_action',
                children: [
                  {
                    type: 'title_property',
                    children: [
                      { type: 'string', text: '"Incomplete Event"' }
                    ]
                  }
                  // Missing required startTime and endTime
                ]
              }
            ]
          }
        ]
      };

      const messages = normalizer.extractAndNormalize(createSimpleMessage([suggestion]));

      // Should not have calendar action due to missing required fields
      expect(messages.TestMessage.contentMessage.suggestions[0].action.createCalendarEventAction).toBeUndefined();
    });
  });

  describe('Share Location Actions', () => {
    it('should parse share location actions', () => {
      const suggestion = {
        type: 'suggestion',
        children: [
          {
            type: 'action',
            children: [
              {
                type: 'text_property',
                children: [
                  { type: 'string', text: '"Share Location"' }
                ]
              },
              {
                type: 'share_location_action',
                children: []
              }
            ]
          }
        ]
      };

      const messages = normalizer.extractAndNormalize(createSimpleMessage([suggestion]));

      expect(messages.TestMessage.contentMessage.suggestions[0].action.shareLocationAction).toEqual({});
    });
  });

  describe('Suggestion Limits and Validation', () => {
    it('should limit to 11 suggestions maximum', () => {
      const suggestions = Array.from({ length: 15 }, (_, i) => ({
        type: 'suggestion',
        children: [
          {
            type: 'reply',
            children: [
              {
                type: 'text_property',
                children: [
                  { type: 'string', text: `"Option ${i + 1}"` }
                ]
              }
            ]
          }
        ]
      }));

      const messages = normalizer.extractAndNormalize(createSimpleMessage(suggestions));

      expect(messages.TestMessage.contentMessage.suggestions).toHaveLength(11);
    });

    it('should handle mixed reply and action suggestions', () => {
      const suggestions = [
        {
          type: 'suggestion',
          children: [
            {
              type: 'reply',
              children: [
                {
                  type: 'text_property',
                  children: [
                    { type: 'string', text: '"Yes"' }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'suggestion',
          children: [
            {
              type: 'action',
              children: [
                {
                  type: 'text_property',
                  children: [
                    { type: 'string', text: '"Call"' }
                  ]
                },
                {
                  type: 'dial_action',
                  children: [
                    {
                      type: 'phone_number_property',
                      children: [
                        { type: 'string', text: '"+1234567890"' }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];

      const messages = normalizer.extractAndNormalize(createSimpleMessage(suggestions));

      expect(messages.TestMessage.contentMessage.suggestions).toHaveLength(2);
      expect(messages.TestMessage.contentMessage.suggestions[0].reply).toBeDefined();
      expect(messages.TestMessage.contentMessage.suggestions[1].action).toBeDefined();
      expect(messages.TestMessage.contentMessage.suggestions[1].action.dialAction).toBeDefined();
    });

    it('should handle malformed suggestions gracefully', () => {
      const suggestions = [
        {
          type: 'suggestion',
          children: [
            {
              type: 'reply',
              children: [
                {
                  type: 'text_property',
                  children: [
                    { type: 'string', text: '"Valid Reply"' }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'suggestion',
          children: [] // Malformed - no reply or action
        },
        {
          type: 'suggestion',
          children: [
            {
              type: 'action',
              children: [] // Malformed - no text or action type
            }
          ]
        }
      ];

      const messages = normalizer.extractAndNormalize(createSimpleMessage(suggestions));

      // Should only include the valid suggestion
      expect(messages.TestMessage.contentMessage.suggestions).toHaveLength(1);
      expect(messages.TestMessage.contentMessage.suggestions[0].reply.text).toBe('Valid Reply');
    });
  });

  describe('Postback Data Generation', () => {
    it('should generate valid JSON postback data', () => {
      const suggestion = {
        type: 'suggestion',
        children: [
          {
            type: 'reply',
            children: [
              {
                type: 'text_property',
                children: [
                  { type: 'string', text: '"Test Reply"' }
                ]
              }
            ]
          }
        ]
      };

      const messages = normalizer.extractAndNormalize(createSimpleMessage([suggestion]));

      const postbackData = messages.TestMessage.contentMessage.suggestions[0].reply.postbackData;
      
      expect(postbackData.length).toBeLessThanOrEqual(2048);
      expect(() => JSON.parse(postbackData)).not.toThrow();
      
      const parsed = JSON.parse(postbackData);
      expect(parsed.action).toBe('reply');
      expect(parsed.text).toBe('Test Reply');
      expect(parsed.timestamp).toBeDefined();
    });

    it('should respect postback data length limits', () => {
      const longText = 'A'.repeat(100);
      const suggestion = {
        type: 'suggestion',
        children: [
          {
            type: 'reply',
            children: [
              {
                type: 'text_property',
                children: [
                  { type: 'string', text: `"${longText}"` }
                ]
              },
              {
                type: 'postback_data_property',
                children: [
                  { type: 'string', text: `"${'B'.repeat(3000)}"` }
                ]
              }
            ]
          }
        ]
      };

      const messages = normalizer.extractAndNormalize(createSimpleMessage([suggestion]));

      const postbackData = messages.TestMessage.contentMessage.suggestions[0].reply.postbackData;
      expect(postbackData.length).toBeLessThanOrEqual(2048);
    });
  });
});