import React, { useEffect, useState, useRef } from 'react';
import styles from '@/styles/Step.module.css';
import CustomButton from '@/components/CustomButton';
import axiosInstance from '@/utils/axios';
import { useTakerStore } from '@/store/TakerAuthStore';
import { CustomToast } from '@/components/CustomToast';
import InputField from '@/components/TakerInputField';
import CustomTooltip from '@/components/CustomTooltip';

const Step4: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const { testId } = useTakerStore();
  const [examInfo, setExamInfo] = useState({
    title: '',
    date: '',
    start_time: '',
    end_time: '',
  });
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const errorDisplayed = useRef(false);

  useEffect(() => {
    const fetchExamInfo = async () => {
      try {
        const response = await axiosInstance.get(`/exam/${testId}/taker/`);
        const { title, date, start_time, end_time } = response.data;
        setExamInfo({ title, date, start_time, end_time });
        errorDisplayed.current = false;
        checkEntryAvailability(date, start_time);
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

    const checkEntryAvailability = (examDate: string, startTime: string) => {
      const currentDate = new Date();
      const [examYear, examMonth, examDay] = examDate.split('-').map(Number);
      const [hours, minutes, seconds] = startTime.split(':').map(Number);

      const examStartTime = new Date(examYear, examMonth - 1, examDay, hours, minutes - 30, seconds);

      setIsButtonEnabled(currentDate >= examStartTime && 
        currentDate.toDateString() === new Date(examYear, examMonth - 1, examDay).toDateString());
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
        <InputField label="시험 제목" value={examInfo.title} dataTestId="test-title" />
        <InputField label="시험 응시 날짜" value={examInfo.date} dataTestId="test-date" />
        <InputField
          label="시험 응시 시간"
          value={
            examInfo.start_time && examInfo.end_time
              ? `${examInfo.start_time} ~ ${examInfo.end_time}`
              : ''
          }
          dataTestId="test-time"
        />
      </div>
      <div className={styles.StepFooter}>
        {isButtonEnabled ? (
          <CustomButton onClick={onNext}>다음</CustomButton>
        ) : (
          <div className={styles.goBack}>
            <CustomButton onClick={onBack}>돌아가기</CustomButton>
            <CustomTooltip
              id="entry-tooltip"
              content="시험 30분 전부터 입실이 가능합니다"
              type="white"
              place="top"
            >
              <div>
                <CustomButton onClick={onNext} state='disabled'>
                  다음
                </CustomButton>
              </div>
            </CustomTooltip>
          </div>
        )}
      </div>
    </>
  );
};

export default Step4;
