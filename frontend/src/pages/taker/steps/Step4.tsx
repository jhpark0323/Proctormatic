import React, { useEffect, useState, useRef } from 'react';
import styles from '@/styles/Step.module.css';
import CustomButton from '@/components/CustomButton';
import axiosInstance from '@/utils/axios';
import { useTakerStore } from '@/store/TakerAuthStore';
import { CustomToast } from '@/components/CustomToast';

const Step4: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { testId } = useTakerStore();
  const [examInfo, setExamInfo] = useState({
    title: '',
    date: '',
    start_time: '',
    end_time: '',
  });

  const errorDisplayed = useRef(false); // 에러 메시지 표시 여부 추적

  useEffect(() => {
    const fetchExamInfo = async () => {
      try {
        const response = await axiosInstance.get(`/exam/${testId}/taker/`);
        const { title, date, start_time, end_time } = response.data;
        setExamInfo({
          title,
          date,
          start_time,
          end_time,
        });
        errorDisplayed.current = false; // 성공 시 에러 표시 상태 초기화
      } catch (error: any) {
        if (!errorDisplayed.current) { // 에러 메시지가 아직 표시되지 않은 경우에만 실행
          if (error.response && error.response.data?.message) {
            CustomToast(error.response.data.message);
          } else {
            CustomToast('알 수 없는 오류가 발생했습니다.');
          }
          errorDisplayed.current = true; // 에러 메시지 표시 상태 업데이트
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
        {/* 시험 제목 부분 */}
        <div className={styles.InnerContainer}> 
          {/* <div>시험ID: { testId }</div>  */}
          <label htmlFor="testID">시험 제목</label>
          <div className={styles.InnerInputAuth}>
            <input 
              type="text" 
              defaultValue={examInfo.title} // 기본값 설정
              readOnly  // 수정 불가 설정
            />
          </div>
        </div>
        {/* 시험 일시 부분 */}
        <div className={styles.InnerContainer}> 
          {/* <div>시험ID: { testId }</div>  */}
          <label htmlFor="testID">시험 응시 날짜</label>
          <div className={styles.InnerInputAuth}>
            <input 
              type="text" 
              defaultValue={examInfo.date} // 기본값 설정
              readOnly  // 수정 불가 설정
            />
          </div>
        </div>
        {/* 시험 시작 시간 */}
        <div className={styles.InnerContainer}> 
          {/* <div>시험ID: { testId }</div>  */}
          <label htmlFor="testID">시험 응시 시간</label>
          <div className={styles.InnerInputAuth}>
          <input 
            type="text" 
            defaultValue={
              examInfo.start_time && examInfo.end_time 
                ? `${examInfo.start_time} ~ ${examInfo.end_time}` 
                : ''
            } 
            readOnly
          />
          </div>
        </div>
      </div>
      <div className={styles.StepFooter}>
        <CustomButton onClick={onNext}>다음</CustomButton>
      </div>
    </>
  );
};

export default Step4;
