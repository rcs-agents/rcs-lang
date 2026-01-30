import { type CardContent } from '../../../types';
import { InnerSuggestions } from './suggestions/Suggestions';

interface CardContentProps {
  cardContent: CardContent;
  isAndroid: boolean;
  isDarkMode: boolean;
  isPortrait: boolean;
  onSendMessage: (payload: any) => void;
}

export function CardContent(props: CardContentProps) {
  // Determine height class based on media height
  const getHeightClass = () => {
    switch (props.cardContent.media?.height) {
      case 'SHORT':
        return 'h-32';
      case 'MEDIUM':
        return 'h-44';
      case 'TALL':
        return 'h-60';
      default:
        return 'h-32';
    }
  };

  return (
    <div class="flex flex-col h-full_">
      {/* Media Section */}
      {props.cardContent.media?.height && (
        <div class={`bg-gray-200 rounded-t-lg w-full ${getHeightClass()} flex items-center justify-center`}>
          {
            ('contentInfo' in props.cardContent.media) ? (
              <img src={props.cardContent.media?.contentInfo?.fileUrl} alt="Media" class="w-full h-full object-cover" />
            ) : (
              <div class="text-xs text-gray-500">Media Content</div>
            )
          }
        </div>
      )}

      {/* Content Section */}
      <div class="p-3 flex flex-col flex-1">
        {/* This div will expand to fill available space, pushing suggestions to bottom */}
        <div class="flex-grow mb-2">
          {props.cardContent.title && (
            <p class="font-semibold text-gray-800 dark:text-white">{props.cardContent.title}</p>
          )}
          {props.cardContent.description && (
            <p class="text-sm text-gray-500 mt-1 dark:text-white">{props.cardContent.description}</p>
          )}
        </div>

        {/* Suggestions/Actions - always at bottom */}
        <InnerSuggestions
          suggestions={props.cardContent.suggestions || []}
          isAndroid={props.isAndroid}
          isDarkMode={props.isDarkMode}
          isPortrait={props.isPortrait}
          onSendMessage={props.onSendMessage}
        />
      </div>
    </div>
  );
}
