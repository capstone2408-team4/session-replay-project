import styles from './Login.module.css'
import padlock from '../../assets/padlock.png'

interface LoginProps {
  showModal: boolean
  onToggleModal: (e: any) => void
}

function Login( { onToggleModal }: LoginProps) {
  return (
    <main className={styles.loginContainer}>
      <div className={styles.loginDialogBox}>
        <svg className={styles.padlock} width="160" height="240">
          <image
            href={padlock}
            x='0'
            y='0'
            height='240'
            width='160'
          >
          </image>
        </svg>
        <div className={styles.notLoggedIn}>
          <h1>Not Logged In</h1>
          <p>Please <a onClick={onToggleModal}>log in</a> to access your project.</p>
        </div>
      </div>
    </main>
  )
}

export default Login;
