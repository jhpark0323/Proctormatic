import { useRef, useState, useEffect } from "react";
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 녹화 관련
  const {
    handleStartRecording,
    handleStopRecording,
    downloadUrl,
    mediaRecorderRef,
  } = useRecording(faceCanvasRef);

  // 시선 분석
  const { detectGaze } = useGazeDetection(recordStartTime);

  // 비식별화
  const { drawCircularMosaic } = useCircularMosaic();

  // MediaPipe Face Mesh 훅 사용
  useFaceMesh(videoRef, faceCanvasRef, recordStartTime, (results) => {
    const canvas = faceCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    if (!ctx || !video) return;

    // 캔버스 초기화 및 비디오 프레임 그리기 (얼굴이 없더라도 계속 그리기)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 얼굴 인식 결과가 없으면 함수 종료
    if (
      !results.multiFaceLandmarks ||
      results.multiFaceLandmarks.length === 0
    ) {
      console.log("얼굴이 감지되지 않았습니다.");
      return;
    }

    // 얼굴이 감지되었을 때만 랜드마크 및 모자이크 처리 등 추가 작업 수행
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
  });

  // 녹화 주기 시작 함수 (컴포넌트 마운트 시 자동 호출)
  useEffect(() => {
    const startRecordingCycle = () => {
      handleStartRecording(); // 첫 녹화 시작

      intervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current) {
          // 기존 녹화를 중지하고 새로운 녹화를 바로 시작
          handleStopRecording(); // 기존 녹화를 중지하고 비동기로 전송
          handleStartRecording(); // 바로 새로운 녹화를 시작
        }
      }, 5 * 60 * 1000); // 5분 주기 (5 * 60 * 1000ms)
      // }, 10 * 1000); // 디버깅용 10초 주기
    };

    startRecordingCycle();

    return () => {
      // 컴포넌트 언마운트 시 녹화 중지 및 타이머 제거
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      handleStopRecording();
    };
  }, []); // 빈 배열을 두어 컴포넌트가 마운트될 때 한 번만 실행

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
            display: "none",
          }}
        />
      </div>

      {/* 녹화 영상 확인용 다운로드 버튼 */}
      {/* <div style={{ marginTop: "20px" }}>
        {downloadUrl && (
          <a href={downloadUrl} download="recorded_video.webm">
            녹화된 영상 다운로드
          </a>
        )}
      </div> */}
    </>
  );
};

export default ExamPage;
