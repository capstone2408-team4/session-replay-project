import styles from './BadLoginAlert.module.css'

function BadLoginAlert() {
  return (
    <div className={styles.alertContainer}>
      Incorrect credentials. Please try again.
    </div>
  );
}

export default BadLoginAlert;
