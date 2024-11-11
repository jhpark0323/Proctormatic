import React, { useEffect, useRef, useState } from "react";
import HeaderBlue from "@/components/HeaderBlue";
import styles from "@/styles/ExamPage.module.css";
import useFaceApiModels from "@/hooks/webcamHooks/useFaceApiModels";
import useFaceTracking from "@/hooks/webcamHooks/useFaceTracking";
import { startRecording, stopRecording } from "@/utils/handleRecording";

const ExamPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  useFaceApiModels();
  useFaceTracking(videoRef, canvasRef);

  // 카메라 스트림 설정 및 MediaRecorder 초기화
  useEffect(() => {
    const initializeMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // MediaRecorder 초기화
          mediaRecorderRef.current = new MediaRecorder(stream, {
            mimeType: "video/webm",
          });

          // 녹화된 데이터 조각 저장
          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              setRecordedChunks((prev) => [...prev, event.data]);
            }
          };
        }
      } catch (err) {
        console.error("카메라 접근에 실패했습니다:", err);
      }
    };

    initializeMediaRecorder();
  }, []);

  const handleStartRecording = () => {
    console.log("녹화 시작 버튼 클릭");
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "inactive"
    ) {
      setRecordedChunks([]); // 녹화된 조각 초기화
      startRecording(mediaRecorderRef.current, setStartTime);
    } else {
      console.error(
        "MediaRecorder가 초기화되지 않았거나 녹화가 이미 진행 중입니다."
      );
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      stopRecording(
        mediaRecorderRef.current,
        setEndTime,
        recordedChunks,
        startTime,
        endTime
      );
    } else {
      console.error("MediaRecorder가 초기화되지 않았습니다.");
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
