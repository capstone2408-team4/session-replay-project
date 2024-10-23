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

// {
//   "data": [
//     {
//       "id": 1,
//       "session_id": "93fa9fec-5a7c-4108-87e9-ec3292b79e79",
//       "project_id": "cfc15e83-970b-42cd-989f-b87b785a1fd4",
//       "file_name": "93fa9fec-5a7c-4108-87e9-ec3292b79e79-2024-10-22T15:51:17.135Z.txt",
//       "session_summary": null,
//       "session_start": "2024-10-22T15:51:17.135Z",
//       "session_end": "2024-10-22T15:52:59.948Z",
//       "last_activity_at": "2024-10-22T15:51:57.159Z",
//       "is_active": false
//     },
//     {
//       "id": 2,
//       "session_id": "93fa9fec-5a7c-4108-87e9-ec3292b79e79",
//       "project_id": "cfc15e83-970b-42cd-989f-b87b785a1fd4",
//       "file_name": "93fa9fec-5a7c-4108-87e9-ec3292b79e79-2024-10-22T15:54:52.084Z.txt",
//       "session_summary": null,
//       "session_start": "2024-10-22T15:54:52.084Z",
//       "session_end": "2024-10-22T15:56:00.467Z",
//       "last_activity_at": "2024-10-22T15:54:52.084Z",
//       "is_active": false
//     },
//     {
//       "id": 3,
//       "session_id": "2a540263-5ebb-4e08-8adf-1b01b1586af2",
//       "project_id": "cfc15e83-970b-42cd-989f-b87b785a1fd4",
//       "file_name": "2a540263-5ebb-4e08-8adf-1b01b1586af2-2024-10-22T15:54:59.001Z.txt",
//       "session_summary": null,
//       "session_start": "2024-10-22T15:54:59.001Z",
//       "session_end": "2024-10-22T15:56:30.573Z",
//       "last_activity_at": "2024-10-22T15:55:24.166Z",
//       "is_active": false
//     },
//     {
//       "id": 4,
//       "session_id": "2a540263-5ebb-4e08-8adf-1b01b1586af2",
//       "project_id": "cfc15e83-970b-42cd-989f-b87b785a1fd4",
//       "file_name": "2a540263-5ebb-4e08-8adf-1b01b1586af2-2024-10-22T15:57:45.892Z.txt",
//       "session_summary": null,
//       "session_start": "2024-10-22T15:57:45.892Z",
//       "session_end": "2024-10-22T15:59:00.982Z",
//       "last_activity_at": "2024-10-22T15:57:58.985Z",
//       "is_active": false
//     }
//   ]
// }