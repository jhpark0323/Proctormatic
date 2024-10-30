import styles from '../styles/LoginModal.module.css';
import React, { useState } from 'react';
import CustomButton from '@/components/CustomButton';
import cancelButton from '@/assets/cancleButtonImg.svg';
import cancelButtonImg from '@/assets/cancleButton.png';

interface LoginModalProps {
  onClose: () => void;
  title: string;
  subtitle: string | string[];
  onLogin: (role: string, credentials?: { email: string; password: string }) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, title, subtitle, onLogin }) => {
  const [currentView, setCurrentView] = useState<'select' | 'hostLogin' | 'takerLogin'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (role: string) => {
    if (role === 'host') {
      setCurrentView('hostLogin');
    } else {
      localStorage.setItem('userRole', role);
      onLogin(role);
    }
  };

  const handleHostLoginSubmit = () => {
    setError('');
    
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    // 주최자 로그인 로직 실행
    onLogin('host', { email, password });
  };

  // 주최자 로그인 화면 렌더링
  const renderHostLoginForm = () => (
    <>
      <div className={styles.loginInputSection}>
        <p className={styles.modalSubTitle}>이메일 주소(로그인 ID)</p>
        <div>
          <input
            className={styles.modalInput}
            type="text"
            placeholder='이메일 주소 입력'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div style={{ marginTop: '5px' }}>
          <input
            className={styles.modalInput}
            type="password"
            placeholder='비밀번호 입력'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete='off'
          />
          <img src={cancelButton} className={styles.resetBtnImg} alt="reset" />
        </div>
        {error && <p className={styles.errorText}>{error}</p>}
      </div>

      <div className={styles.subBtnBox}>
        <span>회원가입</span>
        <div className={styles.finding}>
          <span>아이디 찾기</span>
          &nbsp;ㆍ&nbsp;
          <span>비밀번호 재설정</span>
        </div>
      </div>

      <section className={styles.loginButtonContent}>
        <CustomButton onClick={handleHostLoginSubmit}>
          로그인
        </CustomButton>
      </section>
    </>
  );

  return (
    <div className={styles.Modal} role="dialog">
      <div className={styles.wrapper}>
        <div className={styles.headerBox}>
          <img
            className={styles.cancelButton}
            src={cancelButtonImg}
            alt="close"
            onClick={onClose}
          />
        </div>
        <div className={styles.titleInfoBox}>
          <div className={styles.upLine}>{title}</div>
          <div className={styles.downLine}>
            {Array.isArray(subtitle)
              ? subtitle.map((line, index) => <p key={index}>{line}</p>)
              : subtitle}
          </div>
        </div>
        {currentView === 'select' ? (
          <>
            <div className={styles.userSelectBox}>
              <div 
                className={styles.selectButton} 
                onClick={() => handleLogin('host')}
              >
                주최자
              </div>
              <div 
                className={styles.selectButton} 
                onClick={() => handleLogin('taker')}
              >
                응시자
              </div>
            </div>
          </>
        ) : (
          renderHostLoginForm()
        )}
      </div>
    </div>
  );
};

export default LoginModal;
