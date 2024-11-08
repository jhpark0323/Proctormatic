import styles from "@/styles/Helpdesk.module.css";
import { fonts } from "@/constants";

const Manuals = () => {
  return (
    <div className={styles.manualContainer}>
      <div className={styles.title}>
        <span style={fonts.HEADING_LG_BOLD}>프록토매틱 매뉴얼</span>
      </div>
      <div className={styles.manualWrap}>
        <div className={styles.manualItem}>시험 시작하기</div>
        <div className={styles.manualItem}>시험 예약하기</div>
        <div className={styles.manualItem}>응시자 영상 다시보기</div>
      </div>
    </div>
  );
};

export default Manuals;
