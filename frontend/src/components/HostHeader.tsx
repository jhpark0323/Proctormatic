import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/HeaderWhite.module.css";
import CustomButton from "./CustomButton";
import { useAuthStore } from "@/store/useAuthStore";

const HostHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className={styles.Header}>
      <img className={styles.Logo} src="/src/assets/mainLogo.svg" alt="Logo" />
      <div className={styles.menu}>
        <a onClick={() => navigate("/host/myTest")} className={styles.menuIcon}>
          내 시험 관리
        </a>
        <a
          onClick={() => navigate("/host/helpdesk")}
          className={styles.menuIcon}
        >
          고객 센터
        </a>
        <a onClick={() => navigate("/host/mypage")} className={styles.menuIcon}>
          마이 페이지
        </a>
      </div>
      <div className={styles.LoginBox}>
        <div className={styles.UserInfo}>
          <div className={styles.UserRoleContainer}>
            <span className={styles.UserRole}>
              <span>{user?.name}</span> 님
            </span>
          </div>

          <CustomButton onClick={() => navigate("/host/newTest/")}>
            시험 예약하기
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default HostHeader;
