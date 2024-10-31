import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/HeaderWhite.module.css";
import CustomButton from "./CustomButton";

interface HeaderWhiteProps {
  onLoginClick: () => void;
  userRole?: string;
  onLogoutClick: () => void;
}

const HeaderWhite: React.FC<HeaderWhiteProps> = ({
  onLoginClick,
  userRole,
  onLogoutClick,
}) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken"); // 엑세스 토큰 삭제
    localStorage.removeItem("refreshToken"); // 리프레시 토큰 삭제
    onLogoutClick();
    setIsModalOpen(false);
  };
  

  return (
    <div className={styles.Header}>
      <img className={styles.Logo} src="/src/assets/mainLogo.svg" alt="Logo" />
      <div className={styles.LoginBox}>
        {userRole ? (
          <div className={styles.UserInfo}>
            <div className={styles.UserRoleContainer}>
              <span className={styles.UserRole} onClick={toggleModal} role='name'>
                <span>{userRole}</span> 님
              </span>
              {isModalOpen && (
                <div className={styles.Modal}>
                  <button
                    className={styles.LogoutButton}
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
            {userRole === "taker" ? (
              <CustomButton onClick={() => navigate("/taker")}>
                시험 입실하기
              </CustomButton>
            ) : userRole === "host" ? (
              <CustomButton onClick={() => navigate("/host")}>
                시험 관리하기
              </CustomButton>
            ) : null}
          </div>
        ) : (
          <div className={styles.LoginButton} onClick={onLoginClick}>
            로그인 / 가입
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderWhite;
