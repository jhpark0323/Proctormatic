import React, { useRef, useEffect, useCallback, useState } from 'react';
import styles from '@/styles/Step.module.css';
import CustomButton from '@/components/CustomButton';
import { usePhotoStore } from '@/store/usePhotoStore';

const Step8: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { photo, setPhoto } = usePhotoStore();
  const [isPhotoTaken, setIsPhotoTaken] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startWebcam = async () => {
    if (!stream && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        console.log("웹캠 접근 시도 중...");
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          } 
        });
        console.log("웹캠 접근 성공");
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError(null);
      } catch (error) {
        console.error("웹캠을 사용할 수 없습니다:", error);
        setError("웹캠을 사용할 수 없습니다. 카메라 접근 권한을 확인해주세요.");
      }
    }
  };

  useEffect(() => {
    if (!isPhotoTaken) {
      startWebcam();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, [isPhotoTaken]);

  const capturePhoto = useCallback(() => {
    if (!isVideoLoaded) {
      console.log("비디오가 아직 로드되지 않았습니다.");
      return;
    }

    if (videoRef.current && photoCanvasRef.current) {
      const context = photoCanvasRef.current.getContext('2d');
      if (context) {
        const video = videoRef.current;
        const canvas = photoCanvasRef.current;
        
        const videoAspectRatio = video.videoWidth / video.videoHeight;
        canvas.width = 640;
        canvas.height = canvas.width / videoAspectRatio;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/png');
        setPhoto(imageDataUrl);
        setIsPhotoTaken(true);

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      }
    }
  }, [isVideoLoaded, stream, setPhoto]);

  const retakePhoto = useCallback(() => {
    setIsPhotoTaken(false);
    setPhoto(null);
    setIsVideoLoaded(false);
    setError(null);
  }, [setPhoto]);

  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>본인 사진 촬영</div>
        <div className={styles.StepSubTitle}>본인 확인을 위해 셀프 이미지를 촬영해요.</div>
      </div>
      <div className={styles.StepInner}>
        <div className={styles.Step8Video}>
          {error && (
            <div className="text-red-500 p-4 text-center">
              {error}
            </div>
          )}
          {!isPhotoTaken ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                className={styles.Step8VideoInner} 
                onLoadedMetadata={() => {
                  console.log("비디오 메타데이터가 로드되었습니다.");
                  setIsVideoLoaded(true);
                }}
              />
              <canvas 
                ref={photoCanvasRef} 
                style={{ display: 'none' }}
              />
              <div className={styles.buttonContainer}>
                <button 
                  onClick={capturePhoto}
                  disabled={!isVideoLoaded}
                >
                  사진 찍기
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.Step8VideoInner}>
                <img 
                  src={photo || ''} 
                  alt="촬영된 사진"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div className={styles.buttonContainer}>
                <button onClick={retakePhoto}>다시 찍기</button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className={styles.StepFooter}>
        <CustomButton 
          onClick={onNext}
          state={!isPhotoTaken ? 'disabled' : 'default'}
        >
          다음
        </CustomButton>
      </div>
    </>
  );
};

export default Step8;
