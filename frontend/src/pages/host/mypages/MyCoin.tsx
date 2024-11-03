import styles from "@/styles/Mypage.module.css";
import { fonts } from "@/constants/fonts";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";

import HostModal from "@/components/HostModal";
import CustomButton from "@/components/CustomButton";
import Textfield from "@/components/Textfield";
import { CustomToast } from "@/components/CustomToast";

const MyCoin = () => {
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [code, setCode] = useState("");

  const [myCoin, setMyCoin] = useState(0);
  const fetchMyCoin = () => {
    axiosInstance
      .get("/coin/")
      .then((response) => {
        console.log(response.data);
        setMyCoin(response.data.coin);
      })
      .catch((error) => {
        console.log("코인 데이터 불러오기 실패: ", error);
      });
  };
  useEffect(() => {
    fetchMyCoin();
  }, [myCoin]);

  const handleOpenInputModal = () => setIsInputModalOpen(true);
  const handleCloseInputModal = () => setIsInputModalOpen(false);
  const handleOpenConfirmModal = () => setIsConfirmModalOpen(true);
  const handleCloseConfirmModal = () => setIsConfirmModalOpen(false);

  const handleCodeCheck = () => {
    axiosInstance
      .post("/coin/", { code })
      .then((response) => {
        console.log("코드 등록 성공: ", response.data);
        handleCloseInputModal();
        handleOpenConfirmModal();
        fetchMyCoin();
      })
      .catch((error) => {
        console.log("코드 등록 실패:", error);
        CustomToast("코드를 다시 확인해주세요!");
      });
  };

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
        <CustomButton onClick={handleOpenInputModal}>
          적립금 충전하기
        </CustomButton>
      </div>
      <div className={styles.header}>
        <div>적립금 사용 내역</div>
        <div>전체</div>

        {isInputModalOpen && (
          <HostModal
            onClose={handleCloseInputModal}
            title="무료 적립금 적립하기"
            buttonLabel="등록하기"
            handleButton={handleCodeCheck}
          >
            <Textfield
              label="이벤트/쿠폰 포인트 코드"
              placeholder="코드 입력"
              trailingIcon="delete"
              onChange={setCode}
            />
          </HostModal>
        )}
        {isConfirmModalOpen && (
          <HostModal
            onClose={handleCloseConfirmModal}
            title="무료 적립금 적립하기"
          >
            <div>충전이 완료되었습니다.</div>
          </HostModal>
        )}
      </div>
    </>
  );
};

export default MyCoin;
