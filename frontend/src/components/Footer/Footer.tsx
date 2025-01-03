import styles from './Footer.module.css'

function Footer() {
  return(
    <div className={styles.footerContainer}>
      <footer className={styles.footer}>
        <p className={styles.footerP}>
          Greg Chase, Chad Gratts, Jason Jones, and Matt Register
        </p>
        <p className={styles.footerP}>Have Fun · Be Good</p>
      </footer>
    </div>
  )
}

export default Footer;
