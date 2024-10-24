import React from 'react';
import styles from '../styles/HeaderWhite.module.css';

interface HeaderWhiteProps {
  onLoginClick: () => void;
  userRole?: string;
  onLogoutClick: () => void;
}

const HeaderWhite: React.FC<HeaderWhiteProps> = ({ onLoginClick, userRole, onLogoutClick }) => {
  return (
    <div className={styles.Header}>
      <img className={styles.Logo} src='/src/assets/mainLogo.svg' alt="Logo" />
      <div className={styles.LoginBox}>
        {userRole ? (
          <div className={styles.UserInfo}>
            <span className={styles.UserRole}>
              {userRole === 'host' ? '주최자' : '응시자'}로 로그인됨
            </span>
            <button className={styles.LogoutButton} onClick={onLogoutClick}>
              로그아웃
            </button>
          </div>
        ) : (
          <div className={styles.LoginButton} onClick={onLoginClick}>
            로그인 / 가입
          </div>
        )}
        {/* <button className={styles.ReservationButton}>시험 예약하기</button> */}
      </div>
    </div>
  );
};

export default HeaderWhite;
