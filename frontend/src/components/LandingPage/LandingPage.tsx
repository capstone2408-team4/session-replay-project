import React, { useContext } from 'react';
import LandingHeader from '../LandingHeader'
import Login from '../Login/Login';
import Footer from '../Footer';
import LoginOverlay from '../LoginOverlay'
import styles from './LandingPage.module.css'
import { useAuth } from '../AuthProvider/AuthProvider';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const [showLoginModal, setShowLoginModal] = React.useState(false)
  const { projectName, isLoading } = useAuth();
  const navigate = useNavigate();

  const toggleLoginModal = function(e: any) {
    if (showLoginModal && ['backdrop', 'xButton'].includes(e.target.id)) {
      setShowLoginModal(!showLoginModal)
    } else if (!showLoginModal) {
      setShowLoginModal(true)
    }
  }

  React.useEffect(() => {
    console.log('use effect in landing page', projectName)
    if (projectName) {
      navigate('/single')
    }
  }, [projectName, isLoading])

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
