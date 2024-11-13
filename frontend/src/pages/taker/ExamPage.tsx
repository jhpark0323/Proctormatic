import React, { useEffect, useRef, useState } from "react";
import useFaceApiModels from "@/hooks/webcamHooks/useFaceApiModels";
import useFaceTracking from "@/hooks/webcamHooks/useFaceTracking";
import useCameraStream from "@/hooks/webcamHooks/useCameraStream";
import useOnnxInference from "@/hooks/webcamHooks/useOnnxInference";
import useYoloPostProcessing from "@/hooks/webcamHooks/useYoloPostProcessing";
import { startRecording, stopRecording } from "@/utils/handleRecording";
import HeaderBlue from "@/components/HeaderBlue";

const ExamPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement>(null); // 비식별화용 캔버스
  const onnxCanvasRef = useRef<HTMLCanvasElement>(null); // 객체 인식용 캔버스
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [startTime, setStartTime] = useState<string | null>(null);

  // 1. 웹캠 스트림 초기화
  useCameraStream(videoRef);
  useEffect(() => {
    const initializeMediaRecorder = async () => {
      if (faceCanvasRef.current) {
        const stream = faceCanvasRef.current.captureStream(30); // 초당 30프레임으로 스트림 생성
        if (stream) {
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: "video/webm",
          });

          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };

          mediaRecorderRef.current = mediaRecorder;
          console.log("MediaRecorder 초기화 완료");
        }
      }
    };

    initializeMediaRecorder();
  }, [faceCanvasRef.current]);

  // 2. Face API 모델 로드 및 비식별화 적용
  useFaceApiModels();
  useFaceTracking(videoRef, faceCanvasRef);

  // 3. ONNX 모델 로드 및 추론
  const {
    output,
    runOnnxInference,
    onnxCanvasRef: onnxCanvas,
  } = useOnnxInference(videoRef);
  const { processedResults } = useYoloPostProcessing(output);

  // 4. 주기적으로 ONNX 추론 실행 (2번 캔버스는 비공개)
  useEffect(() => {
    if (onnxCanvasRef.current) {
      console.log("ONNX 캔버스 초기화 완료");
      const onnxInterval = setInterval(runOnnxInference, 2000);
      return () => clearInterval(onnxInterval);
    }
  }, [onnxCanvasRef.current]);

  // 5. 녹화 기능
  const handleStartRecording = () => {
    if (mediaRecorderRef.current) {
      startRecording(mediaRecorderRef.current, setStartTime, recordedChunksRef);
    }
  };

  // const handleStopRecording = () => {
  //   if (mediaRecorderRef.current) {
  //     stopRecording(mediaRecorderRef.current, recordedChunksRef, startTime);
  //   }
  // };

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
        {/* 1번 캔버스: 비식별화된 영상 (녹화 대상) */}
        <canvas
          ref={faceCanvasRef}
          style={{ position: "absolute", top: 0, left: 0 }}
        />

        {/* 2번 캔버스: 객체 인식 (화면에 표시하지 않음) */}
        <canvas ref={onnxCanvasRef} style={{ display: "none" }} />

        {/* 객체 인식 결과 출력 */}
        <div style={{ marginTop: "20px" }}>
          {processedResults.length > 0 && (
            <div>
              <h3>검출된 객체:</h3>
              <ul>
                {processedResults.map((result, index) => (
                  <li key={index}>
                    {`클래스: ${result.classId}, 신뢰도: ${(
                      result.confidence * 100
                    ).toFixed(2)}%, 좌표: [${result.bbox}]`}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
      </div>
    </>
  );
};

export default ExamPage;
