import { useEffect, useState } from 'react'

import type { Thread } from '../../../core/types.js'

import { BottomBar } from './bottom-bar'
import { Chat } from './chat'
import { DeviceFrame } from './device-frames'
import { Header } from './header'

// Props interface for the Phone component
interface DeviceProps {
  agent: {
    iconUrl: string
    brandName: string
  }
  isPortrait: boolean
  isDarkMode: boolean
  isAndroid: boolean
  thread: Thread
  onSendMessage: (payload: any) => void // Add function to send messages
}

const scale = 1
const resolutions = {
  // iPhone 16: 460 PPI https://www.appmysite.com/blog/the-complete-guide-to-iphone-screen-resolutions-and-sizes/
  iOS: {
    portrait: { width: 393 * scale, height: 852 * scale },
    landscape: { width: 852 * scale, height: 393 * scale },
  },
  // Pixel 9: 422 PPI | 20:9 aspect ratio. 1080 W x 2424 H
  android: {
    // portrait: { width: 360 * scale, height: 808 * scale },
    // landscape: { width: 808, height: 360 }
    // HACK: Force dimensions to be the same on iOS and Android
    portrait: { width: 393 * scale, height: 852 * scale },
    landscape: { width: 852 * scale, height: 393 * scale },
  },
}

// This component renders the mobile phone frame and its internal screen content.
// It handles its own rotation and ensures the content within remains upright.
export const Device = (props: DeviceProps) => {
  // State to control the visibility of the entire phone during rotation
  const [isAnimatingRotation, setIsAnimatingRotation] = useState(false)

  // Effect to manage phone visibility during orientation change
  useEffect(() => {
    // When orientation changes, immediately start the animation: hide the phone
    setIsAnimatingRotation(true)

    // After a delay matching the rotation transition duration, end the animation: show the phone
    const timer = setTimeout(() => {
      setIsAnimatingRotation(false)
    }, 300) // This duration should match the rotation transition duration (duration-300)

    return () => clearTimeout(timer) // Cleanup timer on cleanup phase
  }, [props.isPortrait]) // Re-run this effect whenever isPortrait changes

  const getDimensions = (isPortrait: boolean) => {
    return props.isAndroid
      ? resolutions.android[isPortrait ? 'portrait' : 'landscape']
      : resolutions.iOS[isPortrait ? 'portrait' : 'landscape']
  }

  return (
    <div
      style={{
        transition: 'opacity 0.3s ease-in-out',
        opacity: isAnimatingRotation ? 0 : 1,
      }}
    >
      <DeviceFrame isAndroid={props.isAndroid} isPortrait={props.isPortrait} isDarkMode={props.isDarkMode}>
        {/* Screen Area - This is the visible display of the phone. */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transition: 'colors 0.3s ease',
            overflow: 'hidden',
            fontFamily: props.isAndroid ? 'inherit' : 'var(--font-family-sf-pro-display)',
            backgroundColor: props.isDarkMode ? '#030712' : 'white',
            color: props.isDarkMode ? '#f3f4f6' : '#111827',
          }}
        >
          <Header
            agent={props.agent}
            isAndroid={props.isAndroid}
            isDarkMode={props.isDarkMode}
            isPortrait={props.isPortrait}
          />

          <Chat
            thread={props.thread}
            isAndroid={props.isAndroid}
            isDarkMode={props.isDarkMode}
            isPortrait={props.isPortrait}
            onSendMessage={props.onSendMessage}
          />

          <BottomBar
            isAndroid={props.isAndroid}
            isDarkMode={props.isDarkMode}
            isPortrait={props.isPortrait}
            onSendMessage={props.onSendMessage}
          />

          {/* Home Indicator - conditional rendering based on Android/iOS and portrait mode */}
          {!props.isAndroid && props.isPortrait && (
            <div
              style={{
                position: 'absolute',
                bottom: '0.25rem',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '8rem',
                height: '0.25rem',
                backgroundColor: '#9ca3af',
                borderRadius: '9999px',
                opacity: 0.6,
              }}
            />
          )}
        </div>
      </DeviceFrame>
    </div>
  )
}
