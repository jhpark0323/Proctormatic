export const getCategoryEng = (category: string) => {
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

export const getCategoryKor = (code: string) => {
  switch (code) {
    case "usage":
      return "이용 방법";
    case "coin":
      return "적립금";
    case "etc":
      return "기타";
    default:
      return "전체";
  }
};
