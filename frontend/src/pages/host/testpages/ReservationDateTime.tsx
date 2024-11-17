import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ko } from "date-fns/locale";
import Checkbox from "@/components/Checkbox";
import styles from "@/styles/Testpage.module.css";
import { formatDateAndTime } from "@/utils/handleDateTimeChange";
import { fonts } from "@/constants";

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

interface ReservationDateTimeProps {
  testForm: TestForm;
  setTestForm: React.Dispatch<React.SetStateAction<TestForm>>;
  isExitPermitted: boolean;
  setIsExitPermitted: React.Dispatch<React.SetStateAction<boolean>>;
}

const ReservationDateTime = ({
  testForm,
  setTestForm,
  isExitPermitted,
  setIsExitPermitted,
}: ReservationDateTimeProps) => {
  const handleDateTimeChange = (
    field: keyof typeof testForm,
    value: Date | null
  ) => {
    if (value) {
      const { date, time } = formatDateAndTime(value);
      setTestForm((prevForm: TestForm) => ({
        ...prevForm,
        [field]: field === "date" ? date : time,
      }));
    }
  };

  return (
    <div className={styles.makeTestContentItem}>
      <div className={styles.makeTestContentTitle}>
        시험 날짜와 시간 (최대 120분)
      </div>
      <div style={{ ...fonts.SM_REGULAR, color: "var(--GRAY_500)" }}>
        * 응시자는 시험 시작하기 30분 전부터 입장이 가능해요.
      </div>
      {/* <div style={{ ...fonts.SM_REGULAR, color: "var(--GRAY_500)" }}>
        * 지각한 응시자는 시험 시작 후 15분 이내까지만 입장이 가능해요.
      </div> */}

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <div className={styles.timeWrap}>
          {/* 응시 시작 시간 */}
          <div className={styles.timeInput}>
            <div>응시 시작: </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <DatePicker
                value={new Date(testForm.date)}
                onChange={(newValue) => handleDateTimeChange("date", newValue)}
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
                value={new Date(`${testForm.date}T${testForm.start_time}`)}
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
          </div>

          {/* 응시 종료 시간 */}
          <div className={styles.endTimeWrap}>
            <div className={styles.timeWrap}>
              <div className={styles.timeInput}>
                <div>응시 종료: </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <DatePicker
                    value={new Date(testForm.date)}
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
                    value={new Date(`${testForm.date}T${testForm.end_time}`)}
                    onChange={(newValue) =>
                      handleDateTimeChange("end_time", newValue)
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
              </div>
            </div>

            {/* 중도 퇴실 가능 여부 */}
            <Checkbox checked={isExitPermitted} onChange={setIsExitPermitted}>
              중도 퇴실 가능
            </Checkbox>

            {/* 퇴실 가능 시간 */}
            {isExitPermitted && (
              <div className={styles.timeWrap}>
                <div className={styles.timeInput}>
                  <div>퇴실 가능: </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <DatePicker
                      value={new Date(testForm.date)}
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
                        testForm.exit_time
                          ? new Date(`${testForm.date}T${testForm.exit_time}`)
                          : null
                      }
                      onChange={(newValue) =>
                        handleDateTimeChange("exit_time", newValue)
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
                </div>
              </div>
            )}
          </div>
        </div>
      </LocalizationProvider>
    </div>
  );
};

export default ReservationDateTime;
