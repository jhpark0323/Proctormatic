import { fonts } from "@/constants";
import styles from "@/styles/Testpage.module.css";

interface MyTestProps {}

const MyTest = ({}: MyTestProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.mytestHeader}>
        <div className={styles.mytestHeaderWrap}>
          <div className={styles.myInfoWrap}>
            <div>안녕하세요 :)</div>
            <div>
              <span className={styles.myName} style={fonts.HEADING_MD_BOLD}>
                홍길동
              </span>
              <span style={fonts.HEADING_SM}>님</span>
            </div>
            <div>(honggildong@gmail.com)</div>
          </div>
          <div className={styles.testInfoBox}>
            <div className={styles.testInfoItem}>
              <div className={styles.testInfoTitle}>전체 진행 현황</div>
              <div className={styles.testInfoContent}>100%</div>
            </div>
            <div className={styles.testInfoItem}>
              <div className={styles.testInfoTitle}>진행 완료</div>
              <div className={styles.testInfoContent}>3</div>
            </div>
            <div className={styles.testInfoItem}>
              <div className={styles.testInfoTitle}>진행중</div>
              <div className={styles.testInfoContent}>0</div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.testWrap}>
        <div className={styles.testBox}>
          <div className={styles.testCategory}>
            <div>예정된 시험</div>
            <div>드롭박스</div>
          </div>
          <div className={styles.testContent}>예정된 시험이 없습니다.</div>
        </div>
        <div className={styles.testBox}>
          <div className={styles.testCategory}>
            <div>진행중인 시험</div>
            <div>드롭박스</div>
          </div>
          <div className={styles.testContent}>진행중인 시험이 없습니다.</div>
        </div>
        <div className={styles.testBox}>
          <div className={styles.testCategory}>
            <div>이전 시험</div>
            <div>드롭박스</div>
          </div>
          <div className={styles.testContent}>표</div>
        </div>
      </div>
    </div>
  );
};

export default MyTest;
