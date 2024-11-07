import styles from "@/styles/Buttons.module.css";
import { useState, useEffect } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { RiCloseCircleLine } from "react-icons/ri";

interface TextfieldProps {
  label?: string;
  helpMessage?: string;
  placeholder?: string;
  trailingIcon?: "delete" | "search";
  type?: "underline" | "default";
  inputType?: string;
  maxLength?: number;
  value?: string;
  onChange?: (value: string) => void;
  handleSearch?: () => void;
}

const Textfield = ({
  label,
  helpMessage,
  placeholder,
  trailingIcon,
  maxLength,
  value = "",
  type = "default",
  inputType = "text",
  onChange,
  handleSearch,
}: TextfieldProps) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleClear = () => {
    setInputValue("");
    if (onChange) onChange("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={styles["textfield-container"]}>
      {/* 라벨 */}
      {label && <label className={styles["textfield-label"]}>{label}</label>}

      {/* 입력 필드 */}
      {/* textarea일 때 */}
      <div style={{ position: "relative", width: "100%" }}>
        {inputType === "textarea" ? (
          <textarea
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            maxLength={maxLength}
            className={`${styles["textfield-input"]} ${
              type === "underline" ? styles["underline"] : ""
            }`}
            style={{ height: "130px" }}
          />
        ) : (
          <input
            type={inputType}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            maxLength={maxLength}
            className={`${styles["textfield-input"]} ${
              type === "underline" ? styles["underline"] : ""
            }`}
          />
        )}

        {/* 트레일링 아이콘 */}
        {trailingIcon === "delete" && (
          <RiCloseCircleLine
            className={styles["trailing-icon"]}
            onClick={handleClear}
            style={{ cursor: "pointer", opacity: 0.5 }}
          />
        )}
        {trailingIcon === "search" && (
          <IoSearchSharp
            className={styles["trailing-icon"]}
            onClick={handleSearch}
            style={{ cursor: "pointer", opacity: 0.5 }}
          />
        )}
      </div>

      {/* 도움말 메시지 */}
      {helpMessage && (
        <div className={styles["textfield-help"]}>{helpMessage}</div>
      )}
    </div>
  );
};

export default Textfield;
