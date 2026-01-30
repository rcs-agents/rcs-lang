import { createSignal, Show } from 'solid-js';
import { cn } from '../../utils/cn';
import { Phone } from './phone/Phone';
import { Switch } from '../ui/Switch';
import { MoonIcon, RectangleHorizontalIcon, RectangleVerticalIcon, SunIcon, XIcon } from 'lucide-solid';
import { GoogleIcon, AppleIcon } from './Icons';
import { Thread } from '../../types';

type EmulatorProps = {
  agent: {
    iconUrl: string
    brandName: string
  }
  initialThread: Thread
  onSendMessage: (payload: any) => void;
}

export const Emulator = (props: EmulatorProps) => {
  // State for controlling the visibility of the settings modal
  const [isOpen, setIsOpen] = createSignal(true);
  // State for controlling the phone's orientation: true for portrait, false for landscape
  const [isPortrait, setIsPortrait] = createSignal(true);
  // State for controlling the theme: true for light, false for dark
  const [isLightMode, setIsLightMode] = createSignal(true);
  // New state for Android/iOS toggle: true for Android, false for iOS (default Android)
  const [isAndroid, setIsAndroid] = createSignal(true);
  // Create a reactive thread state from the initial MockThread
  const [thread, setThread] = createSignal([...props.initialThread]);

  // Function to toggle the phone's orientation
  const toggleOrientation = () => {
    setIsPortrait((prev) => !prev);
  };

  // Function to toggle the theme
  const toggleTheme = () => {
    setIsLightMode((prev) => !prev);
  };

  // Function to toggle Android/iOS
  const togglePlatform = () => {
    setIsAndroid((prev) => !prev);
  };

  // Function to send user message and add to the thread
  // Now receives message text as parameter from the Phone component
  const sendUserMessage = (input: any) => {
    let isAction = false
    let isReply = false

    if (typeof input === 'object' && 'reply' in input) {
      isReply = true
    }

    if (typeof input === 'object' && 'action' in input) {
      isAction = true
    }

    // Create a new message object with the required base fields
    const baseUserMessage = {
      senderPhoneNumber: "+1234567890",
      messageId: Date.now().toString(),
      sendTime: new Date().toISOString(),
      agentId: "user"
    };

    // Create the appropriate user message type based on the input
    let newMessage;
    if (isAction) {
      newMessage = {
        userMessage: {
          ...baseUserMessage,
          suggestionResponse: {
            postbackData: input.postbackData || "",
            text: input.action.text,
            type: 'ACTION' as const
          }
        }
      };
    } else if (isReply) {
      newMessage = {
        userMessage: {
          ...baseUserMessage,
          suggestionResponse: {
            postbackData: input.postbackData || "",
            text: input.reply.text,
            type: 'REPLY' as const
          }
        }
      };
    } else {
      newMessage = {
        userMessage: {
          ...baseUserMessage,
          text: input.trim()
        }
      };
    }

    props.onSendMessage(newMessage);

    // Add the message to the beginning of the thread using the setter function
    // Use a function form to ensure we're working with the latest state
    setThread(prev => {
      return [newMessage, ...prev];
    });
  };

  return (
    <div>
      {/* Floating trigger button - only shown when modal is closed */}
      <Show when={!isOpen()}>
        <button
          onClick={() => setIsOpen(true)}
          class="fixed bottom-4 right-4 z-50 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow bg-blue-600 text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="Open mobile preview settings"
        >
          {/* Smartphone icon (Lucide-react inspired SVG) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="h-6 w-6"
          >
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <path d="M12 18h.01" />
          </svg>
        </button>
      </Show>

      {/* Settings Panel Modal */}
      <Show when={isOpen()}>
        <div class="fixed bottom-4 right-4 z-50">
          {/* Card Component (simulated with Tailwind CSS) */}
          <div
            class={cn(
              `shadow-xl border-2 rounded-lg p-4 transition-all duration-300`,

              // Ensure the modal itself is always light mode
              'bg-white border-gray-200'
            )}
          >
            {/* CardHeader */}
            <div class="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <h2 class="text-lg font-semibold text-gray-800">Mobile Preview</h2>
              {/* Close Button */}
              <button
                class="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-500"
                onClick={() => setIsOpen(false)}
                aria-label="Close settings panel"
              >
                <XIcon />
              </button>
            </div>

            {/* CardContent */}
            <div class="space-y-4">
              {/* Controls */}
              <div class="space-y-3">
                {/* Portrait/Landscape Toggle */}
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="text-gray-500 size-4 flex items-center">
                      <Show when={isPortrait()} fallback={
                        <RectangleHorizontalIcon />
                      }>
                        <RectangleVerticalIcon />
                      </Show>
                    </div>
                    <span class="text-sm font-medium text-gray-700">
                      {isPortrait() ? 'Portrait' : 'Landscape'}
                    </span>
                  </div>

                  <Switch
                    isChecked={!isPortrait()}
                    onChange={toggleOrientation}
                    ariaLabel="Toggle orientation"
                  />
                </div>

                {/* Light/Dark Mode Toggle */}
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="text-gray-500 size-4 flex items-center">
                      <Show when={isLightMode()} fallback={
                        <MoonIcon />
                      }>
                        <SunIcon />
                      </Show>
                    </div>
                    <span class="text-sm font-medium text-gray-700">
                      {isLightMode() ? 'Light' : 'Dark'} Mode
                    </span>
                  </div>

                  <Switch
                    isChecked={!isLightMode()}
                    onChange={toggleTheme}
                    ariaLabel="Toggle theme"
                  />
                </div>

                {/* Android/iOS Toggle */}
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="text-gray-500 size-4 flex items-center">
                      <Show when={isAndroid()} fallback={
                        <AppleIcon />
                      }>
                        <GoogleIcon />
                      </Show>
                    </div>

                    <span class="text-sm font-medium text-gray-700">
                      {isAndroid() ? 'Android' : 'iOS'}
                    </span>
                  </div>

                  <Switch
                    isChecked={!isAndroid()}
                    onChange={togglePlatform}
                    ariaLabel="Toggle platform"
                  />
                </div>
              </div>

              <Phone
                agent={props.agent}
                isPortrait={isPortrait()}
                isDarkMode={!isLightMode()}
                isAndroid={isAndroid()}
                thread={thread()}
                onSendMessage={sendUserMessage}
              />

            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};
