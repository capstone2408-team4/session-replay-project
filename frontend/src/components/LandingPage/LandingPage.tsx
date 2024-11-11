import React from 'react';
import LandingHeader from '../LandingHeader'
import Login from '../Login/Login';
import Footer from '../Footer';
import LoginOverlay from '../LoginOverlay'
import styles from './LandingPage.module.css'
import { useAuth } from '../AuthProvider/AuthProvider';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const [showLoginModal, setShowLoginModal] = React.useState(false)
  const { projectId, isLoading } = useAuth();
  const navigate = useNavigate();

  const toggleLoginModal = function(e: any) {
    if (showLoginModal && ['backdrop', 'xButton'].includes(e.target.id)) {
      setShowLoginModal(!showLoginModal)
    } else if (!showLoginModal) {
      setShowLoginModal(true)
    }
  }

  React.useEffect(() => {
    if (projectId) {
      navigate('/single')
    }
  }, [projectId, isLoading])

  if (isLoading) {
    return <></>
  }

  return (
    <div className={styles.landingPageWrapper}>
      {showLoginModal && <LoginOverlay onClose={toggleLoginModal}/>}
      <LandingHeader onLogin={toggleLoginModal}/>
      <Login onToggleLoginModal={toggleLoginModal}/>
      <Footer />
    </div>
  )
}

export default LandingPage;
