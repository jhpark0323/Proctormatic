import React from 'react';
import styles from '@/styles/Step.module.css'
import CustomButton from '@/components/CustomButton';

const Step7: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>카메라 연결</div>
        <div className={styles.StepSubTitle}>웹캠 혹은 전방 카메라를 연결해 주세요.</div>
      </div>
      <div className={styles.StepInner}></div>
      <div className={styles.StepFooter}>
        <CustomButton onClick={onNext}>다음</CustomButton>
      </div>
    </>
  );
};

export default Step7;
