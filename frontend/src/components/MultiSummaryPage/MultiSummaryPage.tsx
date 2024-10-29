import React from 'react';
import Header from '../Header';
import MultiSessionSidebar from '../MultiSessionSidebar';
import EmptyPlayer from '../EmptyPlayer/EmptyPlayer.tsx';
import styles from './MultiSummaryPage.module.css'
import axios from 'axios'
import { Session } from '../../Types/index.ts'

function MultiSummaryPage() {
  const [allSessions, setAllSessions] = React.useState<Session[]>([]);
  const [selectedSessions, setSelectedSessions] = React.useState<Session[]>([]);

  const handleSessionSelect = async function(session: Session) {
    if (!session.is_selected) {
      session.is_selected = true
      setSelectedSessions((currentSessions) => currentSessions.slice().concat([session]))
    } else {
      session.is_selected = false
      const newSelectedSession = selectedSessions.filter(selectedSession => selectedSession.id !== session.id )
      setSelectedSessions(newSelectedSession)
    }
  }

  React.useEffect(() => {
    const fetchSessions = async function() {
      try {
        const sessions = await axios.get('http://localhost:5001/api/projects/cfc15e83-970b-42cd-989f-b87b785a1fd4');
        setAllSessions(sessions.data);
      } catch (error) {
        console.error('Error fecthing sessions', error);
        throw error
      }
    }

    fetchSessions();
  }, [])

  return (
    <div className={styles.mainPageWrapper}>
      <div className={styles.headerContainer}>
        <Header project='Providence'/>
      </div>
      <div className={styles.sidebar}>
        <MultiSessionSidebar onSessionSelect={handleSessionSelect} sessions={allSessions}/>
      </div>
      <div className={styles.player}>
        <EmptyPlayer />
      </div>
    </div>
  );
}

export default MultiSummaryPage;
