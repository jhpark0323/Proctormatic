import { useEffect, useState, useRef } from "react";
import * as ort from "onnxruntime-web";
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/";

const useOnnxInference = (
  videoRef: React.RefObject<HTMLVideoElement>,
  onnxCanvasRef: React.RefObject<HTMLCanvasElement>
) => {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [output, setOutput] = useState<any>(null);

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
    if (!session || !videoRef.current || !onnxCanvasRef.current) {
      console.error(
        "ONNX 세션 또는 비디오, 캔버스 요소가 초기화되지 않았습니다."
      );
      return;
    }

    const canvas = onnxCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    canvas.width = 640;
    canvas.height = 480;

    const performInference = async () => {
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

      // 다음 프레임 요청
      requestAnimationFrame(performInference);
    };

    // 첫 번째 프레임 요청
    requestAnimationFrame(performInference);
  };

  return { session, output, runOnnxInference, onnxCanvasRef };
};

export default useOnnxInference;
