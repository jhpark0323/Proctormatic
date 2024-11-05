import React, { useEffect, useState, useRef } from 'react';
import styles from '@/styles/Step.module.css';
import CustomButton from '@/components/CustomButton';
import axiosInstance from '@/utils/axios';
import { useTakerStore } from '@/store/TakerAuthStore';
import { CustomToast } from '@/components/CustomToast';
import InputField from '@/components/TakerInputField';

const Step4: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { testId } = useTakerStore();
  const [examInfo, setExamInfo] = useState({
    title: '',
    date: '',
    start_time: '',
    end_time: '',
  });

  const errorDisplayed = useRef(false);

  useEffect(() => {
    const fetchExamInfo = async () => {
      try {
        const response = await axiosInstance.get(`/exam/${testId}/taker/`);
        const { title, date, start_time, end_time } = response.data;
        setExamInfo({ title, date, start_time, end_time });
        errorDisplayed.current = false;
      } catch (error: any) {
        if (!errorDisplayed.current) {
          if (error.response && error.response.data?.message) {
            CustomToast(error.response.data.message);
          } else {
            CustomToast('알 수 없는 오류가 발생했습니다.');
          }
          errorDisplayed.current = true;
        }
      }
    };

    fetchExamInfo();
  }, [testId]);

  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>시험정보 확인</div>
        <div className={styles.StepSubTitle}>응시하실 시험의 상세 정보를 확인해주세요.</div>
      </div>
      <div className={`${styles.StepInner} ${styles.test1}`}>
        <InputField label="시험 제목" value={examInfo.title} />
        <InputField label="시험 응시 날짜" value={examInfo.date} />
        <InputField 
          label="시험 응시 시간" 
          value={
            examInfo.start_time && examInfo.end_time
              ? `${examInfo.start_time} ~ ${examInfo.end_time}`
              : ''
          }
        />
      </div>
      <div className={styles.StepFooter}>
        <CustomButton onClick={onNext}>다음</CustomButton>
      </div>
    </>
  );
};

export default Step4;
