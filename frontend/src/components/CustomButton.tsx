import styles from "@/styles/Buttons.module.css";

// 사용예시
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
  label: string;
  onClick?: () => void;
}

const CustomButton = ({
  state = "default",
  style = "primary_fill",
  type = "oval",
  label,
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
      {label}
    </div>
  );
};

export default CustomButton;
