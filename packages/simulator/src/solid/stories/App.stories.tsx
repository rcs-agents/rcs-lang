import type { Meta, StoryObj } from '@storybook/react';
import App from '../src/App';

const meta = {
  component: App,
  title: 'Solid/App',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
