/**
 * RBX Simulator Component Library
 *
 * To use custom fonts (SF Pro Display for iOS), import one of the stylesheets:
 *
 * CSS:
 *   import '@rbx/simulator/styles/rbx-simulator.css';
 *
 * SASS:
 *   @import '@rbx/simulator/styles/rbx-simulator';
 *
 * Note: Fonts are optional. Components will fallback to system fonts if not loaded.
 */

// Export all components from the library
export { BottomBar } from './components/bottom-bar/bottom-bar.js'
export { Chat } from './components/chat/chat.js'
export { Device } from './components/device/device.js'
// Message components
export { CardContent } from './components/messages/card-content.js'
export { StandaloneCard } from './components/messages/standalone-card.js'
export { Suggestions } from './components/messages/suggestions.js'
export { TextMessage } from './components/messages/text-message.js'
export { UserTextMessage } from './components/messages/user-text-message.js'
export { SimulatorApp } from './components/simulator-app/simulator-app.js'
export { SimulatorControls } from './components/simulator-controls/simulator-controls.js'

// Export types
export type * from './types/index.js'
