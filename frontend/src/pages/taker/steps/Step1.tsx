import React, { useState, useEffect } from "react";
import styles from "@/styles/Step.module.css";
import CustomButton from "@/components/CustomButton";
import { useTakerStore } from "@/store/TakerAuthStore";

const Step1: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [inputValue, setInputValue] = useState("https://k11s209.p.ssafy.io/exams/4/"); // 개발용 추후 수정 요망
  const { setTestId } = useTakerStore();
  const [isValid, setIsValid] = useState(false);

  // URL 검증 함수
  useEffect(() => {
    const urlPattern = /^https:\/\/k11s209\.p\.ssafy\.io\/exams\/(\d+)\/?$/;
    const match = inputValue.match(urlPattern);
    if (match) {
      setIsValid(true);
      setTestId(match[1]); // 시험 ID (숫자) 저장
    } else {
      setIsValid(false);
    }
  }, [inputValue, setTestId]);

  const handleNextClick = () => {
    if (isValid) {
      onNext(); // Step 2로 이동
    }
  };

  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>URL 입력하기</div>
        <div className={styles.StepSubTitle}>
          이메일로 수신 받은 URL 코드를 붙여 넣어주세요.
        </div>
      </div>
      <div className={styles.StepInner}>
        <div className={styles.UrlContainer}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
      </div>
      <div className={styles.StepFooter}>
        <CustomButton onClick={handleNextClick} state={isValid ? "default" : "disabled"}>
          다음
        </CustomButton>
      </div>
    </>
  );
};

export default Step1;
