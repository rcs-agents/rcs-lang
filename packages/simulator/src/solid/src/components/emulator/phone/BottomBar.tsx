import { createSignal, createEffect, Show } from 'solid-js';
import { ArrowUpIcon, AudioLinesIcon, CirclePlusIcon, MicIcon, PlusIcon, SendHorizontalIcon } from 'lucide-solid';
import { cn } from '../../../utils/cn';

interface BottomBarProps {
  isAndroid: boolean;
  isDarkMode: boolean;
  isPortrait: boolean;
  onSendMessage: (text: string) => void;
}

export const BottomBar = (props: BottomBarProps) => {
  const [isInputActive, setIsInputActive] = createSignal(false);
  const [userMessage, setUserMessage] = createSignal("");

  // Reference to the textarea element
  let textareaRef: HTMLTextAreaElement | undefined;

  // Effect to focus the textarea when isInputActive becomes true
  createEffect(() => {
    if (isInputActive() && textareaRef) {
      // Focus the textarea after a small delay to ensure it's rendered
      setTimeout(() => textareaRef?.focus(), 0);
    }
  });

  // Function to send message and reset input
  const sendMessage = () => {
    if (!userMessage().trim()) return;
    props.onSendMessage(userMessage());
    setUserMessage("");
    setIsInputActive(false);
  };

  const placeholder = (isAndroid: boolean) => isAndroid ? 'RCS message' : 'Text Message ∙ RCS';

  return (
    <div class={cn("absolute bg-white dark:bg-gray-950 pb-4 pt-2 bottom-0 left-0 right-0 px-2 flex items-end gap-2 ", props.isAndroid ? '' : 'text-gray-500 dark:text-gray-400')}>
      <Show when={!props.isAndroid}>
        <div class="w-12 h-12 rounded-full cursor-pointer bg-gray-200 dark:bg-zinc-800 ml-2 mr-2">
          <PlusIcon class="w-7 h-7 ml-2.5 mt-2.5 opacity-70 dark:opacity-100" />
        </div>
      </Show>

      <div
        class={cn(
          "flex-1 rounded-4xl flex  cursor-pointer",
          props.isAndroid ? 'bg-gray-100 dark:bg-zinc-800 dark:text-white py-3 px-3 items-end' : 'border border-gray-300 dark:border-zinc-800 py-1 pl-3 pr-1 justify-between items-center mr-2'
        )}
        id="message-input"
        onClick={() => setIsInputActive(true)}
      >
        <Show when={props.isAndroid}>
          <CirclePlusIcon class="w-6 h-6 mr-3 opacity-70 dark:opacity-100" />
        </Show>

        {
          isInputActive() ? (
            <div class="flex-1 flex items-center">
              <textarea
                ref={textareaRef}
                class="w-full border-0 p-0 m-0 focus:outline-none focus:ring-0"
                value={userMessage()}
                onInput={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                  if (e.key === 'Escape') {
                    setIsInputActive(false);
                  }
                }}
                placeholder={placeholder(props.isAndroid)}
              />
            </div>
          ) : (<div>{placeholder(props.isAndroid)}</div>)
        }

        {/* IOS */}
        <Show when={!props.isAndroid}>
          <div class={
            cn("w-10 h-10 rounded-full cursor-pointer",
              isInputActive() ? 'bg-green-500 text-white dark:bg-blue-100 dark:text-blue-800' : ''
            )
          }>
            <Show when={!isInputActive()} fallback={<ArrowUpIcon class="w-8 h-8 opacity-70 pl-2 pt-2  rounded-full" onClick={sendMessage} />}>
              <MicIcon class="w-8 h-8 opacity-70 pl-2 pt-2 rounded-full" />
            </Show>
          </div>
        </Show>
      </div>

      {/* ANDROID */}
      <Show when={props.isAndroid}>
        <div class={
          cn("w-12 h-12 rounded-full cursor-pointer",
            isInputActive() ? 'bg-blue-800 text-white dark:bg-blue-100 dark:text-blue-800' : 'bg-gray-100 dark:bg-zinc-800'
          )
        }>
          <Show when={!isInputActive()} fallback={<SendHorizontalIcon class="w-9 h-9 opacity-70 pl-3 pt-3" onClick={sendMessage} />}>
            <AudioLinesIcon class="w-9 h-9 opacity-70 pl-3 pt-3" />
          </Show>
        </div>
      </Show>


    </div>
  );
};
