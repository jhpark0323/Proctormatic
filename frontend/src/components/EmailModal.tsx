import React, { useState, useEffect } from 'react';
import styles from '@/styles/EmailModal.module.css';
import closeBtn from '@/assets/cancleButton.png';
import axiosInstance from '@/utils/axios';
import { CustomToast } from "@/components/CustomToast";

interface EmailModalProps {
  onClose: () => void;
  onVerificationSuccess: () => void;
  email: string;
}

const EmailModal: React.FC<EmailModalProps> = ({ onClose, email, onVerificationSuccess  }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(true); // 타이머는 처음에 활성화

  // 타이머 로직
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      setErrorMessage('인증 시간이 만료되었습니다. 인증번호를 재발송해주세요.');
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerActive, timeLeft]);

  // 시간을 분과 초로 포맷
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}분 ${seconds.toString().padStart(2, '0')}초`;
  };

  // 인증 이메일 재발송
  const sendVerificationEmail = async () => {
    try {
      const response = await axiosInstance.post('/users/email/', { email, re_enter: true });
      if (response.status === 200) {
        CustomToast('인증번호가 발송되었습니다.');
        setTimeLeft(300); // 타이머를 5분으로 리셋
        setIsTimerActive(true); // 타이머 다시 시작
        setErrorMessage(''); // 오류 메시지 초기화
      }
    } catch (error) {
      CustomToast('인증번호 발송에 실패했습니다.');
    }
  };

  // 인증번호 확인
  const handleVerification = async () => {
    try {
      const response = await axiosInstance.put('/users/email/', {
        email,
        code: verificationCode
      });
      if (response.status === 200) {
        CustomToast('이메일 인증이 완료되었습니다.');
        onVerificationSuccess(); // 인증 성공 시 호출
        onClose();
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('인증번호가 일치하지 않습니다.');
      }
    }
  };

  return (
    <div className={styles.EmailModal} onClick={(e) => e.stopPropagation()}>
      <div className={styles.wrapperEmail}>
        <div className={styles.ModalTitle}>
          <div>이메일 인증</div>
          <img src={closeBtn} className={styles.closeBtn} alt="close" onClick={onClose} />
        </div>
        <div className={styles.EmailBody}>
          <div className={styles.InfoBox}>
            <span>{email}</span>으로 인증번호가 발송되었습니다.
          </div>
          <div className={styles.InputBox}>
            <div className={styles.InputTitle}>인증번호</div>
            <input
              type="text"
              placeholder="인증번호 입력"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            {errorMessage && <div className={styles.InputError}>{errorMessage}</div>}
            {isTimerActive && <div className={styles.Timer}>남은 시간: {formatTime()}</div>}
          </div>
          <div className={styles.DetailBox}>
            <div className={styles.DetailTitle}>인증 시 유의사항</div>
            <div className={styles.DetailItem}>
              <div>* 개인정보 보호를 위해 발송 시점으로부터 5분 동안만 유효해요.</div>
              <div>* 인증번호 재발송 시 기존에 발송된 인증번호는 만료되요.</div>
              <div>* 메일이 계속 도착하지 않을 경우, 스팸함을 확인해주세요.</div>
            </div>
          </div>
          <div className={styles.ResendBox}>
            메일이 도착하지 않았나요?{' '}
            <span onClick={sendVerificationEmail}>인증번호 재발송</span>
          </div>
          <div className={styles.ButtonBox}>
            <div className={styles.CancelButton} onClick={onClose}>취소</div>
            <div className={styles.VerifyButton} onClick={handleVerification}>인증하기</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
