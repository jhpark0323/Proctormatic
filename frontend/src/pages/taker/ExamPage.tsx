import { useRef, useState } from "react";
import HeaderBlue from "@/components/HeaderBlue";
import useRecording from "@/hooks/mediapipeHooks/useRecording";
import useGazeDetection from "@/hooks/mediapipeHooks/useGazeDetection";
import useFaceMesh from "@/hooks/mediapipeHooks/useFaceMesh";
import useCircularMosaic from "@/hooks/mediapipeHooks/useCircularMosaic";
import {
  FACEMESH_LEFT_EYE,
  FACEMESH_RIGHT_EYE,
  FACEMESH_LIPS,
} from "@mediapipe/face_mesh";

const ExamPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const [recordStartTime, setRecordStartTime] = useState<Date>(new Date());

  // 녹화 관련
  const { handleStartRecording, handleStopRecording, downloadUrl } =
    useRecording(videoRef);

  // 시선 분석
  const { detectGaze } = useGazeDetection(recordStartTime);

  // 비식별화
  const { drawCircularMosaic } = useCircularMosaic();

  // MediaPipe Face Mesh 훅 사용
  useFaceMesh(videoRef, faceCanvasRef, (results) => {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0)
      return;

    const canvas = faceCanvasRef.current!;
    const ctx = canvas?.getContext("2d");
    const video = videoRef.current;

    if (ctx && video) {
      // 캔버스 초기화 및 비디오 프레임 그리기
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const landmarks = results.multiFaceLandmarks[0];

      // 눈, 코, 입을 포함한 모든 랜드마크 가져오기
      const allPoints = [
        ...FACEMESH_LEFT_EYE.map(([index]) => landmarks[index]),
        ...FACEMESH_RIGHT_EYE.map(([index]) => landmarks[index]),
        ...FACEMESH_LIPS.map(([index]) => landmarks[index]),
      ];

      // 하나의 큰 원으로 모자이크 처리
      drawCircularMosaic(ctx, allPoints);

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
          width="800"
          height="600"
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
