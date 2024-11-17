import { useRef } from "react";
import HeaderBlue from "@/components/HeaderBlue";
import useRecording from "@/hooks/mediapipeHooks/useRecording";
import useGazeDetection from "@/hooks/mediapipeHooks/useGazeDetection";
import useFaceMesh from "@/hooks/mediapipeHooks/useFaceMesh";
import useFaceBoundingBox from "@/hooks/mediapipeHooks/useFaceBoundingBox";

const ExamPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);

  // 녹화 관련 훅 사용
  const { handleStartRecording, handleStopRecording, downloadUrl } =
    useRecording(videoRef);

  // 시선 감지 훅 사용
  const LOOK_UP_DURATION = 5000; // 5초 동안 시선을 감지할 시간
  const { detectGaze } = useGazeDetection(LOOK_UP_DURATION);

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
      <div>
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{ width: "640px", height: "480px" }}
        />
        <canvas
          ref={faceCanvasRef}
          width="640"
          height="480"
          style={{ position: "absolute", top: 0, left: 0 }}
        />

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
      </div>
    </>
  );
};

export default ExamPage;
