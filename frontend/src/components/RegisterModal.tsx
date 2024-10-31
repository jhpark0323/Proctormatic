import React, { useEffect } from 'react';
import styles from '@/styles/RegisterModal.module.css';
import cancelButtonImg from '@/assets/cancleButton.png';
import PolicyInner from '@/components/PolicyInner';
import axiosInstance from '@/utils/axios';
import { CustomToast } from "@/components/CustomToast";
import { useRegisterStore } from '@/store/useRegisterStore';

interface RegisterModalProps {
  onClose: () => void;
  title: string;
  subtitle: string | string[];
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, title, subtitle }) => {
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
  const onVerifyEmail = () => {
    console.log("이메일 인증 요청:", email);
    // 이메일 인증 요청 기능 추가
  };

  // RegisterModal.tsx의 handleRegister 함수 수정
const handleRegister = async () => {
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
      birth: birthYear + '-' + birthMonth.padStart(2, '0') + '-' + birthDay.padStart(2, '0'),
      policy,
      marketing
    });

    if (response.status === 201) {
      CustomToast("회원가입이 완료되었습니다.");
      onClose();
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

  return (
    <div className={styles.Modal} role="dialog">
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
              <div className={styles.upLine}>{title}</div>
              <div className={styles.downLine}>
                {Array.isArray(subtitle)
                  ? subtitle.map((line, index) => <p key={index}>{line}</p>)
                  : subtitle}
              </div>
            </div>

            <div>
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

              <div className={styles.formInner}>
                <div className={styles.formInnerNameBox}>
                  <span className={styles.formInnerName}>생년월일</span>
                </div>
                <div className={styles.birthDateBox}>
                  <div className={styles.birthInner}>
                    <select 
                      value={birthYear} 
                      onChange={(e) => setBirthYear(e.target.value)}
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
                    <div className={styles.verifyButton} onClick={onVerifyEmail}>이메일 인증</div>
                  </div>
                  {emailError && <div className={styles.errorCase}>올바르지 않은 이메일 형식이에요.</div>}
                  
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
                  {passwordError && <div className={styles.errorCase}>문자, 숫자, 기호를 조합하여 8자 이상 입력하세요.</div>}
                  
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
                  disabled={nameError || emailError || passwordError || confirmPasswordError}
                >
                  회원가입
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;