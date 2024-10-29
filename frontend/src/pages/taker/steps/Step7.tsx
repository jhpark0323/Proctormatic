import React, { useRef, useEffect, useState } from 'react';
import styles from '@/styles/Step.module.css';
import CustomButton from '@/components/CustomButton';

const Step7: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startWebcam = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setError(null);
        }
      } catch {
        setError("웹캠을 사용할 수 없습니다. 카메라 접근 권한을 확인해주세요.");
      }
    }
  };

  useEffect(() => {
    startWebcam();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>카메라 연결</div>
        <div className={styles.StepSubTitle}>웹캠 혹은 전방 카메라를 연결해 주세요.</div>
      </div>
      <div className={styles.StepInner}>
        <div className={styles.StepVideo}>
          {error && <div className="text-red-500 p-4 text-center">{error}</div>}
          {!error && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              onLoadedMetadata={() => setIsVideoLoaded(true)}
              className={styles.StepVideoInner}
            />
          )}
          {!isVideoLoaded && !error && (
            <div className="text-center text-gray-500 mt-2">카메라 연결 확인 중...</div>
          )}
          {isVideoLoaded && (
            <div className="text-center text-green-500 mt-2">카메라가 정상적으로 연결되었습니다!</div>
          )}
        </div>
      </div>
      <div className={styles.StepFooter}>
        <CustomButton onClick={onNext} state={!isVideoLoaded ? 'disabled' : 'default'}>
          다음
        </CustomButton>
      </div>
    </>
  );
};

export default Step7;
