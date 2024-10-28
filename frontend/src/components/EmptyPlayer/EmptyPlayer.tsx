import styles from './EmptyPlayer.module.css'

function EmptyPlayer() {
  return (
    <div className={styles.empty}>
      <p className={styles.message}>Please select a session to begin watching.</p>
    </div>
  );
}

export default EmptyPlayer;
