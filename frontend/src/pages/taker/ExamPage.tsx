import React, { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

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

                  // 얼굴의 눈, 코, 입을 검은색으로 칠하기
                  resizedDetections.forEach((detection) => {
                    const landmarks = detection.landmarks;
                    const nose = landmarks.getNose();
                    const leftEye = landmarks.getLeftEye();
                    const rightEye = landmarks.getRightEye();
                    const mouth = landmarks.getMouth();

                    context.fillStyle = "black";
                    context.globalAlpha = 0.8;

                    // 코 그리기
                    nose.forEach((point) => {
                      context.beginPath();
                      context.arc(point.x, point.y, 5, 0, Math.PI * 2);
                      context.fill();
                    });

                    // 왼쪽 눈 그리기
                    leftEye.forEach((point) => {
                      context.beginPath();
                      context.arc(point.x, point.y, 5, 0, Math.PI * 2);
                      context.fill();
                    });

                    // 오른쪽 눈 그리기
                    rightEye.forEach((point) => {
                      context.beginPath();
                      context.arc(point.x, point.y, 5, 0, Math.PI * 2);
                      context.fill();
                    });

                    // 입 그리기
                    mouth.forEach((point) => {
                      context.beginPath();
                      context.arc(point.x, point.y, 5, 0, Math.PI * 2);
                      context.fill();
                    });

                    context.globalAlpha = 1.0;
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
    <div style={{ position: "relative" }}>
      <video
        ref={videoRef}
        autoPlay
        style={{ width: "100%", height: "auto", visibility: "hidden" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default ExamPage;
