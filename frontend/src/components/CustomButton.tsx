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
    | "primary_fill"
    | "primary_outline"
    | "primary_clear"
    | "secondary"
    | "danger"
    | "danger_outline"
    | "whitefill";
  type?: "rectangular" | "oval";
  children: React.ReactNode;
  onClick?: () => void;
}

const CustomButton = ({
  state = "default",
  style = "primary_fill",
  type = "oval",
  children,
  onClick,
}: CustomButtonProps) => {
  return (
    <div
      className={`${styles.button} ${styles[type]} ${styles[style]} ${
        state === "disabled" ? styles.disabled : ""
      }`}
      onClick={state !== "disabled" ? onClick : undefined}
      style={{ cursor: state === "disabled" ? "not-allowed" : "pointer" }}
    >
      {children}
    </div>
  );
};

export default CustomButton;
