import styles from "@/styles/Helpdesk.module.css";
import { fonts } from "@/constants";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import CustomButton from "@/components/CustomButton";
import Textfield from "@/components/Textfield";
import HostModal from "@/components/HostModal";
import { FaRegTrashAlt } from "react-icons/fa";
import { GoPencil } from "react-icons/go";
import { FaCheck } from "react-icons/fa";
import { formatDateAndTime } from "@/utils/handleDateTimeChange";
import { useAuthStore } from "@/store/useAuthStore";
import { getCategoryEng, getCategoryKor } from "@/hooks/getCategory";
import { CustomToast } from "@/components/CustomToast";

interface Notification {
  id: number;
  title: string;
  category: "공지사항";
  content: string;
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
  id: number;
  category: string;
  title: string;
  content: string;
  created_at: string;
  organizer: string;
  answerList: Answer[];
}

const Questions = () => {
  const categories = ["전체", "이용 방법", "적립금", "기타"];
  const [currentCategory, setCurrentCategory] = useState("전체");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const { user } = useAuthStore();

  const [postCategory, setPostCategory] = useState("카테고리 선택");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

  const [answer, setAnswer] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [isAvailableEdit, setIsAvailableEdit] = useState(false);

  const [canQuestionEdit, setCanQuestionEdit] = useState(false);
  const [editedQuestionContent, setEditedQuestionContent] = useState("");

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
              : getCategoryEng(currentCategory),
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

  const handleCategoryClick = (category: string) => {
    setCurrentCategory(category);
  };

  // 디테일 모달 관련
  const handleQuestionClick = (question: Question) => {
    axiosInstance
      .get(`/helpdesk/question/${question.id}/`)
      .then((response) => {
        const data = response.data;
        setSelectedQuestion({
          id: question.id,
          category: data.category,
          title: data.title,
          content: data.content,
          created_at: data.created_at,
          organizer: data.organizer,
          answerList: data.answerList,
        });
        setIsDetailModalOpen(true);
      })
      .catch((error) => {
        console.error("질문 상세 조회 실패:", error);
      });
  };

  const handleNotificationClick = (notification: Notification) => {
    axiosInstance
      .get(`/helpdesk/notification/${notification.id}/`)
      .then((response) => {
        const data = response.data;
        setSelectedNotification({
          id: data.id,
          title: data.title,
          category: "공지사항",
          content: data.content,
          created_at: data.created_at,
        });
        setIsDetailModalOpen(true);
      })
      .catch((error) => {
        console.error("공지 상세 조회 실패:", error);
      });
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedQuestion(null);
    setSelectedNotification(null);
    setAnswer("");
  };

  // 글 작성하기
  const handlePostModalOpen = () => {
    setIsPostModalOpen(true);
  };

  const handlePostModalClose = () => {
    setIsPostModalOpen(false);
    setPostTitle("");
    setPostContent("");
    setPostCategory("카테고리 선택");
  };

  // 카테고리 드롭다운
  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleOptionClick = (option: string) => {
    setPostCategory(option);
    setIsDropdownOpen(false);
  };

  const postQuestion = () => {
    axiosInstance
      .post("/helpdesk/question/", {
        category: getCategoryEng(postCategory),
        title: postTitle,
        content: postContent,
      })
      .then(() => {
        setIsPostModalOpen(false);
        setPostTitle("");
        setPostContent("");
        setPostCategory("카테고리 선택");
        fetchQuestions();
      })
      .catch((error) => {
        console.error("질문 등록 실패:", error);
      });
  };

  // 질문 삭제
  const deleteQuestion = (answerId: number) => {
    if (!selectedQuestion) return;

    axiosInstance
      .delete(`/helpdesk/question/${selectedQuestion.id}`)
      .then(() => {
        fetchQuestions();
        handleDetailModalClose();
        CustomToast("질문이 삭제되었습니다.");
      })
      .catch((error) => {
        console.error("질문 삭제 실패:", error);
      });
  };

  // 질문 수정
  const fetchContent = () => {
    if (!selectedQuestion) return;

    axiosInstance
      .get(`/helpdesk/question/${selectedQuestion.id}/`)
      .then((response) => {
        setSelectedQuestion((prevQuestion) => {
          if (!prevQuestion) return null;
          return {
            ...prevQuestion,
            content: response.data.content,
          };
        });
      })
      .catch((error) => {
        console.error("새 질문 내용 조회 실패:", error);
      });
  };

  const updateQuestion = () => {
    if (!selectedQuestion) return;
    setCanQuestionEdit(false);

    axiosInstance
      .put(`/helpdesk/question/${selectedQuestion.id}/`, {
        category: selectedQuestion.category,
        title: selectedQuestion.title,
        content: editedQuestionContent,
      })
      .then(() => {
        fetchContent();
        CustomToast("질문이 수정되었습니다.");
      })
      .catch((error) => {
        console.error("질문 수정 실패:", error);
        CustomToast("다시 시도해주세요.");
      });
  };

  // 댓글 작성
  const fetchAnswer = () => {
    if (!selectedQuestion) return;

    axiosInstance
      .get(`/helpdesk/question/${selectedQuestion.id}/`)
      .then((response) => {
        setSelectedQuestion((prevQuestion) => {
          if (!prevQuestion) return null;

          return {
            ...prevQuestion,
            answerList: response.data.answerList,
          };
        });
      })
      .catch((error) => {
        console.error("질문 데이터를 가져오지 못했습니다:", error);
      });
  };

  const postAnswer = () => {
    if (!selectedQuestion) return;

    axiosInstance
      .post(`/helpdesk/question/${selectedQuestion.id}/answer/`, {
        content: answer,
      })
      .then((response) => {
        if (response.status === 201) {
          fetchAnswer();
          setAnswer("");
        }
      })
      .catch((error) => {
        console.error("답변 등록 실패:", error);
      });
  };

  // 댓글 삭제
  const deleteAnswer = (answerId: number) => {
    if (!selectedQuestion) return;

    axiosInstance
      .delete(`/helpdesk/question/${selectedQuestion.id}/answer/${answerId}`)
      .then(() => {
        fetchAnswer();
        CustomToast("질문이 삭제되었습니다.");
      })
      .catch((error) => {
        console.error("질문 삭제 실패:", error);
      });
  };

  // 댓글 수정
  const updateAnswer = (answerId: number) => {
    if (!selectedQuestion) return;
    setIsAvailableEdit(false);
    axiosInstance
      .put(`/helpdesk/question/${selectedQuestion.id}/answer/${answerId}/`, {
        content: newAnswer,
      })
      .then(() => {
        fetchAnswer();
      })
      .catch((error) => {
        console.error("질문 수정 실패:", error);
        CustomToast("다시 시도해주세요.");
      });
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
                onClick={handlePostModalOpen}
              >
                글 작성하기
              </CustomButton>
            </div>
          </div>

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
                {notifications.map((item) => (
                  <tr
                    key={item.id}
                    style={{ backgroundColor: "rgba(200, 59, 56, 0.1)" }}
                    onClick={() => handleNotificationClick(item)}
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
                {questions.map((item) => (
                  <tr key={item.id} onClick={() => handleQuestionClick(item)}>
                    <td>{getCategoryKor(item.category)}</td>
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

      {/* 질문 상세 모달 */}
      {isDetailModalOpen && (selectedQuestion || selectedNotification) && (
        <HostModal
          onClose={handleDetailModalClose}
          title={
            selectedQuestion
              ? selectedQuestion.title
              : selectedNotification?.title
          }
          isButtonHidden={selectedNotification ? false : true}
        >
          <div className={styles.postModal}>
            <div className={styles.questionAnswerBody}>
              {selectedQuestion ? (
                <div>
                  <div className={styles.iconWrapper}>
                    {/* 수정 버튼과 삭제 버튼 */}
                    {!canQuestionEdit &&
                      user?.name === selectedQuestion.organizer && (
                        <>
                          <FaRegTrashAlt
                            onClick={() => deleteQuestion(selectedQuestion.id)}
                          />
                          <GoPencil
                            onClick={() => {
                              setCanQuestionEdit(true);
                              setEditedQuestionContent(
                                selectedQuestion.content
                              );
                            }}
                          />
                        </>
                      )}

                    {/* canQuestionEdit이 true일 때 확인 버튼 표시 */}
                    {canQuestionEdit && (
                      <button
                        onClick={updateQuestion}
                        className={styles.editButton}
                      >
                        확인
                      </button>
                    )}
                  </div>

                  {/* 질문 내용 수정 또는 표시 */}
                  {canQuestionEdit ? (
                    <div className={styles.editQuestionDiv}>
                      <textarea
                        value={editedQuestionContent}
                        onChange={(e) =>
                          setEditedQuestionContent(e.target.value)
                        }
                        className={styles.editTextarea}
                        style={{ ...fonts.MD_REGULAR }}
                      />
                    </div>
                  ) : (
                    <div>{selectedQuestion.content}</div>
                  )}
                </div>
              ) : (
                <div>{selectedNotification?.content}</div>
              )}
            </div>

            {selectedQuestion && !canQuestionEdit && (
              <div className={styles.questionAnswerContainer}>
                <div className={styles.questionPostBox}>
                  <Textfield
                    placeholder="답변 입력"
                    value={answer}
                    onChange={setAnswer}
                  />
                  <CustomButton onClick={postAnswer}>
                    <FaCheck style={{ color: "var(--WHITE)" }} />
                  </CustomButton>
                </div>
                {selectedQuestion.answerList.length > 0 &&
                  selectedQuestion.answerList.map((item) => {
                    const { date, time } = formatDateAndTime(
                      new Date(item.updated_at)
                    );
                    return (
                      <div key={item.id}>
                        <div className={styles.detailCommentAuthor}>
                          {item.author}
                          {user?.name === item.author && !isAvailableEdit && (
                            <div className={styles.detailCommentIcon}>
                              <FaRegTrashAlt
                                onClick={() => deleteAnswer(item.id)}
                              />
                              <GoPencil
                                onClick={() => {
                                  setIsAvailableEdit(true);
                                  setNewAnswer(item.content);
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <div className={styles.detailCommentContent}>
                          {isAvailableEdit ? (
                            <div className={styles.editDiv}>
                              <input
                                type="text"
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                className={styles.editInput}
                                style={{
                                  ...fonts.MD_REGULAR,
                                }}
                              />
                              <button
                                onClick={() => updateAnswer(item.id)}
                                className={styles.editButton}
                              >
                                확인
                              </button>
                            </div>
                          ) : (
                            <>
                              {item.content}
                              <div
                                style={{
                                  color: "var(--GRAY_500)",
                                  ...fonts.MD_REGULAR,
                                }}
                              >
                                {date} {time}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </HostModal>
      )}

      {/* 글 작성 모달 */}
      {isPostModalOpen && (
        <HostModal
          onClose={handlePostModalClose}
          title="질문 작성하기"
          buttonLabel="질문 게시하기"
          handleButton={postQuestion}
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
                    {categories
                      .filter((cat) => cat !== "전체")
                      .map((option, index) => (
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
    </div>
  );
};

export default Questions;
