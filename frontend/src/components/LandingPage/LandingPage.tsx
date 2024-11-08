import React from 'react';
import LandingHeader from '../LandingHeader'
import Login from '../Login/Login';
import Footer from '../Footer';
import LoginOverlay from '../LoginOverlay'
import styles from './LandingPage.module.css'

function LandingPage() {
  const [showLoginModal, setShowLoginModal] = React.useState(false)

  const toggleLoginModal = function(e: any) {
    if (showLoginModal && ['backdrop', 'xButton'].includes(e.target.id)) {
      setShowLoginModal(!showLoginModal)
    } else if (!showLoginModal) {
      setShowLoginModal(true)
    }
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
