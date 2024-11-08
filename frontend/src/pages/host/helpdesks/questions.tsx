import styles from "@/styles/Helpdesk.module.css";
import { fonts } from "@/constants";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import CustomButton from "@/components/CustomButton";
import Textfield from "@/components/Textfield";

interface Notification {
  id: number;
  title: string;
  category: "공지사항";
  created_at: string;
}

interface Question {
  id: number;
  category: string;
  title: string;
  created_at: string;
  organizer: string;
}

const Questions = () => {
  const categories = ["전체", "이용 방법", "적립금", "기타"];
  const [currentCategory, setCurrentCategory] = useState("전체");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchQuestions();
    fetchNotifications();
  }, [currentCategory]);

  const fetchQuestions = () => {
    axiosInstance
      .get("/helpdesk/question/", {
        params: {
          category:
            currentCategory === "전체"
              ? "all"
              : getCategoryCode(currentCategory),
        },
      })
      .then((response) => {
        setQuestions(response.data.questionList);
      })
      .catch((error) => {
        console.error("질문 조회 실패:", error);
      });
  };

  const fetchNotifications = () => {
    axiosInstance
      .get("/helpdesk/notification/")
      .then((response) => {
        setNotifications(response.data.notificationList);
      })
      .catch((error) => {
        console.error("공지 조회 실패:", error);
      });
  };

  const getCategoryCode = (category: string) => {
    switch (category) {
      case "이용 방법":
        return "usage";
      case "적립금":
        return "coin";
      case "기타":
        return "etc";
      default:
        return "all";
    }
  };

  const handleCategoryClick = (category: string) => {
    setCurrentCategory(category);
  };

  return (
    <div className={styles.questionContainer}>
      <div className={styles.questionWrap}>
        <div className={styles.questionTitle}>
          <span style={fonts.HEADING_MD_BOLD}>공지사항 & 질문</span>
        </div>

        <div className={styles.questionContent}>
          <div className={styles.questionHeader}>
            <div className={styles.category}>
              {categories.map((category, index) => (
                <span key={category} className={styles.categoryItemWrapper}>
                  <span
                    className={styles.categoryItem}
                    style={{
                      fontWeight:
                        currentCategory === category ? "bold" : "normal",
                    }}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </span>
                  {index < categories.length - 1 && <span> / </span>}
                </span>
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
              <CustomButton
                style="primary_fill"
                type="rectangular"
                onClick={() => console.log("글 작성 클릭")}
              >
                글 작성하기
              </CustomButton>
            </div>
          </div>

          {/* Questions & Notifications Table */}
          <div className={styles.questionTable}>
            <table className={styles.table}>
              <thead className={styles.tableTitle}>
                <tr>
                  <th style={{ width: "20%" }}>구분</th>
                  <th style={{ width: "60%" }}>제목</th>
                  <th style={{ width: "20%" }}>작성자</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {notifications.map((item, index) => (
                  <tr
                    key={index}
                    style={{ backgroundColor: "rgba(200, 59, 56, 0.1)" }}
                    onClick={() => console.log(`공지 ${item.id} 클릭`)}
                  >
                    <td>공지</td>
                    <td style={{ textAlign: "start" }}>
                      <div
                        style={{ fontWeight: "bold", color: "var(--BLACK)" }}
                      >
                        {item.title}
                      </div>
                    </td>
                    <td />
                  </tr>
                ))}
                {questions.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => console.log(`질문 ${item.id} 클릭`)}
                  >
                    <td>{item.category}</td>
                    <td style={{ textAlign: "start" }}>
                      <div
                        style={{ fontWeight: "bold", color: "var(--BLACK)" }}
                      >
                        {item.title}
                      </div>
                    </td>
                    <td>
                      <div>{item.organizer}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questions;
