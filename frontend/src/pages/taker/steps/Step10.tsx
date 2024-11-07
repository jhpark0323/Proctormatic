import React, { useEffect, useState, useCallback } from "react";
import styles from "@/styles/Step.module.css";
import CustomButton from "@/components/CustomButton";
import { usePhotoStore } from "@/store/usePhotoStore";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";
import { useTakerStore } from "@/store/TakerAuthStore";

const Step10 = ({ modelsLoaded }: { modelsLoaded: boolean }) => {
  const { photoStep8, photoStep9 } = usePhotoStore();
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const { testId } = useTakerStore();
  const navigate = useNavigate();

  // 유사도 계산 함수
  const calculateSimilarity = useCallback(async () => {
    if (!modelsLoaded || !photoStep8 || !photoStep9) return;

    try {
      setIsLoading(true);
      setAnalysisError(null);

      const [img1, img2] = await Promise.all([
        faceapi.fetchImage(photoStep8),
        faceapi.fetchImage(photoStep9),
      ]);

      const [desc1, desc2] = await Promise.all([
        faceapi.detectSingleFace(img1).withFaceLandmarks().withFaceDescriptor(),
        faceapi.detectSingleFace(img2).withFaceLandmarks().withFaceDescriptor(),
      ]);

      if (!desc1 || !desc2) {
        throw new Error("일부 이미지에서 얼굴을 감지할 수 없습니다.");
      }

      const distance = faceapi.euclideanDistance(
        desc1.descriptor,
        desc2.descriptor
      );
      setSimilarity(parseFloat(((1 - distance) * 100).toFixed(2)));
    } catch (error) {
      console.error("Error calculating similarity:", error);
      setAnalysisError("얼굴 분석 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [modelsLoaded, photoStep8, photoStep9]);

  // 모델이 로드된 후와 사진이 준비되면 유사도 계산
  useEffect(() => {
    if (modelsLoaded && photoStep8 && photoStep9) {
      calculateSimilarity();
    }
  }, [modelsLoaded, photoStep8, photoStep9, calculateSimilarity]);

  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>AI 본인 인증</div>
        <div className={styles.StepSubTitle}>
          촬영하신 사진과 신분증을 AI가 분석 후 유사도를 분석합니다
        </div>
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
              <img
                src={photoStep9}
                alt="신분증 사진"
                className={styles.photo}
              />
            </div>
          )}
        </div>

        {analysisError && (
          <div className={styles.errorMessage}>{analysisError}</div>
        )}

        {isLoading && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <div className={styles.loadingMessage}>
              AI가 사진과 신분증을 대조하여 분석 중입니다
            </div>
          </div>
        )}

        {!isLoading && similarity !== null && (
          <div className={styles.similarityResult}>유사도: {similarity}%</div>
        )}
      </div>
      <div className={styles.StepFooter}>
        <CustomButton
          state={!similarity || isLoading ? "disabled" : "default"}
          onClick={() => navigate(`/taker/${testId}`)}
        >
          시험 입실하기
        </CustomButton>
      </div>
    </>
  );
};

export default Step10;
