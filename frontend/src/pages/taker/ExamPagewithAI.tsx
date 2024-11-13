// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";
// import * as ort from "onnxruntime-web";
// import useFaceTracking from "@/hooks/webcamHooks/useFaceTracking";
// import useFaceApiModels from "@/hooks/webcamHooks/useFaceApiModels";
// import useCameraStream from "@/hooks/webcamHooks/useCameraStream";
// import { startRecording, stopRecording } from "@/utils/handleRecording";

// ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/";

// const ExamPage = () => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const faceCanvasRef = useRef<HTMLCanvasElement>(null); // 얼굴 비식별화용 캔버스
//   const onnxCanvasRef = useRef<HTMLCanvasElement>(null); // ONNX 추론용 캔버스

//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const recordedChunksRef = useRef<Blob[]>([]);
//   const [startTime, setStartTime] = useState<string | null>(null);
//   const [session, setSession] = useState<ort.InferenceSession | null>(null);
//   const [output, setOutput] = useState<any>(null);
//   const [modelsLoaded, setModelsLoaded] = useState(false);

//   // 1. Face API 모델 로드
//   useFaceApiModels();
//   // 2. 웹캠 스트림 초기화
//   useCameraStream(videoRef);
//   // 3. 얼굴 비식별화 처리
//   useFaceTracking(videoRef, faceCanvasRef);

//   // 4. ONNX 모델 로드
//   useEffect(() => {
//     const loadModel = async () => {
//       try {
//         const modelPath = "/models/epochs10_simplified.onnx";
//         const newSession = await ort.InferenceSession.create(modelPath);
//         setSession(newSession);
//         console.log("ONNX 모델 로드 완료");
//       } catch (error) {
//         console.error("ONNX 모델 로드 실패:", error);
//       }
//     };
//     loadModel();
//   }, []);

//   // ONNX 추론 실행
//   const runOnnxInference = async () => {
//     if (!session || !videoRef.current || !onnxCanvasRef.current) return;

//     const canvas = onnxCanvasRef.current;
//     const ctx = canvas.getContext("2d");
//     const video = videoRef.current;

//     canvas.width = 640;
//     canvas.height = 480;
//     ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
//     const inputTensor = new ort.Tensor(
//       "float32",
//       Float32Array.from(imageData.data),
//       [1, 3, 640, 640]
//     );
//     try {
//       const feeds = { input: inputTensor };
//       const results = await session.run(feeds);
//       setOutput(results["output"]?.data);
//     } catch (error) {
//       console.error("ONNX 추론 실패:", error);
//     }
//   };

//   useEffect(() => {
//     const onnxInterval = setInterval(runOnnxInference, 1500);
//     return () => {
//       clearInterval(onnxInterval);
//     };
//   }, [modelsLoaded, session]);

//   const handleStartRecording = () => {
//     if (mediaRecorderRef.current) {
//       startRecording(mediaRecorderRef.current, setStartTime, recordedChunksRef);
//     }
//   };

//   const handleStopRecording = () => {
//     if (mediaRecorderRef.current) {
//       stopRecording(mediaRecorderRef.current, recordedChunksRef, startTime);
//     }
//   };

//   return (
//     <div>
//       {/* 웹캠 스트림 출력 */}
//       <video
//         ref={videoRef}
//         autoPlay
//         muted
//         style={{ width: "640px", height: "480px" }}
//       />
//       {/* 얼굴 비식별화 및 추론 결과를 표시할 캔버스 */}
//       <canvas
//         ref={faceCanvasRef}
//         style={{ position: "absolute", top: 0, left: 0 }}
//       />
//       <canvas
//         ref={onnxCanvasRef}
//         style={{ position: "absolute", top: 0, left: 0, display: "none" }}
//       />

//       {/* ONNX 추론 결과 출력 */}
//       {output && <pre>{JSON.stringify(output, null, 2)}</pre>}

//       {/* 녹화 버튼 */}
//       <div style={{ marginTop: "20px" }}>
//         <button onClick={handleStartRecording}>녹화 시작</button>
//         <button onClick={handleStopRecording}>녹화 종료</button>
//       </div>
//     </div>
//   );
// };

// export default ExamPage;

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import * as ort from "onnxruntime-web";
import useFaceApiModels from "@/hooks/webcamHooks/useFaceApiModels";
import useCameraStream from "@/hooks/webcamHooks/useCameraStream";
import { startRecording, stopRecording } from "@/utils/handleRecording";

ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/";

const ExamPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const onnxCanvasRef = useRef<HTMLCanvasElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [output, setOutput] = useState<any>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // 1. Face API 모델 로드
  useFaceApiModels();
  // 2. 웹캠 스트림 초기화
  useCameraStream(videoRef);

  // 3. ONNX 모델 로드
  useEffect(() => {
    const loadModel = async () => {
      try {
        const modelPath = "/models/epochs10_simplified.onnx";
        const newSession = await ort.InferenceSession.create(modelPath);
        setSession(newSession);
        console.log("ONNX 모델 로드 완료");
      } catch (error) {
        console.error("ONNX 모델 로드 실패:", error);
      }
    };
    loadModel();
  }, []);

  // 얼굴 비식별화 실행
  const runFaceDetection = async () => {
    if (!modelsLoaded || !videoRef.current || !faceCanvasRef.current) return;

    const canvas = faceCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    canvas.width = 640;
    canvas.height = 480;
    ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);

    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );

    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    detections.forEach((detection) => {
      const { x, y, width, height } = detection.box;
      ctx!.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx!.fillRect(x, y, width, height);
    });
  };

  // ONNX 추론 실행
  const runOnnxInference = async () => {
    if (!session || !videoRef.current || !onnxCanvasRef.current) return;

    const canvas = onnxCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    canvas.width = 640;
    canvas.height = 480;
    ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
    const inputTensor = new ort.Tensor(
      "float32",
      Float32Array.from(imageData.data),
      [1, 3, 640, 640]
    );
    try {
      const feeds = { input: inputTensor };
      const results = await session.run(feeds);
      setOutput(results["output"]?.data);
    } catch (error) {
      console.error("ONNX 추론 실패:", error);
    }
  };

  // 얼굴 비식별화와 ONNX 추론을 서로 다른 주기로 실행
  useEffect(() => {
    const faceInterval = setInterval(runFaceDetection, 500); // 0.5초마다 얼굴 감지
    const onnxInterval = setInterval(runOnnxInference, 2000); // 2초마다 ONNX 추론
    return () => {
      clearInterval(faceInterval);
      clearInterval(onnxInterval);
    };
  }, [modelsLoaded, session]);

  const handleStartRecording = () => {
    if (mediaRecorderRef.current) {
      startRecording(mediaRecorderRef.current, setStartTime, recordedChunksRef);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      stopRecording(mediaRecorderRef.current, recordedChunksRef, startTime);
    }
  };

  return (
    <div>
      {/* 웹캠 스트림 출력 */}
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: "640px", height: "480px" }}
      />
      {/* 얼굴 비식별화 및 추론 결과를 표시할 캔버스 */}
      <canvas
        ref={faceCanvasRef}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <canvas
        ref={onnxCanvasRef}
        style={{ position: "absolute", top: 0, left: 0, display: "none" }}
      />

      {/* ONNX 추론 결과 출력 */}
      {output && <pre>{JSON.stringify(output, null, 2)}</pre>}

      {/* 녹화 버튼 */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleStartRecording}>녹화 시작</button>
        <button onClick={handleStopRecording}>녹화 종료</button>
      </div>
    </div>
  );
};

export default ExamPage;
