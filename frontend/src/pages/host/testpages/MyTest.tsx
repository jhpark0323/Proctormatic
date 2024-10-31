import HostHeader from "@/components/HostHeader";
import { fonts } from "@/constants";
import styles from "@/styles/Testpage.module.css";
import { useEffect, useState } from "react";
import { FaAngleDown } from "react-icons/fa";
import axiosInstance from "@/utils/axios";

const MyTest = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [scheduledExams, setScheduledExams] = useState([]);
  const [onGoingExams, setOnGoingExams] = useState([]);
  const [completedExams, setCompletedExams] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/users/")
      .then((userInfoResponse) => {
        setUserName(userInfoResponse.data.name);
        setUserEmail(userInfoResponse.data.email);
        return axiosInstance.get("/exam/scheduled");
      })
      .then((scheduledExamsResponse) => {
        setScheduledExams(scheduledExamsResponse.data.scheduledExamList);
        return axiosInstance.get("/exam/ongoing");
      })
      .then((onGoingExamsResponse) => {
        setOnGoingExams(onGoingExamsResponse.data.ongoingExamList);
        return axiosInstance.get("/exam/completed");
      })
      .then((completedExamsResponse) => {
        setCompletedExams(completedExamsResponse.data.completedExamList);
      })
      .catch((error) => {
        console.error("실패:", error);
      });
  }, []);

  return (
    <>
      <HostHeader />
      <div className={styles.container} style={{ marginTop: "75px" }}>
        <div className={styles.mytestHeader}>
          <div className={styles.mytestHeaderWrap}>
            <div className={styles.myInfoWrap}>
              <div>안녕하세요 :)</div>
              <div>
                <span className={styles.myName} style={fonts.HEADING_LG_BOLD}>
                  {userName}
                </span>
                <span style={fonts.HEADING_MD}>님</span>
              </div>
              <div>({userEmail})</div>
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
                  {completedExams.length}
                </div>
              </div>
              <div className={styles.seperate} />
              <div className={styles.testInfoItem}>
                <div className={styles.testInfoTitle}>진행중</div>
                <div
                  className={styles.testInfoContent}
                  style={fonts.HEADING_LG_BOLD}
                >
                  {onGoingExams.length}
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
            {scheduledExams.length > 0 ? (
              <div>표</div>
            ) : (
              <div className={styles.testContent}>예정된 시험이 없습니다.</div>
            )}
          </div>
          <div className={styles.testBox}>
            <div className={styles.testCategory}>
              <div style={fonts.HEADING_SM_BOLD}>진행중인 시험</div>
              <FaAngleDown />
            </div>
            {onGoingExams.length > 0 ? (
              <div>표</div>
            ) : (
              <div className={styles.testContent}>
                진행중인 시험이 없습니다.
              </div>
            )}
          </div>
          <div className={styles.testBox}>
            <div className={styles.testCategory}>
              <div style={fonts.HEADING_SM_BOLD}>이전 시험</div>
              <FaAngleDown />
            </div>
            {completedExams.length > 0 ? (
              <div>표</div>
            ) : (
              <div className={styles.testContent}>이전 시험이 없습니다.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyTest;
