import { useState } from "react";
import Textfield from "@/components/Textfield";
import { fonts } from "@/constants";
import styles from "@/styles/Testpage.module.css";
import { FaArrowLeft } from "react-icons/fa6";
import Checkbox from "@/components/Checkbox";
import CustomButton from "@/components/CustomButton";

// 시간, 날짜 input
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { ko } from "date-fns/locale";

const MakeTest = () => {
  const [isExitPermitted, setIsExitPermitted] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  // const [endDate, setEndDate] = useState<Date | null>(null);

  return (
    <div className={styles.makeTestContainer}>
      <div className={styles.goBack}>
        <FaArrowLeft style={{ opacity: "0.5" }} />
        <div style={fonts.HEADING_SM_BOLD}>시험 예약하기</div>
      </div>

      <div className={styles.makeTestBox}>
        <div className={styles.makeTestContentBox}>
          <div className={styles.makeTestContentItem}>
            <div className={styles.makeTestContentTitle}>주최자 정보</div>
            <div className={styles.makeTestName} style={fonts.LG_SEMIBOLD}>
              홍길동 (honggildong@gmail.com)
            </div>
          </div>
          <div className={styles.makeTestContentItem}>
            <Textfield label="시험 제목" placeholder="시험 제목 입력" />
          </div>
          <div className={styles.makeTestContentItem}>
            <Textfield
              label="응원 메세지 (선택)"
              placeholder="응원 메세지 입력 (최대 100자)"
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
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <DatePicker
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
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
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
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
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <DatePicker
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
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
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
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
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <DatePicker
                          value={startDate}
                          onChange={(newValue) => setStartDate(newValue)}
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
                          value={startDate}
                          onChange={(newValue) => setStartDate(newValue)}
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
                style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}
              >
                <div style={{ width: "5%" }}>
                  <Textfield placeholder="0" maxLength={3} />
                </div>
                <div className={styles.makeTestContentTitle}>명</div>
              </div>
              <div style={{ display: "flex", alignItems: "end" }}>
                <div
                  className={styles.coinAmount}
                  style={fonts.HEADING_MD_BOLD}
                >
                  600
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
              <div className={styles.coinAmount} style={fonts.HEADING_MD_BOLD}>
                600
              </div>
              <div className={styles.makeTestContentTitle}>C</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.submitButton}>
        <CustomButton>
          <span style={fonts.MD_SEMIBOLD}>결제 및 예약하기</span>
        </CustomButton>
      </div>
    </div>
  );
};

export default MakeTest;
