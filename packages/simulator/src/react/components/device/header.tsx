/** @jsxImportSource react */

import { ArrowLeft, MoreVertical, ShieldCheck } from 'lucide-react'

interface HeaderProps {
  agent: {
    iconUrl: string
    brandName: string
  }
  isAndroid: boolean
  isDarkMode: boolean
  isPortrait: boolean
}

export const Header = (props: HeaderProps) => {
  return (
    <div
      style={{
        padding: '0.75rem',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: props.isDarkMode ? '#27272a' : '#f3f4f6',
        color: props.isDarkMode ? '#e5e7eb' : '#1f2937',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ArrowLeft />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginLeft: '1rem',
          }}
        >
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              backgroundColor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              overflow: 'hidden'
            }}
          >
             {props.agent.iconUrl ? (
                <img src={props.agent.iconUrl} alt="Agent" style={{ width: '100%', height: '100%' }} />
             ) : (
                <div style={{ color: 'white', fontWeight: 'bold' }}>A</div>
             )}
          </div>
          <p
            style={{
              marginBottom: '0',
            }}
          >
            {props.agent.brandName}
          </p>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <ShieldCheck />
        <MoreVertical />
      </div>
    </div>
  )
}
