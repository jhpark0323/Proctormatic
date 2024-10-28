import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/HeaderWhite.module.css";
import CustomButton from "./CustomButton";

interface HostHeaderProps {}

const HostHeader: React.FC<HostHeaderProps> = ({}) => {
  const navigate = useNavigate();
  const userName = "홍길동";

  return (
    <div className={styles.Header}>
      <img className={styles.Logo} src="/src/assets/mainLogo.svg" alt="Logo" />
      <div className={styles.menu}>
        <a href="" className={styles.menuIcon}>
          내 시험 관리
        </a>
        <a href="" className={styles.menuIcon}>
          고객 센터
        </a>
        <a href="" className={styles.menuIcon}>
          마이 페이지
        </a>
      </div>
      <div className={styles.LoginBox}>
        <div className={styles.UserInfo}>
          <div className={styles.UserRoleContainer}>
            <span className={styles.UserRole}>
              <span>{userName}</span> 님
            </span>
          </div>

          <CustomButton onClick={() => navigate("/host")}>
            시험 예약하기
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default HostHeader;
