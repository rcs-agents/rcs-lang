import { FileIcon } from 'lucide-solid';
import { ThreadEntry } from '../../../types';

interface ContentInfoProps {
  message: ThreadEntry;
  nextMessage: ThreadEntry;
  isAndroid: boolean;
  isDarkMode: boolean;
  isPortrait: boolean;
  onSendMessage: (payload: any) => void;
}

// Type guard to check if message has contentInfo
const hasContentInfo = (message: ThreadEntry): boolean => {
  if (!message) {
    return false;
  }

  return 'agentMessage' in message &&
    !!message.agentMessage.contentMessage &&
    'contentInfo' in message.agentMessage.contentMessage;
};

export function ContentInfo({ message }: ContentInfoProps) {
  if (!hasContentInfo(message)) {
    return null;
  }

  // Since we've checked for the existence of the properties, we can safely access them
  const agentMessage = 'agentMessage' in message ? message.agentMessage : null;
  if (!agentMessage || !agentMessage.contentMessage) return null;

  const contentMessage = agentMessage.contentMessage;
  if (!('contentInfo' in contentMessage)) return null;

  const fileName = getFileName(contentMessage.contentInfo?.fileUrl);

  if (fileName.endsWith('.pdf')) {
    return (
      <div class="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-white px-4 py-2 max-w-[330px] rounded-lg flex items-center">
        <div class="p-2 text-white rounded-xl bg-gray-500 dark:bg-zinc-600 mr-2 flex items-center justify-center">
          <FileIcon class="w-6 h-6" />
        </div>
        <div class="flex flex-col overflow-hidden">
          <div class="font-semibold truncate">{fileName}</div>
          <div class="text-xs text-gray-500 dark:text-zinc-200">8.06 MB</div>
        </div>
      </div>
    );
  }

  if (fileName.endsWith('.gif')) {
    return (
      <img src={contentMessage.contentInfo.fileUrl} alt={fileName || ''} class="rounded-2xl w-3/4 max-w-[330px]" />
    );
  }

  if (fileName.endsWith('.webp') || fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    return (
      <img src={contentMessage.contentInfo.fileUrl} alt={fileName || ''} class="rounded-2xl w-full max-w-[330px]" />
    );
  }

  const codecs = {
    'h263': 'video/h263',
    'm4v': 'video/m4v',
    'mp4': 'video/mp4',
    'm4p': 'video/mpeg4',
    'mpeg': 'video/mpeg',
    'webm': 'video/webm'
  }

  const extension = (fileName.split('.').pop() ?? '') as keyof typeof codecs;

  if (extension in codecs) {
    return (
      <video width="400" controls class="rounded-2xl w-full">
        <source src={contentMessage.contentInfo.fileUrl} type={codecs[extension] ?? 'video/mp4'} />
        Your browser does not support HTML video.
      </video>
    );
  }

  return (
    <div class="text-gray-700 bg-gray-100 px-4 py-2 rounded-3xl">
      <p>{contentMessage.contentInfo?.fileUrl}</p>
    </div>
  );
}

function getFileName(fileUrl: string | undefined): string {
  if (!fileUrl) return '';

  try {
    // Parse the URL to handle query parameters properly
    const url = new URL(fileUrl);
    // Get the path
    const pathname = url.pathname;
    // Extract the filename from the path
    const segments = pathname.split('/');
    return segments[segments.length - 1] || '';
  } catch (error) {
    console.error('Error parsing file URL:', error);
    return fileUrl;
  }
};
