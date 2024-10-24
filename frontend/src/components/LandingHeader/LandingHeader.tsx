import styles from './LandingHeader.module.css'
import Header from '../Header'

interface HeaderProps {
  onLogin?: (e: any) => void
}

function LandingHeader({ onLogin }: HeaderProps) {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerSubContainer}>
        <Header onLogin={onLogin}/>
      </div>
    </div>
  )
}

export default LandingHeader;
