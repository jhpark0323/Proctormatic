import React, { ChangeEvent } from "react";
import styles from "@/styles/Buttons.module.css";

// checked 에 들어갈 boolean 값은  const [service, setService] = React.useState(false); 와 같이 불러올 수 있음
// children: 태그로 감싼 내용이 라벨로 들어감
// checked: boolean (변수를 넣어서 쓴다) 예: service
// onChange: checked 에 저장된 boolean 값을 변경한다. 예: setService

// 예문
// <Checkbox checked={service} onChange={setService}>
// (필수) 서비스 이용약관
// </Checkbox>

interface CheckboxProps {
  children: React.ReactNode;
  disabled?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({
  children,
  disabled = false,
  checked,
  onChange,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <div
      className={`checkbox ${disabled ? "disabled" : "enabled"} ${
        styles.checkbox
      }`}
    >
      <label>
        <input
          type="checkbox"
          disabled={disabled}
          checked={checked}
          onChange={handleChange}
        />
        {children}
      </label>
    </div>
  );
};

export default Checkbox;
