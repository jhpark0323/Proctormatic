import HeaderWhite from "@/components/HeaderWhite";
import styles from "@/styles/Testpage.module.css";
import { fonts } from "@/constants";
import axiosInstance from "@/utils/axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";

interface ReportDetailProps {}

interface Taker {
  name: string;
  email: string;
  birth: string;
  id_photo: string | null;
  web_cam: string | null;
  verification_rate: number;
  date: string;
  entry_time: string;
  exit_time: string;
  number_of_entry: number;
  check_out_state: "normal" | "abnormal";
  abnormalList: AbnormalBehavior[];
}

interface AbnormalBehavior {
  detected_time: string;
  end_time: string;
  type: string;
}

const ReportDetail = ({}: ReportDetailProps) => {
  const { eid, tid } = useParams();
  const [takerData, setTakerData] = useState<Taker>({
    name: "",
    email: "",
    birth: "",
    id_photo: null,
    web_cam: null,
    verification_rate: 0,
    date: "",
    entry_time: "",
    exit_time: "",
    number_of_entry: 0,
    check_out_state: "normal",
    abnormalList: [],
  });

  useEffect(() => {
    axiosInstance
      .get(`/exam/${eid}/taker/${tid}/`)
      .then((response) => {
        console.log(response.data);
        setTakerData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [eid, tid]);

  const navigate = useNavigate();
  return (
    <>
      <HeaderWhite />
      <div className={styles.makeTestContainer}>
        <div className={styles.detailMenuWrap}>
          <div className={styles.goBack} onClick={() => navigate(-1)}>
            <FaArrowLeft style={{ opacity: "0.5" }} />
            <div style={fonts.HEADING_SM_BOLD}>검증 결과 보고서</div>
          </div>
        </div>

        <div className={styles.detailContentWrap}>
          <div className={styles.takerdetailInfoWrap}>
            {/* 응시자 정보 */}
            <div className={styles.detailInfoItem}>
              <div className={styles.reportItem}>
                <div className={styles.detailInfoTitle} style={fonts.HEADING_SM_BOLD}>
                  응시자 이름
                </div>
                <div className={styles.detailInfoContext}>{takerData?.name}</div>
              </div>

              <div className={styles.reportItem}>
                <div className={styles.detailInfoTitle} style={fonts.HEADING_SM_BOLD}>
                  응시자 이메일
                </div>
                <div className={styles.detailInfoContext}>{takerData?.email}</div>
              </div>
              <div className={styles.reportItem}>
                <div className={styles.detailInfoTitle} style={fonts.HEADING_SM_BOLD}>
                  응시자 생년월일
                </div>
                <div className={styles.detailInfoContext}>{takerData?.birth}</div>
              </div>
              <div className={styles.reportItem}>
                <div className={styles.detailInfoTitle} style={fonts.HEADING_SM_BOLD}>
                  신분증 사진
                </div>
                <div className={styles.detailInfoContext}>
                  {takerData?.id_photo ? (
                    <img src={takerData.id_photo} className={styles.takerIdImage} />
                  ) : (
                    "업로드 된 신분증이 없습니다..."
                  )}
                </div>
              </div>
            </div>

            {/* 시험 정보 */}
            <div className={styles.detailInfoItem}>
              <div className={styles.reportItem}>
                <div className={styles.detailInfoTitle} style={fonts.HEADING_SM_BOLD}>
                  시험 날짜
                </div>
                <div className={styles.detailInfoContext}>{takerData?.date}</div>
              </div>
              <div className={styles.reportItem}>
                <div className={styles.detailInfoTitle} style={fonts.HEADING_SM_BOLD}>
                  입장 시간
                </div>
                <div className={styles.detailInfoContext}>
                  {takerData?.entry_time ? takerData.entry_time.slice(0, 8) : "정보 없음"}
                </div>
              </div>
              <div className={styles.reportItem}>
                <div className={styles.detailInfoTitle} style={fonts.HEADING_SM_BOLD}>
                  퇴장 시간
                </div>
                <div className={styles.detailInfoContext}>
                  {takerData?.exit_time ? takerData.exit_time.slice(0, 8) : "정보 없음"}
                </div>
              </div>
              <div className={styles.reportItem}>
                <div className={styles.detailInfoTitle} style={fonts.HEADING_SM_BOLD}>
                  재입실 횟수
                </div>
                <div className={styles.detailInfoContext}>{takerData?.number_of_entry}</div>
              </div>
              <div className={styles.reportItem}>
                <div className={styles.detailInfoTitle} style={fonts.HEADING_SM_BOLD}>
                  정상퇴실 여부
                </div>
                <div
                  className={styles.detailInfoContext}
                  style={{
                    color: takerData?.check_out_state === "normal" ? "" : "var(--DELETE)",
                    fontWeight: takerData?.check_out_state === "abnormal" ? "bold" : "",
                  }}
                >
                  {takerData?.check_out_state === "normal" ? "정상" : "비정상"}
                </div>
              </div>
            </div>

            {/* 영상 */}
            <div className={styles.reportItem}>
              <div className={styles.detailInfoTitle} style={fonts.HEADING_SM_BOLD}>
                응시 영상
              </div>
              <div className={styles.detailInfoContext}>
                {takerData?.web_cam ? (
                  <video
                    id="videoPlayer"
                    controls
                    src={takerData.web_cam}
                    className={styles.takerVideo}
                  >
                    현재 브라우저는 동영상을 지원하지 않습니다.
                  </video>
                ) : (
                  "영상 업로드 중입니다..."
                )}
              </div>
            </div>

            {/* 타임라인 버튼 */}
            <div className={styles.detailEventItem}>
              <div className={styles.detailInfoTitle} style={fonts.HEADING_SM_BOLD}>
                감지된 이벤트 타임라인
              </div>
              <div className={styles.timelineButtons}>
                {takerData.abnormalList.map((event, index) => {
                  const borderColors: { [key: string]: string } = {
                    phone: "red",
                    person: "blue",
                    watch: "green",
                    earphone: "purple",
                  };

                  const borderColor = borderColors[event.type] || "gray";

                  return (
                    <button
                      key={index}
                      className={styles.timelineButton}
                      style={{
                        border: `2px solid ${borderColor}`,
                        margin: "5px",
                        padding: "10px",
                        borderRadius: "5px",
                        backgroundColor: "white",
                        color: borderColor,
                      }}
                      onClick={() => {
                        const videoElement = document.getElementById("videoPlayer") as HTMLVideoElement;
                        if (videoElement) {
                          const timeParts = event.detected_time
                            .split(":")
                            .map((part) => parseFloat(part));
                          const timeInSeconds = timeParts.reduce(
                            (acc, time, i) => acc + time * Math.pow(60, timeParts.length - 1 - i),
                            0
                          );
                          videoElement.currentTime = timeInSeconds;
                          videoElement.play();
                        }
                      }}
                    >
                      {`이벤트 ${index + 1} (${event.type}): ${event.detected_time}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportDetail;
