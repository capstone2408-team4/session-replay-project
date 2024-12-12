import { Session } from '../../Types';
import styles from './SessionInfoBox.module.css'

interface SessionInfoBoxProps {
  session: Session
}

function SessionInfoBox({ session }: SessionInfoBoxProps) {
  return (
    <div className={styles.sessionInfoBox}>
      <div className={styles.sessionTitle}>
        Session: {session.session_id}
      </div>
      Session Summary:
      <p>{session.session_summary}</p> 
    </div>
  )
}

export default SessionInfoBox;
