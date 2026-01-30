import { createEffect, For, Show } from 'solid-js';
import { AgentMessage, Thread, ThreadEntry, UserMessage } from '../../../types';
import { Text } from '../messages/Text';
import { ContentInfo } from '../messages/ContentInfo';
import { StandaloneCard } from '../messages/StandaloneCard';
import { CarouselCard } from '../messages/CarouselCard';
import { UserText } from '../messages/UserText';
import { cn } from '../../../utils/cn';

const hasAgentMessage = (message: ThreadEntry): message is { agentMessage: AgentMessage } => {
  return 'agentMessage' in message;
};

const hasUserMessage = (message: ThreadEntry): message is { userMessage: UserMessage } => {
  return 'userMessage' in message;
};

type ChatProps = {
  thread: Thread;
  isAndroid: boolean;
  isDarkMode: boolean;
  isPortrait: boolean;
  onSendMessage: (payload: any) => void;
}

export const Chat = (props: ChatProps) => {
  // Create a derived signal to track messages in reverse order (newest first)
  // This way, when we add a new message at the beginning of the array, it shows at the top
  const messages = () => [...props.thread].reverse();

  // Reference to the messages container element
  let messagesContainerRef: HTMLDivElement | undefined;

  // Effect to scroll to the bottom of the messages container when new messages are added
  // Track both the thread length and the container reference for reactivity
  createEffect(() => {
    if (messagesContainerRef) {
      // Use a small timeout to ensure DOM is fully updated before scrolling
      setTimeout(() => {
        if (messagesContainerRef) {
          messagesContainerRef.scrollTop = messagesContainerRef.scrollHeight;
        }
      }, 10);
    }
  });

  return (
    <div
      class={cn(
        "pb-8 h-[calc(100%-8rem)] relative no-scrollbar overflow-x-hidden overflow-y-auto scroll-smooth space-y-2 flex flex-col",
        props.isAndroid ? 'px-2' : 'text-base px-4',
      )}
      ref={messagesContainerRef}
    >
      <For each={messages()}>
        {(message, index) => {
          return (
            <div>
              <Show when={hasAgentMessage(message)}>
                <StandaloneCard
                  message={message}
                  nextMessage={messages()[index() + 1]}
                  isAndroid={props.isAndroid}
                  isDarkMode={props.isDarkMode}
                  isPortrait={props.isPortrait}
                  onSendMessage={props.onSendMessage}
                />

                <CarouselCard
                  message={message}
                  nextMessage={messages()[index() + 1]}
                  isAndroid={props.isAndroid}
                  isDarkMode={props.isDarkMode}
                  isPortrait={props.isPortrait}
                  onSendMessage={props.onSendMessage}
                />

                <Text
                  message={message}
                  nextMessage={messages()[index() + 1]}
                  previousMessage={messages()[index() - 1]}
                  isAndroid={props.isAndroid}
                  isDarkMode={props.isDarkMode}
                  isPortrait={props.isPortrait}
                  onSendMessage={props.onSendMessage}
                />

                <ContentInfo
                  message={message}
                  nextMessage={messages()[index() + 1]}
                  isAndroid={props.isAndroid}
                  isDarkMode={props.isDarkMode}
                  isPortrait={props.isPortrait}
                  onSendMessage={props.onSendMessage}
                />
              </Show>

              <Show when={hasUserMessage(message)}>
                <UserText
                  message={message}
                  nextMessage={messages()[index() + 1]}
                  previousMessage={messages()[index() - 1]}
                  isAndroid={props.isAndroid}
                  isDarkMode={props.isDarkMode}
                  isPortrait={props.isPortrait}
                />
              </Show>
            </div>
          );
        }}
      </For>
    </div>
  );
};
