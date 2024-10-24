import React from 'react';
import styles from './RegisterOverlay.module.css';
import xButton from '../../assets/x.png';

interface RegisterOverlayProps {
  onClose: (e: any) => void;
}

function RegisterOverlay( { onClose }: RegisterOverlayProps) {
  const [projectName, setProjectName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordRepeat, setPasswordRepeat] = React.useState('');

  const handleNameInput = function(e: React.ChangeEvent<HTMLInputElement>) {
    setProjectName(e.target.value)
  }

  const handlePasswordInput = function(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value)
  }

  const handlePasswordRepeatInput = function(e: React.ChangeEvent<HTMLInputElement>) {
    setPasswordRepeat(e.target.value)
  }

  const handleRegister = function(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== passwordRepeat) {
      alert('Incorret password dum dum')
    } else {
      alert('Looks good')
    }
  }

  return (
    <div className={styles.overlayContainer}>
      <div id='backdrop' onClick={onClose} className={styles.overlay}>
        <div className={styles.overlayBox}>
          <div className={styles.gradientBox}>
            <p>Register:</p>
          </div>
          <div className={styles.loginBoxContainer}>
            <div className={styles.loginBox}>
              <form onSubmit={handleRegister}>
                <div className={styles.userNameContainer}>
                  <label style={{ display: 'block'}} htmlFor='user_name'>Please enter the user name for your new project:</label>
                  <input value={projectName} onChange={handleNameInput} id='user_name' type='text' placeholder='username' minLength={5} required></input>
                  <label style={{ display: 'block'}} htmlFor='password'>Please enter a project password:</label>
                  <input value={password} onChange={handlePasswordInput} id='password' type='password' placeholder='password' minLength={8} required></input>
                  <label style={{ display: 'block'}} htmlFor='passwordRepeat'>Please re-enter password:</label>
                  <input value={passwordRepeat} onChange={handlePasswordRepeatInput} id='passwordRepeat' type='password' placeholder='password' minLength={8} required></input>
                  <button type='submit'>Submit</button>
                </div>
              </form>
            </div>
          </div>
          <div>
            <svg className={styles.xButton} width='40' height='40' xmlns='xmlns="http://www.w3.org/2000/svg"'>
              <image id='xButton' href={xButton} width='30' height='30' x='5' y='5' onClick={onClose} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterOverlay;

