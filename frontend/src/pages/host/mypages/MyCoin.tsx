import styles from "@/styles/Mypage.module.css";
import { fonts } from "@/constants/fonts";
import CustomButton from "@/components/CustomButton";

interface MyCoinProps {}

const MyCoin = ({}: MyCoinProps) => {
  const myCoin = 540;

  return (
    <>
      <div className={styles.header}>
        <div>
          <div className={styles.coinWrap}>
            <div>사용 가능 적립금</div>
            <div className={styles.coinText} style={fonts.HEADING_MD_BOLD}>
              {myCoin}
            </div>
            <div style={{ color: "var(--PRIMARY)" }}>C</div>
          </div>
        </div>
        <CustomButton>적립금 충전하기</CustomButton>
      </div>
      <div className={styles.header}>
        <div>적립금 사용 내역</div>
        <div>전체</div>
      </div>
    </>
  );
};

export default MyCoin;
