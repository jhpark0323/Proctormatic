import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import HeaderWhite from "../components/HeaderWhite";
import Modal from "../components/Modal";
import styles from "../styles/Home.module.css";
import Checkbox from "../components/Checkbox";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, login, logout } = useAuthStore();

  const handleLogin = (role: string) => {
    login(role);
    if (role === "taker") {
      navigate("/taker");
    } else if (role === "host") {
      navigate("/host");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [service, setService] = React.useState(true);
  return (
    <>
      <Checkbox checked={service} onChange={setService} disabled={true}>
        (필수) 서비스 이용약관
      </Checkbox>
      <HeaderWhite
        onLoginClick={openModal}
        userRole={user?.role}
        onLogoutClick={handleLogout}
      />
      {isModalOpen && (
        <Modal
          onClose={closeModal}
          title="AI 온라인 시험 자동 관리감독 서비스"
          subtitle={[
            "어렵고 피곤한 시험 감시와 검증은 그만!",
            "이젠 프록토매틱에게 맡기세요.",
          ]}
          onLogin={handleLogin}
        />
      )}
      {isModalOpen && (
        <div
          className={styles.backdrop}
          data-testid="backdrop"
          onClick={closeModal}
        ></div>
      )}
    </>
  );
};

export default Home;
