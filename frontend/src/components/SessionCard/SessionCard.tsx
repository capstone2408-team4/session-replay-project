import styles from './SessionCard.module.css'
import { Session } from '../../Types';
import { millisToMinutesAndSeconds } from '../../utils/helpers';

interface SessionCardProps {
  session: Session
  onSessionSelect: (session: Session) => void
  isActive: boolean
}

function SessionCard( { session, onSessionSelect, isActive }: SessionCardProps) {
  const start = new Date(session.last_activity_at).getTime();
  const end = new Date(session.session_start).getTime();
  const duration = millisToMinutesAndSeconds(start - end);

  return (
    <div 
      onClick={() => onSessionSelect(session)} 
      role='button' 
      aria-label="Click to select session." 
      tabIndex={0} 
      className={`${styles.sessionCard} ${isActive && styles.activeSelection}`}
    >
      <div className={styles.cardContainer}>
        <ul>
          <li>Time: {new Date(session.session_start).toUTCString()}</li>
          <li>Session ID:
            <span 
              className={styles.sessionID}>{session.session_id.slice(0, 18)}
            </span>
          </li> 
          <li>Duration: {duration}</li> 
        </ul>
      </div>
    </div>
  )
}

export default SessionCard;
