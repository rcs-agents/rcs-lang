import { cn } from '../../../utils/cn';
import { BatteryIcon, CellSignalIcon } from '../Icons';

const getCurrentTime = ({ hour12 }: { hour12?: boolean } = { hour12: true }) => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12 });
};

export const StatusBar = (props: { isAndroid: boolean; isDarkMode?: boolean }) => {
  return (
    <div class={cn("px-3 py-1 flex justify-between items-center dark:text-gray-200 text-gray-700")}>
      <div class="text-xs font-semibold">{getCurrentTime()}</div>
      <div class="flex items-center space-x-1">
        <CellSignalIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}
