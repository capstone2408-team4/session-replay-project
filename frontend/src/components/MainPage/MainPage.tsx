import React from 'react';
import Header from '../Header';
import SessionSidebar from '../SessionSidebar';
import Player from '../Player/Player.tsx';
import styles from './MainPage.module.css'
import axios from 'axios'
import { Session } from '../../Types/index.ts'
import SessionInfoBox from '../SessionInfoBox/SessionInfoBox.tsx';

function MainPage() {
  const [allSessions, setAllSessions] = React.useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = React.useState<Session | null>(null);
  const [selectedSessionEvents, setSelectedSessionEvents] = React.useState<any[]>([])

  const handleSessionSelect = async function(session: Session) {
    setSelectedSession(session)
    fetchSessionEvents(session);
  }

  const sortSessions = function(sortType: string) {
    setAllSessions((sessions) => {
      return sessions.slice().sort((a, b) => {
        switch (sortType) {
          case 'Time Ascending':
            return new Date(a.session_start) - new Date(b.session_start);
          case 'Time Descending':
            return new Date(b.session_start) - new Date(a.session_start);
          default:
            return 0;
        }
      })
    })
  }

  const fetchSessionEvents = async function(session: Session) {
    try {
      // const response = await axios.get(`https://conduit.jjjones.dev/api/events/${session.file_name}`);
      const response = await axios.get(`http://localhost:5001/api/events/${session.file_name}`);
      setSelectedSessionEvents(JSON.parse(response.data));
    } catch (error) {
      console.log('error fetching single session', error)
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
        <SessionSidebar onSort={sortSessions} onSessionSelect={handleSessionSelect} sessions={allSessions}/>
      </div>
      <div className={styles.player}>
        <Player session={selectedSessionEvents}/>
        {selectedSession && <SessionInfoBox session={selectedSession}/>}
      </div>
    </div>
  );
}

export default MainPage;
