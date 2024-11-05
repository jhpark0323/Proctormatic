import { useEffect, useState } from "react";
import { usePhotoStore } from "@/store/usePhotoStore";
import * as faceapi from "face-api.js";

const useOCR = () => {
  const { photoStep9, maskedIDPhoto, setMaskedIDPhoto } = usePhotoStore();

  useEffect(() => {
    const processPhoto = async () => {
      if (photoStep9) {
        // face-api 모델 로드
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

        // 이미지 생성
        const img = new Image();
        img.src = photoStep9;

        img.onload = async () => {
          // canvas 생성
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const context = canvas.getContext("2d");

          if (context) {
            // 이미지 그리기
            context.drawImage(img, 0, 0, img.width, img.height);

            // 얼굴 탐지
            const detections = await faceapi.detectAllFaces(
              img,
              new faceapi.TinyFaceDetectorOptions()
            );

            // 얼굴 영역을 검게 칠함
            detections.forEach((detection) => {
              const { x, y, width, height } = detection.box;
              context.fillStyle = "black";
              context.fillRect(x, y, width, height);
            });

            // 수정된 이미지를 데이터 URL로 변환
            const maskedImageUrl = canvas.toDataURL("image/png");
            setMaskedIDPhoto(maskedImageUrl);
          }
        };
      }
    };

    processPhoto();
  }, [photoStep9]);

  return { maskedIDPhoto };
};

export default useOCR;
