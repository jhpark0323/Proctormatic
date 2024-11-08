import styles from "@/styles/Testpage.module.css";
import { fonts } from "@/constants";
import { FaArrowLeft } from "react-icons/fa6";
import { TbDotsVertical } from "react-icons/tb";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { useNavigate, useParams } from "react-router-dom";
import HeaderWhite from "@/components/HeaderWhite";

interface Taker {
  taker_id: bigint;
  name: string;
  verification_rate: number;
  stored_state: number;
}

interface Exam {
  id: bigint;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  expected_taker: number;
  total_taker: number;
  cheer_msg?: string;
  taker_list: Taker[];
}

const TestDetail = () => {
  const { id } = useParams();
  const [examData, setExamData] = useState<Exam | null>(null);
  useEffect(() => {
    axiosInstance
      .get(`/exam/${id}/`)
      .then((response) => {
        console.log(response.data);
        setExamData(response.data);
      })
      .catch((error) => {
        console.log("조회 실패: ", error);
      });
  }, [id]);

  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  const deleteTest = () => {
    axiosInstance
      .delete(`/exam/${id}/`)
      .then((response) => {
        console.log(response);
        navigate(-1);
      })
      .catch((error) => {
        console.log("시험 삭제 실패: ", error);
      });
  };

  return (
    <>
      <HeaderWhite />
      <div className={styles.makeTestContainer}>
        <div className={styles.detailMenuWrap}>
          <div className={styles.goBack} onClick={() => navigate(-1)}>
            <FaArrowLeft style={{ opacity: "0.5" }} />
            <div style={fonts.HEADING_SM_BOLD}>{examData?.title}</div>
          </div>
          <div className={styles.dropdownWrapper}>
            <div onClick={handleDropdownToggle}>
              <TbDotsVertical />
            </div>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <ul>
                  <li onClick={deleteTest}>삭제</li>
                </ul>
              </div>
            )}
          </div>
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
                {examData?.date} {examData?.start_time} ~ {examData?.end_time}
              </div>
            </div>
            <div className={styles.detailInfoItem}>
              <div
                className={styles.detailInfoTitle}
                style={fonts.HEADING_SM_BOLD}
              >
                응시 인원
              </div>
              <div className={styles.detailInfoContext}>
                {examData?.taker_list.length}명 응시 / 최대
                {examData?.expected_taker}명
              </div>
            </div>
            <div className={styles.detailInfoItem}>
              <div
                className={styles.detailInfoTitle}
                style={fonts.HEADING_SM_BOLD}
              >
                응원 메세지
              </div>
              <div className={styles.detailInfoContext}>
                {examData?.cheer_msg}
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
                  {examData?.taker_list.map((taker) => (
                    <tr key={taker.taker_id.toString()}>
                      <td>{taker.name}</td>
                      <td>{taker.verification_rate}%</td>
                      <td>
                        <td>
                          {/* 90을 임시 기준점으로 잡아놓음 */}
                          <div
                            className={styles.abnormal}
                            style={{
                              ...fonts.MD_SEMIBOLD,
                              backgroundColor:
                                taker.verification_rate < 90
                                  ? "var(--DELETE)"
                                  : "var(--PRIMARY)",
                            }}
                          >
                            {taker.verification_rate >= 90
                              ? "이상 없음"
                              : "확인 필요"}
                          </div>
                        </td>
                      </td>
                      <td>{taker.stored_state}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestDetail;
