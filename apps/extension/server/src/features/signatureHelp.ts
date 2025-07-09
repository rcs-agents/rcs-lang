import type { RCLParser } from '@rcl/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import {
  MarkupKind,
  ParameterInformation,
  type Position,
  type SignatureHelp,
  type SignatureInformation,
} from 'vscode-languageserver/node';

interface PropertySignature {
  label: string;
  documentation: string;
  parameters: {
    label: string;
    documentation: string;
  }[];
}

export class SignatureHelpProvider {
  private signatures: Map<string, PropertySignature>;

  constructor(private parser: RCLParser) {
    this.signatures = this.initializeSignatures();
  }

  /**
   * Provide signature help at the given position
   */
  public async getSignatureHelp(
    document: TextDocument,
    position: Position,
  ): Promise<SignatureHelp | null> {
    const context = this.getContext(document, position);
    if (!context) {
      return null;
    }

    const signature = this.signatures.get(context.type);
    if (!signature) {
      return null;
    }

    const signatureInfo: SignatureInformation = {
      label: signature.label,
      documentation: {
        kind: MarkupKind.Markdown,
        value: signature.documentation,
      },
      parameters: signature.parameters.map((param) => ({
        label: param.label,
        documentation: {
          kind: MarkupKind.Markdown,
          value: param.documentation,
        },
      })),
    };

    return {
      signatures: [signatureInfo],
      activeSignature: 0,
      activeParameter: context.activeParameter,
    };
  }

  /**
   * Get the context at the cursor position
   */
  private getContext(
    document: TextDocument,
    position: Position,
  ): { type: string; activeParameter: number } | null {
    const line = document.getText({
      start: { line: position.line, character: 0 },
      end: position,
    });

    // Check for different contexts

    // Text message with suggestions
    if (line.match(/^\s*text\s+\w+\s+"[^"]*"\s*$/)) {
      // In suggestions context
      const nextLine =
        position.line + 1 < document.lineCount
          ? document.getText({
              start: { line: position.line + 1, character: 0 },
              end: { line: position.line + 1, character: 100 },
            })
          : '';

      if (
        nextLine.match(
          /^\s*(reply|openUrl|dial|viewLocation|requestLocation|shareLocation|calendar)/,
        )
      ) {
        return { type: 'suggestion', activeParameter: 0 };
      }
    }

    // Rich card properties
    if (line.match(/^\s*richCard\s+\w+/)) {
      const paramCount = (line.match(/:/g) || []).length;
      return { type: 'richCard', activeParameter: paramCount };
    }

    // Carousel card
    if (line.match(/^\s*carousel\s+\w+/)) {
      return { type: 'carousel', activeParameter: 0 };
    }

    // Agent properties
    if (line.match(/^\s*agent\s+\w+/)) {
      const paramCount = (line.match(/:/g) || []).length;
      return { type: 'agent', activeParameter: paramCount };
    }

    // Flow properties
    if (line.match(/^\s*flow\s+\w+/)) {
      const paramCount = (line.match(/:/g) || []).length;
      return { type: 'flow', activeParameter: paramCount };
    }

    // Transition conditions
    if (line.match(/\s+->\s+\w+\s+when\s*/)) {
      return { type: 'transition', activeParameter: 0 };
    }

    // Config properties
    if (line.match(/^\s*agentConfig\s+Config/)) {
      const paramCount = (line.match(/:/g) || []).length;
      return { type: 'config', activeParameter: paramCount };
    }

    return null;
  }

  /**
   * Initialize signature definitions
   */
  private initializeSignatures(): Map<string, PropertySignature> {
    const signatures = new Map<string, PropertySignature>();

    // Text message suggestions
    signatures.set('suggestion', {
      label: 'suggestions',
      documentation: 'Add interactive suggestions to a text message',
      parameters: [
        {
          label: 'reply',
          documentation: 'reply "Display Text" "postback_data" - Creates a quick reply button',
        },
        {
          label: 'openUrl',
          documentation: 'openUrl "Display Text" <url>"https://example.com" - Opens a URL',
        },
        {
          label: 'dial',
          documentation: 'dial "Display Text" <phoneNumber>"+1234567890" - Initiates a phone call',
        },
        {
          label: 'viewLocation',
          documentation:
            'viewLocation "Display Text" <latLong>"37.4220,-122.0841" <label>"Location Name" - Shows a location',
        },
        {
          label: 'requestLocation',
          documentation: 'requestLocation "Display Text" - Requests user\'s location',
        },
        {
          label: 'shareLocation',
          documentation:
            'shareLocation "Display Text" <latLong>"37.4220,-122.0841" <label>"Location Name" - Shares a location',
        },
        {
          label: 'calendar',
          documentation:
            'calendar "Display Text" <startTime>"2024-01-15T10:00:00Z" <endTime>"2024-01-15T11:00:00Z" <title>"Meeting Title" <description>"Meeting Description" - Creates calendar event',
        },
      ],
    });

    // Rich card properties
    signatures.set('richCard', {
      label: 'richCard properties',
      documentation: 'Configure a rich card message with media and actions',
      parameters: [
        {
          label: 'description',
          documentation: 'description: "Card description text" - Adds descriptive text to the card',
        },
        {
          label: 'media',
          documentation:
            'media: <url>"https://example.com/image.jpg" <height>TALL - Adds media content',
        },
        {
          label: 'suggestions',
          documentation: 'Add interactive buttons to the card (same as text message suggestions)',
        },
      ],
    });

    // Carousel properties
    signatures.set('carousel', {
      label: 'carousel',
      documentation: 'Create a carousel of rich cards',
      parameters: [
        {
          label: 'richCard',
          documentation: 'richCard cardId "Card Title" - Add a card to the carousel',
        },
        {
          label: 'width',
          documentation: 'width: SMALL|MEDIUM - Set carousel card width',
        },
      ],
    });

    // Agent properties
    signatures.set('agent', {
      label: 'agent properties',
      documentation: 'Configure agent settings and metadata',
      parameters: [
        {
          label: 'displayName',
          documentation: 'displayName: "Agent Display Name" - Required. The name shown to users',
        },
        {
          label: 'brandName',
          documentation: 'brandName: "Brand Name" - Optional. The brand this agent represents',
        },
        {
          label: 'agentConfig',
          documentation: 'agentConfig Config - Define agent configuration block',
        },
        {
          label: 'start',
          documentation: 'start: flowName - Set the initial flow',
        },
      ],
    });

    // Flow properties
    signatures.set('flow', {
      label: 'flow properties',
      documentation: 'Configure flow behavior and transitions',
      parameters: [
        {
          label: 'timeout',
          documentation: 'timeout: <duration>"30s" - Set flow timeout duration',
        },
        {
          label: 'enabled',
          documentation: 'enabled: true|false - Enable or disable the flow',
        },
      ],
    });

    // Transition conditions
    signatures.set('transition', {
      label: 'transition condition',
      documentation: 'Add conditions to state transitions',
      parameters: [
        {
          label: 'condition',
          documentation:
            'JavaScript expression that evaluates to true/false. Available: event, context',
        },
      ],
    });

    // Config properties
    signatures.set('config', {
      label: 'agentConfig properties',
      documentation: 'Configure RCS agent settings',
      parameters: [
        {
          label: 'description',
          documentation: 'description: "Agent description" - Detailed description of the agent',
        },
        {
          label: 'logoUri',
          documentation: 'logoUri: <url>"https://example.com/logo.png" - Agent logo URL',
        },
        {
          label: 'backgroundImageUri',
          documentation:
            'backgroundImageUri: <url>"https://example.com/bg.jpg" - Background image URL',
        },
        {
          label: 'color',
          documentation: 'color: "#RRGGBB" - Primary brand color in hex format',
        },
        {
          label: 'phone',
          documentation: 'phone: <phoneNumber>"+1234567890" - Contact phone number',
        },
        {
          label: 'email',
          documentation: 'email: <email>"support@example.com" - Contact email address',
        },
        {
          label: 'privacy',
          documentation: 'privacy: <url>"https://example.com/privacy" - Privacy policy URL',
        },
        {
          label: 'termsConditions',
          documentation:
            'termsConditions: <url>"https://example.com/terms" - Terms and conditions URL',
        },
      ],
    });

    return signatures;
  }
}
