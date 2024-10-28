import React from 'react';
import styles from '@/styles/Step.module.css'
import CustomButton from '@/components/CustomButton';

const Step6: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>기기 상태 점검</div>
        <div className={styles.StepSubTitle}>시험 응시에 적합한 환경인지 기기 상태를 점검해요.</div>
      </div>
      <div className={styles.StepInner}></div>
      <div className={styles.StepFooter}>
        <CustomButton onClick={onNext}>다음</CustomButton>
      </div>
    </>
  );
};

export default Step6;
