import type React from 'react'

interface DeviceFrameProps {
  children: React.ReactNode
  isPortrait?: boolean
  isDarkMode?: boolean
}

export const IPhone15Frame: React.FC<DeviceFrameProps> = ({ children, isPortrait = true }) => {
  // iPhone 15 Pro actual dimensions: 146.6mm × 70.6mm (roughly 375x812 points)
  // Scale up slightly for better visibility
  const dimensions = isPortrait ? 'w-[375px] h-[812px]' : 'h-[375px] w-[812px]'

  return (
    <div className="flex items-center justify-center">
      <div
        className={`relative ${dimensions} rounded-[45px] shadow-[0_0_2px_2px_rgba(255,255,255,0.1)] border-8 border-zinc-900`}
      >
        {/* Dynamic Island - only show in portrait */}
        {/* {isPortrait && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[90px] h-[22px] bg-zinc-900 rounded-full z-20" />
        )} */}

        <div className="absolute -inset-[1px] border-[3px] border-zinc-700 border-opacity-40 rounded-[37px] pointer-events-none" />

        {/* Screen Content */}
        <div className="relative w-full h-full rounded-[37px] overflow-hidden bg-white">{children}</div>

        {/* Physical Buttons - adjust positions for orientation */}
        {isPortrait ? (
          <>
            {/* Silent Switch */}
            <div className="absolute left-[-12px] top-20 w-[6px] h-8 bg-zinc-900 rounded-l-md shadow-md" />
            {/* Volume Up */}
            <div className="absolute left-[-12px] top-36 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md" />
            {/* Volume Down */}
            <div className="absolute left-[-12px] top-52 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md" />
            {/* Power Button */}
            <div className="absolute right-[-12px] top-36 w-[6px] h-16 bg-zinc-900 rounded-r-md shadow-md" />
          </>
        ) : (
          <>
            {/* Landscape button positions */}
            <div className="absolute top-[-12px] left-20 h-[6px] w-8 bg-zinc-900 rounded-t-md shadow-md" />
            <div className="absolute top-[-12px] left-36 h-[6px] w-12 bg-zinc-900 rounded-t-md shadow-md" />
            <div className="absolute top-[-12px] left-52 h-[6px] w-12 bg-zinc-900 rounded-t-md shadow-md" />
            <div className="absolute bottom-[-12px] left-36 h-[6px] w-16 bg-zinc-900 rounded-b-md shadow-md" />
          </>
        )}
      </div>
    </div>
  )
}

export const AndroidFrame: React.FC<DeviceFrameProps> = ({ children, isPortrait = true }) => {
  // Android phones typically 360x800 points (similar aspect ratio to modern phones)
  const dimensions = isPortrait ? 'h-[800px] w-[360px]' : 'w-[800px] h-[360px]'

  return (
    <div className="flex items-center justify-center">
      <div
        className={`relative flex justify-center ${dimensions} border-4 border-black rounded-2xl`}
        style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
      >
        {/* Front Camera */}
        {isPortrait ? (
          <span className="absolute top-2 left-1/2 transform -translate-x-1/2 border border-black bg-black w-3 h-3 rounded-full z-20" />
        ) : (
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 border border-black bg-black w-3 h-3 rounded-full z-20" />
        )}

        {/* Physical Buttons - with proper z-index */}
        {isPortrait ? (
          <>
            <span className="absolute -right-2 top-20 border-4 border-black h-10 rounded-md" />
            <span className="absolute -right-2 top-44 border-4 border-black h-24 rounded-md" />
          </>
        ) : (
          <>
            <span className="absolute -top-2 left-20 border-4 border-black w-10 h-4 rounded-md" />
            <span className="absolute -top-2 left-44 border-4 border-black w-24 h-4 rounded-md" />
          </>
        )}

        {/* Screen Content - fill entire inner area */}
        <div className="absolute inset-0 rounded-xl overflow-hidden bg-white">
          <div className="w-full h-full">{children}</div>
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
