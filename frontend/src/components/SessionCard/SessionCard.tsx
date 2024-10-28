import styles from './SessionCard.module.css'
import { Session } from '../../Types';
import { millisToMinutesAndSeconds } from '../../utils/helpers';

interface SessionCardProps {
  session: Session
  onSessionSelect: (session: Session) => void
}

function SessionCard( { session, onSessionSelect }: SessionCardProps) {
  // duration to be replaced with something from backend
  // location aslso
  // behavior as well

  return (
    <div onClick={() => onSessionSelect(session)} role='button' aria-label="Click to select session." tabIndex={0} className={styles.sessionCard}>
      <div className={styles.cardContainer}>
        <ul>
          <li>Time: {new Date(session.session_start).toUTCString()}</li>
          <li>Session ID: <span className={styles.sessionID}>{session.session_id.slice(0, 18)}</span></li> 
          <li >Behavior Sentiment: 7/10</li>
          <li >Location: Gates of Hell</li>
          <li>Duration: {millisToMinutesAndSeconds(new Date(session.session_end) - new Date(session.session_start))}</li> 
          <li>OS: </li>
        </ul>
      </div>
    </div>
  )
}

export default SessionCard;
