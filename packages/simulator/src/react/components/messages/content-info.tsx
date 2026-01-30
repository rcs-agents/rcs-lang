/** @jsxImportSource react */

import { File } from 'lucide-react'
import type { ThreadEntry } from '../../../core/types.js'

interface ContentInfoProps {
  message: ThreadEntry
  nextMessage: ThreadEntry
  isAndroid: boolean
  isDarkMode: boolean
  isPortrait: boolean
  onSendMessage: (payload: any) => void
}

// Type guard to check if message has contentInfo
const hasContentInfo = (message: ThreadEntry): boolean => {
  if (!message) {
    return false
  }

  return (
    'agentMessage' in message &&
    !!(message as any).agentMessage?.contentMessage &&
    'contentInfo' in (message as any).agentMessage.contentMessage
  )
}

export function ContentInfo({ message }: ContentInfoProps) {
  if (!hasContentInfo(message)) {
    return null
  }

  // Since we've checked for the existence of the properties, we can safely access them
  const agentMessage = (message as any).agentMessage
  if (!agentMessage || !agentMessage.contentMessage) return null

  const contentMessage = agentMessage.contentMessage
  if (!('contentInfo' in contentMessage) || !contentMessage.contentInfo) return null

  const fileName = getFileName(contentMessage.contentInfo.fileUrl)

  if (fileName.endsWith('.pdf')) {
    return (
      <div
        style={{
          backgroundColor: '#f3f4f6',
          color: '#374151',
          padding: '0.5rem 1rem',
          maxWidth: '20.625rem',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            padding: '0.5rem',
            color: 'white',
            borderRadius: '0.75rem',
            backgroundColor: '#6b7280',
            marginRight: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <File style={{ width: '1.5rem', height: '1.5rem' }} />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontWeight: '600',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {fileName}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#6b7280',
            }}
          >
            8.06 MB
          </div>
        </div>
      </div>
    )
  }

  if (fileName.endsWith('.gif')) {
    return (
      <img
        src={contentMessage.contentInfo.fileUrl}
        alt={fileName || ''}
        style={{
          borderRadius: '1rem',
          width: '75%',
          maxWidth: '20.625rem',
        }}
      />
    )
  }

  if (
    fileName.endsWith('.webp') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg')
  ) {
    return (
      <img
        src={contentMessage.contentInfo.fileUrl}
        alt={fileName || ''}
        style={{
          borderRadius: '1rem',
          width: '100%',
          maxWidth: '20.625rem',
        }}
      />
    )
  }

  const codecs = {
    h263: 'video/h263',
    m4v: 'video/m4v',
    mp4: 'video/mp4',
    m4p: 'video/mpeg4',
    mpeg: 'video/mpeg',
    webm: 'video/webm',
  }

  const extension = (fileName.split('.').pop() ?? '') as keyof typeof codecs

  if (extension in codecs) {
    return (
      <video
        width="400"
        controls
        style={{
          borderRadius: '1rem',
          width: '100%',
        }}
      >
        <source src={contentMessage.contentInfo.fileUrl} type={codecs[extension] ?? 'video/mp4'} />
        Your browser does not support HTML video.
      </video>
    )
  }

  return (
    <div
      style={{
        color: '#374151',
        backgroundColor: '#f3f4f6',
        padding: '0.5rem 1rem',
        borderRadius: '1.5rem',
      }}
    >
      <p>{contentMessage.contentInfo?.fileUrl}</p>
    </div>
  )
}

function getFileName(fileUrl: string | undefined): string {
  if (!fileUrl) return ''

  try {
    // Parse the URL to handle query parameters properly
    const url = new URL(fileUrl)
    // Get the path
    const pathname = url.pathname
    // Extract the filename from the path
    const segments = pathname.split('/')
    return segments[segments.length - 1] || ''
  } catch (error) {
    console.error('Error parsing file URL:', error)
    return fileUrl
  }
}
