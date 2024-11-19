import React from 'react';
import styles from '@/styles/PolicyInner.module.css';

interface PolicyInnerProps {
  onAllCheck: (checked: boolean) => void;
  onRequiredCheck: (index: number, checked: boolean) => void;
  onMarketingCheck: (checked: boolean) => void;
  allChecked: boolean;
  requiredChecks: boolean[];
  marketingChecked: boolean;
}

const PolicyInner: React.FC<PolicyInnerProps> = ({
  onAllCheck,
  onRequiredCheck,
  onMarketingCheck,
  allChecked,
  requiredChecks,
  marketingChecked,
}) => {
  return (
    <section className={styles.PolicyInner}>
      <span className={styles.PolicyTitle}>프록토매틱 이용약관과 개인정보처리방침</span>
      <div className={styles.checkList}>
        <div className={styles.checkItem}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={allChecked}
              onChange={(e) => onAllCheck(e.target.checked)}
              data-testid="all-check"
            />
            <p>아래 약관에 모두 동의</p>
          </label>
        </div>
      </div>
      <div className={styles.grey}></div>
      <div className={styles.checkList}>
        <div className={styles.checkItem}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={requiredChecks[0]}
              onChange={(e) => onRequiredCheck(0, e.target.checked)}
              data-testid="age-check"
            />
            <p>만 14세 이상 동의 (필수)</p>
          </label>
        </div>
      </div>
      <div className={styles.checkList}>
        <div className={styles.checkItem}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={requiredChecks[1]}
              onChange={(e) => onRequiredCheck(1, e.target.checked)}
              data-testid="terms-check"
            />
            <p>이용약관 동의 (필수)</p>
          </label>
        </div>
      </div>
      <div className={styles.checkList}>
        <div className={styles.checkItem}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={requiredChecks[2]}
              onChange={(e) => onRequiredCheck(2, e.target.checked)}
              data-testid="location-check"
            />
            <p>위치정보서비스 이용약관 동의 (필수)</p>
          </label>
        </div>
      </div>
      <div className={styles.checkList}>
        <div className={styles.checkItem}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={requiredChecks[3]}
              onChange={(e) => onRequiredCheck(3, e.target.checked)}
              data-testid="privacy-check"
            />
            <p>개인정보처리방침 동의 (필수)</p>
          </label>
        </div>
      </div>
      <div className={styles.checkList}>
        <div className={styles.checkItem}>
          <label className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={marketingChecked}
              onChange={(e) => onMarketingCheck(e.target.checked)}
              data-testid="marketing-check"
            />
            <p>마케팅 활용 및 광고 수신 동의 (선택)</p>
          </label>
        </div>
      </div>
    </section>
  );
};

export default PolicyInner;
