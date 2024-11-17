import styles from "@/styles/Mypage.module.css";
import { fonts } from "@/constants/fonts";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";

import HostModal from "@/components/HostModal";
import CustomButton from "@/components/CustomButton";
import Textfield from "@/components/Textfield";
import { CustomToast } from "@/components/CustomToast";

interface CoinHistoryItem {
  type: "charge" | "use" | "refund";
  amount: number;
  created_at: string;
}

const MyCoin = () => {
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("all");

  const [myCoin, setMyCoin] = useState(0);
  const fetchMyCoin = () => {
    axiosInstance
      .get("/coin/")
      .then((response) => {
        setMyCoin(response.data.coin);
      })
      .catch((error) => {
        console.log("코인 데이터 불러오기 실패: ", error);
      });
  };
  const [myCoinHistory, setMyCoinHistory] = useState<CoinHistoryItem[]>([]);
  const fetchMyCoinHistory = () => {
    axiosInstance
      .get("/coin/history/", {
        params: {
          type: category,
        },
      })
      .then((response) => {
        setMyCoinHistory(response.data.coinList || []);
      })
      .catch((error) => {
        console.log("코인 데이터 불러오기 실패: ", error);
      });
  };
  useEffect(() => {
    fetchMyCoin();
    fetchMyCoinHistory();
  }, [category]);

  // 모달
  const handleOpenInputModal = () => setIsInputModalOpen(true);
  const handleCloseInputModal = () => setIsInputModalOpen(false);
  const handleOpenConfirmModal = () => setIsConfirmModalOpen(true);
  const handleCloseConfirmModal = () => setIsConfirmModalOpen(false);

  const handleCodeCheck = () => {
    axiosInstance
      .post("/coin/", { code })
      .then(() => {
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
      <div className={styles.header} style={{ marginTop: "2rem" }}>
        <div>적립금 사용 내역</div>
        <select
          className={styles.coinSelect}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="all">전체</option>
          <option value="use">사용</option>
          <option value="charge">충전</option>
          <option value="refund">취소</option>
        </select>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.historyTable}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableCell}>구분</th>
              <th className={styles.tableCell}>상세 내역</th>
              <th className={styles.tableCell}>적립금</th>
            </tr>
          </thead>
          <tbody>
            {myCoinHistory.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className={styles.tableCell}
                  style={{ textAlign: "center" }}
                >
                  적립금 사용 내역이 없습니다
                </td>
              </tr>
            ) : (
              myCoinHistory.map((item, index) => (
                <tr key={index}>
                  <td className={styles.tableCell}>
                    {item.type === "charge"
                      ? "충전"
                      : item.type === "use"
                      ? "사용"
                      : "환불"}
                  </td>
                  <td
                    className={styles.tableCell}
                    style={{ textAlign: "left" }}
                  >
                    <div>
                      {item.type === "charge"
                        ? "적립금 충전"
                        : item.type === "use"
                        ? "적립금 결제"
                        : "적립금 환불"}
                    </div>
                    <div className={styles.subText}>
                      {new Date(item.created_at).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                  </td>
                  <td
                    className={`${styles.tableCell} ${
                      item.type === "charge" || item.type === "refund"
                        ? styles.textBlue
                        : styles.textRed
                    }`}
                  >
                    {item.type === "charge" || item.type === "refund"
                      ? `+${item.amount}C`
                      : `-${item.amount}C`}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isInputModalOpen && (
        <HostModal
          onClose={handleCloseInputModal}
          title="무료 적립금 적립하기"
          buttonLabel="등록하기"
          handleButton={handleCodeCheck}
        >
          <div className={styles.inputModalContainer}>
            <Textfield
              label="이벤트/쿠폰 포인트 코드"
              placeholder="코드 입력"
              trailingIcon="delete"
              value={code}
              onChange={setCode}
            />
            <div className={styles.modalInfo}>
              <div className={styles.modalInfoText} style={fonts.MD_REGULAR}>
                * 유효기간이 만료된 코드는 등록이 불가해요.
              </div>
              <div className={styles.modalInfoText} style={fonts.MD_REGULAR}>
                * 이벤트 또는 쿠폰에 따라 계정당 등록 여부와 횟수가 달라질 수
                있어요.
              </div>
            </div>
          </div>
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
    </>
  );
};

export default MyCoin;
