# RCL Language Examples

This document provides comprehensive examples demonstrating various features of the RCL (Rich Communication Language) and how to use the language toolchain.

## Table of Contents

1. [Basic Agent Structure](#basic-agent-structure)
2. [Message Types](#message-types)
3. [Flow Control](#flow-control)
4. [Context Variables](#context-variables)
5. [Advanced Features](#advanced-features)
6. [API Usage Examples](#api-usage-examples)
7. [Integration Examples](#integration-examples)

## Basic Agent Structure

### Minimal Agent

```rcl
agent GreetingBot
  displayName "Simple Greeting Bot"
  
  flow greeting
    start -> welcome
    
    welcome: "Hello! How can I help you today?"
      * -> end
      
  messages Messages
    # Messages will be auto-generated
```

### Complete Agent Structure

```rcl
agent CoffeeShopBot
  displayName "Coffee Shop Assistant"
  description "Helps customers order coffee and learn about our menu"
  version "1.0.0"
  
  flow ordering
    start -> welcome
    
    welcome: "Welcome to our coffee shop! What can I get you today?"
      "menu" -> show_menu
      "order *" -> take_order
      * -> help
      
    show_menu:
      text "Here's our menu:"
      richCard "Coffee Menu" medium
        title "Our Coffee Selection"
        description "Fresh roasted daily"
        media <image src="menu.jpg" alt="Coffee menu">
        suggestions ["Espresso", "Latte", "Cappuccino"]
      * -> take_order
      
    take_order: "Great choice! What size would you like?"
      context.drink = match[1]
      "small" -> confirm_order(size="small")
      "medium" -> confirm_order(size="medium") 
      "large" -> confirm_order(size="large")
      * -> ask_size_again
      
    confirm_order:
      text "Perfect! One {context.size} {context.drink}."
      text "That'll be ${prices[context.size]}. Please proceed to payment."
      * -> end
      
    ask_size_again: "I didn't catch that. What size: small, medium, or large?"
      "small" -> confirm_order(size="small")
      "medium" -> confirm_order(size="medium")
      "large" -> confirm_order(size="large")
      * -> ask_size_again
      
    help: "I can help you with our menu or take your order. Just say 'menu' or 'order [drink name]'."
      * -> welcome
      
  messages Messages
    welcome: "Welcome to our coffee shop! What can I get you today?"
    show_menu: "Here's our menu:"
    take_order: "Great choice! What size would you like?"
    confirm_order: "Perfect! One {context.size} {context.drink}."
```

## Message Types

### Text Messages

```rcl
agent TextExamples
  displayName "Text Message Examples"
  
  flow examples
    start -> simple_text
    
    simple_text: "This is a simple text message"
      * -> formatted_text
      
    formatted_text:
      text "This is a text block with formatting"
      text "You can have multiple text elements"
      * -> end
```

### Rich Cards

```rcl
agent RichCardExamples
  displayName "Rich Card Examples"
  
  flow examples
    start -> basic_card
    
    basic_card:
      richCard "Product Card" medium
        title "Coffee Beans"
        description "Premium Arabica beans"
        media <image src="beans.jpg" alt="Coffee beans">
        suggestions ["Buy Now", "Learn More"]
      * -> advanced_card
      
    advanced_card:
      richCard "Complex Card" large
        title "Special Offer"
        description "Limited time discount on all drinks"
        media <image src="offer.jpg" alt="Special offer">
        actions
          action "claim_discount" "Claim 20% Off"
          action "view_menu" "View Menu"
      * -> end
```

### Carousel Messages

```rcl
agent CarouselExamples
  displayName "Carousel Examples"
  
  flow examples
    start -> product_carousel
    
    product_carousel:
      carousel "Our Products"
        richCard "Espresso" small
          title "Espresso"
          description "Strong and bold"
          media <image src="espresso.jpg">
          
        richCard "Latte" small
          title "Latte"
          description "Smooth and creamy"
          media <image src="latte.jpg">
          
        richCard "Cappuccino" small
          title "Cappuccino" 
          description "Frothy perfection"
          media <image src="cappuccino.jpg">
      * -> end
```

### Suggestions and Quick Replies

```rcl
agent SuggestionExamples
  displayName "Suggestion Examples"
  
  flow examples
    start -> with_suggestions
    
    with_suggestions: "What would you like to know about?"
      suggestions ["Menu", "Hours", "Location", "Contact"]
      "menu" -> show_menu
      "hours" -> show_hours
      "location" -> show_location
      "contact" -> show_contact
      * -> help
```

## Flow Control

### Linear Flow

```rcl
agent LinearFlow
  displayName "Linear Flow Example"
  
  flow onboarding
    start -> step1
    
    step1: "Welcome! Let's get you set up. What's your name?"
      * -> step2
      
    step2: "Nice to meet you, {match}! What's your email?"
      context.name = match
      * -> step3
      
    step3: "Thanks! We'll send updates to {match}. You're all set!"
      context.email = match
      * -> end
```

### Branching Flow

```rcl
agent BranchingFlow
  displayName "Branching Flow Example"
  
  flow support
    start -> identify_issue
    
    identify_issue: "How can I help you today?"
      "technical*" -> technical_support
      "billing*" -> billing_support
      "general*" -> general_support
      * -> clarify_issue
      
    technical_support: "I'll connect you with our technical team."
      * -> end
      
    billing_support: "Let me help with your billing question."
      * -> end
      
    general_support: "I'm here to help with general questions."
      * -> end
      
    clarify_issue: "Could you be more specific about your issue?"
      * -> identify_issue
```

### Loops and Repetition

```rcl
agent LoopingFlow
  displayName "Looping Flow Example"
  
  flow quiz
    start -> ask_question
    
    ask_question: "What's 2 + 2?"
      "4" -> correct
      "four" -> correct
      * -> incorrect
      
    correct: "Correct! Want another question?"
      "yes" -> ask_question
      "no" -> end
      * -> ask_question
      
    incorrect: "Not quite right. The answer is 4. Try another?"
      "yes" -> ask_question
      "no" -> end
      * -> ask_question
```

## Context Variables

### Setting and Using Context

```rcl
agent ContextExample
  displayName "Context Variables Example"
  
  flow ordering
    start -> get_name
    
    get_name: "What's your name?"
      * -> get_drink
      
    get_drink: "Hi {match}! What drink would you like?"
      context.customer_name = match
      * -> get_size
      
    get_size: "What size {match}?"
      context.drink = match
      "small" -> confirm(size="small")
      "medium" -> confirm(size="medium") 
      "large" -> confirm(size="large")
      * -> get_size
      
    confirm: "Perfect! One {context.size} {context.drink} for {context.customer_name}."
      * -> end
```

### Complex Context Operations

```rcl
agent ComplexContext
  displayName "Complex Context Example"
  
  flow shopping
    start -> browse
    
    browse: "What would you like to browse?"
      context.cart = []
      context.total = 0
      "coffee" -> show_coffee
      "pastries" -> show_pastries
      "checkout" -> checkout
      * -> browse
      
    show_coffee: "Here's our coffee selection:"
      richCard "Add to Cart" medium
        title "Espresso - $3.50"
        actions
          action "add_espresso" "Add to Cart"
      "add espresso" -> add_item(item="espresso", price=3.50)
      "back" -> browse
      * -> show_coffee
      
    add_item:
      context.cart = context.cart + [context.item]
      context.total = context.total + context.price
      text "Added {context.item} to cart. Total: ${context.total}"
      * -> browse
      
    checkout: "Your total is ${context.total}. Proceed to payment?"
      "yes" -> payment
      "no" -> browse
      * -> checkout
```

## Advanced Features

### External Data Integration

```rcl
agent WeatherBot
  displayName "Weather Bot"
  
  flow weather
    start -> get_location
    
    get_location: "What city would you like weather for?"
      * -> show_weather
      
    show_weather:
      context.city = match
      richCard "Weather Info" large
        title "Weather in {context.city}"
        description <api url="weather.api" params="{city: context.city}">
        media <image src="weather-icon.png">
      * -> end
```

### Multi-language Support

```rcl
agent MultiLangBot
  displayName "Multi-language Bot"
  
  flow greeting
    start -> detect_language
    
    detect_language: "Hello / Hola / Bonjour"
      "english" -> english_flow
      "español" -> spanish_flow  
      "français" -> french_flow
      * -> detect_language
      
    english_flow: "Welcome! How can I help you?"
      * -> end
      
    spanish_flow: "¡Bienvenido! ¿Cómo puedo ayudarte?"
      * -> end
      
    french_flow: "Bienvenue! Comment puis-je vous aider?"
      * -> end
```

## API Usage Examples

### Compilation Pipeline

```typescript
import { Compiler } from '@rcs-lang/compiler';
import { AntlrRclParser } from '@rcs-lang/parser';

// Basic compilation
const compiler = new Compiler({
  parser: new AntlrRclParser()
});

const rclSource = `
agent SimpleBot
  displayName "Simple Bot"
  
  flow greeting
    start -> hello
    hello: "Hello!"
      * -> end
      
  messages Messages
`;

const result = await compiler.compile(rclSource);

if (result.success) {
  console.log('JavaScript output:', result.javascript);
  console.log('D2 diagram:', result.d2);
} else {
  console.error('Compilation errors:', result.errors);
}
```

### State Machine Execution

```typescript
import { ConversationalAgent } from '@rcs-lang/csm';

// Load compiled agent
const agentDefinition = require('./compiled-agent.js');
const agent = new ConversationalAgent(agentDefinition);

// Process messages
async function chatWithAgent() {
  let response = await agent.processMessage({
    type: 'text',
    content: 'hello'
  });
  
  console.log('Bot:', response.message);
  
  response = await agent.processMessage({
    type: 'text', 
    content: 'menu'
  });
  
  console.log('Bot:', response.message);
}

chatWithAgent();
```

### Language Service Integration

```typescript
import { 
  CompletionProvider,
  HoverProvider,
  DiagnosticsProvider 
} from '@rcs-lang/language-service';

// Setup language service
const completionProvider = new CompletionProvider();
const hoverProvider = new HoverProvider();
const diagnosticsProvider = new DiagnosticsProvider();

// Get completions at cursor position
const completions = await completionProvider.provideCompletions(
  document,
  { line: 5, character: 10 }
);

// Get hover information
const hover = await hoverProvider.provideHover(
  document,
  { line: 8, character: 15 }
);

// Get diagnostics
const diagnostics = await diagnosticsProvider.provideDiagnostics(document);
```

## Integration Examples

### Express.js Web Server

```javascript
const express = require('express');
const { ConversationalAgent } = require('@rcs-lang/csm');

const app = express();
app.use(express.json());

// Load compiled agent
const agentDefinition = require('./coffee-shop-bot.js');
const bot = new ConversationalAgent(agentDefinition);

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    const response = await bot.processMessage({
      type: 'text',
      content: message,
      sessionId
    });
    
    res.json({
      success: true,
      message: response.message,
      suggestions: response.suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('Chat server running on port 3000');
});
```

### React Component

```jsx
import React, { useState } from 'react';
import { ConversationalAgent } from '@rcs-lang/csm';

const ChatComponent = ({ agentDefinition }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [agent] = useState(() => new ConversationalAgent(agentDefinition));

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { sender: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Get bot response
      const response = await agent.processMessage({
        type: 'text',
        content: input
      });

      // Add bot message
      const botMessage = { 
        sender: 'bot', 
        content: response.message,
        suggestions: response.suggestions 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    }

    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.content}
            {msg.suggestions && (
              <div className="suggestions">
                {msg.suggestions.map((suggestion, i) => (
                  <button key={i} onClick={() => setInput(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;
```

These examples demonstrate the flexibility and power of the RCL language and its toolchain for building sophisticated conversational agents and integrating them into various applications.