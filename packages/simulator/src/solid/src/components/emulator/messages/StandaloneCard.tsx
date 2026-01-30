import { Show } from 'solid-js';
import { ThreadEntry } from '../../../types';
import { CardContent } from './CardContent';
import { OuterSuggestions } from './suggestions/Suggestions';

interface StandaloneCardProps {
  message: ThreadEntry;
  nextMessage: ThreadEntry;
  isAndroid: boolean;
  isDarkMode: boolean;
  isPortrait: boolean;
  onSendMessage: (payload: any) => void;
}

// Helper to check if message is an agent message with richCard
const hasRichCard = (message: ThreadEntry): boolean => {
  if (!message) {
    return false;
  }
  return 'agentMessage' in message &&
    !!message.agentMessage.contentMessage &&
    'richCard' in message.agentMessage.contentMessage;
};

// Helper to check if message has a StandaloneCard
const hasRichCardStandalone = (message: ThreadEntry): boolean => {
  if (!hasRichCard(message)) return false;

  // At this point we know 'agentMessage' exists but TypeScript doesn't, so we check again
  if (!('agentMessage' in message)) return false;

  const contentMessage = message.agentMessage.contentMessage;
  if (!('richCard' in contentMessage)) return false;

  return 'standaloneCard' in contentMessage.richCard;
};

/**
 * StandaloneCard component that renders a rich card from an agent message
 * 
 * @param message - The thread entry containing the message
 * @returns A rendered card or null if required data is missing
 */
export function StandaloneCard(props: StandaloneCardProps) {
  // Check if the message has a standalone rich card
  if (!hasRichCardStandalone(props.message)) {
    return null;
  }

  // Since we've checked for the existence of the properties, we can safely access them
  const agentMessage = 'agentMessage' in props.message ? props.message.agentMessage : null;
  if (!agentMessage || !agentMessage.contentMessage) return null;

  const contentMessage = agentMessage.contentMessage;
  if (!('richCard' in contentMessage) || !('standaloneCard' in contentMessage.richCard)) return null;

  // Check if the standalone card has content
  if (!('cardContent' in contentMessage.richCard.standaloneCard)) {
    return null;
  }

  // Safe to access the card content
  const { cardContent } = contentMessage.richCard.standaloneCard;

  return (
    <div>
      <div class="rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800">
        <CardContent
          cardContent={cardContent}
          isAndroid={props.isAndroid}
          isDarkMode={props.isDarkMode}
          isPortrait={props.isPortrait}
          onSendMessage={props.onSendMessage}
        />
      </div>

      <Show when={!props.nextMessage}>
        <OuterSuggestions
          suggestions={contentMessage?.suggestions || []}
          isAndroid={props.isAndroid}
          isDarkMode={props.isDarkMode}
          isPortrait={props.isPortrait}
          onSendMessage={props.onSendMessage}
        />
      </Show>
    </div>
  );
}
