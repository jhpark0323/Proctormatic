import CustomButton from "@/components/CustomButton";
import styles from "@/styles/Mypage.module.css";
import { fonts } from "@/constants/fonts";
import ToggleSwitch from "@/components/ToggleSwitch";
import { IoIosArrowForward } from "react-icons/io";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { CustomToast } from "@/components/CustomToast";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import HostModal from "@/components/HostModal";
import Textfield from "@/components/Textfield";
import { checkPassword } from "@/utils/checkPassword";

interface UserProfile {
  name: string;
  email: string;
  birth: string;
  coin: number;
  created_at: string;
  marketing: boolean;
}

const AccountInfo = () => {
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChangePWModalOpen, setIsChangePWModalOpen] = useState(false);
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/users/")
      .then((response) => {
        setUserInfo(response.data);
      })
      .catch((error) => {
        console.error("사용자 정보 불러오기 실패:", error);
      });
  }, []);

  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleMarketingToggle = () => {
    if (userInfo) {
      const updatedMarketingStatus = !userInfo.marketing;
      setUserInfo({ ...userInfo, marketing: updatedMarketingStatus });

      axiosInstance
        .put("/users/", { marketing: updatedMarketingStatus })
        .then(() => {
          CustomToast("마케팅 이용 동의 여부가 변경되었습니다.");
        })
        .catch((error) => {
          console.error("마케팅 상태 업데이트 실패:", error);
        });
    }
  };

  // 회원 탈퇴 모달 관련 핸들러
  const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  const handleDeleteConfirmed = () => {
    axiosInstance
      .patch("/users/")
      .then(() => {
        handleCloseDeleteModal();
        logout();
        navigate("/");
        CustomToast("회원탈퇴가 완료되었습니다.");
      })
      .catch((error) => {
        console.log("회원 탈퇴 실패: ", error);
        CustomToast("다시 시도해주세요.");
      });
  };

  // 비밀번호 변경 모달
  const handleOpenChangePWModal = () => setIsChangePWModalOpen(true);
  const handleCloseChangePWModal = () => setIsChangePWModalOpen(false);

  const handleChangePWConfirmed = () => {
    axiosInstance
      .put("/users/password/", { password1, password2 })
      .then(() => {
        handleCloseChangePWModal();
        CustomToast("비밀번호가 변경되었습니다.");
      })
      .catch((error) => {
        CustomToast(error.response.data.message);
      });
  };

  const [passwordError, setPasswordError] = useState<boolean>(false);
  const handlePasswordChange = (value: string) => {
    setPassword1(value);
    setPasswordError(!checkPassword(value));
  };
  const [isPassword2Focused, setIsPassword2Focused] = useState<boolean>(false);

  return (
    <div className={styles.infoContainer}>
      <div className={styles.infoItem}>
        <div className={styles.infoTitle} style={fonts.HEADING_SM_BOLD}>
          로그인 ID
        </div>
        <div className={styles.infoContent}>
          <div>{userInfo?.email}</div>
          <CustomButton
            style="primary_outline"
            type="rectangular"
            onClick={handleLogout}
          >
            로그아웃
          </CustomButton>
        </div>
      </div>
      <div className={styles.infoItem}>
        <div className={styles.infoTitle} style={fonts.HEADING_SM_BOLD}>
          주최자 이름
        </div>
        <div className={styles.infoContent}>{userInfo?.name}</div>
      </div>
      <div className={styles.infoItem}>
        <div className={styles.infoTitle} style={fonts.HEADING_SM_BOLD}>
          생년 월일
        </div>
        <div className={styles.infoContent}>
          {userInfo?.birth
            ? new Date(userInfo.birth).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
        </div>
      </div>
      <div className={styles.infoItem} onClick={handleOpenChangePWModal}>
        {/* 비밀번호 재설정 클릭 시 모달 열기 */}
        <div className={styles.infoTitle} style={fonts.HEADING_SM_BOLD}>
          비밀번호 재설정
        </div>
        <div className={styles.infoButton}>
          <IoIosArrowForward />
        </div>
      </div>
      <div className={styles.infoItem}>
        <div className={styles.infoTitle} style={fonts.HEADING_SM_BOLD}>
          마케팅 이용 동의
        </div>
        <div className={styles.infoButton}>
          <ToggleSwitch
            isOn={userInfo?.marketing || false}
            toggleHandler={handleMarketingToggle}
          />
        </div>
      </div>
      <div className={styles.infoItem} onClick={handleOpenDeleteModal}>
        <div className={styles.infoTitle} style={fonts.HEADING_SM_BOLD}>
          회원 탈퇴
        </div>
        <div className={styles.infoButton} style={{ textAlign: "end" }}>
          <IoIosArrowForward />
        </div>
      </div>
      {/* 회원 탈퇴 모달 */}
      {isDeleteModalOpen && (
        <HostModal
          title="회원 탈퇴"
          buttonLabel="탈퇴하기"
          handleButton={handleDeleteConfirmed}
          onClose={handleCloseDeleteModal}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: "1rem" }}>정말 탈퇴하시겠습니까?</div>
            <div style={{ color: "var(--GRAY_500)", ...fonts.MD_REGULAR }}>
              * 탈퇴 시 데이터는 복구가 불가합니다.
            </div>
          </div>
        </HostModal>
      )}
      {/* 비밀번호 변경 모달 */}
      {isChangePWModalOpen && (
        <HostModal
          title="비밀번호 변경"
          buttonLabel="변경하기"
          handleButton={handleChangePWConfirmed}
          onClose={handleCloseChangePWModal}
        >
          <div className={styles.changePWcontent}>
            <Textfield
              label="비밀번호 재설정"
              trailingIcon="delete"
              inputType="password"
              value={password1}
              onChange={handlePasswordChange} // 비밀번호 입력값 변경 시 검증 수행
              helpMessage={
                passwordError ? "올바르지 않은 비밀번호 형식이에요." : ""
              }
            />
            <Textfield
              label="비밀번호 확인"
              trailingIcon="delete"
              inputType="password"
              value={password2}
              onChange={(value) => {
                setPassword2(value);
                setIsPassword2Focused(true);
              }}
              helpMessage={
                isPassword2Focused && password1 !== password2
                  ? "비밀번호가 일치하지 않아요."
                  : ""
              }
            />
          </div>
        </HostModal>
      )}
    </div>
  );
};

export default AccountInfo;
