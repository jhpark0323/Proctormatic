// 사용법
// 폰트만 설정할 때: style={fonts.HEADING_1XL}
// 폰트 이외에 설정값이 있을 때: style={{ ...fonts.HEADING_1XL, fontWeight: "800" }}

const fonts = {
  // Heading
  HEADING_4XL: {
    fontWeight: "bold",
    fontSize: "48px",
    lineHeight: "140%",
    fontFamily: "Pretendard",
  },
  HEADING_3XL: {
    fontWeight: "bold",
    fontSize: "40px",
    lineHeight: "140%",
    fontFamily: "Pretendard",
  },
  HEADING_2XL: {
    fontWeight: "semibold",
    fontSize: "32px",
    lineHeight: "140%",
    fontFamily: "Pretendard",
  },
  HEADING_1XL: {
    fontWeight: "semibold",
    fontSize: "28px",
    lineHeight: "140%",
    fontFamily: "Pretendard",
  },
  HEADING_LG_BOLD: {
    fontWeight: "bold",
    fontSize: "24px",
    lineHeight: "140%",
    fontFamily: "Pretendard",
  },
  HEADING_LG: {
    fontWeight: "semibold",
    fontSize: "24px",
    lineHeight: "140%",
    fontFamily: "Pretendard",
  },
  HEADING_MD_BOLD: {
    fontWeight: "bold",
    fontSize: "20px",
    lineHeight: "140%",
    fontFamily: "Pretendard",
  },
  HEADING_MD: {
    fontWeight: "semibold",
    fontSize: "20px",
    lineHeight: "140%",
    fontFamily: "Pretendard",
  },
  HEADING_SM_BOLD: {
    fontWeight: "bold",
    fontSize: "18px",
    lineHeight: "140%",
    fontFamily: "Pretendard",
  },
  HEADING_SM: {
    fontWeight: "semibold",
    fontSize: "18px",
    lineHeight: "140%",
    fontFamily: "Pretendard",
  },

  // Body
  LG_SEMIBOLD: {
    fontWeight: "semibold",
    fontSize: "16px",
    lineHeight: "150%",
    fontFamily: "Pretendard",
  },
  LG_MEDIUM: {
    fontWeight: "medium",
    fontSize: "16px",
    lineHeight: "150%",
    fontFamily: "Pretendard",
  },
  LG_REGULAR: {
    fontWeight: "regular",
    fontSize: "16px",
    lineHeight: "150%",
    fontFamily: "Pretendard",
  },
  LG_ITALIC: {
    fontStyle: "italic",
    fontWeight: "light",
    fontSize: "16px",
    lineHeight: "150%",
    fontFamily: "Pretendard",
  },

  MD_SEMIBOLD: {
    fontWeight: "semibold",
    fontSize: "14px",
    lineHeight: "150%",
    fontFamily: "Pretendard",
  },
  MD_MEDIUM: {
    fontWeight: "medium",
    fontSize: "14px",
    lineHeight: "150%",
    fontFamily: "Pretendard",
  },
  MD_REGULAR: {
    fontWeight: "regular",
    fontSize: "14px",
    lineHeight: "150%",
    fontFamily: "Pretendard",
  },
  MD_ITALIC: {
    fontStyle: "italic",
    fontWeight: "light",
    fontSize: "14px",
    lineHeight: "150%",
    fontFamily: "Pretendard",
  },

  SM_SEMIBOLD: {
    fontWeight: "semibold",
    fontSize: "12px",
    lineHeight: "160%",
    fontFamily: "Pretendard",
  },
  SM_MEDIUM: {
    fontWeight: "medium",
    fontSize: "12px",
    lineHeight: "160%",
    fontFamily: "Pretendard",
  },
  SM_REGULAR: {
    fontWeight: "regular",
    fontSize: "12px",
    lineHeight: "160%",
    fontFamily: "Pretendard",
  },
  SM_ITALIC: {
    fontStyle: "italic",
    fontWeight: "light",
    fontSize: "12px",
    lineHeight: "160%",
    fontFamily: "Pretendard",
  },

  XSM_SEMIBOLD: {
    fontWeight: "semibold",
    fontSize: "10px",
    lineHeight: "160%",
    fontFamily: "Pretendard",
  },
  XSM_MEDIUM: {
    fontWeight: "medium",
    fontSize: "10px",
    lineHeight: "160%",
    fontFamily: "Pretendard",
  },
  XSM_REGULAR: {
    fontWeight: "regular",
    fontSize: "10px",
    lineHeight: "160%",
    fontFamily: "Pretendard",
  },
  XSM_ITALIC: {
    fontStyle: "italic",
    fontWeight: "light",
    fontSize: "10px",
    lineHeight: "160%",
    fontFamily: "Pretendard",
  },
};

// Function to inject font styles as CSS variables
export const injectFonts = () => {
  const root = document.documentElement;

  // Set default font (MD_MEDIUM)
  root.style.setProperty("--font-weight", fonts.LG_MEDIUM.fontWeight);
  root.style.setProperty("--font-size", fonts.LG_MEDIUM.fontSize);
  root.style.setProperty("--line-height", fonts.LG_MEDIUM.lineHeight);
  root.style.setProperty("--font-family", fonts.LG_MEDIUM.fontFamily);

  // CSS 변수 이름 형식 수정
  Object.entries(fonts).forEach(([key, value]) => {
    Object.entries(value).forEach(([property, cssValue]) => {
      const cssVarName = `--font-${key.toLowerCase()}-${property.toLowerCase()}`;
      root.style.setProperty(cssVarName, cssValue as string);
    });
  });
};

// 사용하기 쉽게 CSS 클래스로 변환하는 유틸리티 함수 추가
export const createFontStyles = () => {
  let styles = "";
  Object.entries(fonts).forEach(([key, value]) => {
    styles += `
      .font-${key.toLowerCase()} {
        font-weight: var(--font-${key.toLowerCase()}-fontweight);
        font-size: var(--font-${key.toLowerCase()}-fontsize);
        line-height: var(--font-${key.toLowerCase()}-lineheight);
        font-family: var(--font-${key.toLowerCase()}-fontfamily);
      }
    `;
  });
  return styles;
};

// styles.css에서 사용할 CSS
export const generateGlobalStyles = () => {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = createFontStyles();
  document.head.appendChild(styleSheet);
};

export { fonts };
