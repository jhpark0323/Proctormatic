import { useEffect, useState } from "react";
import * as ort from "onnxruntime-web";

type InferenceResult = ort.Tensor | null;

const useOnnxModel = (modelPath: string) => {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [output, setOutput] = useState<InferenceResult>(null);

  // 모델 로드
  useEffect(() => {
    const loadModel = async () => {
      try {
        const newSession = await ort.InferenceSession.create(modelPath);
        setSession(newSession);
        setLoading(false);
        console.log("ONNX 모델이 성공적으로 로드됨");
      } catch (error) {
        console.error("ONNX 모델 로드 실패:", error);
        setLoading(false);
      }
    };

    loadModel();
  }, [modelPath]);

  // 추론 실행 함수
  const runInference = async (
    inputData: Float32Array,
    inputShape: number[]
  ) => {
    if (!session) {
      console.error("모델 세션이 초기화되지 않음");
      return null;
    }
    try {
      const inputTensor = new ort.Tensor("float32", inputData, inputShape);
      const feeds = { input: inputTensor };
      const results = await session.run(feeds);
      const output = results[Object.keys(results)[0]];
      setOutput(output);
      return output;
    } catch (error) {
      console.error("ONNX 추론 실패:", error);
      return null;
    }
  };

  return { loading, output, runInference };
};

export default useOnnxModel;
