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
  buttonType?: "button" | "submit" | "reset"; // HTML button의 type 속성
}

const CustomButton = ({
  state = "default",
  style = "default",
  type = "oval",
  children,
  onClick,
  buttonType = "button", // HTML button의 type을 buttonType으로 설정
}: CustomButtonProps) => {
  return (
    <button
      className={`${styles.button} ${styles[type]} ${styles[style]} ${
        state === "disabled" ? styles.disabled : ""
      }`}
      onClick={state !== "disabled" ? onClick : undefined}
      style={{ cursor: state === "disabled" ? "not-allowed" : "pointer" }}
      type={buttonType} // HTML button의 type 설정
    >
      {children}
    </button>
  );
};

export default CustomButton;
