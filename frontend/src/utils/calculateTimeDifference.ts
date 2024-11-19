export const calculateTimeDifference = (
  date: string,
  startTime: string,
  endTime: string
): number => {
  // 날짜와 시간을 합쳐서 Date 객체로 변환
  const startDate = new Date(`${date}T${startTime}`);
  const endDate = new Date(`${date}T${endTime}`);

  // 시간 차이를 밀리초 단위로 계산
  const differenceInMs = endDate.getTime() - startDate.getTime();

  // 분 단위로 변환하여 반환
  return Math.ceil(differenceInMs / (1000 * 60));
};
