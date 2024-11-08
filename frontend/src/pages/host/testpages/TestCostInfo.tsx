import Textfield from "@/components/Textfield";
import styles from "@/styles/Testpage.module.css";
import { fonts } from "@/constants";

interface TestCostInfoProps {
  timeDifference: number;
  expectedTaker: number;
  setExpectedTaker: (value: number) => void;
  currentCost: number;
  currentCoinAmount: number;
}

const TestCostInfo = ({
  timeDifference,
  expectedTaker,
  setExpectedTaker,
  currentCost,
  currentCoinAmount,
}: TestCostInfoProps) => {
  return (
    <>
      {/* 서비스 요금 */}
      <div className={styles.makeTestContentItem}>
        <div className={styles.makeTestContentTitle}>서비스 요금</div>
        <div className={styles.newTestInfoBox}>
          <div className={styles.testInfoItem}>
            <div className={styles.newTestInfoTitle}>총 시험 시간</div>
            <div
              className={styles.testInfoContent}
              style={fonts.HEADING_LG_BOLD}
            >
              {timeDifference}분
            </div>
          </div>
          <div className={styles.newTestSeperate} />
          <div className={styles.testInfoItem}>
            <div className={styles.newTestInfoTitle}>10분 당</div>
            <div
              className={styles.testInfoContent}
              style={fonts.HEADING_LG_BOLD}
            >
              10C
            </div>
          </div>
          <div className={styles.newTestSeperate} />
          <div className={styles.testInfoItem}>
            <div className={styles.newTestInfoTitle}>서비스 요금</div>
            <div
              className={styles.testInfoContent}
              style={fonts.HEADING_LG_BOLD}
            >
              10C/명
            </div>
          </div>
        </div>
      </div>

      {/* 응시 인원 */}
      <div className={styles.makeTestContentItem}>
        <div className={styles.makeTestContentTitle}>응시 인원</div>
        <div className={styles.peopelNumWrap}>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <div style={{ width: "15%" }}>
              <Textfield
                placeholder="0"
                maxLength={3}
                value={expectedTaker.toString()}
                onChange={(value) => setExpectedTaker(parseInt(value) || 0)}
              />
            </div>
            <div className={styles.makeTestContentTitle}>명</div>
          </div>
          <div style={{ display: "flex", alignItems: "end" }}>
            <div className={styles.coinAmount} style={fonts.HEADING_MD_BOLD}>
              {currentCost}
            </div>
            <div className={styles.makeTestContentTitle}>C</div>
          </div>
        </div>
      </div>

      {/* 결제 후 적립금 */}
      <div
        className={styles.makeTestContentItem}
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div>
          <div>결제 후 적립금</div>
          <div style={{ ...fonts.SM_REGULAR, color: "var(--GRAY_500)" }}>
            * 수정 후 적립금 차액은 다시 돌려드려요.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "end" }}>
          <div
            className={styles.coinAmount}
            style={{
              ...fonts.HEADING_MD_BOLD,
              color: currentCoinAmount - currentCost < 0 ? "var(--DELETE)" : "",
            }}
          >
            {currentCoinAmount - currentCost}
          </div>

          <div className={styles.makeTestContentTitle}>C</div>
        </div>
      </div>
    </>
  );
};

export default TestCostInfo;
