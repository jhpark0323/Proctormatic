import React from 'react';
import styles from '@/styles/Step.module.css';
import CustomButton from '@/components/CustomButton';

const Step5: React.FC = () => {
  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>응시자 정보 입력</div>
        <div className={styles.StepSubTitle}>응시자 정보를 정확하게 입력해주세요.</div>
      </div>
      <div className={styles.StepInner}></div>
      <div className={styles.StepFooter}>
        <CustomButton>확인했습니다</CustomButton>
      </div>
    </>
  );
};

export default Step5;
