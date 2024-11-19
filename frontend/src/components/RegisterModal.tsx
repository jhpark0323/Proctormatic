import React, { useEffect, useState } from 'react';
import styles from '@/styles/RegisterModal.module.css';
import cancelButtonImg from '@/assets/cancleButton.png';
import PolicyInner from '@/components/PolicyInner';
import axiosInstance from '@/utils/axios';
import { CustomToast } from "@/components/CustomToast";
import { useRegisterStore } from '@/store/useRegisterStore';
import EmailModal from '@/components/EmailModal'; // EmailModal 임포트

interface RegisterModalProps {
  onClose: () => void;
  title: string;
  subtitle: string | string[];
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, title, subtitle }) => {
  const [isLoading, setLoading] = useState(false); // 로딩 상태 추가
  const [isEmailModalOpen, setEmailModalOpen] = useState(false); // EmailModal 상태 추가
  const [isEmailVerified, setEmailVerified] = useState(false); // 이메일 인증 상태 추가


  const {
    // Form fields
    name, email, password, confirmPassword,
    birthYear, birthMonth, birthDay,
    
    // Error states
    nameError, emailError, passwordError, confirmPasswordError,
    
    // Agreement states
    allChecked, requiredChecks, marketingChecked,
    policy, marketing,
    
    // Actions
    validateName, validateEmail, validatePassword, validateConfirmPassword,
    setBirthYear, setBirthMonth, setBirthDay,
    handleAllCheck, handleRequiredCheck, handleMarketingCheck,
    updateBirth, resetStore, validateAllFields,
  } = useRegisterStore();

  // 생년월일이 변경될 때마다 birth 업데이트
  useEffect(() => {
    updateBirth();
  }, [birthYear, birthMonth, birthDay]);

  // 컴포넌트가 언마운트될 때 store 초기화
  useEffect(() => {
    return () => resetStore();
  }, []);

  const years = Array.from({ length: 100 }, (_, i) => `${1923 + i}`);
  const months = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
  const days = Array.from({ length: 31 }, (_, i) => `${i + 1}`);

  // 이메일 인증 버튼 핸들러
  const onVerifyEmail = async () => {
    setLoading(true); // 로딩 시작
    try {
      const response = await axiosInstance.post('/users/email/', {
        email: email
      });
      
      if (response.status === 200) {
        CustomToast('인증번호가 발송되었습니다.');
        setEmailModalOpen(true);
      }
    } catch (error) {
      CustomToast('인증번호 발송에 실패했습니다.');
    } finally {
      setLoading(false); // 로딩 종료
    }
    // // EmailModal 열기
    // setEmailModalOpen(true);
  };

  const closeEmailModal = () => {
    setEmailModalOpen(false); // EmailModal 닫기
  };

  const handleRegister = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 폼 제출 방지
    const isValid = validateAllFields();
  
    // 입력값 검증 실패
    if (!isValid) {
      if (!name || nameError) {
        CustomToast("올바른 이름을 입력해주세요.");
        return;
      }
      if (!email || emailError) {
        CustomToast("올바른 이메일을 입력해주세요.");
        return;
      }
      if (!password || passwordError) {
        CustomToast("올바른 비밀번호를 입력해주세요.");
        return;
      }
      if (!confirmPassword || confirmPasswordError) {
        CustomToast("비밀번호가 일치하지 않습니다.");
        return;
      }
      return;
    }
  
    // 이메일 인증 여부 확인
    if (!isEmailVerified) {
      CustomToast("이메일 인증을 완료해주세요.");
      return;
    }
  
    // 필수 약관 동의 확인
    if (!policy) {
      CustomToast("필수 항목에 동의해주세요.");
      return;
    }
  
    try {
      const response = await axiosInstance.post('/users/', {
        name,
        email,
        password,
        birth: `${birthYear}${birthMonth.padStart(2, '0')}${birthDay.padStart(2, '0')}`, // YYYYMMDD 형식
        policy,
        marketing
      });
  
      if (response.status === 201) {
        onClose(); // 회원가입 성공 시에만 모달 닫기
        CustomToast("회원가입이 완료되었습니다.");
      } else {
        CustomToast("회원가입 중 문제가 발생했습니다."); // 정상적으로 처리되지 않았을 때 사용자에게 알림
      }
    } catch (error: any) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            CustomToast("입력하신 정보를 다시 확인해주세요.");
            break;
          case 409:
            CustomToast("이미 가입된 이메일입니다.");
            break;
          default:
            CustomToast("회원가입 중 오류가 발생했습니다.");
        }
      } else {
        CustomToast("서버와의 통신 중 오류가 발생했습니다.");
      }
    }
  };
  

  // EmailModal에서 이메일 인증이 완료되었을 때 호출할 함수
  const handleEmailVerified = () => {
    setEmailVerified(true);
    setEmailModalOpen(false); // 모달 닫기
  };


  return (
    <div className={styles.Modal} data-testid="register-modal">
      <div className={styles.wrapper}>
        <div className={styles.headerBox}>
          <span className={styles.ModalTitle}>회원가입</span>
          <img
            className={styles.cancelButton}
            src={cancelButtonImg}
            alt="close"
            onClick={onClose}
          />
        </div>
        <div className={styles.inBox}>
          <div className={styles.inBoxInner}>
            {/* titleBox 부분 */}
            <div className={styles.titleBox}>
              <div className={styles.upLine} data-testid="modal-title">{title}</div>
              <div className={styles.downLine} data-testid="modal-subtitle">
                {Array.isArray(subtitle)
                  ? subtitle.map((line, index) => <p key={index}>{line}</p>)
                  : subtitle}
              </div>
            </div>

            <form>
              <div className={styles.formInner}>
                <div className={styles.formInnerNameBox}>
                  <span className={styles.formInnerName}>이름 (한글 2 - 10 자)</span>
                </div>
                <input 
                  type="text" 
                  className={`${styles.formInput} ${nameError ? styles.errorInput : ''}`} 
                  placeholder="이름 입력"
                  value={name}
                  onChange={(e) => validateName(e.target.value)}
                  autoComplete="off"
                />
                {nameError && <div className={styles.errorCase} data-testid="not-correct-name">올바르지 않은 이름이에요.</div>}
              </div>

              <div className={styles.formInner}>
                <div className={styles.formInnerNameBox}>
                  <span className={styles.formInnerName}>생년월일</span>
                </div>
                <div className={styles.birthDateBox}>
                  <div className={styles.birthInner}>
                    <select 
                      value={birthYear} 
                      onChange={(e) => setBirthYear(e.target.value)}
                      data-testid="birthYear-select"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>{year}년</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.birthInner}>
                    <select 
                      value={birthMonth} 
                      onChange={(e) => setBirthMonth(e.target.value)}
                      data-testid="birthMonth-select"
                    >
                      {months.map((month) => (
                        <option key={month} value={month}>{month}월</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.birthInner}>
                    <select 
                      value={birthDay} 
                      onChange={(e) => setBirthDay(e.target.value)}
                      data-testid="birthDay-select"
                    >
                      {days.map((day) => (
                        <option key={day} value={day}>{day}일</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.birthInfo}>
                  * 생년월일 정보는 아이디 찾기에 필요한 정보로 활용돼요.
                </div>
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
                      />
                      <div className={`${styles.rowGrayBar} ${emailError ? styles.errorRow : ''}`}></div>
                    </div>
                    <div className={styles.verifyButton} onClick={!isLoading ? onVerifyEmail : undefined} data-testid="email-send-button">
                      {isEmailVerified ? (
                        <div className={styles.verifiedText}>인증완료</div>
                      ) : (
                        isLoading ? (
                          <div className={styles.loadingSpinner}></div> // 로딩 스피너
                        ) : (
                          "이메일 인증"
                        )
                      )}
                    </div>
                  </div>
                  {emailError && <div className={styles.errorCase} data-testid="not-correct-email">올바르지 않은 이메일 형식이에요.</div>}
                  
                  <div className={styles.pwdInputOne}>
                    <input 
                      type="password" 
                      placeholder="비밀번호 입력"
                      value={password}
                      onChange={(e) => validatePassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <div className={`${styles.rowGrayBar} ${passwordError ? styles.errorRow : ''}`}></div>
                  </div>
                  {passwordError && <div className={styles.errorCase} data-testid="not-corret-pw">문자, 숫자, 기호를 조합하여 8자 이상 입력하세요.</div>}
                  
                  <div className={styles.pwdInputTwo}>
                    <input 
                      type="password" 
                      placeholder="비밀번호 확인" 
                      value={confirmPassword}
                      onChange={(e) => validateConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <div className={`${styles.rowGrayBar} ${confirmPasswordError ? styles.errorRow : ''}`}></div>
                  </div>
                  {confirmPasswordError && <div className={styles.errorCase}>비밀번호를 다시 입력해주세요.</div>}
                </div>

                <div className={styles.infoPart}>
                  <span className={styles.infoInner}>* 이메일 주소로 로그인 ID 생성 후 분석 결과보고서를 전달드려요.</span>
                  <span className={styles.infoInner}>* 비밀번호는 문자, 숫자, 기호를 조합하여 8자 이상을 사용하세요.</span>
                </div>
              </div>

              <div>
                <PolicyInner
                  onAllCheck={handleAllCheck}
                  onRequiredCheck={handleRequiredCheck}
                  onMarketingCheck={handleMarketingCheck}
                  allChecked={allChecked}
                  requiredChecks={requiredChecks}
                  marketingChecked={marketingChecked}
                />
              </div>

              <div className={styles.buttonBox}>
                <button
                  className={styles.registerButton}
                  onClick={handleRegister}
                  disabled={
                    nameError || emailError || passwordError || confirmPasswordError || !isEmailVerified || !policy
                  }
                  data-testid="register-button"
                >
                  회원가입
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* EmailModal이 열릴 때 블러 처리 배경과 함께 표시 */}
      {isEmailModalOpen && (
        <>
          <div className={styles.blurBackground}></div> {/* 블러 처리 배경 */}
          <EmailModal onClose={closeEmailModal} email={email} onVerificationSuccess={handleEmailVerified}/>
        </>
      )}
    </div>
  );
};

export default RegisterModal;
