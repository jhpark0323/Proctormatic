import React from 'react';
import styles from '@/styles/RegisterModal.module.css';
import cancelButtonImg from '@/assets/cancleButton.png';

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
        {/* <div className={styles.titleInfoBox}>
          <div className={styles.upLine}>{title}</div>
          <div className={styles.downLine}>
            {Array.isArray(subtitle)
              ? subtitle.map((line, index) => <p key={index}>{line}</p>)
              : subtitle}
          </div>
        </div> */}
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
            {/* 회원가입 form 부분 */}
            <div>
              {/* 이름 입력하는 부분 */}
              <div className={styles.formInner}>
                <div className={styles.formInnerNameBox}>
                  <span className={styles.formInnerName}>주최자 이름</span>
                </div>
                <input type="text" className={styles.formInput} placeholder='이름 입력'/>
              </div>
              {/* 생년월일 입력하는 부분 */}
              <div className={styles.formInner}>
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
              
              
              <div className={styles.formInner}>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
