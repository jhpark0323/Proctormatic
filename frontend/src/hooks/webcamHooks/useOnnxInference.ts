import { useEffect, useState, useRef } from "react";
import * as ort from "onnxruntime-web";
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/";

const useOnnxInference = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [output, setOutput] = useState<any>(null);
  const onnxCanvasRef = useRef<HTMLCanvasElement>(null);

  // ONNX 모델 로드
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

  // ONNX 추론 실행
  const runOnnxInference = async () => {
    if (!session) {
      console.error("ONNX 세션이 초기화되지 않았습니다.");
      return;
    }
    if (!videoRef.current) {
      console.error("비디오 요소가 존재하지 않습니다.");
      return;
    }
    if (!onnxCanvasRef.current) {
      console.error("ONNX 캔버스가 초기화되지 않았습니다.");
      return;
    }

    console.log("ONNX 추론 준비 완료");

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

  return { output, runOnnxInference, onnxCanvasRef };
};

export default useOnnxInference;
