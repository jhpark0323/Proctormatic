import { useEffect, useState } from "react";
import Textfield from "@/components/Textfield";
import { fonts } from "@/constants";
import styles from "@/styles/Testpage.module.css";
import { FaArrowLeft } from "react-icons/fa6";
import Checkbox from "@/components/Checkbox";
import CustomButton from "@/components/CustomButton";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import axiosInstance from "@/utils/axios";
import { CustomToast } from "@/components/CustomToast";
import HeaderWhite from "@/components/HeaderWhite";

// 시간, 날짜 input
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { ko } from "date-fns/locale";
import { formatDateAndTime } from "@/utils/handleDateTimeChange";

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

  // 사용자 정보 조회
  const [userEmail, setUserEmail] = useState("");
  const { user } = useAuthStore();
  const fetchUserEmail = () => {
    axiosInstance
      .get("/users/")
      .then((response) => {
        setUserEmail(response.data.email);
      })
      .catch((error) => {
        console.log("이메일 조회 실패: ", error);
      });
  };

  // 코인 불러오기
  const [currentCoinAmount, setCurrentCoinAmount] = useState(0);
  const fetchCurrentCoinAmount = () => {
    axiosInstance
      .get("/coin/")
      .then((response) => {
        setCurrentCoinAmount(response.data.coin);
      })
      .catch((error) => {
        console.log("코인 조회 실패: ", error);
      });
  };

  useEffect(() => {
    fetchUserEmail();
    fetchCurrentCoinAmount();
  }, []);

  // 시험 만들기
  const { date, time } = formatDateAndTime(new Date());
  const [testForm, setTestForm] = useState<TestForm>({
    title: "",
    date: date,
    start_time: time,
    end_time: "",
    exit_time: "",
    expected_taker: 0,
    cost: 0,
  });

  const handleDateTimeChange = (field: keyof TestForm, value: Date | null) => {
    if (value) {
      const { date, time } = formatDateAndTime(value);

      setTestForm((prevForm) => ({
        ...prevForm,
        [field]: field === "date" ? date : time,
      }));
    }
  };

  const submitTestForm = () => {
    const completeForm = {
      ...testForm,
      cost: testForm.expected_taker * 60,
      exit_time: testForm.exit_time || testForm.end_time, // exit_time이 비어있다면 end_time으로 설정
    };

    // 나중에 비어있는 칸에 커서가 가도록
    if (
      !completeForm.title ||
      !completeForm.date ||
      !completeForm.start_time ||
      !completeForm.end_time ||
      !completeForm.expected_taker
    ) {
      console.log(completeForm);
      CustomToast("비어있는 칸이 있습니다!");
      return;
    }

    axiosInstance
      .post("/exam/", completeForm)
      .then((response) => {
        console.log(response.data);
        CustomToast(response.data.message);
        navigate("/host/myTest");
      })
      .catch((error) => {
        CustomToast(error.data.message);
        console.log(completeForm);
        console.log("시험 생성 실패: ", error);
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
            <div className={styles.makeTestContentItem}>
              <div className={styles.makeTestContentTitle}>주최자 정보</div>
              <div className={styles.makeTestName} style={fonts.LG_SEMIBOLD}>
                {user?.name} ({userEmail})
              </div>
            </div>
            <div className={styles.makeTestContentItem}>
              <Textfield
                label="시험 제목"
                placeholder="시험 제목 입력"
                value={testForm.title}
                onChange={(value) => setTestForm({ ...testForm, title: value })}
              />
            </div>
            <div className={styles.makeTestContentItem}>
              <Textfield
                label="응원 메세지 (선택)"
                placeholder="응원 메세지 입력 (최대 100자)"
                value={testForm.cheer_msg}
                onChange={(value) =>
                  setTestForm({ ...testForm, cheer_msg: value })
                }
              />
            </div>
            <div className={styles.makeTestContentItem}>
              <div className={styles.makeTestContentTitle}>
                시험 날짜와 시간 (최대 60분)
              </div>
              <div style={{ ...fonts.SM_REGULAR, color: "var(--GRAY_500)" }}>
                * 응시자는 시험 시작하기 30분 전부터 입장이 가능해요.
              </div>
              <div style={{ ...fonts.SM_REGULAR, color: "var(--GRAY_500)" }}>
                * 지각한 응시자는 시험 시작 후 15분 이내까지만 입장이 가능해요.
              </div>
              <div className={styles.timeWrap}>
                <div className={styles.timeInput}>
                  <div>응시 시작:</div>
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={ko}
                  >
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <DatePicker
                        value={
                          testForm.date ? new Date(testForm.date) : new Date()
                        }
                        onChange={(newValue) =>
                          handleDateTimeChange("date", newValue)
                        }
                        slotProps={{
                          textField: {
                            helperText: null,
                            InputProps: {
                              style: { fontSize: "0.875rem", height: "2.5rem" },
                            },
                          },
                        }}
                      />
                      <TimePicker
                        value={
                          testForm.start_time
                            ? new Date(
                                `${testForm.date}T${testForm.start_time}`
                              )
                            : null
                        }
                        onChange={(newValue) =>
                          handleDateTimeChange("start_time", newValue)
                        }
                        slotProps={{
                          textField: {
                            helperText: null,
                            InputProps: {
                              style: { fontSize: "0.875rem", height: "2.5rem" },
                            },
                          },
                        }}
                      />
                    </div>
                  </LocalizationProvider>
                </div>

                <div className={styles.endTimeWrap}>
                  <div className={styles.timeInput}>
                    <div>응시 종료:</div>
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      adapterLocale={ko}
                    >
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <DatePicker
                          value={
                            testForm.date ? new Date(testForm.date) : new Date()
                          }
                          onChange={(newValue) =>
                            handleDateTimeChange("date", newValue)
                          }
                          slotProps={{
                            textField: {
                              helperText: null,
                              InputProps: {
                                style: {
                                  fontSize: "0.875rem",
                                  height: "2.5rem",
                                },
                              },
                            },
                          }}
                        />
                        <TimePicker
                          value={
                            testForm.end_time
                              ? new Date(
                                  `${testForm.date}T${testForm.end_time}`
                                )
                              : null
                          }
                          onChange={(newValue) =>
                            handleDateTimeChange("end_time", newValue)
                          }
                          slotProps={{
                            textField: {
                              helperText: null,
                              InputProps: {
                                style: {
                                  fontSize: "0.875rem",
                                  height: "2.5rem",
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </LocalizationProvider>
                  </div>
                  <Checkbox
                    checked={isExitPermitted}
                    onChange={setIsExitPermitted}
                  >
                    중도 퇴실 가능
                  </Checkbox>
                  {isExitPermitted ? (
                    <div className={styles.timeInput}>
                      <div>퇴실 가능:</div>
                      <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        adapterLocale={ko}
                      >
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <DatePicker
                            value={
                              testForm.date
                                ? new Date(testForm.date)
                                : new Date()
                            }
                            onChange={(newValue) =>
                              handleDateTimeChange("date", newValue)
                            }
                            slotProps={{
                              textField: {
                                helperText: null,
                                InputProps: {
                                  style: {
                                    fontSize: "0.875rem",
                                    height: "2.5rem",
                                  },
                                },
                              },
                            }}
                          />
                          <TimePicker
                            value={
                              testForm.exit_time
                                ? new Date(
                                    `${testForm.date}T${testForm.exit_time}`
                                  )
                                : null
                            }
                            onChange={(newValue) =>
                              handleDateTimeChange("exit_time", newValue)
                            }
                            slotProps={{
                              textField: {
                                helperText: null,
                                InputProps: {
                                  style: {
                                    fontSize: "0.875rem",
                                    height: "2.5rem",
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      </LocalizationProvider>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className={styles.makeTestContentItem}>
              <div className={styles.makeTestContentTitle}>서비스 요금</div>
              <div className={styles.newTestInfoBox}>
                <div className={styles.testInfoItem}>
                  <div className={styles.newTestInfoTitle}>총 시험 시간</div>
                  <div
                    className={styles.testInfoContent}
                    style={fonts.HEADING_LG_BOLD}
                  >
                    100%
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
                    60C/명
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.makeTestContentItem}>
              <div className={styles.makeTestContentTitle}>응시 인원</div>
              <div className={styles.peopelNumWrap}>
                <div
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    alignItems: "center",
                  }}
                >
                  <div style={{ width: "15%" }}>
                    <Textfield
                      placeholder="0"
                      maxLength={3}
                      value={testForm.expected_taker.toString()}
                      onChange={(value) =>
                        setTestForm({
                          ...testForm,
                          expected_taker: parseInt(value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className={styles.makeTestContentTitle}>명</div>
                </div>
                <div style={{ display: "flex", alignItems: "end" }}>
                  <div
                    className={styles.coinAmount}
                    style={fonts.HEADING_MD_BOLD}
                  >
                    {testForm.expected_taker * 60}
                  </div>
                  <div className={styles.makeTestContentTitle}>C</div>
                </div>
              </div>
            </div>

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
                  style={fonts.HEADING_MD_BOLD}
                >
                  {currentCoinAmount - testForm.expected_taker * 60}
                </div>
                <div className={styles.makeTestContentTitle}>C</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.submitButton}>
          <CustomButton onClick={() => submitTestForm()}>
            <span style={fonts.MD_SEMIBOLD}>결제 및 예약하기</span>
          </CustomButton>
        </div>
      </div>
    </>
  );
};

export default MakeTest;
