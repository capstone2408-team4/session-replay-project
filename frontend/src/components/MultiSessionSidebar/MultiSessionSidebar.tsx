import React from 'react';
import styles from './MultiSessionSidebar.module.css'
import SessionCard from '../SessionCard';
import { Session } from '../../Types';
import ai from '../../assets/ai.png'

interface SingleSessionSidebarProps {
  sessions: Session[]
  onSessionSelect: (session: Session) => void
}

function SingleSessionSidebar( { sessions, onSessionSelect } : SingleSessionSidebarProps) {
  return (
    <div className={styles.sidebarMain}>
      <div className={styles.sidebarHeader}>
        <button className={styles.sidebarButton}>
            Summarize Recordings
            <svg width={30} height={30} xmlns="http://www.w3.org/2000/svg">
              <image href={ai} x='0' y='0'height='30'width='30' />
            </svg>
          </button>
      </div>
      {sessions.map(session => {
        return <SessionCard isActive={!!session.is_selected} key={session.session_id} onSessionSelect={onSessionSelect} session={session} />
      })}
    </div>
    
  );
}

export default SingleSessionSidebar;
