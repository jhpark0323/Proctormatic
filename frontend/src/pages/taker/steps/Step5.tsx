import React, { useState } from 'react';
import styles from '@/styles/Step.module.css';
import CustomButton from '@/components/CustomButton';
import TermsModal from '@/components/TermsModal';
import { useNavigate } from 'react-router-dom';

const Step5: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = () => {
    setIsModalOpen(false);
    // Add navigation or other logic here after confirming
    // For example: navigate('/exam-room');
  };

  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>응시자 정보 입력</div>
        <div className={styles.StepSubTitle}>응시자 정보를 정확하게 입력해주세요.</div>
      </div>
      <div className={styles.StepInner}>
        {/* Add your form fields here */}
      </div>
      <div className={styles.StepFooter}>
        <CustomButton onClick={() => setIsModalOpen(true)}>
          확인했습니다
        </CustomButton>
      </div>

      <TermsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default Step5;