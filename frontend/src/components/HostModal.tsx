import { ReactNode } from "react";
import styles from "@/styles/HostModal.module.css";
import { TfiClose } from "react-icons/tfi";
import CustomButton from "./CustomButton";
import { fonts } from "@/constants";

interface HostModalProps {
  children: ReactNode;
  title?: string;
  isButtonHidden?: boolean;
  buttonLabel?: string;
  handleButton?: () => void;
  onClose: () => void;
}

const HostModal = ({
  children,
  title,
  buttonLabel = "확인",
  isButtonHidden = false,
  handleButton,
  onClose,
}: HostModalProps) => {
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackground} onClick={handleBackgroundClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalTitle} style={fonts.HEADING_LG_BOLD}>
          <div>{title}</div>
          <div onClick={onClose} style={{ opacity: "0.5" }}>
            <TfiClose />
          </div>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {!isButtonHidden && (
          <div className={styles.modalButton}>
            <CustomButton onClick={handleButton ? handleButton : onClose}>
              {buttonLabel}
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostModal;
