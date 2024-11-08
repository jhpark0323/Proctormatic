import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/HeaderWhite.module.css";
import CustomButton from "./CustomButton";
import { useAuthStore } from "@/store/useAuthStore";
import mainLogo from "../assets/mainLogo.svg";

interface HeaderWhiteProps {
  onLoginClick?: () => void;
}

const HeaderWhite: React.FC<HeaderWhiteProps> = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const { user, logout, initializeFromToken } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    initializeFromToken();
  }, []);

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setIsModalOpen(false);
    navigate("/");
  };

  return (
    <div className={styles.Header}>
      <img
        className={styles.Logo}
        src={mainLogo}
        alt="Logo"
        onClick={() => navigate("/")}
        data-testid = 'logo'
      />

      {user?.role === "host" && (
        <div className={styles.menu}>
          <a
            onClick={() => navigate("/host/myTest")}
            className={styles.menuIcon}
            data-testid = 'host-mytest'
          >
            내 시험 관리
          </a>
          <a
            onClick={() => navigate("/host/helpdesk")}
            className={styles.menuIcon}
            data-testid = 'host-helpdesk'
          >
            고객 센터
          </a>
          <a
            onClick={() => navigate("/host/mypage")}
            className={styles.menuIcon}
            data-testid = 'host-mypage'
          >
            마이 페이지
          </a>
        </div>
      )}

      <div className={styles.LoginBox}>
        {user ? (
          <div className={styles.UserInfo}>
            <div className={styles.UserRoleContainer}>
              <span
                className={styles.UserRole}
                onClick={toggleModal}
                role="name"
              >
                {user.role === "host" ? (
                  <>
                    <span>{user.name}</span> 님
                  </>
                ) : (
                  <>
                    <span>응시자</span>님 환영합니다!
                  </>
                )}
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
            {user.role === "taker" ? (
              <CustomButton onClick={() => navigate("/taker")}>
                시험 입실하기
              </CustomButton>
            ) : user.role === "host" ? (
              <CustomButton onClick={() => navigate("/host/newTest/")}>
                시험 예약하기
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
