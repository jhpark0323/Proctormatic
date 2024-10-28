import CustomButton from "@/components/CustomButton";
import styles from "@/styles/Mypage.module.css";
import { fonts } from "@/constants/fonts";
import ToggleSwitch from "@/components/ToggleSwitch";
import { IoIosArrowForward } from "react-icons/io";

interface AccountInfoProps {}

const AccountInfo = ({}: AccountInfoProps) => {
  return (
    <div className={styles.infoContainer}>
      <div className={styles.infoItem}>
        <div className={styles.infoTitle} style={fonts.HEADING_SM_BOLD}>
          로그인 ID
        </div>
        <div className={styles.infoContent}>
          <div>honggildong@gmail.com</div>
          <CustomButton style="primary_outline" type="rectangular">
            로그아웃
          </CustomButton>
        </div>
      </div>
      <div className={styles.infoItem}>
        <div className={styles.infoTitle} style={fonts.HEADING_SM_BOLD}>
          주최자 이름
        </div>
        <div className={styles.infoContent}>홍길동</div>
      </div>
      <div className={styles.infoItem}>
        <div className={styles.infoTitle} style={fonts.HEADING_SM_BOLD}>
          생년 월일
        </div>
        <div className={styles.infoContent}>2000년 1월 1일</div>
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
          <ToggleSwitch />
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
