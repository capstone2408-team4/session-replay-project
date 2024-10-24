import React from 'react';
import LandingHeader from '../LandingHeader'
import Login from '../Login/Login';
import Footer from '../Footer';
import LoginOverlay from '../LoginOverlay'
import styles from './LandingPage.module.css'
import RegisterOverlay from '../RegisterOverlay';


function LandingPage() {
  const [showLoginModal, setShowLoginModal] = React.useState(false)
  const [showRegisterModal, setShowRegisterModal] = React.useState(false)

  const toggleLoginModal = function(e: any) {
    if (showLoginModal && ['backdrop', 'xButton'].includes(e.target.id)) {
      setShowLoginModal(!showLoginModal)
    } else if (!showLoginModal) {
      setShowLoginModal(true)
    }
  }

  const toggleRegisterModal = function(e: any) {
    if (showRegisterModal && ['backdrop', 'xButton'].includes(e.target.id)) {
      setShowRegisterModal(!showRegisterModal)
    } else if (!showRegisterModal) {
      setShowRegisterModal(true)
    }
  }

  return (
    <div className={styles.landingPageWrapper}>
      {showLoginModal && <LoginOverlay onClose={toggleLoginModal}/>}
      {showRegisterModal && <RegisterOverlay onClose={toggleRegisterModal}/>}
      <LandingHeader onLogin={toggleLoginModal}/>
      <Login onToggleRegisterModal={toggleRegisterModal} onToggleLoginModal={toggleLoginModal}/>
      <Footer />
    </div>
  )
}

export default LandingPage;
