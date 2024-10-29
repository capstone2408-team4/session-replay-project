import React from 'react';
import Header from '../Header/index.ts';
import MultiSessionSidebar from '../MultiSessionSidebar/index.ts';
import EmptyMultiSession from '../EmptyMultiSession/EmptyMultiSession.tsx';
import styles from './MultiSessionPage.module.css'
import axios from 'axios'
import { Session } from '../../Types/index.ts'

function MultiSessionPage() {
  const [allSessions, setAllSessions] = React.useState<Session[]>([]);
  const [selectedSessions, setSelectedSessions] = React.useState<Session[]>([]);
  const [summaryIsLoading, setSummaryIsLoading] = React.useState(false);
  const [showSessionCountError, setShowSessionCountError] = React.useState(false);
  const [summarizeButtonDisabled, setSummarizeButtonDisabled] = React.useState(false);
  const [currentSummary, setCurrentSummary] = React.useState<null | string>(null)

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

    try {
      const ids = selectedSessions.map(session => session.id);
      const response = await axios.post('http://localhost:5001/api/multi-summary', {ids: ids});
      console.log('summary response from back end was:', response.data)
      setCurrentSummary(response.data)
    } catch (error) {
      console.error('Error sending ids to to backend API')
      throw error
    } finally {
      setSummaryIsLoading(false)
      setSummarizeButtonDisabled(false)
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
      </div>
    </div>
  );
}

export default MultiSessionPage;
