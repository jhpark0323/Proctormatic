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
  const [isEmailFound, setIsEmailFound] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [emailFindTitle, setEmailFindTitle] = useState("아이디 찾기");
  const [emailFindSubtitle, setEmailFindSubtitle] = useState([
    "로그인 ID가 기억나지 않으신가요?",
    "검색을 통해 쉽게 찾을 수 있어요!",
  ]);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openRegisterModal = () => {
    closeLoginModal();
    setIsRegisterModalOpen(true);
  };

  const openEmailFindModal = () => {
    closeLoginModal();
    resetEmailFindModal(); // 초기 상태로 설정 후 모달 열기
    setIsEmailFindModalOpen(true);
  };

  const closeRegisterModal = () => setIsRegisterModalOpen(false);
  const closeEmailFindModal = () => setIsEmailFindModalOpen(false);

  const resetEmailFindModal = () => {
    setEmailFindTitle("아이디 찾기");
    setEmailFindSubtitle([
      "로그인 ID가 기억나지 않으신가요?",
      "검색을 통해 쉽게 찾을 수 있어요!",
    ]);
  };

  const handleEmailFindSubmit = (isFound: boolean, count: number) => {
    setIsEmailFound(isFound);
    setFoundCount(count);
    setEmailFindTitle("아이디 검색 결과");
    setEmailFindSubtitle(
      isFound ? [`아래와 같이 ${count}개의 아이디를 찾았어요!`] : ["아이디를 찾지 못했어요 :("]
    );
  };

  const handleLoginRedirect = () => {
    closeEmailFindModal();
    openLoginModal();
  };

  const handleRetrySearch = () => {
    closeEmailFindModal(); // 모달을 닫고
    setTimeout(() => {
      openEmailFindModal(); // 초기화한 상태로 모달을 다시 엽니다.
    }, 0); // 딜레이를 줘서 닫힌 후에 다시 열리도록 합니다.
  };

  return (
    <>
      <HeaderWhite onLoginClick={openLoginModal} />

      <div className={styles.Content} data-testid="SwiperComponent">
        <SwiperComponent />
      </div>

      {isEmailFindModalOpen && (
        <EmailFindModal
          onClose={closeEmailFindModal}
          title={emailFindTitle}
          subtitle={emailFindSubtitle}
          onSubmit={handleEmailFindSubmit}
          onLoginRedirect={handleLoginRedirect}
          onRetrySearch={handleRetrySearch} // "검색 다시하기" 기능 추가
        />
      )}

      {isLoginModalOpen && (
        <LoginModal
          onClose={closeLoginModal}
          onRegisterClick={openRegisterModal}
          onEmailFindClick={openEmailFindModal}
          title="AI 온라인 시험 자동 관리감독 서비스"
          subtitle={[
            "어렵고 피곤한 시험 감시와 검증은 그만!",
            "이젠 프록토매틱에게 맡기세요.",
          ]}
          data-testid="login-modal"
        />
      )}
      
      {isRegisterModalOpen && (
        <RegisterModal
          onClose={closeRegisterModal}
          title="AI 온라인 시험 자동 관리감독 서비스"
          subtitle={["어렵고 피곤한 시험 감시와 검증은 그만!"]}
        />
      )}

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
