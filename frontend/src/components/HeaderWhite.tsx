import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/HeaderWhite.module.css';

interface HeaderWhiteProps {
  onLoginClick: () => void;
  userRole?: string;
  onLogoutClick: () => void;
}

const HeaderWhite: React.FC<HeaderWhiteProps> = ({ onLoginClick, userRole, onLogoutClick }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.Header}>
      <img className={styles.Logo} src='/src/assets/mainLogo.svg' alt="Logo" />
      <div className={styles.LoginBox}>
        {userRole ? (
          <div className={styles.UserInfo}>
            <span className={styles.UserRole}>
              {userRole === 'host' ? '주최자' : '응시자'}로 로그인됨
            </span>
            <button className={styles.ActionButton} onClick={onLogoutClick}>
              로그아웃
            </button>
            {userRole === 'taker' ? (
              <button className={styles.ActionButton} onClick={() => navigate('/taker')}>
                시험 입실하기
              </button>
            ) : userRole === 'host' ? (
              <button className={styles.ActionButton} onClick={() => navigate('/host')}>
                시험 관리하기
              </button>
            ) : null}
          </div>
        ) : (
          <div className={styles.LoginButton} onClick={onLoginClick}>
            로그인 / 가입
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderWhite;
