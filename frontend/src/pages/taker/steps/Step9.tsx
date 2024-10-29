import React, { useCallback, useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import styles from '@/styles/Step.module.css';
import CustomButton from '@/components/CustomButton';
import { usePhotoStore } from '@/store/usePhotoStore';
import { FaCamera } from "react-icons/fa";

interface Step9Props {
  onNext: () => void;
}

const Step9: React.FC<Step9Props> = ({ onNext }) => {
  const { setPhotoStep9 } = usePhotoStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isPhotoTaken, setIsPhotoTaken] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);

  // 얼굴 인식 모델 로드 함수
  const loadModels = async () => {
    const MODEL_URL = '/models';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    setModelsLoaded(true);
  };

  useEffect(() => {
    loadModels();
    startWebcam();
  }, []);

  // 웹캠 시작 함수
  const startWebcam = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
  };

  // 사진 캡처 함수
  const takePhoto = (): string | null => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const capturedData = canvas.toDataURL('image/png');
        setPhotoData(capturedData);
        setIsPhotoTaken(true);
        return capturedData;
      }
    }
    return null;
  };

  // 캡처 및 얼굴 인식 함수
const handleCapture = useCallback(async () => {
  if (!modelsLoaded) {
    alert("모델이 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.");
    return;
  }

  const capturedPhoto = takePhoto();
  if (capturedPhoto) {
    const img = new Image();
    img.src = capturedPhoto;
    img.onload = async () => {
      const detections = await faceapi.detectAllFaces(
        img,
        new faceapi.TinyFaceDetectorOptions()
      );

      if (detections.length > 0) {
        console.log("Face detected, saving photo.");
        setPhotoStep9(capturedPhoto);
      } else {
        alert("얼굴 인식에 실패했습니다. 다시 촬영해 주세요.");
        setIsPhotoTaken(false);
        setPhotoData(null);
        startWebcam(); // 다시 웹캠을 시작하여 촬영 모드로 돌아감
      }
    };
  } else {
    console.error("Failed to capture photo data.");
    alert("사진 캡처에 실패했습니다. 다시 시도해 주세요.");
  }
}, [modelsLoaded, setPhotoStep9]);

  // 다시 찍기 함수
  const retakePhoto = useCallback(() => {
    setIsPhotoTaken(false);
    setPhotoData(null);
    startWebcam();
  }, []);

  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>신분증 촬영</div>
        <div className={styles.StepSubTitle}>본인 확인을 위해 신분증을 촬영해 주세요.</div>
      </div>
      <div className={styles.StepInner}>
        <div className={styles.StepVideo}>
          {!isPhotoTaken ? (
            <>
              <video ref={videoRef} autoPlay playsInline className={styles.StepVideoInner} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div className={styles.buttonContainer}>
                <CustomButton onClick={handleCapture} state={!modelsLoaded ? 'disabled' : 'default'}>
                  <FaCamera />
                </CustomButton>
              </div>
            </>
          ) : (
            <>
              <div className={styles.StepVideoInner}>
                <img 
                  src={photoData || ''} 
                  alt="촬영된 사진"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div className={styles.buttonContainer}>
                <CustomButton onClick={retakePhoto}>다시 찍기</CustomButton>
              </div>
            </>
          )}
        </div>
      </div>
      <div className={styles.StepFooter}>
        <CustomButton onClick={onNext} state={!isPhotoTaken ? 'disabled' : 'default'}>
          다음
        </CustomButton>
      </div>
    </>
  );
};

export default Step9;
