import React from 'react'

export interface PreviewControlsProps {
  /** Current preview index (0-based) */
  currentIndex: number
  /** Total number of messages */
  totalMessages: number
  /** Callback when user clicks Previous */
  onPrevious: () => void
  /** Callback when user clicks Next */
  onNext: () => void
  /** Optional: Auto-play state */
  isAutoPlaying?: boolean
  /** Optional: Toggle auto-play */
  onToggleAutoPlay?: () => void
  /** Whether controls are disabled */
  disabled?: boolean
}

/**
 * Preview mode navigation controls
 * Shows Previous/Next buttons and current position indicator
 */
export const PreviewControls: React.FC<PreviewControlsProps> = ({
  currentIndex,
  totalMessages,
  onPrevious,
  onNext,
  isAutoPlaying = false,
  onToggleAutoPlay,
  disabled = false,
}) => {
  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex < totalMessages - 1
  const displayIndex = currentIndex + 1 // 1-based for display

  return (
    <div
      className="preview-controls"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        backgroundColor: 'var(--preview-controls-bg, #f5f5f5)',
        borderRadius: '8px',
        marginBottom: '8px',
      }}
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={disabled || !canGoPrevious}
        className="preview-control-btn"
        title="Previous message"
        style={{
          padding: '6px 12px',
          border: '1px solid var(--preview-control-border, #ccc)',
          borderRadius: '4px',
          backgroundColor: 'var(--preview-control-btn-bg, white)',
          cursor: canGoPrevious && !disabled ? 'pointer' : 'not-allowed',
          opacity: canGoPrevious && !disabled ? 1 : 0.5,
        }}
      >
        ← Prev
      </button>

      <span
        className="preview-position"
        style={{
          fontFamily: 'monospace',
          fontSize: '14px',
          minWidth: '60px',
          textAlign: 'center',
        }}
      >
        {totalMessages > 0 ? `${displayIndex} / ${totalMessages}` : '0 / 0'}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={disabled || !canGoNext}
        className="preview-control-btn"
        title="Next message"
        style={{
          padding: '6px 12px',
          border: '1px solid var(--preview-control-border, #ccc)',
          borderRadius: '4px',
          backgroundColor: 'var(--preview-control-btn-bg, white)',
          cursor: canGoNext && !disabled ? 'pointer' : 'not-allowed',
          opacity: canGoNext && !disabled ? 1 : 0.5,
        }}
      >
        Next →
      </button>

      {onToggleAutoPlay && (
        <button
          type="button"
          onClick={onToggleAutoPlay}
          disabled={disabled}
          className="preview-control-btn preview-autoplay-btn"
          title={isAutoPlaying ? 'Stop auto-play' : 'Start auto-play'}
          style={{
            padding: '6px 12px',
            border: '1px solid var(--preview-control-border, #ccc)',
            borderRadius: '4px',
            backgroundColor: isAutoPlaying
              ? 'var(--preview-autoplay-active, #4CAF50)'
              : 'var(--preview-control-btn-bg, white)',
            color: isAutoPlaying ? 'white' : 'inherit',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {isAutoPlaying ? '⏸ Stop' : '▶ Auto'}
        </button>
      )}
    </div>
  )
}
