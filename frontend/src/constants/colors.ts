const colors = {
  WHITE: "#FFF",
  BLACK: "#000",
  BACKGROUND: "#F0F1F2",

  // Grayscale
  GRAY_50: "#FAFAFA",
  GRAY_100: "#F8F8F8",
  GRAY_200: "#F0F1F2",
  GRAY_300: "#D7D7D7",
  GRAY_400: "#BBBBBB",
  GRAY_500: "#888888",
  GRAY_600: "#5C5C5C",
  GRAY_700: "#4B4B4B",
  GRAY_800: "#333333",
  GRAY_900: "#191919",

  // Primary
  PRIMARY: "#2276DC",
  PRIMARY_HOVER: "#1B5EB0",
  PRIMARY_ACTIVED: "#144784",

  // Secondary
  SECONDARY: "#ED893E",
  SECONDARY_HOVER: "#DD7D36",
  SECONDARY_ACTIVED: "#BE6726",

  // Nagative
  DELETE: "#C83B38",
  DELETE_HOVER: "#A02F2D",
  DELETE_ACTIVED: "#860B07",
};

// 함수를 활용해서 색상을 css 변수로 적용
export const injectColors = () => {
  const root = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
};

export { colors };
