import React from 'react';
import styles from '@/styles/Step.module.css';
import CustomButton from '@/components/CustomButton';

const Step9: React.FC<{ onNext: () => void }> = ({ onNext }) => {

  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>신분증 촬영</div>
        <div className={styles.StepSubTitle}>본인 확인을 위해 신분증을 촬영해 주세요.</div>
      </div>
      <div className={styles.StepInner}>
      </div>
      <div className={styles.StepFooter}>
        <CustomButton onClick={onNext}>다음</CustomButton>
      </div>
    </>
  );
};

export default Step9;
