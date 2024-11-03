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
      <div className={styles.infoItem}>
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
      <div className={styles.infoItem}>
        <div className={styles.infoTitle} style={fonts.HEADING_SM_BOLD}>
          회원 탈퇴
        </div>
        <div className={styles.infoButton} style={{ textAlign: "end" }}>
          <IoIosArrowForward />
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
