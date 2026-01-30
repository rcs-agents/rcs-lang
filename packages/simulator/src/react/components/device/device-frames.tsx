import type React from 'react'
import type { CSSProperties } from 'react'

interface DeviceFrameProps {
  children: React.ReactNode
  isPortrait?: boolean
  isDarkMode?: boolean
}

// Common styles
const flexCenter: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const zinc900 = '#18181b'
const zinc700 = '#3f3f46'

export const IPhone15Frame: React.FC<DeviceFrameProps> = ({ children, isPortrait = true }) => {
  // iPhone 15 Pro actual dimensions: 146.6mm × 70.6mm (roughly 375x812 points)
  const frameStyle: CSSProperties = {
    position: 'relative',
    width: isPortrait ? '375px' : '812px',
    height: isPortrait ? '812px' : '375px',
    borderRadius: '45px',
    boxShadow: '0 0 2px 2px rgba(255,255,255,0.1)',
    border: `8px solid ${zinc900}`,
  }

  const innerBorderStyle: CSSProperties = {
    position: 'absolute',
    inset: '-1px',
    border: `3px solid ${zinc700}`,
    borderRadius: '37px',
    opacity: 0.4,
    pointerEvents: 'none',
  }

  const screenStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '37px',
    overflow: 'hidden',
    backgroundColor: 'white',
  }

  const buttonBaseStyle: CSSProperties = {
    position: 'absolute',
    backgroundColor: zinc900,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  }

  return (
    <div style={flexCenter}>
      <div style={frameStyle}>
        <div style={innerBorderStyle} />

        {/* Screen Content */}
        <div style={screenStyle}>{children}</div>

        {/* Physical Buttons - adjust positions for orientation */}
        {isPortrait ? (
          <>
            {/* Silent Switch */}
            <div style={{ ...buttonBaseStyle, left: '-12px', top: '80px', width: '6px', height: '32px', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px' }} />
            {/* Volume Up */}
            <div style={{ ...buttonBaseStyle, left: '-12px', top: '144px', width: '6px', height: '48px', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px' }} />
            {/* Volume Down */}
            <div style={{ ...buttonBaseStyle, left: '-12px', top: '208px', width: '6px', height: '48px', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px' }} />
            {/* Power Button */}
            <div style={{ ...buttonBaseStyle, right: '-12px', top: '144px', width: '6px', height: '64px', borderTopRightRadius: '6px', borderBottomRightRadius: '6px' }} />
          </>
        ) : (
          <>
            {/* Landscape button positions */}
            <div style={{ ...buttonBaseStyle, top: '-12px', left: '80px', height: '6px', width: '32px', borderTopLeftRadius: '6px', borderTopRightRadius: '6px' }} />
            <div style={{ ...buttonBaseStyle, top: '-12px', left: '144px', height: '6px', width: '48px', borderTopLeftRadius: '6px', borderTopRightRadius: '6px' }} />
            <div style={{ ...buttonBaseStyle, top: '-12px', left: '208px', height: '6px', width: '48px', borderTopLeftRadius: '6px', borderTopRightRadius: '6px' }} />
            <div style={{ ...buttonBaseStyle, bottom: '-12px', left: '144px', height: '6px', width: '64px', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' }} />
          </>
        )}
      </div>
    </div>
  )
}

export const AndroidFrame: React.FC<DeviceFrameProps> = ({ children, isPortrait = true }) => {
  // Android phones typically 360x800 points (similar aspect ratio to modern phones)
  const frameStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    width: isPortrait ? '360px' : '800px',
    height: isPortrait ? '800px' : '360px',
    border: '4px solid black',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  }

  const cameraStyle: CSSProperties = {
    position: 'absolute',
    border: '1px solid black',
    backgroundColor: 'black',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    zIndex: 20,
    ...(isPortrait
      ? { top: '8px', left: '50%', transform: 'translateX(-50%)' }
      : { left: '8px', top: '50%', transform: 'translateY(-50%)' }),
  }

  const buttonStyle: CSSProperties = {
    position: 'absolute',
    border: '4px solid black',
    borderRadius: '6px',
  }

  const screenStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: 'white',
  }

  return (
    <div style={flexCenter}>
      <div style={frameStyle}>
        {/* Front Camera */}
        <span style={cameraStyle} />

        {/* Physical Buttons - with proper z-index */}
        {isPortrait ? (
          <>
            <span style={{ ...buttonStyle, right: '-8px', top: '80px', height: '40px' }} />
            <span style={{ ...buttonStyle, right: '-8px', top: '176px', height: '96px' }} />
          </>
        ) : (
          <>
            <span style={{ ...buttonStyle, top: '-8px', left: '80px', width: '40px', height: '4px' }} />
            <span style={{ ...buttonStyle, top: '-8px', left: '176px', width: '96px', height: '4px' }} />
          </>
        )}

        {/* Screen Content - fill entire inner area */}
        <div style={screenStyle}>
          <div style={{ width: '100%', height: '100%' }}>{children}</div>
        </div>
      </div>
    </div>
  )
}

export const DeviceFrame: React.FC<DeviceFrameProps & { isAndroid: boolean }> = ({ isAndroid, children, ...props }) => {
  return isAndroid ? (
    <AndroidFrame {...props}>{children}</AndroidFrame>
  ) : (
    <IPhone15Frame {...props}>{children}</IPhone15Frame>
  )
}
