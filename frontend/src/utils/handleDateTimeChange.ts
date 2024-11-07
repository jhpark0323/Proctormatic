export const formatDateAndTime = (date: Date) => {
  // 날짜 부분 추출: "YYYY-MM-DD" 형식으로 반환
  const formattedDate = date.toISOString().split("T")[0];

  // 시간 부분 추출: "HH:mm:ss" 형식으로 반환
  const formattedTime = date.toTimeString().split(" ")[0];

  return {
    date: formattedDate,
    time: formattedTime,
  };
};

// 사용 예시
// const now = new Date();
// const { date, time } = formatDateAndTime(now);
// console.log(date); // "YYYY-MM-DD"
// console.log(time); // "HH:mm:ss"
