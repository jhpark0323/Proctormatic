import React from 'react';
import styles from '@/styles/Step.module.css';
import CustomButton from '@/components/CustomButton';
import { useTakerStore } from '@/store/TakerAuthStore';

const Step4: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { testId } = useTakerStore();

  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>시험정보 확인</div>
        <div className={styles.StepSubTitle}>응시하실 시험의 상세 정보를 확인해주세요.</div>
      </div>
      <div className={styles.StepInner}>
        <div>시험ID: { testId }</div> 
      </div>
      <div className={styles.StepFooter}>
        <CustomButton onClick={onNext}>다음</CustomButton>
      </div>
    </>
  );
};

export default Step4;
