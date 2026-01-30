import { BatteryIcon, CellSignalIcon } from '../icons'

const getCurrentTime = ({ hour12 }: { hour12?: boolean } = { hour12: true }) => {
  const now = new Date()
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12 })
}

export const StatusBar = (props: { isAndroid: boolean; isDarkMode?: boolean }) => {
  return (
    <div
      style={{
        paddingLeft: '0.75rem',
        paddingRight: '0.75rem',
        paddingTop: '0.25rem',
        paddingBottom: '0.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: props.isDarkMode ? '#e5e7eb' : '#374151',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: '600',
        }}
      >
        {getCurrentTime()}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        <CellSignalIcon />
        <BatteryIcon />
      </div>
    </div>
  )
}
