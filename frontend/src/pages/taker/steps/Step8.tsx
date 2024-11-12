import React, { useRef, useEffect, useCallback, useState } from "react";
import * as faceapi from "face-api.js";
import styles from "@/styles/Step.module.css";
import CustomButton from "@/components/CustomButton";
import { usePhotoStore } from "@/store/usePhotoStore";
import { CustomToast } from "@/components/CustomToast";
import { FaCamera } from "react-icons/fa";

const Step8: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { photoStep8, setPhotoStep8 } = usePhotoStore();
  const [isPhotoTaken, setIsPhotoTaken] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const startWebcam = async () => {
    if (
      !stream &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    ) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError(null);
      } catch (error) {
        setError("웹캠을 사용할 수 없습니다. 카메라 접근 권한을 확인해주세요.");
      }
    }
  };

  const loadModels = async () => {
    const MODEL_URL = "https://k11s209.p.ssafy.io/dist/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    setModelsLoaded(true);
  };

  useEffect(() => {
    loadModels();
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

  const capturePhoto = useCallback(async () => {
    if (!isVideoLoaded || !modelsLoaded) return;

    if (videoRef.current && photoCanvasRef.current) {
      const context = photoCanvasRef.current.getContext("2d");
      if (context) {
        const video = videoRef.current;
        const canvas = photoCanvasRef.current;

        const videoAspectRatio = video.videoWidth / video.videoHeight;
        canvas.width = 640;
        canvas.height = canvas.width / videoAspectRatio;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageDataUrl = canvas.toDataURL("image/png");

        const img = new Image();
        img.src = imageDataUrl;
        img.onload = async () => {
          const detections = await faceapi.detectAllFaces(
            img,
            new faceapi.TinyFaceDetectorOptions()
          );

          if (detections.length > 0) {
            setPhotoStep8(imageDataUrl);
            setIsPhotoTaken(true);

            if (stream) {
              stream.getTracks().forEach((track) => track.stop());
              setStream(null);
            }
          } else {
            CustomToast("얼굴 인식에 실패했습니다. 다시 촬영해 주세요.");
            setIsPhotoTaken(false);
          }
        };
      }
    }
  }, [isVideoLoaded, stream, setPhotoStep8, modelsLoaded]);

  const retakePhoto = useCallback(() => {
    setIsPhotoTaken(false);
    setPhotoStep8(null);
    setIsVideoLoaded(false);
    setError(null);
  }, [setPhotoStep8]);

  return (
    <>
      <div className={styles.StepTitleBox}>
        <div className={styles.StepTitle}>본인 사진 촬영</div>
        <div className={styles.StepSubTitle}>
          본인 확인을 위해 셀프 이미지를 촬영해요.
        </div>
      </div>
      <div className={styles.StepInner}>
        <div className={styles.StepVideo}>
          {error && <div className="text-red-500 p-4 text-center">{error}</div>}
          {!isPhotoTaken ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={styles.StepVideoInner}
                onLoadedMetadata={() => setIsVideoLoaded(true)}
              />
              <canvas ref={photoCanvasRef} style={{ display: "none" }} />
              <div className={styles.buttonContainer}>
                <CustomButton
                  onClick={capturePhoto}
                  state={
                    !isVideoLoaded || !modelsLoaded ? "disabled" : "default"
                  }
                >
                  <FaCamera color="white" />
                </CustomButton>
              </div>
            </>
          ) : (
            <>
              <div className={styles.StepVideoInner}>
                <img
                  src={photoStep8 || ""}
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

export default Step8;
