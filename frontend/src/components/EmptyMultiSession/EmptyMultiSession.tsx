import styles from './EmptyMultiSession.module.css'
import loading from '../../assets/loading.gif'

interface EmptyMultiSessionProps {
  isLoading: boolean
}

function EmptyMultiSession({ isLoading }: EmptyMultiSessionProps) {
  return (
    <div className={styles.empty}>
      {!isLoading && <p className={styles.message}>Please select up to 10 sessions from the sidebar to summarize.</p>}
      {isLoading && <img src={loading}></img>}
    </div>
  )
}

export default EmptyMultiSession;
