import styles from './Header.module.css';
import providenceImg from '../../assets/providence.png';
import infinityImg from '../../assets/infinity.png';
import playButton from '../../assets/playbutton.png'
import { Link } from 'react-router-dom';

interface HeaderProps {
  onLogin?: (e:any) => void
  project?: string
  selectedPage?: string
}

function Header({ onLogin, project, selectedPage }: HeaderProps) {
  return (
    <header className={styles.header}>
      <svg width="280" height="60" xmlns="http://www.w3.org/2000/svg">
        <image href={providenceImg} x="0" y="-30" height="120px" width="280px"/>
      </svg>
      

      {project && <div className={styles.midpoint}>
        <Link to='/single'>
          <div tabIndex={0} className={`${styles.headerChoice} ${styles.gradientText} ${selectedPage === 'single' && styles.pageSelected}`}>
            <svg className={styles.infinity} width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <image href={playButton} x="0" y="0" height="40px" width="40px"/>
            </svg>
            <span>Single Session</span>
          </div>
        </Link>
        <Link to='/multi'>
          <div tabIndex={0} className={`${styles.headerChoice} ${styles.gradientText} ${selectedPage === 'multi' && styles.pageSelected}`}>
            <svg className={styles.infinity} width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <image href={infinityImg} x="0" y="0" height="40px" width="40px"/>
            </svg>
            <span>Multi Session</span>
          </div>
        </Link>
      </div>}

      {project && <div className={`${styles.projectName}`}>
        Logged in as project: {project}
      </div>}

      {!project && <button onClick={onLogin} className={styles.login}>
        Login
      </button>}
    </header>
  );
}

export default Header;
