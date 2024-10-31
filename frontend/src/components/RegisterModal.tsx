import React from 'react';
import styles from '@/styles/RegisterModal.module.css';
import cancelButtonImg from '@/assets/cancleButton.png';
import PolicyInner from '@/components/PolicyInner';

interface RegisterModalProps {
  onClose: () => void;
  title: string;
  subtitle: string | string[];
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, title, subtitle }) => {
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
            
            <div> {/* 회원가입 form 부분 */}
              <div className={styles.formInner}>  {/* 이름 입력하는 부분 */}
                <div className={styles.formInnerNameBox}>
                  <span className={styles.formInnerName}>주최자 이름</span>
                </div>
                <input type="text" className={styles.formInput} placeholder='이름 입력'/>
              </div>
              
              <div className={styles.formInner}>  {/* 생년월일 입력하는 부분 */}
                {/* 생년월일 제목 */}
                <div className={styles.formInnerNameBox}>
                  <span className={styles.formInnerName}>생년월일</span>
                </div>
                {/* 생년월일 입력 필드 */}
                <div className={styles.birthDateBox}>
                  <div className={styles.birthInner}>
                    <div className={styles.birthInnerContainer}>2000년</div>
                  </div>
                  <div className={styles.birthInner}>
                    <div className={styles.birthInnerContainer}>1월</div>
                  </div>
                  <div className={styles.birthInner}>
                    <div className={styles.birthInnerContainer}>1일</div>
                  </div>
                </div>
                {/* 생년월일 안내 문구 */}
                <div className={styles.birthInfo}>* 생년월일 정보는 아이디 찾기에 필요한 정보로 활용돼요.</div>
              </div>

              <div className={styles.emailBox}>  {/* 이메일 입력하는 부분 */}
                {/* 이메일 주소 타이틀 */}
                <div className={styles.titlePart}>이메일 주소 (로그인 ID)</div>

                {/* 입력하는 부분 */}
                <div className={styles.inputPart}>

                  {/* 이메일 입력하는 부분 */}
                  <div className={styles.emailInput}>
                    <div className={styles.firstLeft}>
                      <input placeholder='이메일 주소 입력' />
                      <div className={styles.rowGrayBar}></div>
                    </div>
                    <div className={styles.verifyButton}>이메일 인증</div>
                  </div>
                  {/* 위 의 이메일 인증에서 에러 발생 시 */}
                  <div className={styles.errorCase}>올바르지 않은 이메일 형식이에요.</div>

                  {/* 비밀번호 입력하는 부분 */}
                  <div className={styles.pwdInputOne}>
                    <input type="text" placeholder='비밀번호 입력'/>
                    <div className={styles.rowGrayBar}></div>
                  </div>
                  <div className={styles.errorCase}>문자, 숫자, 기호를 조합하여 8자 이상 입력하세요.</div>
                  <div className={styles.pwdInputTwo}>
                    <input type="text" placeholder='비밀번호 확인'/>
                    <div className={styles.rowGrayBar}></div>
                  </div>
                  <div className={styles.errorCase}>비밀번호를 다시 입력해주세요.</div>
                </div>
                {/* 회원가입 관련 안내 부분 */}
                <div className={styles.infoPart}>
                  <span className={styles.infoInner}>* 이메일 주소로 로그인 ID 생성 후 분석 결과보고서를 전달드려요.</span>
                  <span className={styles.infoInner}>* 비밀번호는 문자, 숫자, 기호를 조합하여 8자 이상을 사용하세요.</span>
                </div>
              </div>

              <div>  {/* 이용 약관 부분 */}
                <PolicyInner />
              </div>

              <div className={styles.buttonBox}>
                <button className={styles.registerButton}>회원가입</button>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
