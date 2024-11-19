import styles from "@/styles/Buttons.module.css";

interface ToggleSwitchProps {
  isOn: boolean;
  toggleHandler: () => void;
}

const ToggleSwitch = ({ isOn, toggleHandler }: ToggleSwitchProps) => {
  return (
    <div onClick={toggleHandler} className={styles.toggle}>
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
