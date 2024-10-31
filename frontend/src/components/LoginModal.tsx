import styles from '../styles/LoginModal.module.css';
import React, { useState } from 'react';
import CustomButton from '@/components/CustomButton';
import cancelButton from '@/assets/cancleButtonImg.svg';
import cancelButtonImg from '@/assets/cancleButton.png';
import { useAuthStore } from '@/store/useAuthStore';

interface LoginModalProps {
  onClose: () => void;
  title: string;
  subtitle: string | string[];
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, title, subtitle }) => {
  const [currentView, setCurrentView] = useState<'select' | 'hostLogin' | 'takerLogin'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { hostLogin, takerLogin } = useAuthStore();

  const handleLogin = (role: string) => {
    if (role === 'host') {
      setCurrentView('hostLogin');
    } else {
      takerLogin();
      onClose();        // 응시자 역할 선택시에도 모달 닫기
    }
  };

  const handleHostLoginSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      await hostLogin(email, password);
      onClose();        // 로그인 성공 시 모달 닫기
    } catch (error) {
      setError('로그인 실패: 이메일 또는 비밀번호를 확인하세요.');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleHostLoginSubmit();
    }
  };

  const clearPassword = () => {
    setPassword('');
  };

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
            onChange={handleEmailChange}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div style={{ marginTop: '5px', position: 'relative' }}>
          <input
            className={styles.modalInput}
            type="password"
            placeholder='비밀번호 입력'
            value={password}
            onChange={handlePasswordChange}
            onKeyPress={handleKeyPress}
            autoComplete='off'
          />
          <img
            src={cancelButton}
            className={styles.resetBtnImg}
            alt="reset"
            onClick={clearPassword}
            style={{ cursor: 'pointer', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
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
          <div className={styles.userSelectBox}>
            <div className={styles.selectButton} onClick={() => handleLogin('host')}>
              주최자
            </div>
            <div className={styles.selectButton} onClick={() => handleLogin('taker')}>
              응시자
            </div>
          </div>
        ) : (
          renderHostLoginForm()
        )}
      </div>
    </div>
  );
};

export default LoginModal;
