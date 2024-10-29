import skeleton from '../../assets/404.gif'
import styles from './FourOhFour.module.css'
import Header from '../Header';

function FourOhFour() {
  return (
    <>
      <Header project='Providence'/>
      <div className={styles.main}>
        <div className={styles.container}>
          <h1>404 Error</h1>
          <p>Ruh roh. You seem to be lost.</p>
          <img src={skeleton}></img>
        </div>
      </div>
    </>
  )
}

export default FourOhFour;
