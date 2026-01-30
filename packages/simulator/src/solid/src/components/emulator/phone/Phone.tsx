import { createSignal, createEffect, For, Show } from 'solid-js';
import { cn } from '../../../utils/cn';
import { Thread } from '../../../types';
import { BottomBar } from './BottomBar'
import { StatusBar } from './StatusBar'
import { Chat } from './Chat'
import { Header } from './Header';

// Props interface for the Phone component
interface PhoneProps {
  agent: {
    iconUrl: string
    brandName: string
  }
  isPortrait: boolean;
  isDarkMode: boolean;
  isAndroid: boolean;
  thread: Thread;
  onSendMessage: (payload: any) => void; // Add function to send messages
}

const scale = 1;
const resolutions = {
  // iPhone 16: 460 PPI https://www.appmysite.com/blog/the-complete-guide-to-iphone-screen-resolutions-and-sizes/
  iOS: {
    portrait: { width: 393 * scale, height: 852 * scale },
    landscape: { width: 852 * scale, height: 393 * scale }
  },
  // Pixel 9: 422 PPI | 20:9 aspect ratio. 1080 W x 2424 H
  android: {
    // portrait: { width: 360 * scale, height: 808 * scale },
    // landscape: { width: 808, height: 360 }
    // HACK: Force dimensions to be the same on iOS and Android
    portrait: { width: 393 * scale, height: 852 * scale },
    landscape: { width: 852 * scale, height: 393 * scale }
  }
}

// This component renders the mobile phone frame and its internal screen content.
// It handles its own rotation and ensures the content within remains upright.
export const Phone = (props: PhoneProps) => {
  // State to control the visibility of the entire phone during rotation
  const [isAnimatingRotation, setIsAnimatingRotation] = createSignal(false);

  // Effect to manage phone visibility during orientation change
  createEffect(() => {
    // When orientation changes, immediately start the animation: hide the phone
    props.isPortrait; // Accessing prop to trigger effect on change
    setIsAnimatingRotation(true);

    // After a delay matching the rotation transition duration, end the animation: show the phone
    const timer = setTimeout(() => {
      setIsAnimatingRotation(false);
    }, 300); // This duration should match the rotation transition duration (duration-300)

    return () => clearTimeout(timer); // Cleanup timer on cleanup phase
  }); // Re-run this effect whenever isPortrait changes (implicit from prop access)

  const getDimensions = (isPortrait: boolean) => {
    return props.isAndroid ? resolutions.android[isPortrait ? 'portrait' : 'landscape'] : resolutions.iOS[isPortrait ? 'portrait' : 'landscape'];
  };

  return (
    <div
      class={cn(
        "transition-all duration-300 ease-in-out", // Transition for overall size change and opacity
        "bg-black p-2",
        "transition-colors duration-300",
        "origin-center transition-transform duration-300 ease-in-out", // Faster transition for rotation
        isAnimatingRotation() ? 'opacity-0' : 'opacity-100', // Controls opacity for the fade effect
        props.isAndroid ? 'rounded-[16px]' : 'rounded-[24px]',
      )}
      style={{
        width: `${getDimensions(props.isPortrait).width}px`,
        height: `${getDimensions(props.isPortrait).height}px`
      }}
    >
      {/* Screen Area - This is the visible display of the phone. */}
      <div
        class={cn(
          "relative w-full h-full transition-colors duration-300 overflow-hidden",
          props.isAndroid ? 'rounded-[8px]' : 'rounded-[16px] font-[family-name:var(--font-family-sf-pro-display)]',
          props.isDarkMode ? "bg-gray-950 text-gray-100" : "bg-white text-gray-900",
          props.isDarkMode ? "dark" : ""
        )}
      >
        <Header
          agent={props.agent}
          isAndroid={props.isAndroid}
          isDarkMode={props.isDarkMode}
          isPortrait={props.isPortrait}
        />

        <Chat
          thread={props.thread}
          isAndroid={props.isAndroid}
          isDarkMode={props.isDarkMode}
          isPortrait={props.isPortrait}
          onSendMessage={props.onSendMessage}
        />

        <BottomBar
          isAndroid={props.isAndroid}
          isDarkMode={props.isDarkMode}
          isPortrait={props.isPortrait}
          onSendMessage={props.onSendMessage}
        />

        {/* Home Indicator - conditional rendering based on Android/iOS and portrait mode */}
        <Show when={!props.isAndroid && props.isPortrait}>
          <div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full opacity-60" />
        </Show>
      </div>
    </div>
  );
};
