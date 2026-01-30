
import { Show } from 'solid-js';
import { ThreadEntry } from '../../../types';
import { CardContent } from './CardContent';
import { OuterSuggestions } from './suggestions/Suggestions';

interface CarouselCardProps {
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

// Helper to check if message has a CarouselCard
const hasRichCardCarousel = (message: ThreadEntry): boolean => {
  if (!hasRichCard(message)) return false;

  // At this point we know 'agentMessage' exists but TypeScript doesn't, so we check again
  if (!('agentMessage' in message)) return false;

  const contentMessage = message.agentMessage.contentMessage;
  if (!('richCard' in contentMessage)) return false;

  return 'carouselCard' in contentMessage.richCard;
};

export function CarouselCard(props: CarouselCardProps) {
  // Check if the message has a carousel rich card
  if (!hasRichCardCarousel(props.message)) {
    return null;
  }

  // Since we've checked for the existence of the properties, we can safely access them
  const agentMessage = 'agentMessage' in props.message ? props.message.agentMessage : null;
  if (!agentMessage || !agentMessage.contentMessage) return null;

  const contentMessage = agentMessage.contentMessage;
  if (!('richCard' in contentMessage) || !('carouselCard' in contentMessage.richCard)) return null;

  // Check if the carousel card has content
  if (!('cardContents' in contentMessage.richCard.carouselCard)) {
    return null;
  }

  const { cardContents } = contentMessage.richCard.carouselCard;

  if (!cardContents || cardContents.length === 0) {
    return null;
  }

  return (
    <div class="space-y-2 -mx-2">
      {/* Carousel container with horizontal scroll */}
      <div class="px-2 no-scrollbar flex items-stretch overflow-hidden overflow-x-scroll scroll-smooth gap-2">

        {cardContents.map((cardContent, _index) => (
          <div class="min-w-[240px] w-[260px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800">
            <CardContent
              cardContent={cardContent}
              isAndroid={props.isAndroid}
              isDarkMode={props.isDarkMode}
              isPortrait={props.isPortrait}
              onSendMessage={props.onSendMessage}
            />
          </div>
        ))}

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
