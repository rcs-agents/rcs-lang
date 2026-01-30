import { Moon, RectangleHorizontal, RectangleVertical, Sun } from 'lucide-react'
import React from 'react'
import type { DisplaySettings } from '../../core/types.js'

export interface SimulatorControlsProps {
  displaySettings: DisplaySettings
  onToggleOrientation: () => void
  onToggleTheme: () => void
  onTogglePlatform: () => void
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  displaySettings,
  onToggleOrientation,
  onToggleTheme,
  onTogglePlatform,
}) => {
  const { isPortrait, isDarkMode, isAndroid } = displaySettings

  return (
    <div
      className="simulator-controls"
      style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '10px',
        padding: '10px',
        background: isDarkMode ? '#333' : '#f0f0f0',
        borderRadius: '8px',
      }}
    >
      <button onClick={onToggleOrientation} title="Toggle Orientation">
        {isPortrait ? (
          <RectangleVertical size={16} color={isDarkMode ? 'white' : 'black'} />
        ) : (
          <RectangleHorizontal size={16} color={isDarkMode ? 'white' : 'black'} />
        )}
      </button>
      <button onClick={onToggleTheme} title="Toggle Theme">
        {isDarkMode ? <Moon size={16} color="white" /> : <Sun size={16} color="orange" />}
      </button>
      <button
        onClick={onTogglePlatform}
        style={{ fontSize: '12px', padding: '0 5px' }}
      >
        {isAndroid ? 'Android' : 'iOS'}
      </button>
    </div>
  )
}
