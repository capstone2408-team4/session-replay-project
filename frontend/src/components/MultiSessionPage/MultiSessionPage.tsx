import React from 'react';
import Header from '../Header/index.ts';
import MultiSessionSidebar from '../MultiSessionSidebar/index.ts';
import EmptyMultiSession from '../EmptyMultiSession/EmptyMultiSession.tsx';
import styles from './MultiSessionPage.module.css'
import axios from 'axios'
import { Session } from '../../Types/index.ts'
import { useAuth } from '../../hooks/authContext';
import { useNavigate } from 'react-router-dom';


function MultiSessionPage() {
  const [allSessions, setAllSessions] = React.useState<Session[]>([]);
  const [selectedSessions, setSelectedSessions] = React.useState<Session[]>([]);
  const [summaryIsLoading, setSummaryIsLoading] = React.useState(false);
  const [showSessionCountError, setShowSessionCountError] = React.useState(false);
  const [summarizeButtonDisabled, setSummarizeButtonDisabled] = React.useState(false);
  const [currentSummary, setCurrentSummary] = React.useState<null | string>(null)
  const { projectId, isLoading } = useAuth();
  const navigate = useNavigate();

  const summarizedIds = React.useRef<number[]>()

  const handleSessionSelect = async function(session: Session) {
    if (!session.is_selected) {
      if (selectedSessions.length >= 10) {
        setShowSessionCountError(true)
        setTimeout(() => {
          setShowSessionCountError(false)
        }, 3000)
      } else {
        session.is_selected = true
        setSelectedSessions((currentSessions) => currentSessions.slice().concat([session]))
      }
    } else {
      session.is_selected = false
      const newSelectedSession = selectedSessions.filter(selectedSession => selectedSession.id !== session.id )
      setSelectedSessions(newSelectedSession)
    }
  }

  const handleSummarizeSession = async function() {
    setSummaryIsLoading(true)
    setSummarizeButtonDisabled(true)
    setCurrentSummary(null)
    
    if (selectedSessions.length === 0) {
      setSummaryIsLoading(false)
      setSummarizeButtonDisabled(false)
      return
    } 

    const ids = selectedSessions.map(session => session.id);
    try {
      const response = await axios.post('http://localhost:5001/api/multi-summary', {ids: ids}, { withCredentials: true});
      summarizedIds.current = ids;
      setCurrentSummary(response.data)
    } catch (error) {
      throw error
    } finally {
      setSummaryIsLoading(false)
      setSummarizeButtonDisabled(false)
    }
  }

  React.useEffect(() => {
    if (!projectId && !isLoading) {
      navigate('/');
    }

  }, [projectId, isLoading, navigate])

  React.useEffect(() => {
    const fetchSessions = async function() {
      try {
        const sessions = await axios.get(`http://localhost:5001/api/projects/${projectId}`, { withCredentials: true});
        setAllSessions(sessions.data);
      } catch (error) {
        throw error
      }
    }

    if (projectId) {
      fetchSessions();
    }
  
  }, [projectId])

  return (
    <div className={styles.mainPageWrapper}>
      <div className={styles.headerContainer}>
        <Header selectedPage={'multi'} project='Providence'/>
      </div>
      <div className={styles.sidebar}>
        <MultiSessionSidebar 
          onSummarizeSession={handleSummarizeSession} 
          showSessionCountError={showSessionCountError} 
          onSessionSelect={handleSessionSelect} 
          sessions={allSessions}
          buttonDisabled={summarizeButtonDisabled}
        />
      </div>
      <div className={styles.player}>
        {!currentSummary && <EmptyMultiSession isLoading={summaryIsLoading}/>}
        {currentSummary && 
          <div className={styles.sessionSummaryContainer}>
            <h1>Multi Session Summary</h1>
            <h2>{`For session IDs: ${summarizedIds.current?.join(', ')}`}</h2>
            <div className={styles.sessionSummary}>
              {currentSummary}
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export default MultiSessionPage;
