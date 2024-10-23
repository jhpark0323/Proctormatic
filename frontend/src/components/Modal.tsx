import styles from '../styles/Modal.module.css';
import cancelButtonImg from '../assets/cancleButton.png';
import React from 'react';

interface ModalProps {
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className={styles.Modal}>
      <div className={styles.wrapper}>
        <div className={styles.headerBox}>
          <img
            className={styles.cancelButton}
            src={cancelButtonImg}
            alt="닫기"
            onClick={onClose}
          />
        </div>
        <div className={styles.titleInfoBox}>
          <div className={styles.upLine}>
            {/* 대제목 작성 부분 */}
            AI 온라인 시험&nbsp;자동 관리감독 서비스
          </div>
          <div className={styles.downLine}>
            {/* 소제목 작성 부분 */}
            어렵고 피곤한 시험 감시와 검증은 그만!<br />이젠 프록토매틱에게 맡기세요.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
