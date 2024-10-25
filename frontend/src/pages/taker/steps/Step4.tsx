import React from 'react';
import styles from '../../../styles/Step.module.css';

const Step4: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>시험정보 확인</div>
        <div className={styles.StepSubTitle}>응시하실 시험의 상세 정보를 확인해주세요.</div>
      </div>
      <div className={styles.StepInner}></div>
      <div className={styles.StepFooter}>
        <button onClick={onNext}>다음</button>
      </div>
    </>
  );
};

export default Step4;
