import React, { useEffect, useState, useCallback } from 'react';
import styles from '@/styles/Step.module.css';
import CustomButton from '@/components/CustomButton';
import { usePhotoStore } from '@/store/usePhotoStore';
import * as faceapi from 'face-api.js';

const Step10 = () => {
  const { photoStep8, photoStep9 } = usePhotoStore();
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // 필요한 모델만 로드하도록 최적화된 코드
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadModels();
  }, []);

  // 유사도 계산 함수
  const calculateSimilarity = useCallback(async () => {
    if (!modelsLoaded || !photoStep8 || !photoStep9) return;

    setIsLoading(true);
    try {
      // 두 이미지를 Face API로 가져오기
      const [img1, img2] = await Promise.all([
        faceapi.fetchImage(photoStep8),
        faceapi.fetchImage(photoStep9)
      ]);

      // 얼굴과 디스크립터 탐지
      const [desc1, desc2] = await Promise.all([
        faceapi.detectSingleFace(img1).withFaceLandmarks().withFaceDescriptor(),
        faceapi.detectSingleFace(img2).withFaceLandmarks().withFaceDescriptor()
      ]);

      // 유사도 계산
      if (desc1 && desc2) {
        const distance = faceapi.euclideanDistance(desc1.descriptor, desc2.descriptor);
        const similarityScore = ((1 - distance) * 100).toFixed(2);
        setSimilarity(parseFloat(similarityScore));
      } else {
        console.warn("Face descriptors not found in one or both images.");
        setSimilarity(null);
      }
    } catch (error) {
      console.error("Error calculating similarity:", error);
      setSimilarity(null);
    } finally {
      setIsLoading(false);
    }
  }, [modelsLoaded, photoStep8, photoStep9]);

  // 모델이 로드되고 사진이 준비되면 유사도 계산
  useEffect(() => {
    if (modelsLoaded && photoStep8 && photoStep9) {
      calculateSimilarity();
    }
  }, [modelsLoaded, photoStep8, photoStep9, calculateSimilarity]);

  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>AI 본인 인증</div>
        <div className={styles.StepSubTitle}>촬영하신 사진과 신분증을 AI가 분석 후 유사도를 분석합니다</div>
      </div>
      <div className={styles.StepInner}>
        <div className={styles.photoContainer}>
          {photoStep8 && (
            <div>
              <h3>본인 사진</h3>
              <img src={photoStep8} alt="본인 사진" className={styles.photo} />
            </div>
          )}
          {photoStep9 && (
            <div>
              <h3>신분증 사진</h3>
              <img src={photoStep9} alt="신분증 사진" className={styles.photo} />
            </div>
          )}
        </div>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <div className={styles.loadingMessage}>AI가 사진과 신분증을 대조하여 분석 중입니다</div>
          </div>
        ) : (
          similarity !== null && (
            <div className={styles.similarityResult}>유사도: {similarity}%</div>
          )
        )}
      </div>
      <div className={styles.StepFooter}>
        <CustomButton state={!similarity ? 'disabled' : 'default'}>
          시험 입실하기
        </CustomButton>
      </div>
    </>
  );
};

export default Step10;
