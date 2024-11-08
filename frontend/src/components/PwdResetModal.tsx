import React, { useEffect, useState } from 'react';
import styles from '@/styles/RegisterModal.module.css';
import cancelButtonImg from '@/assets/cancleButton.png';
import { CustomToast } from "@/components/CustomToast";
import { usePwdResetStore } from '@/store/usePwdResetModal';
import EmailModal from '@/components/EmailModal';
import axiosInstance from '@/utils/axios';

interface PwdResetModalProps {
  onClose: () => void;
  title: string;
  subtitle: string | string[];
}

const PwdResetModal: React.FC<PwdResetModalProps> = ({ onClose, title, subtitle }) => {
  const [isLoading, setLoading] = useState(false);
  const [isEmailModalOpen, setEmailModalOpen] = useState(false);
  const [isEmailVerified, setEmailVerified] = useState(false);

  const {
    name, email, password, confirmPassword,
    nameError, emailError, passwordError, confirmPasswordError,
    validateName, validateEmail, validatePassword, validateConfirmPassword,
    resetStore,
  } = usePwdResetStore();

  useEffect(() => {
    return () => resetStore();
  }, []);

  const onVerifyEmail = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/users/email/', { email, re_enter: true});
      CustomToast('인증번호가 발송되었습니다.');
      setEmailModalOpen(true);
    } catch (error) {
      CustomToast('인증번호 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }; 
  
  const closeEmailModal = () => setEmailModalOpen(false);

  const handleEmailVerified = () => {
    setEmailVerified(true);
    setEmailModalOpen(false);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put('/users/email/password/', {
        email,
        password1: password,
        password2: confirmPassword
      });
      
      if (response.status === 200) {
        CustomToast('비밀번호가 성공적으로 변경되었습니다.');
        onClose();
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        CustomToast(error.response.data.message);
      } else {
        CustomToast('비밀번호 변경에 실패했습니다.');
      }
    }
  };

  return (
    <div className={styles.Modal} data-testid="pwd-reset-modal">
      <div className={styles.wrapper}>
        <div className={styles.headerBox}>
          <img
            className={styles.cancelButton}
            src={cancelButtonImg}
            alt="close"
            onClick={onClose}
          />
        </div>
        <div className={styles.inBox}>
          <div className={styles.inBoxInner}>
            <div className={styles.titleBox}>
              <div className={styles.upLine}>{title}</div>
              <div className={styles.downLine}>
                {Array.isArray(subtitle)
                  ? subtitle.map((line, index) => <p key={index}>{line}</p>)
                  : subtitle}
              </div>
            </div>

            <form onSubmit={handleResetSubmit}>
              <div className={styles.formInner}>
                <div className={styles.formInnerNameBox}>
                  <span className={styles.formInnerName}>주최자 이름 (한글 2 - 10 자)</span>
                </div>
                <input 
                  type="text" 
                  className={`${styles.formInput} ${nameError ? styles.errorInput : ''}`} 
                  placeholder="이름 입력"
                  value={name}
                  onChange={(e) => validateName(e.target.value)}
                  autoComplete="off"
                />
                {nameError && <div className={styles.errorCase}>올바르지 않은 이름이에요.</div>}
              </div>

              <div className={styles.emailBox}>
                <div className={styles.titlePart}>이메일 주소 (로그인 ID)</div>
                <div className={styles.inputPart}>
                  <div className={styles.emailInput}>
                    <div className={styles.firstLeft}>
                      <input 
                        type="email" 
                        placeholder="이메일 주소 입력" 
                        value={email}
                        onChange={(e) => validateEmail(e.target.value)}
                        autoComplete="new-email"
                        disabled={isEmailVerified}
                      />
                      <div className={`${styles.rowGrayBar} ${emailError ? styles.errorRow : ''}`}></div>
                    </div>
                    <div className={styles.verifyButton} onClick={!isLoading && !isEmailVerified ? onVerifyEmail : undefined}>
                      {isEmailVerified ? (
                        <div className={styles.verifiedText}>인증완료</div>
                      ) : (
                        isLoading ? (
                          <div className={styles.loadingSpinner}></div>
                        ) : (
                          "이메일 인증"
                        )
                      )}
                    </div>
                  </div>
                  {emailError && <div className={styles.errorCase}>올바르지 않은 이메일 형식이에요.</div>}
                  
                  <div className={styles.pwdInputOne}>
                    <input 
                      type="password" 
                      placeholder="새로운 비밀번호 입력"
                      value={password}
                      onChange={(e) => validatePassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <div className={`${styles.rowGrayBar} ${passwordError ? styles.errorRow : ''}`}></div>
                  </div>
                  {passwordError && <div className={styles.errorCase}>문자, 숫자, 기호를 조합하여 8자 이상 입력하세요.</div>}
                  
                  <div className={styles.pwdInputTwo}>
                    <input 
                      type="password" 
                      placeholder="새로운 비밀번호 확인" 
                      value={confirmPassword}
                      onChange={(e) => validateConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <div className={`${styles.rowGrayBar} ${confirmPasswordError ? styles.errorRow : ''}`}></div>
                  </div>
                  {confirmPasswordError && <div className={styles.errorCase}>비밀번호를 다시 입력해주세요.</div>}
                </div>

                <div className={styles.infoPart}>
                  <span className={styles.infoInner}>* 본인 확인을 위한 이메일 인증을 진행 해주세요.</span>
                  <span className={styles.infoInner}>* 비밀번호는 문자, 숫자, 기호를 조합하여 8자 이상을 사용하세요.</span>
                </div>
              </div>

              <div className={styles.buttonBox}>
                <button
                  type="submit"
                  className={styles.registerButton}
                  disabled={
                    nameError || !isEmailVerified || passwordError || confirmPasswordError || password !== confirmPassword || name.length < 2 || password.length < 8
                  }
                >
                  재설정 하기
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isEmailModalOpen && (
        <>
          <div className={styles.blurBackground}></div>
          <EmailModal onClose={closeEmailModal} email={email} onVerificationSuccess={handleEmailVerified}/>
        </>
      )}
    </div>
  );
};

export default PwdResetModal;