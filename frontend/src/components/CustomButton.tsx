import styles from "@/styles/Buttons.module.css";

// 사용예시
// import CustomButton from 'src\components\CustomButton';
/* <CustomButton
label="버튼 클릭"
onClick={() => alert("Button clicked!")}
/> */

interface CustomButtonProps {
  state?: "default" | "disabled";
  style?:
    | "default"
    | "primary_fill"
    | "primary_outline"
    | "primary_clear"
    | "secondary"
    | "danger"
    | "danger_outline"
    | "blackfill"
    | "whitefill";
  type?: "rectangular" | "oval";
  children: React.ReactNode;
  onClick?: () => void;
  buttonType?: "button" | "submit" | "reset";
  "data-testid"?: string; // 테스트 ID를 받을 수 있도록 추가
}

const CustomButton = ({
  state = "default",
  style = "default",
  type = "oval",
  children,
  onClick,
  buttonType = "button",
  "data-testid": testId, // data-testid 속성을 전달
}: CustomButtonProps) => {
  return (
    <button
      className={`${styles.button} ${styles[type]} ${styles[style]} ${
        state === "disabled" ? styles.disabled : ""
      }`}
      onClick={state !== "disabled" ? onClick : undefined}
      style={{ cursor: state === "disabled" ? "not-allowed" : "pointer" }}
      type={buttonType}
      data-testid={testId} // data-testid 속성 추가
    >
      {children}
    </button>
  );
};

export default CustomButton;
