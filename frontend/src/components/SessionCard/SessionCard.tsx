import styles from './SessionCard.module.css'
import { Session } from '../../Types';


interface SessionCardProps {
  session: Session
  onSessionSelect: (session: Session) => void
}

function SessionCard( { session, onSessionSelect }: SessionCardProps) {
  return (
    <div onClick={() => onSessionSelect(session)} role='button' aria-label="Click to select session." tabIndex={0} className={styles.sessionCard}>
      <span>{session.session_id}</span>
    </div>
  )
}

export default SessionCard;
