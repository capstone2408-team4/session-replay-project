import React from 'react';
import SortDropdown from '../SortDropdown';
import styles from './SessionSidebar.module.css'
import down from '../../assets/down.png'
import SessionCard from '../SessionCard';
import { Session } from '../../Types';


interface SessionSidebarProps {
  sessions: Session[]
  onSessionSelect: (session: Session) => void
}

function SessionSidebar( { sessions, onSessionSelect } : SessionSidebarProps) {
  const [showSortDropdown, setShowSortDropdown] = React.useState(false)
  const [showFilterPopover, setShowFilterPopover] = React.useState(false)

  return (
    <div className={styles.sidebarMain}>
      <div className={styles.sidebarHeader}>
        <button className={styles.sidebarButton}>
          Sort
          <svg width={30} height={30} xmlns="http://www.w3.org/2000/svg">
            <image href={down} x='2' y='6'height='20'width='20' />
          </svg>
        </button>
        {/* <SortDropdown /> */}
        <button className={styles.sidebarButton}>
          Filter
          <svg width={30} height={30} xmlns="http://www.w3.org/2000/svg">
            <image href={down} x='2' y='6' height='20' width='20' />
          </svg>
        </button>
      </div>
      {sessions.map(session => {
        return <SessionCard onSessionSelect={onSessionSelect} session={session} />
      })}
    </div>
    
  );
}

export default SessionSidebar;
