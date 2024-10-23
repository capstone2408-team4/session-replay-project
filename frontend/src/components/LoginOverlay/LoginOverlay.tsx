import React from 'react';
import styles from './LoginOverlay.module.css';
import xButton from '../../assets/x.png';

interface LoginOverlayProps {
  onClose: (e: any) => void;
}

function LoginOverlay( { onClose }: LoginOverlayProps) {

  const [projectName, setProjectName] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleNameInput = function(e: any) {
    setProjectName(e.target.value)
  }

  const handlePasswordInput = function(e: any) {
    setPassword(e.target.value)
  }

  return (
    <div className={styles.overlayContainer}>
      <div id='backdrop' onClick={onClose} className={styles.overlay}>
        <div className={styles.overlayBox}>
          <div className={styles.gradientBox}>
            <p>Log in:</p>
          </div>
          <div className={styles.loginBoxContainer}>
            <div className={styles.loginBox}>
              <form>
                <div className={styles.userNameContainer}>
                  <label style={{ display: 'block'}} htmlFor='user_name'>Please enter the project user name:</label>
                  <input value={projectName} onChange={handleNameInput} id='user_name' type='text' placeholder='username'></input>
                  <label style={{ display: 'block'}} htmlFor='password'>Please enter the project password:</label>
                  <input value={password} onChange={handlePasswordInput} id='password' type='password' placeholder='password'></input>
                  <button type='submit'>Mamma Mia Letsa Go!</button>
                </div>
              </form>
            </div>
          </div>
          <div>
            <svg className={styles.xButton} width='40' height='40' xmlns='xmlns="http://www.w3.org/2000/svg"'>
              <image
                id='xButton'
                href={xButton}
                width='30'
                height='30'
                x='5'
                y='5'
                onClick={onClose}
              >
              </image>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginOverlay;
