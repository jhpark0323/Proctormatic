import React, { useEffect, useRef, useState } from "react";
import HeaderBlue from "@/components/HeaderBlue";
import styles from "@/styles/ExamPage.module.css";
import useFaceApiModels from "@/hooks/webcamHooks/useFaceApiModels";
import useCameraStream from "@/hooks/webcamHooks/useCameraStream";
import useFaceTracking from "@/hooks/webcamHooks/useFaceTracking";
import {
  startRecording,
  stopRecording,
  uploadRecordedVideo,
} from "@/utils/handleRecording";

const ExamPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  useFaceApiModels();
  useCameraStream(videoRef);
  useFaceTracking(videoRef, canvasRef);

  const handleStartRecording = () => {
    console.log("버튼 누름");

    if (mediaRecorderRef.current) {
      setRecordedChunks([]);

      if (mediaRecorderRef.current.state === "inactive") {
        console.log("녹화를 시작합니다.");
        startRecording(mediaRecorderRef.current, setStartTime);
      } else {
        console.warn("녹화가 이미 진행 중입니다.");
      }
    } else {
      console.error("MediaRecorder가 초기화되지 않았습니다.");
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
