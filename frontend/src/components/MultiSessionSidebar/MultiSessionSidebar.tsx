import styles from './MultiSessionSidebar.module.css'
import SessionCard from '../SessionCard';
import SessionCountError from '../SessionCountError';
import { Session } from '../../Types';
import ai from '../../assets/ai.png'

interface SingleSessionSidebarProps {
  sessions: Session[]
  onSessionSelect: (session: Session) => void
  showSessionCountError: boolean
  onSummarizeSession: () => void
  buttonDisabled: boolean
}

function SingleSessionSidebar( { sessions, onSessionSelect, showSessionCountError, onSummarizeSession, buttonDisabled } : SingleSessionSidebarProps) {
  return (
    <div className={styles.sidebarMain}>
      <div className={styles.sidebarHeader}>
        {showSessionCountError && <SessionCountError />}
        <button disabled={buttonDisabled} onClick={onSummarizeSession} className={styles.sidebarButton}>
            Summarize Recordings
            <svg width={30} height={30} xmlns="http://www.w3.org/2000/svg">
              <image href={ai} x='0' y='0'height='30'width='30' />
            </svg>
          </button>
      </div>
      {sessions.map(session => {
        return <SessionCard isActive={!!session.is_selected} key={session.id} onSessionSelect={onSessionSelect} session={session} />
      })}
    </div>
    
  );
}

export default SingleSessionSidebar;
