import { useNavigate } from "react-router-dom";
import styles from "@/styles/Testpage.module.css";
import { CustomToast } from "@/components/CustomToast";

interface Exam {
  id: number;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  url: string;
  expected_taker: number;
  total_taker?: number;
}

const renderScheduledExamTable = (
  exams: Exam[],
  navigate: ReturnType<typeof useNavigate>
) => (
  <table className={styles.historyTable}>
    <thead className={styles.tableHeader}>
      <tr>
        <th className={styles.tableCell}>시험명</th>
        <th className={styles.tableCell}>날짜와 시간</th>
        <th className={styles.tableCell}>시험 정보 보기</th>
        <th className={styles.tableCell}>예상 응시 인원</th>
      </tr>
    </thead>
    <tbody>
      {exams.map((exam) => (
        <tr key={exam.id} className="border-t border-gray-200">
          <td className={styles.tableCell}>{exam.title}</td>
          <td className={styles.tableCell}>
            <div>{exam.date}</div>
            <div>{`${exam.start_time} ~ ${exam.end_time}`}</div>
          </td>
          <td className={styles.tableCell}>
            <div
              className={styles.reportButton}
              onClick={() => navigate(`/host/scheduledtest/${exam.id}`)}
            >
              보기
            </div>
          </td>
          <td className={styles.tableCell}>{exam.expected_taker}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const renderExamTable = (exams: Exam[]) => {
  const handleCopyUrl = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        CustomToast("시험 URL이 복사되었습니다.");
      })
      .catch((error) => {
        console.error("URL 복사 실패:", error);
      });
  };

  return (
    <table className={styles.historyTable}>
      <thead className={styles.tableHeader}>
        <tr>
          <th className={styles.tableCell}>시험명</th>
          <th className={styles.tableCell}>날짜와 시간</th>
          <th className={styles.tableCell}>시험 입장</th>
          <th className={styles.tableCell}>예상 응시 인원</th>
        </tr>
      </thead>
      <tbody>
        {exams.map((exam) => (
          <tr key={exam.id} className="border-t border-gray-200">
            <td className={styles.tableCell}>{exam.title}</td>
            <td className={styles.tableCell}>
              <div>{exam.date}</div>
              <div>{`${exam.start_time} ~ ${exam.end_time}`}</div>
            </td>
            <td className={styles.tableCell}>
              <div
                className={styles.reportButton}
                onClick={() => handleCopyUrl(exam.url)}
              >
                URL
              </div>
            </td>
            <td className={styles.tableCell}>{exam.expected_taker}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const renderCompletedExamTable = (
  exams: Exam[],
  navigate: ReturnType<typeof useNavigate>
) => (
  <table className={styles.historyTable}>
    <thead className={styles.tableHeader}>
      <tr>
        <th className={styles.tableCell}>시험명</th>
        <th className={styles.tableCell}>날짜와 시간</th>
        <th className={styles.tableCell}>업로드 된 영상</th>
        <th className={styles.tableCell}>결과 보고서</th>
      </tr>
    </thead>
    <tbody>
      {exams.map((exam) => (
        <tr key={exam.id}>
          <td className={styles.tableCell}>{exam.title}</td>
          <td className={styles.tableCell}>
            <div>{exam.date}</div>
            <div>{`${exam.start_time} ~ ${exam.end_time}`}</div>
          </td>
          <td className={styles.tableCell}>{exam.expected_taker}</td>
          <td className={styles.tableCell}>
            <div
              className={styles.reportButton}
              onClick={() => navigate(`/host/test/${exam.id}`)}
            >
              보기
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export { renderScheduledExamTable, renderExamTable, renderCompletedExamTable };
