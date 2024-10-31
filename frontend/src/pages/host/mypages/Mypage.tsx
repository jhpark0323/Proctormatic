import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import HeaderBlue from "@/components/HeaderBlue";
import styles from "@/styles/TakerHome.module.css";
import { FaRegCreditCard } from "react-icons/fa6";
import { SiPrivateinternetaccess } from "react-icons/si";
import { BiInfoSquare } from "react-icons/bi";
import { FaAngleLeft } from "react-icons/fa6";

import MyCoin from "./MyCoin";
import AccountInfo from "./AccountInfo";
import HostHeader from "@/components/HostHeader";

const Mypage = () => {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <MyCoin />;
      case 2:
        return <AccountInfo />;
      // case 3:
      //   return <약관 페이지 />;

      default:
        return null;
    }
  };

  const getStepStyle = (currentStep: number) => ({
    color: step === currentStep ? "black" : "var(--GRAY_400)",
    fontSize: step === currentStep ? "20px" : "18px",
    cursor: "pointer", // 클릭 가능 표시
  });

  return (
    <>
      <HostHeader />
      <div className={styles.Content}>
        <div className={styles.ContentHeader}>
          <FaAngleLeft
            size={23}
            style={{ cursor: "pointer" }}
            onClick={handleBackClick}
          />
          마이 페이지
        </div>
        <div className={styles.ContentInner}>
          {/* 사이드바 부분 */}
          <div className={styles.InnerSide} role="complementary">
            <div
              className={styles.SideStep}
              style={getStepStyle(1)}
              onClick={() => setStep(1)} // 클릭 시 step을 1로 설정
            >
              <FaRegCreditCard size={22} />내 적립금
            </div>
            <div
              className={styles.SideStep}
              style={getStepStyle(2)}
              onClick={() => setStep(2)} // 클릭 시 step을 2로 설정
            >
              <SiPrivateinternetaccess size={22} />
              계정 정보
            </div>
            <div
              className={styles.SideStep}
              style={getStepStyle(3)}
              onClick={() => setStep(3)} // 클릭 시 step을 3로 설정
            >
              <BiInfoSquare size={22} />
              약관 및 정책
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

export default Mypage;
