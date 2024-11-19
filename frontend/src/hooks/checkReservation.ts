export const validateTimes = (
  startTime: Date | null,
  endTime: Date | null,
  exitTime: Date | null
) => {
  const currentTime = new Date();
  const thirtyMinutesLater = new Date(currentTime.getTime() + 30 * 60 * 1000);

  // 현재 시간에서 30분 이후보다 늦어야 함
  if (startTime && startTime < thirtyMinutesLater) {
    return {
      isValid: false,
      field: "start_time",
      message: "시험 시작 시간은 현재 시간 기준 30분 이후로 설정해야 합니다.",
    };
  }

  // end_time은 start_time 이후여야 하며, 최대 2시간 이후까지만 가능
  if (startTime && endTime) {
    const twoHoursLater = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
    if (endTime <= startTime) {
      return {
        isValid: false,
        field: "end_time",
        message: "시험 종료 시간은 시작 시간 이후여야 합니다.",
      };
    }
    if (endTime > twoHoursLater) {
      return {
        isValid: false,
        field: "end_time",
        message:
          "시험 종료 시간은 시작 시간 이후 최대 2시간까지만 설정할 수 있습니다.",
      };
    }
  }

  // exit_time은 start_time <= exit_time <= end_time이어야 함
  if (exitTime && startTime && endTime) {
    if (exitTime < startTime || exitTime > endTime) {
      return {
        isValid: false,
        field: "exit_time",
        message: "퇴실 가능 시간은 시작 시간과 종료 시간 사이여야 합니다.",
      };
    }
  }

  return { isValid: true, field: null, message: "" };
};
