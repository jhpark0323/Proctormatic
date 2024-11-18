import { useEffect } from "react";
import { usePhotoStore } from "@/store/usePhotoStore";
import * as faceapi from "face-api.js";
import Tesseract from "tesseract.js";

interface LoggerInfo {
  status: string;
  progress: number;
}

const useOCR = () => {
  const { photoStep9, setMaskedIDPhoto } = usePhotoStore();

  const preprocessImage = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3; // 그레이스케일 변환
      data[i] = avg;      // Red
      data[i + 1] = avg;  // Green
      data[i + 2] = avg;  // Blue
    }

    context.putImageData(imageData, 0, 0);
  };

  useEffect(() => {
    const processPhoto = async () => {
      if (photoStep9) {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

        const img = new Image();
        img.src = photoStep9;

        img.onload = async () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const context = canvas.getContext("2d");

          if (context) {
            context.drawImage(img, 0, 0, img.width, img.height);

            // 이미지 전처리
            preprocessImage(canvas, context);

            // 얼굴 탐지 및 마스킹
            const detections = await faceapi.detectAllFaces(
              img,
              new faceapi.TinyFaceDetectorOptions()
            );

            detections.forEach((detection) => {
              const { x, y, width, height } = detection.box;
              context.fillStyle = "black";
              context.fillRect(x, y, width, height); // 얼굴 마스킹
            });

            // OCR 수행
            const ocrResult = await Tesseract.recognize(img, "kor", {
              logger: (info: LoggerInfo) => {
                console.log(`OCR 진행 상태: ${info.status}, 진행률: ${info.progress}`);
              },
            }).catch((error) => {
              console.error("OCR 에러 발생:", error);
            });

            const text = ocrResult?.data?.text || "";
            const words = ocrResult?.data?.words || [];

            console.log("OCR 결과:", text);

            // 단어별 위치 정보로 텍스트 마스킹
            words.forEach((word) => {
              const { bbox } = word; // bbox: { x0, y0, x1, y1 }
              const x = bbox.x0;
              const y = bbox.y0;
              const width = bbox.x1 - bbox.x0;
              const height = bbox.y1 - bbox.y0;

              context.fillStyle = "black";
              context.fillRect(x, y, width, height); // 텍스트 영역만 마스킹
            });

            const maskedImageUrl = canvas.toDataURL("image/png");
            console.log("마스킹된 이미지 URL:", maskedImageUrl);
            setMaskedIDPhoto(maskedImageUrl);
          }
        };
      }
    };

    processPhoto();
  }, [photoStep9]);

  return { maskedIDPhoto: usePhotoStore.getState().maskedIDPhoto };
};

export default useOCR;
