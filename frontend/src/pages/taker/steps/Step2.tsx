import React from 'react';
import styles from '../../../styles/Step.module.css'

const Step2: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>시험 주의사항</div>
        <div className={styles.StepSubTitle}>시험 응시 전 주의사항을 모두 숙지해주세요.</div>
      </div>
      <div className={styles.StepInner}></div>
      <div className={styles.StepFooter}>
        <button onClick={onNext}>다음</button>
      </div>
    </>
  );
};

export default Step2;
