import styles from "@/styles/Buttons.module.css";
import { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { RiCloseCircleLine } from "react-icons/ri";

// 사용 예시
/* 
  const [name, setName] = useState("윤예리");

      <Textfield
        label="이름"
        helpMessage="이름을 입력하세요"
        placeholder="홍길동"
        maxLength=10
        trailingIcon="delete"
        onChange={(value) => setName(value)}
      >
        {name}
      </Textfield>
*/

interface TextfieldProps {
  label?: string;
  helpMessage?: string;
  placeholder?: string;
  trailingIcon?: "delete" | "search";
  type?: "underline" | "default";
  maxLength?: number;
  children?: React.ReactNode;
  onChange?: (value: string) => void;
  handleSearch?: () => void;
}

const Textfield = ({
  label,
  helpMessage,
  placeholder,
  trailingIcon,
  maxLength,
  children = "",
  type = "default",
  onChange,
  handleSearch,
}: TextfieldProps) => {
  const [inputValue, setInputValue] = useState(children?.toString() || "");
  const handleClear = () => {
    setInputValue(""); // 입력 필드 초기화
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue); // 값 변경 시 부모 컴포넌트로 전달
    }
  };

  return (
    <div className={styles["textfield-container"]}>
      {/* 라벨 */}
      <label className={styles["textfield-label"]}>{label}</label>

      {/* 입력 필드 */}
      <div style={{ position: "relative", width: "100%" }}>
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          maxLength={maxLength}
          defaultValue={children?.toString()} // defaultValue로 설정
          className={`${styles["textfield-input"]} ${
            type === "underline" ? styles["underline"] : ""
          }`}
        />

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
      <div className={styles["textfield-help"]}>{helpMessage}</div>
    </div>
  );
};

export default Textfield;
