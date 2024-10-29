import styles from './SessionCountError.module.css'

function SessionCountError() {
  return (
    <div className={styles.error}>
      Exceeded max session count of 10. Please deselect a session to continue.
    </div>
  )
}

export default SessionCountError;
