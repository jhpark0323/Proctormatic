import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import HeaderBlue from "@/components/HeaderBlue";
import styles from "@/styles/TakerHome.module.css";

import { FaAngleLeft } from "react-icons/fa6";
import { MdDevices } from "react-icons/md";
import { IoCameraOutline } from "react-icons/io5";
import { TbCameraSelfie } from "react-icons/tb";
import { RiIdCardLine } from "react-icons/ri";
import { AiOutlineRobot } from "react-icons/ai";

import Step6 from "@/pages/taker/steps/Step6";
import Step7 from "@/pages/taker/steps/Step7";
import Step8 from "@/pages/taker/steps/Step8";
import Step9 from "@/pages/taker/steps/Step9";
import Step10 from "@/pages/taker/steps/Step10";

import * as faceapi from "face-api.js";

const TakerHome2 = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      if (modelsLoaded) return;
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models in TakerHome2:", error);
      }
    };
    loadModels();
  }, [modelsLoaded]);

  const { user } = useAuthStore();
  const [step, setStep] = useState(6);
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  const renderStepContent = () => {
    switch (step) {
      case 6:
        return <Step6 onNext={() => setStep(7)} />;
      case 7:
        return <Step7 onNext={() => setStep(8)} />;
      case 8:
        return <Step8 onNext={() => setStep(9)} />;
      case 9:
        return <Step9 onNext={() => setStep(10)} />;
      case 10:
        return <Step10 modelsLoaded={modelsLoaded} />;
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
          본인 확인 및 시험 준비하기
        </div>
        <div className={styles.ContentInner}>
          {/* 사이드바 부분 */}
          <div className={styles.InnerSide} role="complementary">
            <div className={styles.SideStep} style={getStepStyle(6)}>
              <MdDevices size={22} />
              기기 상태 점검
            </div>
            <div className={styles.SideStep} style={getStepStyle(7)}>
              <IoCameraOutline size={22} />
              카메라 연결
            </div>
            <div className={styles.SideStep} style={getStepStyle(8)}>
              <TbCameraSelfie size={22} />
              사진 촬영
            </div>
            <div className={styles.SideStep} style={getStepStyle(9)}>
              <RiIdCardLine size={22} />
              신분증 촬영
            </div>
            <div className={styles.SideStep} style={getStepStyle(10)}>
              <AiOutlineRobot size={22} />
              AI 본인 인증
            </div>
            {/* <div className={styles.SideStep} style={getStepStyle(5)}>
              <MdOutlinePersonOutline size={22} />응시자 정보 입력
            </div> */}
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

export default TakerHome2;
