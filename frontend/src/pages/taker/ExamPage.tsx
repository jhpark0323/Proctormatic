import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import HeaderBlue from "@/components/HeaderBlue";
import styles from "@/styles/ExamPage.module.css";
import { formatDateAndTime } from "@/utils/handleDateTimeChange";

interface ExamPageProps {}

const ExamPage = ({}: ExamPageProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

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

        // 캔버스 스트림 생성 및 MediaRecorder 초기화
        if (canvasRef.current) {
          const canvasStream = canvasRef.current.captureStream(30);
          mediaRecorderRef.current = new MediaRecorder(canvasStream, {
            mimeType: "video/webm",
          });

          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              setRecordedChunks((prev) => [...prev, event.data]);
            }
          };

          mediaRecorderRef.current.onstop = handleUpload;
        }
      } catch (err) {
        console.error("카메라 접근에 실패했습니다:", err);
      }
    };

    const startFaceTracking = () => {
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
                  );

                  resizedDetections.forEach((detection) => {
                    const landmarks = detection.landmarks;
                    const leftEye = landmarks.getLeftEye();
                    const rightEye = landmarks.getRightEye();
                    const mouth = landmarks.getMouth();

                    const minX = Math.min(...leftEye.map((p) => p.x)) - 20;
                    const maxX = Math.max(...rightEye.map((p) => p.x)) + 20;
                    const minY = Math.min(leftEye[0].y, rightEye[0].y) - 10;
                    const maxY = Math.max(...mouth.map((p) => p.y));

                    const trapezoidWidth = maxX - minX;
                    const trapezoidHeight = maxY - minY;

                    const faceRegion = context.getImageData(
                      minX,
                      minY,
                      trapezoidWidth,
                      trapezoidHeight
                    );

                    const v = 15;
                    const smallWidth = Math.max(
                      1,
                      Math.floor(trapezoidWidth / v)
                    );
                    const smallHeight = Math.max(
                      1,
                      Math.floor(trapezoidHeight / v)
                    );

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

                      context.save();
                      context.beginPath();
                      context.moveTo(minX + 20, minY);
                      context.lineTo(maxX - 20, minY);
                      context.quadraticCurveTo(maxX, minY, maxX, minY + 20);
                      context.lineTo(maxX, maxY - 20);
                      context.quadraticCurveTo(maxX, maxY, maxX - 20, maxY);
                      context.lineTo(minX + 20, maxY);
                      context.quadraticCurveTo(minX, maxY, minX, maxY - 20);
                      context.lineTo(minX, minY + 20);
                      context.quadraticCurveTo(minX, minY, minX + 20, minY);
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

  const handleStartRecording = () => {
    if (mediaRecorderRef.current) {
      setRecordedChunks([]);
      const { time } = formatDateAndTime(new Date());
      setStartTime(time);
      mediaRecorderRef.current.start();
      console.log("녹화를 시작합니다.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      const { time } = formatDateAndTime(new Date());
      setEndTime(time);
      mediaRecorderRef.current.stop();
      console.log("녹화를 종료합니다.");
    }
  };

  const handleUpload = async () => {
    if (recordedChunks.length > 0 && startTime && endTime) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const formData = new FormData();
      formData.append("web_cam", blob, "recorded_video.webm");
      formData.append("start_time", startTime);
      formData.append("end_time", endTime);

      try {
        const response = await fetch("/taker/webcam/", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("업로드 성공");
        } else {
          console.error("업로드 실패");
        }
      } catch (err) {
        console.error("서버 통신에 실패했습니다:", err);
      }
    }
  };

  return (
    <>
      <HeaderBlue />
      <div className={styles.container}>
        <video ref={videoRef} autoPlay className={styles.video} />
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.controls}>
          <button onClick={handleStartRecording}>녹화 시작</button>
          <button onClick={handleStopRecording}>녹화 종료</button>
        </div>
      </div>
    </>
  );
};

export default ExamPage;
