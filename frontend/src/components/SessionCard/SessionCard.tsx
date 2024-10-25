import styles from './SessionCard.module.css'
import { Session } from '../../Types';
import { millisToMinutesAndSeconds } from '../../utils/helpers';

interface SessionCardProps {
  session: Session
  onSessionSelect: (session: Session) => void
}

function SessionCard( { session, onSessionSelect }: SessionCardProps) {
  return (
    <div onClick={() => onSessionSelect(session)} role='button' aria-label="Click to select session." tabIndex={0} className={styles.sessionCard}>
      <div className={styles.cardContainer}>
        <ul>
          <li style={{color: 'red'}}>Session ID: {session.session_id}</li> 
          <li style={{color: 'orange'}}>Date: {new Date(session.session_start).toDateString()}</li>
          <li style={{color: 'yellow'}}>Duration: {millisToMinutesAndSeconds(new Date(session.session_end) - new Date(session.session_start))}</li>
          <li style={{color: 'green'}}>Behavior Sentiment: 7/10</li>
          <li style={{color: 'white'}}>Location: Pearly Gates</li>
          <li style={{color: 'white'}}>IP Address: 192.168.1.1</li>
          <li style={{color: 'violet'}}>OS: </li>
        </ul>
      </div>
    </div>
  )
}

export default SessionCard;




// SessionID            session.session_id
// Date                 new Date(session.session_start).toDateString()
// Duration             millisToMinutesAndSeconds(new Date(session.session_end) - new Date(session.session_start))
// Behavior Sentiment   session.behavior_score
// Location             session.location
// IP Address           session.IP_address
// Operating System     session.os


// await client.query(`
//   CREATE TABLE IF NOT EXISTS sessions (
//     id SERIAL PRIMARY KEY,
//     session_id VARCHAR(255) NOT NULL,
//     project_id VARCHAR(255) NOT NULL,
//     file_name VARCHAR(255) NOT NULL,
//     session_summary TEXT,
//     session_start TIMESTAMP WITH TIME ZONE NOT NULL,
//     session_end TIMESTAMP WITH TIME ZONE,
//     last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL,
//     is_active BOOLEAN NOT NULL DEFAULT TRUE,
//     CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id)
//   );
// `);