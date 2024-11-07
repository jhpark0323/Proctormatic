import styles from '@/styles/EmailFindModal.module.css';
import cancelButtonImg from '@/assets/cancleButton.png';

interface EmailFindModalProps {
  onClose: () => void;
  title: string;
  subtitle: string | string[];
}

const EmailFindModal: React.FC<EmailFindModalProps> = ({ onClose, title, subtitle  }) => {
  return (
    <>    
      <div className={styles.blurBackground} /> {/* 배경 블러처리 추가 */}
      <div className={styles.Modal} data-testid="register-modal">
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
              {/* titleBox 부분 */}
              <div className={styles.titleBox}>
                <div className={styles.upLine}>{title}</div>
                <div className={styles.downLine}>
                  {Array.isArray(subtitle)
                    ? subtitle.map((line, index) => <p key={index}>{line}</p>)
                    : subtitle}
                </div>
              </div>

              <form>
                <div className={styles.formInner}>
                  <div className={styles.formInnerNameBox}>
                    <span className={styles.formInnerName}>주최자 이름 (한글 2 - 10 자)</span>
                  </div>
                  <input 
                    type="text" 
                    className={styles.formInput}
                    placeholder="이름 입력"
                    autoComplete="off"
                  />
                </div>

                <div className={styles.formInner}>
                  <div className={styles.formInnerNameBox}>
                    <span className={styles.formInnerName}>생년월일</span>
                  </div>
                  <div className={styles.birthDateBox}>
                    <div className={styles.birthInner}>
                      <select></select>
                    </div>
                    <div className={styles.birthInner}>
                      <select name="" id=""></select>
                    </div>
                    <div className={styles.birthInner}>
                      <select name="" id=""></select>
                    </div>
                  </div>
                </div>

                <div className={styles.buttonBox}>
                  <button
                    className={styles.registerButton}
                  >
                    검색하기
                  </button>
                </div>

              </form>


            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EmailFindModal;