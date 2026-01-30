import { CopyIcon } from 'lucide-solid';
import { ThreadEntry, AgentMessage } from '../../../types';
import { OuterSuggestions } from './suggestions/Suggestions';
import { cn } from '../../../utils/cn';
import { Show } from 'solid-js';

interface TextProps {
  message: ThreadEntry;
  nextMessage: ThreadEntry;
  previousMessage: ThreadEntry;
  isAndroid: boolean;
  isDarkMode: boolean;
  isPortrait: boolean;
  onSendMessage: (payload: any) => void;
}

// Helper to check if message has text content
const hasText = (message: ThreadEntry): boolean => {
  if (!message) {
    return false;
  }
  return 'agentMessage' in message &&
    !!message.agentMessage.contentMessage &&
    'text' in message.agentMessage.contentMessage;
};

export function Text(props: TextProps) {
  if (!hasText(props.message)) {
    return null;
  }

  // Safe access since we've checked with hasText
  if (!('agentMessage' in props.message)) {
    return null;
  }

  const contentMessage = props.message.agentMessage.contentMessage;
  // Additional check to ensure text property exists
  if (!('text' in contentMessage)) {
    return null;
  }

  // Now contentMessage is known to have a text property
  const { text, suggestions = [] } = contentMessage as { text: string, suggestions?: any[] };

  // OTP
  if ('agentMessage' in props.message && props.message.agentMessage.messageTrafficType === 'AUTHENTICATION') {
    const parts = text.split(' ');
    const code = parts[parts.length - 2];

    return (
      <div class="border border-gray-400 dark:border-zinc-800  bg-white dark:bg-zinc-800 text-gray-700 dark:text-white px-4 py-2 rounded-3xl items-center gap-2 justify-end inline-flex float-right">
        <CopyIcon class="w-4 h-4" />Copy "{code}"
      </div>
    )
  }

  return (
    <div>
      <div class={cn(
        "text-gray-700 bg-gray-100 dark:bg-zinc-800 dark:text-white px-4 py-2 rounded-r-3xl max-w-[330px]",
        hasText(props.previousMessage) ? "rounded-tl-lg -mt-1" : "rounded-tl-3xl",
        hasText(props.nextMessage) ? "rounded-bl-lg" : "rounded-bl-3xl",
        props.isAndroid ? "" : "iOS-bubble received",
      )}
      >
        <p>{text}</p>
      </div>

      <Show when={!props.isAndroid || (props.isAndroid && !props.nextMessage)}>
        <OuterSuggestions
          suggestions={suggestions}
          isAndroid={props.isAndroid}
          isDarkMode={props.isDarkMode}
          isPortrait={props.isPortrait}
          onSendMessage={props.onSendMessage}
        />
      </Show>
    </div>
  );
}
