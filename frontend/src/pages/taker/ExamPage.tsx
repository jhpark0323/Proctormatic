import { useEffect, useRef, useState } from "react";
import useFaceApiModels from "@/hooks/webcamHooks/useFaceApiModels";
import useFaceTracking from "@/hooks/webcamHooks/useFaceTracking";
import useCameraStream from "@/hooks/webcamHooks/useCameraStream";
import { startRecording, stopRecording } from "@/utils/handleRecording";
import HeaderBlue from "@/components/HeaderBlue";

const ExamPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [startTime, setStartTime] = useState<string | null>(null);

  // 1. 웹캠 스트림 초기화
  useCameraStream(videoRef);

  // 2. Face API 모델 로드 및 비식별화 적용
  useFaceApiModels();
  useFaceTracking(videoRef, faceCanvasRef);

  // 5. 녹화 기능
  const handleStartRecording = () => {
    if (mediaRecorderRef.current) {
      startRecording(mediaRecorderRef.current, setStartTime, recordedChunksRef);
    }
  };

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
              recordedChunksRef.current.push(event.data);
              console.log("새로운 데이터 청크 추가됨:", event.data);
            }
          };
        }
      } catch (err) {
        console.error("카메라 접근에 실패했습니다:", err);
      }
    };
    initializeMediaRecorder();
  }, []);

  // 디버깅용 다운로드
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      stopRecording(mediaRecorderRef.current, recordedChunksRef, startTime);

      mediaRecorderRef.current.onstop = () => {
        if (recordedChunksRef.current.length > 0) {
          const webmBlob = new Blob(recordedChunksRef.current, {
            type: "video/webm",
          });
          const url = URL.createObjectURL(webmBlob);
          setDownloadUrl(url);
        }
      };
      recordedChunksRef.current = [];
    }
  };

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
