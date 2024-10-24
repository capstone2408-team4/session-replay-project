import styles from './Header.module.css'
import providenceImg from '../../assets/providence-.png'

interface HeaderProps {
  onLogin?: (e:any) => void
}

function Header({ onLogin }: HeaderProps) {
  return (
    <header className={styles.header}>
      <svg width="280" height="60" xmlns="http://www.w3.org/2000/svg">
        <image
          href={providenceImg}
          x="-10"
          y="-17"
          height="100px"
          width="100px"
        />
        <text fill="white" x="90" y="40" fontSize="30">Providence</text>
      </svg>

      <button onClick={onLogin} className={styles.login}>
        Login
      </button>
    </header>
  );
}

export default Header;
