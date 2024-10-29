import React, { useEffect, useRef, useState } from 'react';
import styles from '@/styles/Step.module.css';
import CustomButton from '@/components/CustomButton';
import * as faceapi from 'face-api.js';

const Step10: React.FC = () => {
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [matchPercentage, setMatchPercentage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('초기화 중...');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    initializeCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      setDebugInfo('모델 로딩 시작...');
      // 모델 로딩
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);
      setDebugInfo('모델 로딩 완료, 카메라 초기화 중...');
      setIsModelsLoaded(true);

      // 카메라 초기화
      const constraints = {
        video: {
          width: { ideal: 720 }, /* 720 */
          height: { ideal: 280 }, /* 560 */
          facingMode: 'user'
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setDebugInfo('카메라 스트림 획득 완료');
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setDebugInfo('비디오 엘리먼트에 스트림 연결 완료');
        
        // 비디오 이벤트 리스너 추가
        videoRef.current.onloadedmetadata = () => {
          setDebugInfo('비디오 메타데이터 로드됨');
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setDebugInfo('비디오 재생 시작됨');
                setIsVideoLoaded(true);
              })
              .catch(err => {
                setDebugInfo(`비디오 재생 실패: ${err.message}`);
                setError(`비디오 재생 중 오류: ${err.message}`);
              });
          }
        };

        videoRef.current.onerror = (e) => {
          setDebugInfo(`비디오 엘리먼트 에러: ${e}`);
          setError('비디오 로드 중 오류가 발생했습니다.');
        };
      } else {
        setDebugInfo('비디오 엘리먼트를 찾을 수 없음');
        setError('비디오 엘리먼트를 초기화할 수 없습니다.');
      }
    } catch (err) {
      const error = err as Error;
      setDebugInfo(`초기화 오류: ${error.message}`);
      if (error.name === 'NotAllowedError') {
        setError('카메라 접근이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
      } else if (error.name === 'NotFoundError') {
        setError('카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.');
      } else if (error.name === 'NotReadableError') {
        setError('카메라가 이미 다른 앱에서 사용 중입니다. 다른 앱을 종료하고 다시 시도해주세요.');
      } else {
        setError(`카메라 초기화 중 오류가 발생했습니다: ${error.message}`);
      }
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        const img = new Image();
        img.src = URL.createObjectURL(file);
        
        img.onload = () => {
          setDebugInfo('사진 로드 완료');
          photoRef.current = img;
        };
      }
    } catch (err) {
      console.error('Error loading photo:', err);
      setError('사진을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const compareFaces = async () => {
    try {
      setError(null);
      if (!isModelsLoaded) {
        setError('얼굴 인식 모델이 아직 로드되지 않았습니다.');
        return;
      }

      if (!videoRef.current || !photoRef.current) {
        setError('비디오와 사진이 모두 필요합니다.');
        return;
      }

      setDebugInfo('얼굴 비교 시작...');
      const detectionOptions = new faceapi.TinyFaceDetectorOptions();

      const [videoResult, photoResult] = await Promise.all([
        faceapi.detectSingleFace(videoRef.current, detectionOptions)
          .withFaceLandmarks()
          .withFaceDescriptor(),
        faceapi.detectSingleFace(photoRef.current, detectionOptions)
          .withFaceLandmarks()
          .withFaceDescriptor()
      ]);

      if (!videoResult || !photoResult) {
        setError('얼굴을 감지할 수 없습니다. 조명과 각도를 확인해주세요.');
        setMatchPercentage(null);
        return;
      }

      const distance = faceapi.euclideanDistance(videoResult.descriptor, photoResult.descriptor);
      const similarity = Math.max(0, 1 - distance);
      const percentage = Math.round(similarity * 100);
      setMatchPercentage(percentage);
      setDebugInfo('얼굴 비교 완료');
    } catch (err) {
      console.error('Error comparing faces:', err);
      setError('얼굴 비교 중 오류가 발생했습니다.');
      setMatchPercentage(null);
    }
  };

  return (
    <div className={styles.StepContainer}>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>신분증 촬영</div>
        <div className={styles.StepSubTitle}>본인 확인을 위해 신분증을 촬영해 주세요.</div>
      </div>
      
      <div className={styles.StepInner}>
        {error && (
          <div className={styles.DebugInfo}>
            {error}
          </div>
        )}

        <div className={styles.VideoContainer}>
          <video 
            ref={videoRef}
            width="720"
            height="560"
            autoPlay
            playsInline
            muted
            className={styles.Video}
          />
          {!isVideoLoaded && (
            <div className={styles.LoadingMessage}>
              카메라를 불러오는 중...
            </div>
          )}
        </div>




        <div className={styles.VideoAbout}>
          <div className={styles.DebugInfo}>
            현재 상태: {debugInfo}
          </div>

          <div className={styles.Controls}>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className={styles.FileInput}
            />
            <button 
              onClick={compareFaces}
              disabled={!isModelsLoaded || !isVideoLoaded || !photoRef.current}
              className={styles.CompareButton}
            >
              얼굴 비교하기
            </button>
          </div>

          {matchPercentage !== null && (
            <div className={styles.ResultContainer}>
              <div className={styles.MatchResult}>
                일치도: {matchPercentage}% 
                {matchPercentage >= 70 ? (
                  <span className={styles.Success}>✔️</span>
                ) : (
                  <span className={styles.Failure}>❌</span>
                )}
              </div>
            </div>
          )}
          </div>
        </div>

      <div className={styles.StepFooter}>
        <CustomButton>완료</CustomButton>
      </div>
    </div>
  );
};

export default Step10;