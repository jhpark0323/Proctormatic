import { useState } from "react";
import HeaderWhite from "@/components/HeaderWhite";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
import EmailFindModal from "@/components/EmailFindModal";
import styles from "@/styles/Home.module.css";
import SwiperComponent from "@/components/Swiper";

const Home = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEmailFindModalOpen, setIsEmailFindModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openRegisterModal = () => {
    closeLoginModal(); // LoginModal 닫기
    setIsRegisterModalOpen(true); // RegisterModal 열기
  };

  const openEmailFindModal = () => {
    closeLoginModal(); // LoginModal 닫기
    setIsEmailFindModalOpen(true); // EmailFindModal 열기
  }
  
  const closeRegisterModal = () => setIsRegisterModalOpen(false);
  const closeEmailFindModal = () => setIsEmailFindModalOpen(false);

  return (
    <>
      <HeaderWhite onLoginClick={openLoginModal} />

      <div className={styles.Content} data-testid="SwiperComponent">
        <SwiperComponent />
      </div>

      {/* email find Modal */}
      {isEmailFindModalOpen && (
        <EmailFindModal
          onClose={closeEmailFindModal}
          title="아이디 찾기"
          subtitle={[
            "로그인 ID가 기억나지 않으신가요?",
            "검색을 통해 쉽게 찾을 수 있어요!",
          ]}
        />
      )

      }

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={closeLoginModal}
          onRegisterClick={openRegisterModal}  // 회원가입 클릭 이벤트 전달
          onEmailFindClick={openEmailFindModal} // 이메일 찾기 클릭 이벤트 전달
          title="AI 온라인 시험 자동 관리감독 서비스"
          subtitle={[
            "어렵고 피곤한 시험 감시와 검증은 그만!",
            "이젠 프록토매틱에게 맡기세요.",
          ]}
          data-testid="login-modal"
        />
      )}
      
      {/* Register Modal */}
      {isRegisterModalOpen && (
        <RegisterModal
          onClose={closeRegisterModal}
          title="AI 온라인 시험 자동 관리감독 서비스"
          subtitle= {[
            "어렵고 피곤한 시험 감시와 검증은 그만!"
          ]}
        />
      )}

      {/* 배경 클릭 시 모달 닫기 */}
      {(isLoginModalOpen || isRegisterModalOpen) && (
        <div
          className={styles.backdrop}
          data-testid="backdrop"
          onClick={() => {
            if (isLoginModalOpen) closeLoginModal();
            if (isRegisterModalOpen) closeRegisterModal();
          }}
        ></div>
      )}
    </>
  );
};

export default Home;
