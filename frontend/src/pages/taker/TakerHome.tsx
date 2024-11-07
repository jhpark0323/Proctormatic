import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import HeaderBlue from "@/components/HeaderBlue";
import styles from "@/styles/TakerHome.module.css";
import { MdOutlineEmail } from "react-icons/md";
import { PiWarningBold, PiInfoBold } from "react-icons/pi";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { MdOutlinePersonOutline } from "react-icons/md";
import { FaAngleLeft } from "react-icons/fa6";

import Step1 from "@/pages/taker/steps/Step1";
import Step2 from "@/pages/taker/steps/Step2";
import Step3 from "@/pages/taker/steps/Step3";
import Step4 from "@/pages/taker/steps/Step4";
import Step5 from "@/pages/taker/steps/Step5";

const TakerHome = () => {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // 이전 페이지
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <Step1 onNext={() => setStep(2)} />;
      case 2:
        return <Step2 onNext={() => setStep(3)} />;
      case 3:
        return <Step3 onNext={() => setStep(4)} />;
      case 4:
        return <Step4 onNext={() => setStep(5)} onBack={() => setStep(1)} />;
      case 5:
        return <Step5 />;
      default:
        return null;
    }
  };

  const getStepStyle = (currentStep: number) => ({
    color: step === currentStep ? "black" : "var(--GRAY_400)",
    fontSize: step === currentStep ? "20px" : "18px",
  });

  return (
    <>
      <HeaderBlue userRole={user?.role} />
      <div className={styles.Content}>
        <div className={styles.ContentHeader}>
          <FaAngleLeft
            size={23}
            style={{ cursor: "pointer" }}
            onClick={handleBackClick}
          />
          시험장 입실하기
        </div>
        <div className={styles.ContentInner}>
          {/* 사이드바 부분 */}
          <div className={styles.InnerSide} role="complementary">
            <div className={styles.SideStep} style={getStepStyle(1)}>
              <MdOutlineEmail size={22} />
              URL 입력하기
            </div>
            <div className={styles.SideStep} style={getStepStyle(2)}>
              <PiInfoBold size={22} />
              시험 주의사항
            </div>
            <div className={styles.SideStep} style={getStepStyle(3)}>
              <PiWarningBold size={22} />
              부정행위 안내
            </div>
            <div className={styles.SideStep} style={getStepStyle(4)}>
              <HiOutlineDocumentSearch size={22} />
              시험정보 확인
            </div>
            <div className={styles.SideStep} style={getStepStyle(5)}>
              <MdOutlinePersonOutline size={22} />
              응시자 정보 입력
            </div>
          </div>

          {/* 메인 부분 */}
          <div className={styles.InnerMain} role="main">
            {renderStepContent()}
          </div>
        </div>
        <div className={styles.ContentFooter}></div>
      </div>
    </>
  );
};

export default TakerHome;
