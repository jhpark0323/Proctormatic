import React from 'react';
import styles from '../styles/HeaderWhite.module.css';

interface HeaderWhiteProps {
  onLoginClick: () => void;
}

const HeaderWhite: React.FC<HeaderWhiteProps> = ({ onLoginClick }) => {
  return (
    <div className={styles.Header}>
      <img className={styles.Logo} src='/src/assets/mainLogo.svg' alt="Logo" />
      <div className={styles.LoginBox}>
        <div className={styles.LoginButton} onClick={onLoginClick}>
          로그인 / 가입
        </div>
        <button>시험 예약하기</button>
      </div>
    </div>
  );
};

export default HeaderWhite;
