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
import { useAuth } from '../../hooks/authContext';
import { useNavigate } from 'react-router-dom';
import { eventWithTime } from 'rrweb';
import logger from '../../utils/logger.ts';

function SingleSessionPage() {
  const [allSessions, setAllSessions] = React.useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = React.useState<Session | null>(null);
  const [selectedSessionEvents, setSelectedSessionEvents] = React.useState<eventWithTime[]>([]);
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
      const response = await axios.get(`/api/events/${session.file_name}`, { withCredentials: true});
      setSelectedSessionEvents(JSON.parse(response.data));
    } catch (error) {
      logger.error('Error fetching events file.', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        fileName: session.file_name,
        timestamp: new Date().toISOString()
      })
      throw error
    }
  }

  React.useEffect(() => {
    if (!isLoading && !projectId) {
      navigate('/');
    }

  }, [projectId, isLoading, navigate])  

  React.useEffect(() => {
    const fetchSessions = async function() {
      try {
        const sessions = await axios.get(`/api/projects/${projectId}`, { withCredentials: true});
        setAllSessions(sessions.data);
      } catch (error) {
        logger.error('Error fetching sessions.', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          projectId: projectId,
          timestamp: new Date().toISOString()
        })
        throw error
      }
    }

    fetchSessions();
  }, [navigate, projectId])

  return (
    <div className={styles.mainPageWrapper}>
      <div className={styles.headerContainer}>
        <Header selectedPage={'single'} project='Providence'/>
      </div>
      <div className={styles.sidebar}>
        <SingleSessionSidebar 
          selectedSession={selectedSession} 
          onFilter={filterSessions} 
          onSort={sortSessions} 
          onSessionSelect={handleSessionSelect} 
          sessions={filteredSessions || allSessions}
        />
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
