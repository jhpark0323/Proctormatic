import CustomButton from "@/components/CustomButton";
import styles from "@/styles/Helpdesk.module.css";
import { fonts } from "@/constants";
import Textfield from "@/components/Textfield";
import { useEffect, useState } from "react";
import HostHeader from "@/components/HostHeader";
import axiosInstance from "@/utils/axios";
import HostModal from "@/components/HostModal";
import { CustomToast } from "@/components/CustomToast";

interface FAQ {
  id: number;
  title: string;
}

interface notification {
  id: number;
  title: string;
  category: "공지사항";
  created_at: string;
}

interface question {
  Id: number;
  organizer: string;
  category: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const Helpdesk = () => {
  const categories = ["전체", "이용 방법", "적립금", "기타"];
  const [currentCategory, setCurrentCategory] = useState("전체");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [notifications, setNotifications] = useState<notification[]>([]);
  const [questions, setQuestions] = useState<question[]>([]);

  const fetchFAQ = () => {
    axiosInstance
      .get("/helpdesk/faq/")
      .then((response) => {
        setFaqs(response.data.faqList);
      })
      .catch((error) => {
        console.error("FAQ 조회 실패:", error);
      });
  };

  const fetchQuestions = () => {
    axiosInstance
      .get("/helpdesk/question/")
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

  useEffect(() => {
    fetchFAQ();
    fetchQuestions();
    fetchNotifications();
  }, []);

  const handleCategoryClick = (category: string) => {
    setCurrentCategory(category);
    axiosInstance
      .get("/helpdesk/question?category={category}")
      .then((response) => {
        setQuestions(response.data.questionList);
      })
      .catch((error) => {
        console.log("카테고리 검색 실패: ", error);
      });
  };

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const handlePostModalOpen = () => setIsPostModalOpen(true);
  const handlePostModalClose = () => setIsPostModalOpen(false);

  const [postCategory, setPostCategory] = useState("카테고리 선택");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const options = ["이용 방법", "적립금", "기타"];
  const handleDropdownToggle = () => setIsDropdownOpen((prev) => !prev);

  const handleOptionClick = (option: string) => {
    setPostCategory(option);
    setIsDropdownOpen(false);
  };

  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

  const handlePostQuestion = () => {
    axiosInstance
      .post("/helpdesk/question/", {
        category: postCategory,
        title: postTitle,
        content: postContent,
      })
      .then((response) => {
        CustomToast("질문이 등록되었습니다.");
        fetchQuestions();
        fetchNotifications();
        handlePostModalClose();
      })
      .catch((error) => {
        console.error("질문 등록 실패: ", error);
        if (error.response && error.response.status === 400) {
          CustomToast(error.message);
        } else {
          CustomToast("다시 시도해 주세요.");
        }
      });
  };

  return (
    <>
      <HostHeader />
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
            <div className={styles.questionHeader}>
              <div className={styles.category}>
                {categories.map((category) => (
                  <span
                    key={category}
                    className={styles.categoryItem}
                    style={{
                      fontWeight:
                        currentCategory === category ? "bold" : "normal",
                    }}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <span> </span>
                    {category}
                    <span> /</span>
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
                  onClick={handlePostModalOpen}
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
                    <th>구분</th>
                    <th>제목</th>
                    <th>작성자</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {notifications.map((item, index) => (
                    <tr
                      key={index}
                      style={{ backgroundColor: "rgba(200, 59, 56, 0.1)" }}
                    >
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "var(--GRAY_600)",
                        }}
                      >
                        공지
                      </td>
                      <td>
                        <div style={{ fontWeight: "bold" }}>{item.title}</div>
                        <div
                          style={{
                            color: "var(--GRAY_500)",
                            ...fonts.MD_REGULAR,
                          }}
                        >
                          {item.created_at}
                        </div>
                      </td>
                      <td />
                    </tr>
                  ))}
                  {questions.map((item, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "var(--GRAY_600)",
                        }}
                      >
                        {item.category}
                      </td>
                      <td>
                        <div style={{ fontWeight: "bold" }}>{item.title}</div>
                        <div
                          style={{
                            color: "var(--GRAY_500)",
                            ...fonts.MD_REGULAR,
                          }}
                        >
                          {item.created_at}
                        </div>
                      </td>
                      <td>
                        <div style={{ textAlign: "center" }}>
                          {item.organizer}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isPostModalOpen && (
        <HostModal
          onClose={handlePostModalClose}
          buttonLabel="질문 게시하기"
          handleButton={handlePostQuestion}
        >
          <div className={styles.postModal}>
            <div>
              <div className={styles.dropdown} onClick={handleDropdownToggle}>
                <div className={styles.dropdownLabel}>{postCategory}</div>
                {isDropdownOpen && (
                  <div className={styles.dropdownContent}>
                    {options.map((option, index) => (
                      <div
                        key={index}
                        className={styles.dropdownItem}
                        onClick={() => handleOptionClick(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Textfield
                label="제목"
                maxLength={100}
                value={postTitle}
                onChange={(value) => setPostTitle(value)}
              />
            </div>
            <Textfield
              label="질문 내용"
              value={postContent}
              onChange={(value) => setPostContent(value)}
            />
          </div>
        </HostModal>
      )}
    </>
  );
};

export default Helpdesk;
