import React from 'react';
import styles from '../../../styles/Step.module.css';

const Step3: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>부정행위 안내</div>
        <div className={styles.StepSubTitle}>아래와 같은 사항들이 지켜지지 않을 시 부정행위 처리될 수 있습니다.</div>
      </div>
      <div className={styles.StepInner}></div>
      <div className={styles.StepFooter}>
        <button onClick={onNext}>다음</button>
      </div>
    </>
  );
};

export default Step3;
