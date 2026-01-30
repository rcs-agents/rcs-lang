import { type Suggestion, type SuggestedReply, type SuggestedAction } from '../../../../types';
import { CalendarPlusIcon, PhoneIcon, GlobeIcon, MapPinIcon, LocateFixedIcon } from 'lucide-solid'
import { cn } from '../../../../utils/cn';

type OuterSuggestionsProps = {
  suggestions: Suggestion[];
  isAndroid: boolean;
  isDarkMode: boolean;
  isPortrait: boolean;
  onSendMessage: (payload: any) => void;
}

export function OuterSuggestions(props: OuterSuggestionsProps) {
  if (props.suggestions.length === 0) {
    return null;
  }

  const chooser = (isAndroid: boolean) => isAndroid ? OuterSuggestionsAndroid(props) : OuterSuggestionsIOS(props);

  return chooser(props.isAndroid);
}


function OuterSuggestionsAndroid(props: OuterSuggestionsProps) {
  return (
    <ul
      class="mt-3 -mx-2 px-2 no-scrollbar flex items-stretch overflow-hidden overflow-x-scroll scroll-smooth gap-2"
    >
      {props.suggestions.map((suggestion, idx) => (
        <li>
          <button
            class="px-3 py-2  border rounded-full border-gray-300 bg-white hover:bg-gray-100 dark:border-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            data-index={idx}
          >
            <Suggestion
              suggestion={suggestion}
              isInner={false}
              isAndroid={props.isAndroid}
              isDarkMode={props.isDarkMode}
              isPortrait={props.isPortrait}
              onSendMessage={props.onSendMessage}
            />
          </button>
        </li>
      ))}
    </ul>
  )
}

function OuterSuggestionsIOS(props: OuterSuggestionsProps) {
  return (
    <ul
      class={cn(
        'iOS-bubble received',
        'pt-0 pb-0 mt-2'
      )}
    >
      {props.suggestions.map((suggestion, idx) => (
        <li
          class={
            cn(
              'border-b border-gray-300 dark:border-zinc-800 -mr-4',
              idx === props.suggestions.length - 1 ? 'border-0' : '',
            )
          }
        >
          <button
            class={
              cn(
                'text-blue-500',
                idx === 0 ? 'pt-0' : 'pt-2.5',
                idx === props.suggestions.length - 1 ? 'pb-0' : 'pb-2.5',
              )
            }
            data-index={idx}
            onClick={() => props.onSendMessage({
              reply: 'reply' in suggestion ? suggestion.reply : undefined,
              action: 'action' in suggestion ? suggestion.action : undefined
            })}
          >
            {'reply' in suggestion ? suggestion.reply.text : ''}
            {'action' in suggestion ? suggestion.action.text : ''}
          </button>
        </li>
      ))}
    </ul>
  )
}




type InnerSuggestionsProps = {
  suggestions: Suggestion[];
  isAndroid: boolean;
  isDarkMode: boolean;
  isPortrait: boolean;
  onSendMessage: (payload: any) => void;
}

export function InnerSuggestions(props: InnerSuggestionsProps) {
  if (props.suggestions.length === 0) {
    return null;
  }

  return (
    <div class="mt-3 space-y-1 text-[15px]">
      {props.suggestions.map((suggestion, idx) => {
        // Determine button class based on position
        const isFirst = idx === 0;
        const isLast = idx === props.suggestions.length - 1;
        const isSingle = props.suggestions.length === 1;

        let roundedClass = "rounded rounded-sm"; // Default: no rounded corners

        if (isSingle) {
          roundedClass = "rounded-2xl"; // Single element: fully rounded
        } else if (isFirst) {
          roundedClass = "rounded-t-2xl rounded-b-sm"; // First element: top rounded
        } else if (isLast) {
          roundedClass = "rounded-b-2xl rounded-t-sm"; // Last element: bottom rounded
        }

        return (
          <button
            class={`w-full py-1.5 px-1 h-14 text-gray-700 dark:text-white bg-white dark:bg-zinc-950 ${roundedClass}`}
            data-index={idx}
          >
            <Suggestion
              suggestion={suggestion} format="vertical"
              isInner={true}
              isAndroid={props.isAndroid}
              isDarkMode={props.isDarkMode}
              isPortrait={props.isPortrait}
              onSendMessage={props.onSendMessage}
            />
          </button>
        );
      })}
    </div>
  )
}

type SuggestionProps = {
  suggestion: Suggestion,
  format?: 'vertical' | 'horizontal'
  isInner: boolean;
  isAndroid: boolean;
  isDarkMode: boolean;
  isPortrait: boolean;
  onSendMessage: (payload: any) => void;
}

function Suggestion(props: SuggestionProps) {
  return (
    <div>
      {'reply' in props.suggestion ? RenderReply({ reply: props.suggestion.reply, format: props.format, isAndroid: props.isAndroid, isDarkMode: props.isDarkMode, isPortrait: props.isPortrait, onSendMessage: props.onSendMessage }) : undefined}
      {'action' in props.suggestion ? RenderAction({ action: props.suggestion.action, format: props.format, isAndroid: props.isAndroid, isDarkMode: props.isDarkMode, isPortrait: props.isPortrait, onSendMessage: props.onSendMessage }) : undefined}
    </div>
  )
}

type RenderReplyProps = {
  reply: SuggestedReply,
  format?: 'vertical' | 'horizontal'
  isAndroid: boolean;
  isDarkMode: boolean;
  isPortrait: boolean;
  onSendMessage: (payload: any) => void;
}

function RenderReply(props: RenderReplyProps) {
  return (
    <div
      class="flex whitespace-nowrap items-center"
      onClick={() => props.onSendMessage({ reply: props.reply })}
    >
      {props.reply.text}
    </div>
  )
}

type RenderActionProps = {
  action: SuggestedAction,
  format?: 'vertical' | 'horizontal'
  isAndroid: boolean;
  isDarkMode: boolean;
  isPortrait: boolean;
  onSendMessage: (payload: any) => void;
}

function RenderAction(props: RenderActionProps) {
  const iconClass = props.format === 'vertical' ? 'size-6' : 'size-4';

  return (
    <div
      class="flex whitespace-nowrap items-center"
      onClick={() => props.onSendMessage({ action: props.action })}
    >
      <div class={`${props.format === 'vertical' ? 'bg-gray-100 dark:bg-zinc-800 rounded-full mr-4 p-2 ml-2' : 'mr-1'}`}>
        {'dialAction' in props.action && props.isAndroid ? <PhoneIcon class={iconClass} /> : undefined}
        {'viewLocationAction' in props.action && props.isAndroid ? <MapPinIcon class={iconClass} /> : undefined}
        {'createCalendarEventAction' in props.action && props.isAndroid ? <CalendarPlusIcon class={iconClass} /> : undefined}
        {'openUrlAction' in props.action && props.isAndroid ? <GlobeIcon class={iconClass} /> : undefined}
        {'shareLocationAction' in props.action && props.isAndroid ? <LocateFixedIcon class={iconClass} /> : undefined}
      </div>
      {props.action.text}
    </div>
  )
}
