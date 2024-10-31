import styles from '@/styles/PolicyInner.module.css';

interface PolicyInnerProps {}

const PolicyInner: React.FC<PolicyInnerProps> = () => {
  return (
    <>
      <section className={styles.PolicyInner}>
        <span className={styles.PolicyTitle}>프록토매틱 이용약관과 개인정보처리방침</span>
        <div className={styles.checkList}>
          <div className={styles.checkItem}>
            <p>아래 약관에 모두 동의</p>
          </div>
        </div>
        <div className={styles.grey}></div>
        <div className={styles.checkList}>
          <div className={styles.checkItem}>
            <p>만 14세 이상 동의 (필수)</p>
          </div>
        </div>
        <div className={styles.checkList}>
          <div className={styles.checkItem}>
            <p>이용약관 동의 (필수)</p>
          </div>
        </div>
        <div className={styles.checkList}>
          <div className={styles.checkItem}>
            <p>위치정보서비스 이용약관 동의 (필수)</p>
          </div>
        </div>
        <div className={styles.checkList}>
          <div className={styles.checkItem}>
            <p>개인정보처리방침 동의 (필수)</p>
          </div>
        </div>
        <div className={styles.checkList}>
          <div className={styles.checkItem}>
            <p>마케팅 활용 및 광고 수신 동의 (선택)</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default PolicyInner;
