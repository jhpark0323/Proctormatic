import React, { useCallback, useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import styles from "@/styles/Step.module.css";
import CustomButton from "@/components/CustomButton";
import { usePhotoStore } from "@/store/usePhotoStore";
import { FaCamera } from "react-icons/fa";
import useOCR from "@/hooks/OCR";
import { CustomToast } from "@/components/CustomToast";
import { useTakerStore } from "@/store/TakerAuthStore";

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
  const { birth, setBirth } = useTakerStore();
  const { maskedIDPhoto } = useOCR();

  // 얼굴 인식 모델 로드 함수
  const loadModels = async () => {
    const MODEL_URL = "/models";
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
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
      const context = canvas.getContext("2d");

      if (context) {
        const cropWidth = video.videoWidth * 0.7;
        const cropHeight = video.videoHeight * 0.6;
        const startX = (video.videoWidth - cropWidth) / 2;
        const startY = (video.videoHeight - cropHeight) / 2;

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        context.drawImage(
          video,
          startX,
          startY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );

        const capturedData = canvas.toDataURL("image/png");
        setPhotoData(capturedData);
        setIsPhotoTaken(true);
        return capturedData;
      }
    }
    return null;
  };

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
          setPhotoStep9(capturedPhoto);
        } else {
          CustomToast("얼굴이 인식되지 않았습니다.");
          setIsPhotoTaken(false);
          setPhotoData(null);
          startWebcam();
        }
      };
    } else {
      CustomToast("다시 시도해주세요.");
    }
  }, [modelsLoaded, setPhotoStep9]);

  const retakePhoto = useCallback(() => {
    setIsPhotoTaken(false);
    setPhotoData(null);
    startWebcam();
  }, []);

  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>신분증 촬영</div>
        <div className={styles.StepSubTitle}>
          본인 확인을 위해 신분증을 촬영해 주세요.
        </div>
      </div>
      <div className={styles.StepInner}>
        <div className={styles.StepVideo}>
          {!isPhotoTaken ? (
            <>
              <div className={styles.VideoContainer}>
                <div className={styles.IDcardLine} />
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={styles.StepVideoInner}
                />
              </div>
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <div className={styles.buttonContainer}>
                <CustomButton
                  onClick={handleCapture}
                  state={!modelsLoaded ? "disabled" : "default"}
                >
                  <FaCamera />
                </CustomButton>
              </div>
            </>
          ) : (
            <>
              <div className={styles.StepVideoInner}>
                <img
                  src={photoData || ""}
                  alt="촬영된 사진"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div className={styles.buttonContainer}>
                <CustomButton onClick={retakePhoto}>다시 찍기</CustomButton>
              </div>
            </>
          )}
        </div>
      </div>

      {maskedIDPhoto && (
        <div>
          {/* <img src={maskedIDPhoto} alt="" /> */}
          <div className={styles.InputContainer}>
            <label>생년월일 입력</label>
            <input
              type="text"
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
              placeholder="YYYYMMDD 형식으로 입력"
              className={styles.InputField}
            />
          </div>
        </div>
      )}

      <div className={styles.StepFooter}>
        <CustomButton
          onClick={onNext}
          state={!isPhotoTaken ? "disabled" : "default"}
        >
          다음
        </CustomButton>
      </div>
    </>
  );
};

export default Step9;
