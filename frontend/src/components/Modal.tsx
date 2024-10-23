import styles from '../styles/Modal.module.css';
import cancelButtonImg from '../assets/cancleButton.png';
import React from 'react';

interface ModalProps {
  onClose: () => void;
  title: string;
  subtitle: string | string[];
  onLogin: (role: string) => void;
}

const Modal: React.FC<ModalProps> = ({ onClose, title, subtitle, onLogin }) => {
  return (
    <div className={styles.Modal} role='dialog'>
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
          <div className={styles.upLine}>
            {title}
          </div>
          <div className={styles.downLine}>
            {Array.isArray(subtitle)
              ? subtitle.map((line, index) => <p key={index}>{line}</p>)
              : subtitle}
          </div>
        </div>
        <div className={styles.userSelectBox}>
          <div 
            className={styles.selectButton} 
            onClick={() => onLogin('host')}
          >
            주최자
          </div>
          <div 
            className={styles.selectButton} 
            onClick={() => onLogin('taker')}
          >
            응시자
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
