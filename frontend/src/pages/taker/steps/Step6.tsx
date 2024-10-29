// Step6.tsx
import React, { useState, useEffect } from 'react';
import styles from '@/styles/Step.module.css';
import CustomButton from '@/components/CustomButton';

const Step6: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [browserCompatible, setBrowserCompatible] = useState<string | null>(null);
  const [cpuPerformance, setCpuPerformance] = useState<string | null>(null);
  const [internetSpeed, setInternetSpeed] = useState<string | null>(null);
  const [internetSpeedMs, setInternetSpeedMs] = useState<number | null>(null);
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);

  // 브라우저 호환성 체크
  useEffect(() => {
    const checkBrowserCompatibility = () => {
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      setBrowserCompatible(isChrome ? "호환되는 브라우저입니다." : "호환되지 않는 브라우저입니다.");
    };
    checkBrowserCompatibility();
  }, []);

  // CPU 성능 체크
  const checkCpuPerformance = () => {
    const start = performance.now();
    for (let i = 0; i < 1e7; i++) {} // 단순 계산 작업
    const end = performance.now();
    const duration = end - start;
    setCpuPerformance(duration < 200 ? "양호" : "낮음");
  };

  // 인터넷 속도 측정
  const checkInternetSpeed = async () => {
    try {
      setIsTestingSpeed(true);
      setInternetSpeed("검사 중...");
      setInternetSpeedMs(null);

      const measurements = [];
      const testCount = 3;
      
      const testUrl = 'https://www.cloudflare.com/cdn-cgi/trace';

      for (let i = 0; i < testCount; i++) {
        const start = performance.now();
        const response = await fetch(testUrl, {
          method: 'GET',
          cache: 'no-store',
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const end = performance.now();
        measurements.push(end - start);

        // 측정 사이에 짧은 딜레이를 둡니다
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const avgDuration = measurements.reduce((a, b) => a + b) / testCount;
      setInternetSpeedMs(Math.round(avgDuration));

      // 속도 기준 세분화
      let speedStatus;
      if (avgDuration < 300) {
        speedStatus = "매우 양호";
      } else if (avgDuration < 500) {
        speedStatus = "양호";
      } else if (avgDuration < 1000) {
        speedStatus = "보통";
      } else {
        speedStatus = "느림";
      }

      setInternetSpeed(`${speedStatus} (${Math.round(avgDuration)} ms)`);
    } catch (error) {
      console.error('인터넷 속도 측정 실패:', error);
      setInternetSpeed("측정 실패");
    } finally {
      setIsTestingSpeed(false);
    }
  };

  useEffect(() => {
    checkCpuPerformance();
    checkInternetSpeed();
  }, []);

  // 재시도 버튼 스타일
  const retryButtonStyle = {
    marginLeft: '10px',
    padding: '4px 8px',
    fontSize: '14px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>기기 상태 점검</div>
        <div className={styles.StepSubTitle}>시험 응시에 적합한 환경인지 기기 상태를 점검해요.</div>
      </div>
      <div className={styles.StepInner}>

        {/* {(cpuPerformance === "낮음" || internetSpeed === "느림") && (
        )} */}
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeeba', 
            borderRadius: '4px',
            color: '#856404' 
          }}>
            ⚠️ 원활한 시험 진행을 위해 다른 프로그램을 종료하거나 네트워크 상태를 확인해주세요.
          </div>


        <div className={styles.statusBox}>

          <div className={styles.statusItem}>
            <div>
              <strong>브라우저 호환성:</strong> {browserCompatible || "검사 중..."}
            </div>
          </div>

          <div className={styles.statusItem}>
            <div>
              <strong>CPU 성능:</strong> {cpuPerformance || "검사 중..."}
              {cpuPerformance === "낮음" && (
                <button 
                  onClick={checkCpuPerformance}
                  style={retryButtonStyle}
                  disabled={isTestingSpeed}
                >
                  다시 검사
                </button>
              )}
            </div>
          </div>

          <div className={styles.statusItem}>
            <div>
              <strong>인터넷 속도:</strong> {internetSpeed || "검사 중..."}
              {(internetSpeed === "측정 실패" || internetSpeed === "느림" || internetSpeed === "보통") && (
                <button 
                  onClick={checkInternetSpeed}
                  style={retryButtonStyle}
                  disabled={isTestingSpeed}
                >
                  {isTestingSpeed ? "측정 중..." : "다시 측정"}
                </button>
              )}
            </div>
          </div>
        </div>
        
      </div>
      <div className={styles.StepFooter}>
        <CustomButton onClick={onNext}>다음</CustomButton>
      </div>
    </>
  );
};

export default Step6;
