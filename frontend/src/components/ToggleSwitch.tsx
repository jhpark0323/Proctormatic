import { useState } from "react";
import styles from "@/styles/Buttons.module.css";

const ToggleSwitch = () => {
  const [isOn, setIsOn] = useState(false);

  const toggleHandler = () => {
    setIsOn(!isOn);
  };

  return (
    <div onClick={toggleHandler} className={styles.toggle}>
      {/* 토글 컨테이너와 서클 부분 */}
      <div
        className={`${styles["toggle-container"]} ${
          isOn ? styles["toggle--checked"] : ""
        }`}
      />
      <div
        className={`${styles["toggle-circle"]} ${
          isOn ? styles["toggle--checked"] : ""
        }`}
      />
    </div>
  );
};

export default ToggleSwitch;
