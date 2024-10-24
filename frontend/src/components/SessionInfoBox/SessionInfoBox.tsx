import { Session } from '../../Types';
import styles from './SessionInfoBox.module.css'

interface SessionInfoBoxProps {
  session: Session
}

function SessionInfoBox({ session }: SessionInfoBoxProps) {
  return (
    <div className={styles.sessionInfoBox}>
      <div className={styles.sessionTitle}>
        {session.session_id}
      </div>
      Your future AI summary goes here:
    </div>
  )
}

export default SessionInfoBox;
