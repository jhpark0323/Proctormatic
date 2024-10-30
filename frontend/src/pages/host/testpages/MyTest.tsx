import { fonts } from "@/constants";
import styles from "@/styles/Testpage.module.css";
import { FaAngleDown } from "react-icons/fa";

interface MyTestProps {}

const MyTest = ({}: MyTestProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.mytestHeader}>
        <div className={styles.mytestHeaderWrap}>
          <div className={styles.myInfoWrap}>
            <div>안녕하세요 :)</div>
            <div>
              <span className={styles.myName} style={fonts.HEADING_LG_BOLD}>
                홍길동
              </span>
              <span style={fonts.HEADING_MD}>님</span>
            </div>
            <div>(honggildong@gmail.com)</div>
          </div>
          <div className={styles.testInfoBox}>
            <div className={styles.testInfoItem}>
              <div className={styles.testInfoTitle}>전체 진행 현황</div>
              <div
                className={styles.testInfoContent}
                style={fonts.HEADING_LG_BOLD}
              >
                100%
              </div>
            </div>
            <div className={styles.seperate} />
            <div className={styles.testInfoItem}>
              <div className={styles.testInfoTitle}>진행 완료</div>
              <div
                className={styles.testInfoContent}
                style={fonts.HEADING_LG_BOLD}
              >
                3
              </div>
            </div>
            <div className={styles.seperate} />
            <div className={styles.testInfoItem}>
              <div className={styles.testInfoTitle}>진행중</div>
              <div
                className={styles.testInfoContent}
                style={fonts.HEADING_LG_BOLD}
              >
                0
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.testWrap}>
        <div className={styles.testBox}>
          <div className={styles.testCategory}>
            <div style={fonts.HEADING_SM_BOLD}>예정된 시험</div>
            <FaAngleDown />
          </div>
          <div className={styles.testContent}>예정된 시험이 없습니다.</div>
        </div>
        <div className={styles.testBox}>
          <div className={styles.testCategory}>
            <div style={fonts.HEADING_SM_BOLD}>진행중인 시험</div>
            <FaAngleDown />
          </div>
          <div className={styles.testContent}>진행중인 시험이 없습니다.</div>
        </div>
        <div className={styles.testBox}>
          <div className={styles.testCategory}>
            <div style={fonts.HEADING_SM_BOLD}>이전 시험</div>

            <FaAngleDown />
          </div>
          <div className={styles.testContent}>표</div>
        </div>
      </div>
    </div>
  );
};

export default MyTest;
