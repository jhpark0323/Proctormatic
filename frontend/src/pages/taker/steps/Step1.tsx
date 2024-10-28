import React from 'react';
import styles from '@/styles/Step.module.css'
import CustomButton from '@/components/CustomButton';

const Step1: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>URL 입력하기</div>
        <div className={styles.StepSubTitle}>이메일로 수신 받은 URL 코드를 붙여 넣어주세요.</div>
      </div>
      <div className={styles.StepInner}></div>
      <div className={styles.StepFooter}>
        <CustomButton onClick={onNext}>다음</CustomButton>
      </div>
    </>
  );
};

export default Step1;
