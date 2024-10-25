import styles from "@/styles/Buttons.module.css";

interface TextfieldProps {
  label?: string;
  helpMessage?: string;
  placeholder?: string;
  trailingIcon?: string;
  children?: React.ReactNode;
  type: "underline" | "default";
}

const Textfield = ({
  label,
  helpMessage,
  placeholder,
  trailingIcon,
  children = "",
  type = "default",
}: TextfieldProps) => {
  return (
    <div className={styles["textfield-container"]}>
      {/* 라벨 */}
      <label className={styles["textfield-label"]}>{label}</label>

      {/* 입력 필드 */}
      <div style={{ position: "relative", width: "100%" }}>
        <input
          type="text"
          placeholder={placeholder}
          defaultValue={children?.toString()} // defaultValue로 설정
          className={`${styles["textfield-input"]} ${
            type === "underline" ? styles["underline"] : ""
          }`}
        />

        {/* 트레일링 아이콘 */}
        {trailingIcon && (
          <img
            src={trailingIcon}
            alt="icon"
            className={styles["trailing-icon"]}
          />
        )}
      </div>

      {/* 도움말 메시지 */}
      <div className={styles["textfield-help"]}>{helpMessage}</div>
    </div>
  );
};

export default Textfield;
