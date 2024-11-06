import React, { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import HeaderBlue from "@/components/HeaderBlue";
import styles from "@/styles/ExamPage.module.css";

interface ExamPageProps {}

const ExamPage = ({}: ExamPageProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      } catch (err) {
        console.error("모델 로딩에 실패했습니다:", err);
      }
    };

    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("카메라 접근에 실패했습니다:", err);
      }
    };

    const startFaceTracking = async () => {
      if (videoRef.current) {
        videoRef.current.addEventListener("play", () => {
          if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const displaySize = {
              width: videoRef.current.videoWidth || 0,
              height: videoRef.current.videoHeight || 0,
            };
            faceapi.matchDimensions(canvas, displaySize);

            setInterval(async () => {
              if (videoRef.current) {
                const detections = await faceapi
                  .detectAllFaces(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                  )
                  .withFaceLandmarks();
                const resizedDetections = faceapi.resizeResults(
                  detections,
                  displaySize
                );
                const context = canvas.getContext("2d");
                if (context) {
                  context.clearRect(0, 0, canvas.width, canvas.height);
                  canvas.width = displaySize.width;
                  canvas.height = displaySize.height;

                  context.drawImage(
                    videoRef.current,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  ); // 비디오 배경 그리기

                  // 얼굴을 사다리꼴 모양으로 마스킹하고 모서리를 둥글게 처리하기
                  resizedDetections.forEach((detection) => {
                    const landmarks = detection.landmarks;
                    const leftEye = landmarks.getLeftEye();
                    const rightEye = landmarks.getRightEye();
                    const mouth = landmarks.getMouth();

                    // 마스킹 범위 계산 (사다리꼴 형태)
                    const minX =
                      Math.min(...leftEye.map((point) => point.x)) - 20; // 왼쪽 눈보다 조금 더 왼쪽으로 확장
                    const maxX =
                      Math.max(...rightEye.map((point) => point.x)) + 20; // 오른쪽 눈보다 조금 더 오른쪽으로 확장
                    const minY = Math.min(leftEye[0].y, rightEye[0].y) - 10; // 눈 위쪽보다 약간 위로
                    const maxY = Math.max(...mouth.map((point) => point.y)); // 입 끝 좌표

                    const trapezoidWidth = maxX - minX;
                    const trapezoidHeight = maxY - minY;
                    const borderRadius = 20; // 둥근 모서리 반경 설정

                    // 얼굴 영역 가져오기
                    const faceRegion = context.getImageData(
                      minX,
                      minY,
                      trapezoidWidth,
                      trapezoidHeight
                    );

                    // 축소 및 확대를 통한 모자이크 처리 (더 강한 모자이크)
                    const v = 15; // 모자이크 강도를 더 높임
                    const smallWidth = Math.max(
                      1,
                      Math.floor(trapezoidWidth / v)
                    );
                    const smallHeight = Math.max(
                      1,
                      Math.floor(trapezoidHeight / v)
                    );

                    // 축소
                    const smallCanvas = document.createElement("canvas");
                    smallCanvas.width = smallWidth;
                    smallCanvas.height = smallHeight;
                    const smallContext = smallCanvas.getContext("2d");
                    if (smallContext) {
                      smallContext.putImageData(faceRegion, 0, 0);
                      smallContext.drawImage(
                        canvas,
                        minX,
                        minY,
                        trapezoidWidth,
                        trapezoidHeight,
                        0,
                        0,
                        smallWidth,
                        smallHeight
                      );

                      // 확대 후 원래 영역에 그리기 (사다리꼴 마스킹 처리)
                      context.save();
                      context.beginPath();
                      context.moveTo(minX + borderRadius, minY);
                      context.lineTo(maxX - borderRadius, minY);
                      context.quadraticCurveTo(
                        maxX,
                        minY,
                        maxX,
                        minY + borderRadius
                      );
                      context.lineTo(maxX, maxY - borderRadius);
                      context.quadraticCurveTo(
                        maxX,
                        maxY,
                        maxX - borderRadius,
                        maxY
                      );
                      context.lineTo(minX + borderRadius, maxY);
                      context.quadraticCurveTo(
                        minX,
                        maxY,
                        minX,
                        maxY - borderRadius
                      );
                      context.lineTo(minX, minY + borderRadius);
                      context.quadraticCurveTo(
                        minX,
                        minY,
                        minX + borderRadius,
                        minY
                      );
                      context.clip();
                      context.drawImage(
                        smallCanvas,
                        0,
                        0,
                        smallWidth,
                        smallHeight,
                        minX,
                        minY,
                        trapezoidWidth,
                        trapezoidHeight
                      );
                      context.restore();
                    }
                  });
                }
              }
            }, 100);
          }
        });
      }
    };

    loadModels().then(() => {
      getCameraStream().then(() => {
        startFaceTracking();
      });
    });
  }, []);

  return (
    <>
      <HeaderBlue />
      <div className={styles.container}>
        <video ref={videoRef} autoPlay className={styles.video} />
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
    </>
  );
};

export default ExamPage;
