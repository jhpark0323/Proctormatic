import CustomButton from "@/components/CustomButton";
import styles from "@/styles/Helpdesk.module.css";
import { fonts } from "@/constants";
import Textfield from "@/components/Textfield";
import { useState } from "react";
const Helpdesk = () => {
  // 목업 데이터
  const faqs = [
    { id: 1, title: "faq 1" },
    { id: 2, title: "faq 2" },
    { id: 3, title: "faq 3" },
    { id: 4, title: "faq 4" },
    { id: 5, title: "faq 5" },
  ];

  const categories = ["전체", "공지사항", "이용 방법", "적립금", "기타"];
  const [currentCategory, setCurrentCategory] = useState("전체");

  // 목업 데이터
  const tableData = [
    {
      Id: 1,
      category: "이용 방법",
      title: "적립금 결제",
      created_at: "2024-10-16 14:38:56",
      organizer: "허유정",
    },
    {
      Id: 2,
      category: "이용 방법",
      title: "적립금 결제",
      created_at: "2024-10-17 14:38:40",
      organizer: "허유정",
    },
  ];

  const handleCategoryClick = (category: string) => {
    setCurrentCategory(category);
  };

  return (
    <>
      {/* faq */}
      <div className={styles.faqContainer}>
        <div className={styles.title}>
          <span style={fonts.HEADING_LG_BOLD}>자주 묻는 질문(FAQ)</span>
        </div>
        <div className={styles.faqContent}>
          <div className={styles.faqWrap}>
            {faqs.map((faq) => (
              <div key={faq.id} className={styles.faqItem}>
                <span>{faq.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.separator}></div>

      {/* manual */}
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

      <div className={styles.questionContainer}>
        <div className={styles.questionWrap}>
          <div className={styles.questionTitle}>
            <span style={fonts.HEADING_MD_BOLD}>공지사항 & 질문</span>
          </div>
          <div className={styles.questionContent}>
            {/* 헤더 */}
            <div className={styles.questionHeader}>
              <div className={styles.category}>
                {categories.map((category) => (
                  <>
                    <span
                      key={category}
                      className={styles.categoryItem}
                      style={{
                        fontWeight:
                          currentCategory === category ? "bold" : "normal",
                      }}
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category}
                    </span>
                    <span style={{ cursor: "default" }}> / </span>
                  </>
                ))}
              </div>
              <div
                style={{ display: "flex", flexDirection: "row", gap: "2.2rem" }}
              >
                <div className={styles.searchBox}>
                  <Textfield
                    placeholder="검색"
                    type="underline"
                    trailingIcon="search"
                  />
                </div>
                <CustomButton style="primary_fill" type="rectangular">
                  글 작성하기
                </CustomButton>
              </div>
            </div>
            {/* 표 */}
            <div className={styles.questionTable}>
              <div>
                <div className={styles.tableSeparator}></div>

                <table className={styles.table}>
                  <thead className={styles.tableTitle}>
                    <tr>
                      <th>구분</th>
                      <th>제목</th>
                      <th>작성자</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {tableData.map((row, index) => (
                      <tr key={index}>
                        <td
                          style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            color: "var(--GRAY_600)",
                          }}
                        >
                          {row.category}
                        </td>
                        <td>
                          <div style={{ fontWeight: "bold" }}>{row.title}</div>
                          <div style={{ color: "var(--GRAY_500)" }}>
                            {row.created_at}
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>{row.organizer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Helpdesk;
