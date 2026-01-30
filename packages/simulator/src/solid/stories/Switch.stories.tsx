import type { Meta, StoryObj } from '@storybook/react';
import { createSignal } from 'solid-js';
import { Switch } from '../src/components/ui/Switch';

const meta = {
  component: Switch,
  title: 'Solid/UI/Switch',
  argTypes: {
    isChecked: { control: 'boolean' },
    ariaLabel: { control: 'text' },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: (args) => {
    const [checked, setChecked] = createSignal(args.isChecked || false);

    return (
      <div class="p-8 flex items-center gap-4">
        <Switch
          isChecked={checked()}
          onChange={() => setChecked(!checked())}
          ariaLabel={args.ariaLabel || 'Toggle switch'}
        />
        <span>Switch is {checked() ? 'ON' : 'OFF'}</span>
      </div>
    );
  },
  args: {
    isChecked: false,
    ariaLabel: 'Toggle switch',
  },
};

export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = createSignal(true);

    return (
      <Switch
        isChecked={checked()}
        onChange={() => setChecked(!checked())}
        ariaLabel="Checked switch"
      />
    );
  },
};

export const Unchecked: Story = {
  render: () => {
    const [checked, setChecked] = createSignal(false);

    return (
      <Switch
        isChecked={checked()}
        onChange={() => setChecked(!checked())}
        ariaLabel="Unchecked switch"
      />
    );
  },
};
