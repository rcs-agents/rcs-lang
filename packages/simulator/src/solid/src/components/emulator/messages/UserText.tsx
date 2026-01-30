import { CheckCheckIcon } from "lucide-solid";
import { ThreadEntry, UserMessage, SuggestionResponse } from "../../../types";
import { cn } from "../../../utils/cn";
import { Show } from "solid-js";

type UserMessageProps = {
  message: ThreadEntry;
  nextMessage: ThreadEntry;
  previousMessage: ThreadEntry;
  isAndroid: boolean;
  isDarkMode: boolean;
  isPortrait: boolean;
}

// Type guard to narrow UserMessage to the text variant
const hasText = (message: ThreadEntry): message is { userMessage: UserMessage & { text: string } } => {
  if (!message) {
    return false;
  }

  return 'userMessage' in message && 'text' in message.userMessage;
};

const hasSuggestionResponse = (message: ThreadEntry): message is { userMessage: UserMessage & { suggestionResponse: SuggestionResponse } } => {
  if (!message) {
    return false;
  }

  return 'userMessage' in message && 'suggestionResponse' in message.userMessage;
};

export const UserText = (props: UserMessageProps) => {
  if (!hasText(props.message) && !hasSuggestionResponse(props.message)) {
    return null;
  }

  return (
    <div
      class={cn(
        "max-w-[320px] py-2 pl-4 pr-2 leading-tight justify-end items-center inline-flex float-right rounded-l-3xl",
        hasText(props.previousMessage) ? "rounded-tr-lg -mt-1" : "rounded-tr-3xl",
        hasText(props.nextMessage) ? "rounded-br-lg" : "rounded-br-3xl",
        props.isAndroid ? "bg-blue-800 text-gray-50 text-sm" : "iOS-bubble sent",
      )}
    >
      <div>
        {hasText(props.message) ? props.message.userMessage.text : props.message.userMessage.suggestionResponse.text}
      </div>
      <Show when={props.isAndroid}>
        <div class="rounded-full p-0.5 ml-2  border border-gray-50">
          <CheckCheckIcon class="size-2.5" />
        </div>
      </Show>
    </div>
  );
};
