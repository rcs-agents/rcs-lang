/**
 * Solid.js implementation of the RCS Simulator
 *
 * This module provides Solid.js components for simulating RCS messaging experiences.
 */

// Main App component
export { default as App } from './src/App';

// Phone components
export { default as Phone } from './src/components/emulator/phone/Phone';
export { default as Chat } from './src/components/emulator/phone/Chat';
export { default as Header } from './src/components/emulator/phone/Header';
export { default as StatusBar } from './src/components/emulator/phone/StatusBar';
export { default as BottomBar } from './src/components/emulator/phone/BottomBar';

// Message components
export { default as TextMessage } from './src/components/emulator/messages/Text';
export { default as UserTextMessage } from './src/components/emulator/messages/UserText';
export { default as StandaloneCard } from './src/components/emulator/messages/StandaloneCard';
export { default as CarouselCard } from './src/components/emulator/messages/CarouselCard';
export { default as CardContent } from './src/components/emulator/messages/CardContent';
export { default as ContentInfo } from './src/components/emulator/messages/ContentInfo';
export { Suggestions } from './src/components/emulator/messages/suggestions/Suggestions';

// UI components
export { default as Switch } from './src/components/ui/Switch';

// Utilities
export { cn } from './src/utils/cn';

// Types
export * from './src/types';
