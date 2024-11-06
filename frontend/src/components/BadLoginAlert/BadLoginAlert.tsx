import styles from './BadLoginAlert.module.css'

interface BadLoginAlertProps {
  register?: boolean
}

function BadLoginAlert({ register }: BadLoginAlertProps) {
  return (
    <div className={styles.alertContainer}>
      {!register ? 'Incorrect credentials. Please try again.' : 'Passwords do not match.'}
    </div>
  );
}

export default BadLoginAlert;
