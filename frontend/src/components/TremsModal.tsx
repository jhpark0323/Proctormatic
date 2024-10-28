import { useState } from 'react';
import styles from '@/styles/TermsModal.module.css';
import CustomButton from '@/components/CustomButton';

const TermsModal = ({ isOpen, onClose, onConfirm }) => {
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    service: false,
    privacy: false,
    marketing: false,
    age: false,
  });

  const handleAllChange = (e) => {
    const { checked } = e.target;
    setAgreements({
      all: checked,
      terms: checked,
      service: checked,
      privacy: checked,
      marketing: checked,
      age: checked,
    });
  };

  const handleSingleChange = (name) => (e) => {
    const { checked } = e.target;
    const newAgreements = {
      ...agreements,
      [name]: checked,
    };
    
    const allChecked = Object.keys(newAgreements)
      .filter(key => key !== 'all')
      .every(key => newAgreements[key]);
      
    setAgreements({
      ...newAgreements,
      all: allChecked,
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            이용약관 및 개인정보 처리 방침에 동의해 주세요.
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>
        
        <p className={styles.modalDescription}>
          아래 내용에 동의 후 시험에 입장해 주세요.
        </p>
        
        <div className={styles.checkboxContainer}>
          <label className={styles.checkAll}>
            <input
              type="checkbox"
              checked={agreements.all}
              onChange={handleAllChange}
            />
            <span>모두 동의합니다.</span>
          </label>
          
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={agreements.terms}
              onChange={handleSingleChange('terms')}
            />
            <span>[필수] 이용약관 동의</span>
          </label>
          
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={agreements.service}
              onChange={handleSingleChange('service')}
            />
            <span>[필수] 위치기반 서비스 이용약관 동의</span>
          </label>
          
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={agreements.privacy}
              onChange={handleSingleChange('privacy')}
            />
            <span>[필수] 개인정보처리방침 동의</span>
          </label>
          
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={agreements.marketing}
              onChange={handleSingleChange('marketing')}
            />
            <span>[필수] 본석을 위한 영상 및 사진 활용에 동의</span>
          </label>
          
          <div className={styles.ageSection}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={agreements.age}
                onChange={handleSingleChange('age')}
              />
              <span>만 14세 이상이에요.</span>
            </label>
          </div>
        </div>
        
        <button
          onClick={() => {
            if (Object.values(agreements).every(value => value)) {
              onConfirm();
            }
          }}
          className={styles.confirmButton}
        >
          다음으로
        </button>
      </div>
    </div>
  );
};

export default TermsModal;