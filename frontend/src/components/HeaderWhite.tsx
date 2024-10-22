import styles from '../styles/HeaderWhite.module.css';

const HeaderWhite = () => {
  return (
    <>
      <div className={styles.Header}>
        <img className={styles.Logo} src='/src/assets/mainLogo.svg' />
        <div className={styles.LoginBox}>
          <div className={styles.LoginButton}>로그인 / 가입</div>
          <button>시험 예약하기</button>
        </div>
      </div>
    </>
  )
}

export default HeaderWhite;