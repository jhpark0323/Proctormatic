import { useEffect, useState } from "react";
import Textfield from "@/components/Textfield";
import { fonts } from "@/constants";
import styles from "@/styles/Testpage.module.css";
import { FaArrowLeft } from "react-icons/fa6";
import CustomButton from "@/components/CustomButton";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import axiosInstance from "@/utils/axios";
import { CustomToast } from "@/components/CustomToast";
import HeaderWhite from "@/components/HeaderWhite";
import ReservationDateTime from "./ReservationDateTime";
import TestCostInfo from "./TestCostInfo";
import { formatDateAndTime } from "@/utils/handleDateTimeChange";
import { calculateTimeDifference } from "@/utils/calculateTimeDifference";

interface TestForm {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  exit_time?: string;
  expected_taker: number;
  cheer_msg?: string;
  cost: number;
}

const MakeTest = () => {
  const [isExitPermitted, setIsExitPermitted] = useState(false);
  const navigate = useNavigate();

  // 사용자 정보 및 코인 정보 조회
  const [userEmail, setUserEmail] = useState("");
  const { user } = useAuthStore();
  const [currentCoinAmount, setCurrentCoinAmount] = useState(0);

  const fetchUserData = async () => {
    try {
      const userResponse = await axiosInstance.get("/users/");
      setUserEmail(userResponse.data.email);

      const coinResponse = await axiosInstance.get("/coin/");
      setCurrentCoinAmount(coinResponse.data.coin);
    } catch (error) {
      console.error("데이터 조회 실패: ", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // 시험 생성 폼 초기 상태 설정
  const { date, time } = formatDateAndTime(new Date());
  const [testForm, setTestForm] = useState<TestForm>({
    title: "",
    date,
    start_time: time,
    end_time: "",
    exit_time: "",
    expected_taker: 0,
    cheer_msg: "",
    cost: 0,
  });

  // 시험 시간 및 비용 계산
  const [expectedTaker, setExpectedTaker] = useState(testForm.expected_taker);
  const [timeDifference, setTimeDifference] = useState(0);
  const [currentCost, setCurrentCost] = useState(0);

  useEffect(() => {
    // 시간 차이 계산 (시간이 없으면 기본값 0)
    const diff =
      testForm.start_time && testForm.end_time
        ? calculateTimeDifference(
            testForm.date,
            testForm.start_time,
            testForm.end_time
          )
        : 0;
    setTimeDifference(diff);

    // 비용 계산 (값이 없으면 0으로 처리)
    const cost = diff * 10 * (expectedTaker || 0);
    setCurrentCost(cost);
  }, [testForm, expectedTaker]);

  // 시험 생성 함수
  const submitTestForm = async () => {
    const completeForm = {
      ...testForm,
      cost: currentCost,
      exit_time: testForm.exit_time || testForm.end_time,
    };

    // 필수 입력 값 체크
    if (!completeForm.title) {
      CustomToast("제목을 입력해주세요.");
      return;
    }
    if (
      !completeForm.date ||
      !completeForm.start_time ||
      !completeForm.end_time ||
      !expectedTaker
    ) {
      CustomToast("시간을 설정해주세요.");
      return;
    }

    axiosInstance
      .post("/exam/", completeForm)
      .then((response) => {
        CustomToast(response.data.message);
        navigate("/host/myTest");
      })
      .catch((error) => {
        if (error.response?.status === 409) {
          CustomToast(error.response.data.message);
        } else {
          CustomToast("다시 시도해주세요.");
        }
        console.error("시험 생성 실패: ", error);
      });
  };

  return (
    <>
      <HeaderWhite />
      <div className={styles.makeTestContainer}>
        <div className={styles.goBack} onClick={() => navigate(-1)}>
          <FaArrowLeft style={{ opacity: "0.5" }} />
          <div style={fonts.HEADING_SM_BOLD}>시험 예약하기</div>
        </div>

        <div className={styles.makeTestBox}>
          <div className={styles.makeTestContentBox}>
            {/* 주최자 정보 */}
            <div className={styles.makeTestContentItem}>
              <div className={styles.makeTestContentTitle}>주최자 정보</div>
              <div className={styles.makeTestName} style={fonts.LG_SEMIBOLD}>
                {user?.name} ({userEmail})
              </div>
            </div>

            {/* 시험 제목 입력 */}
            <Textfield
              label="시험 제목"
              placeholder="시험 제목 입력"
              value={testForm.title}
              onChange={(value) => setTestForm({ ...testForm, title: value })}
            />

            {/* 응원 메세지 입력 */}
            <Textfield
              label="응원 메세지 (선택)"
              placeholder="응원 메세지 입력 (최대 100자)"
              value={testForm.cheer_msg}
              onChange={(value) =>
                setTestForm({ ...testForm, cheer_msg: value })
              }
            />

            {/* 시험 날짜 및 시간 설정 */}
            <ReservationDateTime
              testForm={testForm}
              setTestForm={setTestForm}
              isExitPermitted={isExitPermitted}
              setIsExitPermitted={setIsExitPermitted}
            />

            {/* 서비스 요금 및 응시 인원 설정 */}
            <TestCostInfo
              timeDifference={timeDifference}
              expectedTaker={expectedTaker}
              setExpectedTaker={(value) => {
                setExpectedTaker(value);
                setTestForm({ ...testForm, expected_taker: value });
              }}
              currentCost={currentCost}
              currentCoinAmount={currentCoinAmount}
            />
          </div>
        </div>

        <div className={styles.submitButton}>
          <CustomButton onClick={submitTestForm}>
            <span style={fonts.MD_SEMIBOLD}>결제 및 예약하기</span>
          </CustomButton>
        </div>
      </div>
    </>
  );
};

export default MakeTest;
