import { VNode, h } from 'snabbdom';
import type { NodePropertyDefinition, PropertyFormData, RCLNode } from './types';

export class PropertyEditor {
  private node: RCLNode;
  private onUpdate: (data: PropertyFormData) => void;
  private formData: PropertyFormData;

  constructor(node: RCLNode, onUpdate: (data: PropertyFormData) => void) {
    this.node = node;
    this.onUpdate = onUpdate;
    this.formData = this.extractFormData(node);
  }

  /**
   * Extract form data from node
   */
  private extractFormData(node: RCLNode): PropertyFormData {
    const data: PropertyFormData = {
      label: node.data.label || '',
      type: node.type,
    };

    if (node.data.messageData) {
      const msg = node.data.messageData;
      data.messageTrafficType = msg.messageTrafficType;

      if (msg.ttl) data.ttl = msg.ttl;
      if (msg.expireTime) data.expireTime = msg.expireTime;

      if (msg.contentMessage) {
        const content = msg.contentMessage;

        if (content.text) {
          data.messageType = 'text';
          data.text = content.text;
        } else if (content.richCard?.standaloneCard) {
          data.messageType = 'richCard';
          const card = content.richCard.standaloneCard;
          data.cardTitle = card.cardContent?.title;
          data.cardDescription = card.cardContent?.description;
          data.cardOrientation = card.cardOrientation;
        } else if (content.richCard?.carouselCard) {
          data.messageType = 'carousel';
          data.cardWidth = content.richCard.carouselCard.cardWidth;
        } else if (content.uploadedRbmFile || content.contentInfo) {
          data.messageType = 'file';
          if (content.uploadedRbmFile) {
            data.fileName = content.uploadedRbmFile.fileName;
          } else if (content.contentInfo) {
            data.fileUrl = content.contentInfo.fileUrl;
          }
        }

        // Extract suggestions
        if (content.suggestions) {
          data.suggestions = content.suggestions
            .map((s: any) => {
              if (s.reply) {
                return {
                  type: 'reply' as const,
                  text: s.reply.text,
                  postbackData: s.reply.postbackData,
                };
              } else if (s.action) {
                const suggestion: any = {
                  type: 'action' as const,
                  text: s.action.text,
                  postbackData: s.action.postbackData,
                };

                // Determine action type
                if (s.action.dialAction) {
                  suggestion.actionType = 'dial';
                  suggestion.actionData = s.action.dialAction;
                } else if (s.action.openUrlAction) {
                  suggestion.actionType = 'openUrl';
                  suggestion.actionData = s.action.openUrlAction;
                }
                // ... other action types

                return suggestion;
              }
              return null;
            })
            .filter(Boolean);
        }
      }
    }

    return data;
  }

  /**
   * Create HTML form element
   */
  createFormElement(): HTMLElement {
    const form = document.createElement('form');
    form.className = 'property-form';
    form.onsubmit = (e) => {
      e.preventDefault();
      this.onUpdate(this.formData);
    };

    // Add form sections
    form.appendChild(this.createBasicPropertiesSection());

    if (['message', 'rich_card'].includes(this.node.type)) {
      form.appendChild(this.createMessagePropertiesSection());
      form.appendChild(this.createSuggestionsSection());
    }

    form.appendChild(this.createFormActions());

    return form;
  }

  /**
   * Create basic properties section
   */
  private createBasicPropertiesSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'form-section';

    const title = document.createElement('h4');
    title.textContent = 'Basic Properties';
    section.appendChild(title);

    // Label input
    const labelGroup = this.createFormGroup('Label', 'text', this.formData.label, (value) => {
      this.formData.label = value;
    });
    section.appendChild(labelGroup);

    // Type display (read-only)
    const typeGroup = document.createElement('div');
    typeGroup.className = 'form-group';
    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Type';
    const typeInput = document.createElement('input');
    typeInput.type = 'text';
    typeInput.value = this.node.type;
    typeInput.disabled = true;
    typeGroup.appendChild(typeLabel);
    typeGroup.appendChild(typeInput);
    section.appendChild(typeGroup);

    return section;
  }

  /**
   * Create message properties section
   */
  private createMessagePropertiesSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'form-section';

    const title = document.createElement('h4');
    title.textContent = 'Message Properties';
    section.appendChild(title);

    // Message type selector
    const messageTypeGroup = this.createSelectGroup(
      'Message Type',
      [
        { value: 'text', label: 'Text' },
        { value: 'richCard', label: 'Rich Card' },
        { value: 'carousel', label: 'Carousel' },
        { value: 'file', label: 'File' },
      ],
      this.formData.messageType || 'text',
      (value) => {
        this.formData.messageType = value as any;
        this.updateFormVisibility();
      },
    );
    section.appendChild(messageTypeGroup);

    // Text message fields
    if (this.formData.messageType === 'text') {
      const textGroup = this.createTextareaGroup(
        'Text (max 2048 chars)',
        this.formData.text || '',
        (value) => {
          this.formData.text = value;
        },
        2048,
      );
      section.appendChild(textGroup);
    }

    // Rich card fields
    if (this.formData.messageType === 'richCard') {
      const titleGroup = this.createFormGroup(
        'Title (max 200 chars)',
        'text',
        this.formData.cardTitle || '',
        (value) => {
          this.formData.cardTitle = value;
        },
        200,
      );
      section.appendChild(titleGroup);

      const descGroup = this.createTextareaGroup(
        'Description (max 2000 chars)',
        this.formData.cardDescription || '',
        (value) => {
          this.formData.cardDescription = value;
        },
        2000,
      );
      section.appendChild(descGroup);

      const orientationGroup = this.createSelectGroup(
        'Orientation',
        [
          { value: 'VERTICAL', label: 'Vertical' },
          { value: 'HORIZONTAL', label: 'Horizontal' },
        ],
        this.formData.cardOrientation || 'VERTICAL',
        (value) => {
          this.formData.cardOrientation = value as any;
        },
      );
      section.appendChild(orientationGroup);
    }

    // Traffic type
    const trafficTypeGroup = this.createSelectGroup(
      'Traffic Type',
      [
        { value: '', label: 'Select...' },
        { value: 'AUTHENTICATION', label: 'Authentication' },
        { value: 'TRANSACTION', label: 'Transaction' },
        { value: 'PROMOTION', label: 'Promotion' },
        { value: 'SERVICEREQUEST', label: 'Service Request' },
        { value: 'ACKNOWLEDGEMENT', label: 'Acknowledgement' },
      ],
      this.formData.messageTrafficType || '',
      (value) => {
        this.formData.messageTrafficType = value as any;
      },
    );
    section.appendChild(trafficTypeGroup);

    return section;
  }

  /**
   * Create suggestions section
   */
  private createSuggestionsSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'form-section';

    const header = document.createElement('div');
    header.className = 'section-header';
    const title = document.createElement('h4');
    title.textContent = `Suggestions (${this.formData.suggestions?.length || 0}/11)`;
    header.appendChild(title);

    if ((this.formData.suggestions?.length || 0) < 11) {
      const addBtn = document.createElement('button');
      addBtn.className = 'add-btn';
      addBtn.textContent = '+ Add';
      addBtn.onclick = (e) => {
        e.preventDefault();
        this.addSuggestion();
        this.refreshForm();
      };
      header.appendChild(addBtn);
    }

    section.appendChild(header);

    // Suggestions list
    const list = document.createElement('div');
    list.className = 'suggestions-list';

    this.formData.suggestions?.forEach((suggestion, index) => {
      list.appendChild(this.createSuggestionItem(suggestion, index));
    });

    section.appendChild(list);

    return section;
  }

  /**
   * Create suggestion item
   */
  private createSuggestionItem(suggestion: any, index: number): HTMLElement {
    const item = document.createElement('div');
    item.className = 'suggestion-item';

    // Header with type selector and remove button
    const header = document.createElement('div');
    header.className = 'suggestion-header';

    const typeSelect = document.createElement('select');
    typeSelect.value = suggestion.type;
    typeSelect.onchange = () => {
      suggestion.type = typeSelect.value as any;
    };
    ['reply', 'action'].forEach((type) => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      typeSelect.appendChild(option);
    });
    header.appendChild(typeSelect);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.onclick = (e) => {
      e.preventDefault();
      this.removeSuggestion(index);
      this.refreshForm();
    };
    header.appendChild(removeBtn);

    item.appendChild(header);

    // Text input
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = 'Text (max 25 chars)';
    textInput.maxLength = 25;
    textInput.value = suggestion.text || '';
    textInput.oninput = () => {
      suggestion.text = textInput.value;
    };
    item.appendChild(textInput);

    // Postback data input
    const postbackInput = document.createElement('input');
    postbackInput.type = 'text';
    postbackInput.placeholder = 'Postback data (max 2048 chars)';
    postbackInput.maxLength = 2048;
    postbackInput.value = suggestion.postbackData || '';
    postbackInput.oninput = () => {
      suggestion.postbackData = postbackInput.value;
    };
    item.appendChild(postbackInput);

    // Action type selector for actions
    if (suggestion.type === 'action') {
      const actionTypeSelect = document.createElement('select');
      actionTypeSelect.value = suggestion.actionType || '';
      actionTypeSelect.onchange = () => {
        suggestion.actionType = actionTypeSelect.value as any;
      };

      const actionTypes = [
        { value: '', label: 'Select action...' },
        { value: 'dial', label: 'Dial' },
        { value: 'openUrl', label: 'Open URL' },
        { value: 'viewLocation', label: 'View Location' },
        { value: 'createCalendarEvent', label: 'Create Calendar Event' },
        { value: 'shareLocation', label: 'Share Location' },
      ];

      actionTypes.forEach(({ value, label }) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        actionTypeSelect.appendChild(option);
      });

      item.appendChild(actionTypeSelect);
    }

    return item;
  }

  /**
   * Create form actions
   */
  private createFormActions(): HTMLElement {
    const actions = document.createElement('div');
    actions.className = 'form-actions';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.className = 'save-btn';
    saveBtn.textContent = 'Save';
    actions.appendChild(saveBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
      this.formData = this.extractFormData(this.node);
      this.refreshForm();
    };
    actions.appendChild(cancelBtn);

    return actions;
  }

  /**
   * Helper methods for creating form controls
   */
  private createFormGroup(
    label: string,
    type: string,
    value: string,
    onChange: (value: string) => void,
    maxLength?: number,
  ): HTMLElement {
    const group = document.createElement('div');
    group.className = 'form-group';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    group.appendChild(labelEl);

    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    if (maxLength) input.maxLength = maxLength;
    input.oninput = () => onChange(input.value);
    group.appendChild(input);

    if (maxLength) {
      const counter = document.createElement('div');
      counter.className = 'char-count';
      counter.textContent = `${value.length}/${maxLength}`;
      input.oninput = () => {
        onChange(input.value);
        counter.textContent = `${input.value.length}/${maxLength}`;
      };
      group.appendChild(counter);
    }

    return group;
  }

  private createTextareaGroup(
    label: string,
    value: string,
    onChange: (value: string) => void,
    maxLength?: number,
  ): HTMLElement {
    const group = document.createElement('div');
    group.className = 'form-group';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    group.appendChild(labelEl);

    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.rows = 4;
    if (maxLength) textarea.maxLength = maxLength;
    textarea.oninput = () => onChange(textarea.value);
    group.appendChild(textarea);

    if (maxLength) {
      const counter = document.createElement('div');
      counter.className = 'char-count';
      counter.textContent = `${value.length}/${maxLength}`;
      textarea.oninput = () => {
        onChange(textarea.value);
        counter.textContent = `${textarea.value.length}/${maxLength}`;
      };
      group.appendChild(counter);
    }

    return group;
  }

  private createSelectGroup(
    label: string,
    options: { value: string; label: string }[],
    value: string,
    onChange: (value: string) => void,
  ): HTMLElement {
    const group = document.createElement('div');
    group.className = 'form-group';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    group.appendChild(labelEl);

    const select = document.createElement('select');
    select.value = value;
    select.onchange = () => onChange(select.value);

    options.forEach(({ value, label }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });

    group.appendChild(select);

    return group;
  }

  /**
   * Add a new suggestion
   */
  private addSuggestion(): void {
    if (!this.formData.suggestions) {
      this.formData.suggestions = [];
    }

    this.formData.suggestions.push({
      type: 'reply',
      text: '',
      postbackData: '',
    });
  }

  /**
   * Remove a suggestion
   */
  private removeSuggestion(index: number): void {
    if (this.formData.suggestions) {
      this.formData.suggestions.splice(index, 1);
    }
  }

  /**
   * Update form visibility based on selections
   */
  private updateFormVisibility(): void {
    this.refreshForm();
  }

  /**
   * Refresh the form
   */
  private refreshForm(): void {
    const form = this.createFormElement();
    const parent = document.querySelector('.property-form')?.parentElement;
    if (parent) {
      parent.innerHTML = '';
      parent.appendChild(form);
    }
  }
}

/**
 * Property Manager for handling property editing
 */
export class PropertyManager {
  private currentEditor: PropertyEditor | null = null;
  private nodePropertyDefinitions: Map<string, NodePropertyDefinition[]> = new Map();

  constructor() {
    this.setupDefaultPropertyDefinitions();
  }

  private setupDefaultPropertyDefinitions(): void {
    // Message node properties
    this.nodePropertyDefinitions.set('message', [
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        required: true,
        defaultValue: 'Message',
      },
      {
        key: 'text',
        label: 'Message Text',
        type: 'textarea',
        required: true,
        defaultValue: '',
      },
      {
        key: 'messageType',
        label: 'Message Type',
        type: 'select',
        options: ['text', 'richCard', 'carousel'],
        defaultValue: 'text',
      },
    ]);

    // Rich card node properties
    this.nodePropertyDefinitions.set('rich_card', [
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        required: true,
        defaultValue: 'Rich Card',
      },
      {
        key: 'title',
        label: 'Card Title',
        type: 'text',
        required: true,
        defaultValue: '',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
        defaultValue: '',
      },
      {
        key: 'imageUrl',
        label: 'Image URL',
        type: 'text',
        required: false,
        defaultValue: '',
      },
      {
        key: 'height',
        label: 'Card Height',
        type: 'select',
        options: ['SHORT', 'MEDIUM', 'TALL'],
        defaultValue: 'MEDIUM',
      },
    ]);

    // Start/End node properties
    ['start', 'end'].forEach((nodeType) => {
      this.nodePropertyDefinitions.set(nodeType, [
        {
          key: 'label',
          label: 'Label',
          type: 'text',
          required: true,
          defaultValue: nodeType === 'start' ? 'Start' : 'End',
        },
      ]);
    });

    // Condition node properties
    this.nodePropertyDefinitions.set('condition', [
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        required: true,
        defaultValue: 'Condition',
      },
      {
        key: 'condition',
        label: 'Condition Expression',
        type: 'textarea',
        required: true,
        defaultValue: '',
      },
    ]);
  }

  public getPropertyDefinitions(nodeType: string): NodePropertyDefinition[] {
    return this.nodePropertyDefinitions.get(nodeType) || [];
  }

  /**
   * Create a property editor for a node
   */
  public createPropertyEditor(
    node: RCLNode,
    onChange: (data: PropertyFormData) => void,
  ): HTMLElement {
    this.currentEditor = new PropertyEditor(node, (data) => {
      // Convert PropertyFormData back to node update
      const updatedNode = this.applyFormDataToNode(node, data);
      onChange(data);
    });

    return this.currentEditor.createFormElement();
  }

  /**
   * Apply form data to node
   */
  private applyFormDataToNode(node: RCLNode, data: PropertyFormData): RCLNode {
    const updatedNode = { ...node };
    updatedNode.data = { ...node.data };

    // Update label
    updatedNode.data.label = data.label;

    // Update message data
    if (data.messageType) {
      if (!updatedNode.data.messageData) {
        updatedNode.data.messageData = {
          messageTrafficType: data.messageTrafficType,
          contentMessage: {},
        };
      }

      const messageData = updatedNode.data.messageData;
      messageData.messageTrafficType = data.messageTrafficType;

      // Clear existing content
      messageData.contentMessage = {};

      switch (data.messageType) {
        case 'text':
          messageData.contentMessage.text = data.text;
          break;

        case 'richCard':
          messageData.contentMessage.richCard = {
            standaloneCard: {
              cardOrientation: data.cardOrientation,
              cardContent: {
                title: data.cardTitle,
                description: data.cardDescription,
              },
            },
          };
          break;

        case 'carousel':
          messageData.contentMessage.richCard = {
            carouselCard: {
              cardWidth: data.cardWidth,
              cardContents: [],
            },
          };
          break;
      }

      // Add suggestions
      if (data.suggestions && data.suggestions.length > 0) {
        messageData.contentMessage.suggestions = data.suggestions.map((s) => {
          if (s.type === 'reply') {
            return {
              reply: {
                text: s.text,
                postbackData: s.postbackData,
              },
            };
          } else {
            const action: any = {
              text: s.text,
              postbackData: s.postbackData,
            };

            // Add specific action type
            switch (s.actionType) {
              case 'openUrl':
                action.openUrlAction = s.actionData || { url: '' };
                break;
              case 'dial':
                action.dialAction = s.actionData || { phoneNumber: '' };
                break;
              // ... other action types
            }

            return { action };
          }
        });
      }
    }

    return updatedNode;
  }

  /**
   * Close the current editor
   */
  closeEditor(): void {
    this.currentEditor = null;
  }
}
