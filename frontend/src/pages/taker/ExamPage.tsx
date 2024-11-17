import { useEffect, useRef, useState } from "react";
import HeaderBlue from "@/components/HeaderBlue";
import useRecording from "@/hooks/mediapipeHooks/useRecording";
import useGazeDetection from "@/hooks/mediapipeHooks/useGazeDetection";
import useFaceMesh from "@/hooks/mediapipeHooks/useFaceMesh";
import useFaceBoundingBox from "@/hooks/mediapipeHooks/useFaceBoundingBox";

const ExamPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const [recordStartTime, setRecordStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (recordStartTime === null) {
      // recordStartTime이 설정되지 않았을 때만 설정
      const currentTime = new Date();
      setRecordStartTime(currentTime);
      console.log(currentTime.toString());
    }
  }, []);

  // 녹화 관련 훅 사용
  const { handleStartRecording, handleStopRecording, downloadUrl } =
    useRecording(videoRef);

  // 시선 감지 훅 사용
  const { detectGaze } = useGazeDetection(recordStartTime);

  // MediaPipe Face Mesh 훅 사용
  useFaceMesh(videoRef, faceCanvasRef, (results) => {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0)
      return;

    const canvas = faceCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    const video = videoRef.current;

    if (ctx && video) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const landmarks = results.multiFaceLandmarks[0];

      // 얼굴 모자이크 처리
      const boundingBox = useFaceBoundingBox(landmarks, canvas);
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height
      );

      // 시선 감지 로직
      detectGaze(landmarks, ctx);
    }
  });

  return (
    <>
      <HeaderBlue />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{ width: "800px", height: "600px" }}
        />
        <canvas
          ref={faceCanvasRef}
          style={{
            width: "800px",
            height: "600px",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>

      {/* 녹화 버튼 */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleStartRecording}>녹화 시작</button>
        <button onClick={handleStopRecording}>녹화 종료</button>
        {downloadUrl && (
          <a href={downloadUrl} download="recorded_video.webm">
            녹화된 영상 다운로드
          </a>
        )}
      </div>
    </>
  );
};

export default ExamPage;
