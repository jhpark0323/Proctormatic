import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/HeaderWhite.module.css';
import CustomButton from './CustomButton';

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
              <span>{userRole}</span> 님
            </span>
            <div>
              gd
            </div>
            {/* <button className={styles.ActionButton} onClick={onLogoutClick}>
              로그아웃
            </button> */}
            {userRole === 'taker' ? (
              <CustomButton onClick={() => navigate('/taker')}>
                시험 입실하기
              </CustomButton>
            ) : userRole === 'host' ? (
              <CustomButton onClick={() => navigate('/host')}>
                시험 관리하기
              </CustomButton>
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
