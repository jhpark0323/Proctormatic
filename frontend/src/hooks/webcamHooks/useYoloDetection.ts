import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

const modelName = "yolov8n";

interface UseYoloDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const useYoloDetection = ({ videoRef, canvasRef }: UseYoloDetectionProps) => {
  const [model, setModel] = useState<tf.GraphModel | null>(null);

  // YOLO 모델 로드
  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const yolov8 = await tf.loadGraphModel(
        `${window.location.origin}/${modelName}_web_model/model.json`,
        {
          onProgress: (fractions) => {
            console.log(`모델 로딩 중: ${(fractions * 100).toFixed(2)}%`);
          },
        }
      );
      setModel(yolov8);
    };
    loadModel();
  }, []);

  // 객체 인식 수행
  const detectObjects = async () => {
    if (model && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      const inputTensor = tf.browser.fromPixels(video).expandDims(0);
      const predictions = model.execute(inputTensor) as tf.Tensor;
      const [boxes, scores, classes] = predictions.arraySync();

      // 캔버스에 결과 그리기
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < boxes.length; i++) {
        const [x1, y1, x2, y2] = boxes[i];
        context.strokeStyle = "red";
        context.lineWidth = 2;
        context.strokeRect(x1, y1, x2 - x1, y2 - y1);
      }

      tf.dispose(inputTensor);
      tf.dispose(predictions);
    }
  };

  // 주기적으로 객체 인식 실행
  useEffect(() => {
    const intervalId = setInterval(detectObjects, 2000);
    return () => clearInterval(intervalId);
  }, [model]);

  return { model, detectObjects };
};

export default useYoloDetection;
