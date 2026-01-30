import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './simulator-controls.js'

const meta: Meta = {
  title: 'Components/SimulatorControls',
  component: 'rbx-simulator-controls',
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    showLabels: { control: 'boolean' },
    showIcons: { control: 'boolean' },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    togglePosition: {
      control: 'select',
      options: ['left', 'right', 'middle'],
    },
    isPortrait: { control: 'boolean' },
    isLightMode: { control: 'boolean' },
    isAndroid: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    html`
    <rbx-simulator-controls
      .onOrientationChange=${(isPortrait: boolean) =>
        console.log('Orientation:', isPortrait ? 'Portrait' : 'Landscape')}
      .onThemeChange=${(isLight: boolean) => console.log('Theme:', isLight ? 'Light' : 'Dark')}
      .onPlatformChange=${(isAndroid: boolean) => console.log('Platform:', isAndroid ? 'Android' : 'iOS')}
    ></rbx-simulator-controls>
  `,
}

export const Horizontal_With_Icons_And_Labels: Story = {
  render: () =>
    html`
    <rbx-simulator-controls
      .orientation=${'horizontal'}
      .showLabels=${true}
      .showIcons=${true}
      .togglePosition=${'right'}
      .onOrientationChange=${(isPortrait: boolean) =>
        console.log('Orientation:', isPortrait ? 'Portrait' : 'Landscape')}
      .onThemeChange=${(isLight: boolean) => console.log('Theme:', isLight ? 'Light' : 'Dark')}
      .onPlatformChange=${(isAndroid: boolean) => console.log('Platform:', isAndroid ? 'Android' : 'iOS')}
    ></rbx-simulator-controls>
  `,
}

export const Horizontal_Labels_Left: Story = {
  render: () =>
    html`
    <rbx-simulator-controls
      .orientation=${'horizontal'}
      .showLabels=${true}
      .showIcons=${true}
      .togglePosition=${'left'}
      .onOrientationChange=${(isPortrait: boolean) =>
        console.log('Orientation:', isPortrait ? 'Portrait' : 'Landscape')}
      .onThemeChange=${(isLight: boolean) => console.log('Theme:', isLight ? 'Light' : 'Dark')}
      .onPlatformChange=${(isAndroid: boolean) => console.log('Platform:', isAndroid ? 'Android' : 'iOS')}
    ></rbx-simulator-controls>
  `,
}

export const Vertical_Layout: Story = {
  render: () =>
    html`
    <rbx-simulator-controls
      .orientation=${'vertical'}
      .showLabels=${true}
      .showIcons=${true}
      .togglePosition=${'right'}
      .onOrientationChange=${(isPortrait: boolean) =>
        console.log('Orientation:', isPortrait ? 'Portrait' : 'Landscape')}
      .onThemeChange=${(isLight: boolean) => console.log('Theme:', isLight ? 'Light' : 'Dark')}
      .onPlatformChange=${(isAndroid: boolean) => console.log('Platform:', isAndroid ? 'Android' : 'iOS')}
    ></rbx-simulator-controls>
  `,
}

export const Vertical_Labels_Left: Story = {
  render: () =>
    html`
    <rbx-simulator-controls
      .orientation=${'vertical'}
      .showLabels=${true}
      .showIcons=${true}
      .togglePosition=${'left'}
      .onOrientationChange=${(isPortrait: boolean) =>
        console.log('Orientation:', isPortrait ? 'Portrait' : 'Landscape')}
      .onThemeChange=${(isLight: boolean) => console.log('Theme:', isLight ? 'Light' : 'Dark')}
      .onPlatformChange=${(isAndroid: boolean) => console.log('Platform:', isAndroid ? 'Android' : 'iOS')}
    ></rbx-simulator-controls>
  `,
}

export const Middle_Toggle_Position: Story = {
  render: () =>
    html`
    <rbx-simulator-controls
      .orientation=${'horizontal'}
      .showLabels=${true}
      .showIcons=${true}
      .togglePosition=${'middle'}
      .onOrientationChange=${(isPortrait: boolean) =>
        console.log('Orientation:', isPortrait ? 'Portrait' : 'Landscape')}
      .onThemeChange=${(isLight: boolean) => console.log('Theme:', isLight ? 'Light' : 'Dark')}
      .onPlatformChange=${(isAndroid: boolean) => console.log('Platform:', isAndroid ? 'Android' : 'iOS')}
    ></rbx-simulator-controls>
  `,
}

export const Icons_Only: Story = {
  render: () =>
    html`
    <rbx-simulator-controls
      .orientation=${'horizontal'}
      .showLabels=${false}
      .showIcons=${true}
      .togglePosition=${'middle'}
      .onOrientationChange=${(isPortrait: boolean) =>
        console.log('Orientation:', isPortrait ? 'Portrait' : 'Landscape')}
      .onThemeChange=${(isLight: boolean) => console.log('Theme:', isLight ? 'Light' : 'Dark')}
      .onPlatformChange=${(isAndroid: boolean) => console.log('Platform:', isAndroid ? 'Android' : 'iOS')}
    ></rbx-simulator-controls>
  `,
}

export const Labels_Only: Story = {
  render: () =>
    html`
    <rbx-simulator-controls
      .orientation=${'horizontal'}
      .showLabels=${true}
      .showIcons=${false}
      .togglePosition=${'right'}
      .onOrientationChange=${(isPortrait: boolean) =>
        console.log('Orientation:', isPortrait ? 'Portrait' : 'Landscape')}
      .onThemeChange=${(isLight: boolean) => console.log('Theme:', isLight ? 'Light' : 'Dark')}
      .onPlatformChange=${(isAndroid: boolean) => console.log('Platform:', isAndroid ? 'Android' : 'iOS')}
    ></rbx-simulator-controls>
  `,
}

export const Labels_Only_Left: Story = {
  render: () =>
    html`
    <rbx-simulator-controls
      .orientation=${'horizontal'}
      .showLabels=${true}
      .showIcons=${false}
      .togglePosition=${'left'}
      .onOrientationChange=${(isPortrait: boolean) =>
        console.log('Orientation:', isPortrait ? 'Portrait' : 'Landscape')}
      .onThemeChange=${(isLight: boolean) => console.log('Theme:', isLight ? 'Light' : 'Dark')}
      .onPlatformChange=${(isAndroid: boolean) => console.log('Platform:', isAndroid ? 'Android' : 'iOS')}
    ></rbx-simulator-controls>
  `,
}

export const Minimal_No_Labels_No_Icons: Story = {
  render: () =>
    html`
    <rbx-simulator-controls
      .orientation=${'horizontal'}
      .showLabels=${false}
      .showIcons=${false}
      .togglePosition=${'middle'}
      .onOrientationChange=${(isPortrait: boolean) =>
        console.log('Orientation:', isPortrait ? 'Portrait' : 'Landscape')}
      .onThemeChange=${(isLight: boolean) => console.log('Theme:', isLight ? 'Light' : 'Dark')}
      .onPlatformChange=${(isAndroid: boolean) => console.log('Platform:', isAndroid ? 'Android' : 'iOS')}
    ></rbx-simulator-controls>
  `,
}

export const Vertical_Middle_Position: Story = {
  render: () =>
    html`
    <rbx-simulator-controls
      .orientation=${'vertical'}
      .showLabels=${false}
      .showIcons=${true}
      .togglePosition=${'middle'}
      .onOrientationChange=${(isPortrait: boolean) =>
        console.log('Orientation:', isPortrait ? 'Portrait' : 'Landscape')}
      .onThemeChange=${(isLight: boolean) => console.log('Theme:', isLight ? 'Light' : 'Dark')}
      .onPlatformChange=${(isAndroid: boolean) => console.log('Platform', isAndroid ? 'Android' : 'iOS')}
    ></rbx-simulator-controls>
  `,
}

export const Vertical_Middle_With_Labels: Story = {
  render: () =>
    html`
    <rbx-simulator-controls
      .orientation=${'vertical'}
      .showLabels=${true}
      .showIcons=${true}
      .togglePosition=${'middle'}
      .fixedWidthLabels=${true}
      .onOrientationChange=${(isPortrait: boolean) =>
        console.log('Orientation:', isPortrait ? 'Portrait' : 'Landscape')}
      .onThemeChange=${(isLight: boolean) => console.log('Theme:', isLight ? 'Light' : 'Dark')}
      .onPlatformChange=${(isAndroid: boolean) => console.log('Platform:', isAndroid ? 'Android' : 'iOS')}
    ></rbx-simulator-controls>
  `,
}

export const Interactive_Demo: Story = {
  render: () =>
    html`
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 2rem; background: #f3f4f6; border-radius: 1rem;">
      <h3 style="margin: 0; font-family: sans-serif;">Try Different Configurations</h3>
      
      <div>
        <h4 style="margin: 0 0 0.5rem 0; font-family: sans-serif; color: #6b7280;">Horizontal - Middle Position</h4>
        <rbx-simulator-controls
          .orientation=${'horizontal'}
          .showLabels=${true}
          .showIcons=${true}
          .togglePosition=${'middle'}
        ></rbx-simulator-controls>
      </div>

      <div>
        <h4 style="margin: 0 0 0.5rem 0; font-family: sans-serif; color: #6b7280;">Horizontal - Right Position</h4>
        <rbx-simulator-controls
          .orientation=${'horizontal'}
          .showLabels=${true}
          .showIcons=${true}
          .togglePosition=${'right'}
        ></rbx-simulator-controls>
      </div>

      <div>
        <h4 style="margin: 0 0 0.5rem 0; font-family: sans-serif; color: #6b7280;">Vertical - Left Position</h4>
        <rbx-simulator-controls
          .orientation=${'vertical'}
          .showLabels=${true}
          .showIcons=${true}
          .togglePosition=${'left'}
        ></rbx-simulator-controls>
      </div>
    </div>
  `,
}
