import styles from "@/styles/Testpage.module.css";
import { fonts } from "@/constants";
import { FaArrowLeft } from "react-icons/fa6";
import { TbDotsVertical } from "react-icons/tb";

const TestDetail = () => {
  return (
    <div className={styles.makeTestContainer}>
      <div className={styles.detailMenuWrap}>
        <div className={styles.goBack}>
          <FaArrowLeft style={{ opacity: "0.5" }} />
          <div style={fonts.HEADING_SM_BOLD}>S209 평가 시험</div>
        </div>
        <TbDotsVertical />
      </div>

      <div className={styles.detailContentWrap}>
        <div className={styles.detailInfoWrap}>
          <div className={styles.detailInfoItem}>
            <div
              className={styles.detailInfoTitle}
              style={fonts.HEADING_SM_BOLD}
            >
              시험 날짜와 시간
            </div>
            <div className={styles.detailInfoContext}>
              2024 - 10 - 17(목) 오후 02:50 ~ 오후 03:20
            </div>
          </div>
          <div className={styles.detailInfoItem}>
            <div
              className={styles.detailInfoTitle}
              style={fonts.HEADING_SM_BOLD}
            >
              응시 인원
            </div>
            <div className={styles.detailInfoContext}>2명 응시 / 최대 2명</div>
          </div>
          <div className={styles.detailInfoItem}>
            <div
              className={styles.detailInfoTitle}
              style={fonts.HEADING_SM_BOLD}
            >
              응원 메세지
            </div>
            <div className={styles.detailInfoContext}>
              좋은 결과 있으시길 바랍니다.
            </div>
          </div>
        </div>
        <div className={styles.summaryWrap}>
          <div style={{ marginBottom: "0.5rem" }}>응시자 요약</div>
          <div className={styles.summaryBox}>
            <table className={styles.summaryTable}>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>일치 정도</th>
                  <th>이상 여부</th>
                  <th>영상 업로드 정도</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>홍길동</td>
                  <td>95%</td>
                  <td>
                    <div className={styles.abnormal} style={fonts.MD_SEMIBOLD}>
                      이상 없음
                    </div>
                  </td>
                  <td>100%</td>
                </tr>
                <tr>
                  <td>홍길동</td>
                  <td>95%</td>
                  <td>
                    <div className={styles.abnormal} style={fonts.MD_SEMIBOLD}>
                      이상 없음
                    </div>
                  </td>
                  <td>100%</td>
                </tr>
                <tr>
                  <td>홍길동</td>
                  <td>95%</td>
                  <td>
                    <div className={styles.abnormal} style={fonts.MD_SEMIBOLD}>
                      이상 없음
                    </div>
                  </td>
                  <td>100%</td>
                </tr>
                <tr>
                  <td>홍길동</td>
                  <td>95%</td>
                  <td>
                    <div className={styles.abnormal} style={fonts.MD_SEMIBOLD}>
                      이상 없음
                    </div>
                  </td>
                  <td>100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetail;
