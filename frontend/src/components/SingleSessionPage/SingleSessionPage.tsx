import React from 'react';
import Header from '../Header/index.ts';
import SingleSessionSidebar from '../SingleSessionSidebar/SingleSessionSidebar.tsx';
import Player from '../Player/Player.tsx';
import styles from './SingleSessionPage.module.css'
import axios from 'axios'
import { Session } from '../../Types/index.ts'
import SessionInfoBox from '../SessionInfoBox/SessionInfoBox.tsx';
import EmptyPlayer from '../EmptyPlayer/EmptyPlayer.tsx';
import { filterToday, filterYday, filterRange, sorter } from '../../utils/helpers.ts';
import { useAuth } from '../AuthProvider/AuthProvider.tsx';
import { useNavigate } from 'react-router-dom';

function SingleSessionPage() {
  const [allSessions, setAllSessions] = React.useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = React.useState<Session | null>(null);
  const [selectedSessionEvents, setSelectedSessionEvents] = React.useState<any[]>([]);
  const [filteredSessions, setFilteredSessions] = React.useState<Session[] | null>(null);
  const { projectId, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSessionSelect = async function(session: Session) {
    setSelectedSession(session)
    fetchSessionEvents(session);
  }

  const sortSessions = function(sortType: string) {
    if (filteredSessions) {
      setFilteredSessions(sorter(filteredSessions, sortType));
    } else {
      setAllSessions(sorter(allSessions, sortType));
    }
  }

  const filterSessions = function(filterType: string, range: null | number=null) {
    if (filterType === 'today') {
      setFilteredSessions(filterToday(allSessions));
    } else if (filterType === 'yesterday') {
      setFilteredSessions(filterYday(allSessions));
    } else if (filterType === 'range' && range) {
      setFilteredSessions(filterRange(allSessions, range))
    } else {
      setFilteredSessions(null)
    }

    setSelectedSession(null)
  }

  const fetchSessionEvents = async function(session: Session) {
    try {
      const response = await axios.get(`http://localhost:5001/api/events/${session.file_name}`, { withCredentials: true});
      setSelectedSessionEvents(JSON.parse(response.data));
    } catch (error) {
      console.log('error fetching single session', error)
    }
  }

  React.useEffect(() => {
    if (!isLoading && !projectId) {
      navigate('/');
    }

  }, [projectId, isLoading])  

  React.useEffect(() => {
    const fetchSessions = async function() {
      try {
        const sessions = await axios.get(`http://localhost:5001/api/projects/cfc15e83-970b-42cd-989f-b87b785a1fd4`, { withCredentials: true});
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
        <Header selectedPage={'single'} project='Providence'/>
      </div>
      <div className={styles.sidebar}>
        <SingleSessionSidebar selectedSession={selectedSession} onFilter={filterSessions} onSort={sortSessions} onSessionSelect={handleSessionSelect} sessions={filteredSessions || allSessions}/>
      </div>
      <div className={styles.player}>
        {!selectedSession && <EmptyPlayer />}
        {selectedSession && <>
          <Player session={selectedSessionEvents}/>
          <SessionInfoBox session={selectedSession}/>
        </>}
      </div>
    </div>
  );
}

export default SingleSessionPage;
