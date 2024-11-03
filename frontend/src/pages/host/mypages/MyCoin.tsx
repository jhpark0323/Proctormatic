import styles from "@/styles/Mypage.module.css";
import { fonts } from "@/constants/fonts";
import CustomButton from "@/components/CustomButton";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import HostModal from "@/components/HostModal";

const MyCoin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myCoin, setMyCoin] = useState(0);
  useEffect(() => {
    axiosInstance
      .get("/coin/")
      .then((response) => {
        console.log(response.data);
        setMyCoin(response.data.coin);
      })
      .catch((error) => {
        console.log("코인 데이터 불러오기 실패: ", error);
      });
  }, [myCoin]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

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
        <CustomButton onClick={handleOpenModal}>적립금 충전하기</CustomButton>
      </div>
      <div className={styles.header}>
        <div>적립금 사용 내역</div>
        <div>전체</div>

        {isModalOpen && (
          <HostModal onClose={handleCloseModal} title="적립금 환불 받기">
            <div>모달 내용입니다</div>
          </HostModal>
        )}
      </div>
    </>
  );
};

export default MyCoin;
