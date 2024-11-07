import CustomButton from "@/components/CustomButton";
import styles from "@/styles/Helpdesk.module.css";
import { fonts } from "@/constants";
import Textfield from "@/components/Textfield";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import HostModal from "@/components/HostModal";
import { CustomToast } from "@/components/CustomToast";
import HeaderWhite from "@/components/HeaderWhite";
import { formatDateAndTime } from "@/utils/handleDateTimeChange";
import { FaRegTrashAlt } from "react-icons/fa";
import { GoPencil } from "react-icons/go";

interface FAQ {
  id: number;
  title: string;
}

interface Notification {
  id: number;
  title: string;
  category: "공지사항";
  created_at: string;
}

interface Answer {
  id: number;
  author: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Question {
  content: any;
  id: number;
  organizer: string;
  category: string;
  title: string;
  created_at: string;
  updated_at: string;
  answerList: Answer[];
}

const Helpdesk = () => {
  const categories = ["전체", "이용 방법", "적립금", "기타"];
  const [currentCategory, setCurrentCategory] = useState("전체");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );

  useEffect(() => {
    fetchFAQ();
    fetchQuestions();
    fetchNotifications();
  }, [currentCategory]);

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
        category: getCategoryCode(postCategory),
        title: postTitle,
        content: postContent,
      })
      .then(() => {
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

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const handleDetailModalOpen = () => setIsDetailModalOpen(true);
  const handleDetailModalClose = () => setIsDetailModalOpen(false);
  const [detailModalTitle, setDetailModalTitle] = useState("");
  const [detailModalContext, setDetailModalContext] = useState("");
  const [detailModalCreatedAt, setDetailModalCreatedAt] = useState("");
  const [detailID, setDetailID] = useState(0);

  const getDetailModalContent = (
    type: "faq" | "notification" | "question",
    id: number
  ) => {
    setDetailID(id);
    let endpoint = "";

    if (type === "faq") {
      endpoint = `/helpdesk/faq/${id}/`;
    } else if (type === "notification") {
      endpoint = `/helpdesk/notification/${id}/`;
    } else if (type === "question") {
      endpoint = `/helpdesk/question/${id}/`;
    }

    axiosInstance
      .get(endpoint)
      .then((response) => {
        const data = response.data;

        if (type === "question") {
          setSelectedQuestion(data); // 선택된 질문의 전체 데이터를 저장
        }

        setDetailModalTitle(data.title);
        setDetailModalContext(data.content);
        setDetailModalCreatedAt(data.created_at);
        handleDetailModalOpen();
      })
      .catch((error) => {
        console.log("조회 실패: ", error);
      });
  };

  const deleteQuestion = () => {
    axiosInstance
      .delete(`/helpdesk/question/${detailID}/`)
      .then(() => {
        CustomToast("질문이 삭제되었습니다.");
        handleDetailModalClose();
        fetchQuestions();
        fetchNotifications();
      })
      .catch((error) => {
        console.error("질문 삭제 실패: ", error);
        CustomToast("다시 시도해 주세요.");
      });
  };

  const updateQuestion = () => {
    if (!selectedQuestion) return;

    axiosInstance
      .put(`/helpdesk/question/${detailID}/`, {
        category: selectedQuestion.category,
        title: selectedQuestion.title,
        content: selectedQuestion.content,
      })
      .then(() => {
        CustomToast("질문이 수정되었습니다.");
        fetchQuestions();
        fetchNotifications();
        handleDetailModalClose();
      })
      .catch((error) => {
        console.error("질문 수정 실패: ", error);
        CustomToast("다시 시도해 주세요.");
      });
  };

  return (
    <>
      <HeaderWhite />
      <div className={styles.faqContainer}>
        <div className={styles.title}>
          <span style={fonts.HEADING_LG_BOLD}>자주 묻는 질문(FAQ)</span>
        </div>
        <div className={styles.faqContent}>
          <div className={styles.faqWrap}>
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={styles.faqItem}
                onClick={() => getDetailModalContent("faq", faq.id)}
              >
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
          <div className={styles.manualItem} style={{ height: "8vh" }}>
            시험 시작하기
          </div>
          <div className={styles.manualItem} style={{ height: "8vh" }}>
            시험 예약하기
          </div>
          <div className={styles.manualItem} style={{ height: "8vh" }}>
            응시자 영상 다시보기
          </div>
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
                    <th style={{ width: "20%" }}>구분</th>
                    <th style={{ width: "60%" }}>제목</th>
                    <th style={{ width: "20%" }}>작성자</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {notifications.map((item, index) => {
                    const { date, time } = formatDateAndTime(
                      new Date(item.created_at)
                    );
                    return (
                      <tr
                        key={index}
                        style={{ backgroundColor: "rgba(200, 59, 56, 0.1)" }}
                        onClick={() =>
                          getDetailModalContent("notification", item.id)
                        }
                      >
                        <td>공지</td>
                        <td style={{ textAlign: "start" }}>
                          <div
                            style={{
                              fontWeight: "bold",
                              color: "var(--BLACK)",
                            }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              color: "var(--GRAY_500)",
                              ...fonts.MD_REGULAR,
                            }}
                          >
                            {date} {time}
                          </div>
                        </td>
                        <td />
                      </tr>
                    );
                  })}
                  {questions.map((item, index) => {
                    const { date, time } = formatDateAndTime(
                      new Date(item.created_at)
                    );
                    return (
                      <tr
                        key={index}
                        onClick={() =>
                          getDetailModalContent("question", item.id)
                        }
                      >
                        <td>
                          {item.category === "usage"
                            ? "이용 방법"
                            : item.category === "coin"
                            ? "적립금"
                            : item.category === "etc"
                            ? "기타"
                            : item.category}
                        </td>
                        <td style={{ textAlign: "start" }}>
                          <div
                            style={{
                              fontWeight: "bold",
                              color: "var(--BLACK)",
                            }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              color: "var(--GRAY_500)",
                              ...fonts.MD_REGULAR,
                            }}
                          >
                            {date} {time}
                          </div>
                        </td>
                        <td>
                          <div>
                            <div>{item.organizer}</div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
            <div className={styles.postTitle}>
              <div className={styles.dropdown}>
                <div
                  className={styles.dropdownLabel}
                  onClick={handleDropdownToggle}
                >
                  &nbsp;&nbsp;{postCategory}
                </div>
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
            <div style={{ height: "50%" }}>
              <Textfield
                label="질문 내용"
                value={postContent}
                inputType="textarea"
                onChange={(value) => setPostContent(value)}
              />
            </div>
          </div>
        </HostModal>
      )}

      {isDetailModalOpen && selectedQuestion && (
        <HostModal onClose={handleDetailModalClose} title={detailModalTitle}>
          <div className={styles.postModal}>
            <div className={styles.questionAnswerBody}>
              {detailModalContext}
              <div className={styles.iconWrapper}>
                <FaRegTrashAlt
                  onClick={() => deleteQuestion(selectedQuestion.id)}
                />
                <GoPencil onClick={() => updateQuestion(selectedQuestion.id)} />
              </div>
            </div>
            <div className={styles.questionAnswerContainer}>
              {selectedQuestion.answerList.length > 0 &&
                selectedQuestion.answerList.map((item, index) => {
                  const { date, time } = formatDateAndTime(
                    new Date(item.updated_at)
                  );
                  return (
                    <div key={index}>
                      <div className={styles.detailCommentAuthor}>
                        {item.author}
                      </div>
                      <div className={styles.detailCommentContent}>
                        {item.content}
                        <div
                          style={{
                            color: "var(--GRAY_500)",
                            ...fonts.MD_REGULAR,
                          }}
                        >
                          {date} {time}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </HostModal>
      )}
    </>
  );
};

export default Helpdesk;
