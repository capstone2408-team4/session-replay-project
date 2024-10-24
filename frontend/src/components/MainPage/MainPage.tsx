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
  const [selectedSession, setSelectedSession] = React.useState<Session | string>('');
  const [selectedSessionEvents, setSelectedSessionEvents] = React.useState<any[]>([])

  const handleSessionSelect = async function(session: Session) {
    setSelectedSession(session)
    const events = await fetchSessionEvents(session);
    setSelectedSessionEvents(events)
  }

  const fetchSessionEvents = async function(session: Session) {
    try {
      console.log(session.file_name)
      // const response = await axios.get(`https://conduit.jjjones.dev/api/events/dcdd34b7-d045-45d6-8ac8-b88e83b0a5f3-2024-10-23T14:48:58.238Z.txt`);
      const response = await axios.get(`https://conduit.jjjones.dev/api/events/${session.file_name}`);
      setSelectedSession(JSON.parse(response.data));
    } catch (error) {
      console.log('error fetching single session', error)
    }
  }

  React.useEffect(() => {
    const fetchSessions = async function() {
      try {
        const sessions = await axios.get('https://conduit.jjjones.dev/api/projects/cfc15e83-970b-42cd-989f-b87b785a1fd4');
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
        <Header />
      </div>
      <div className={styles.sidebar}>
        <SessionSidebar onSessionSelect={handleSessionSelect} sessions={allSessions}/>
      </div>
      <div className={styles.player}>
        <Player session={selectedSession}/>
        <SessionInfoBox session={{session_id: 'Example Session Name'}}/>
      </div>
    </div>
  );
}

export default MainPage;
