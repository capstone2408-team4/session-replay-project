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
    fetchSessionEvents(session);
  }

  const fetchSessionEvents = async function(session: Session) {
    try {
      const response = await axios.get(`https://conduit.jjjones.dev/api/events/${session.file_name}`);
      setSelectedSessionEvents(JSON.parse(response.data));
    } catch (error) {
      console.log('error fetching single session', error)
    }
  }

  React.useEffect(() => {
    const fetchSessions = async function() {
      try {
        const sessions = await axios.get('https://conduit.jjjones.dev/api/projects/f47ac10b-58cc-4372-a567-0e02b2c3d479');
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
        <SessionSidebar onSessionSelect={handleSessionSelect} sessions={allSessions}/>
      </div>
      <div className={styles.player}>
        <Player session={selectedSessionEvents}/>
        <SessionInfoBox session={selectedSession}/>
      </div>
    </div>
  );
}

export default MainPage;
