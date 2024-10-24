import React from 'react';
import LandingHeader from '../LandingHeader'
import Login from '../Login/Login';
import Footer from '../Footer';
import LoginOverlay from '../LoginOverlay'
import styles from './LandingPage.module.css'


function LandingPage() {
  const [showModal, setShowModal] = React.useState(false)


  const toggleModal = function(e: any) {
    if (showModal && ['backdrop', 'xButton'].includes(e.target.id)) {
      setShowModal(!showModal)
    } else if (!showModal) {
      setShowModal(true)
    }
  }

  return (
    <div className={styles.landingPageWrapper}>
      {showModal && <LoginOverlay onClose={toggleModal}/>}
      <LandingHeader onLogin={toggleModal}/>
      <Login showModal={showModal} onToggleModal={toggleModal}/>
      <Footer />
    </div>
  )
}

export default LandingPage;
