import { ArrowLeftIcon, EllipsisVerticalIcon, ShieldCheckIcon } from 'lucide-solid';
import { cn } from '../../../utils/cn';

interface HeaderProps {
  agent: {
    iconUrl: string
    brandName: string
  }
  isAndroid: boolean;
  isDarkMode: boolean;
  isPortrait: boolean;
}

export const Header = (props: HeaderProps) => {
  return (
    <div class={cn("px-3 py-3 mb-4 flex justify-between items-center bg-gray-100 dark:bg-zinc-800 dark:text-gray-200 text-gray-800")}>
      <div class="flex items-center">
        <ArrowLeftIcon />
        <div class="flex items-center space-x-3 ml-4">
          <div class="size-10 rounded-full bg-gray-300">
            <img src={props.agent.iconUrl} class="size-10 rounded-full" alt="" />
          </div>
          <p>{props.agent.brandName}</p>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <ShieldCheckIcon />
        <EllipsisVerticalIcon />
      </div>
    </div>
  );
}
