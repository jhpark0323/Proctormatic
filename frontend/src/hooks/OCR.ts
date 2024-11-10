import { useEffect } from "react";
import { usePhotoStore } from "@/store/usePhotoStore";
import * as faceapi from "face-api.js";
import Tesseract from "tesseract.js";

interface LoggerInfo {
  status: string;
  progress: number;
}

const useOCR = () => {
  const { photoStep9, maskedIDPhoto, setMaskedIDPhoto } = usePhotoStore();

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

            // OCR을 사용해 신분증 텍스트 추출
            const ocrResult = await Tesseract.recognize(img, "kor", {
              logger: (info: LoggerInfo) => {
                console.log(
                  `Status: ${info.status}, Progress: ${info.progress}`
                );
              },
            });

            // 디버깅용 console.log
            console.log("OCR 결과:", ocrResult.data.text);

            // OCR 결과에서 이름과 생년월일을 제외한 나머지 정보 마스킹
            const {
              data: { text },
            } = ocrResult;

            if (text.trim() === "") {
              // OCR에서 텍스트를 읽지 못한 경우 - 첫 문자와 첫 숫자를 제외한 나머지 마스킹
              let firstCharacterFound = false;
              let firstDigitFound = false;

              const lines = text.split("\n");
              lines.forEach((line: string, index: number) => {
                let maskedLine = "";

                for (let i = 0; i < line.length; i++) {
                  const char = line[i];

                  if (!firstCharacterFound && /[가-힣]/.test(char)) {
                    // 첫 번째 한글 문자를 발견했을 때는 마스킹하지 않음
                    maskedLine += char;
                    firstCharacterFound = true;
                  } else if (!firstDigitFound && /[0-9]/.test(char)) {
                    // 첫 번째 숫자를 발견했을 때는 마스킹하지 않음
                    maskedLine += char;
                    firstDigitFound = true;
                  } else {
                    // 나머지 문자와 숫자는 모두 마스킹 처리
                    maskedLine += "*";
                  }
                }

                // 마스킹된 라인을 캔버스에 그리기
                context.fillStyle = "black";
                context.fillText(maskedLine, 10, 20 * (index + 1));
              });
            } else {
              // 이름과 생년월일을 추출하기 위한 정규식 설정 (수정 필요)
              const namePattern = /[가-힣]{2,4}/; // 2~4자의 연속된 한글을 이름으로 추출 (일반적인 한국 이름의 길이)
              const dobPattern = /\b(\d{6}|\d{8})\b/; // 생년월일: 6자리(YYMMDD) 또는 8자리(YYYYMMDD)

              const nameMatch = text.match(namePattern);
              const dobMatch = text.match(dobPattern);

              const name = nameMatch ? nameMatch[0] : null;
              const dob = dobMatch ? dobMatch[0] : null;

              // OCR 텍스트에서 이름과 생년월일을 제외한 정보 마스킹
              if (name !== null || dob !== null) {
                const lines = text.split("\n");
                lines.forEach((line: string) => {
                  // 이름과 생년월일이 포함되지 않은 텍스트를 찾아서 마스킹 처리
                  if (
                    !(
                      (name && line.includes(name)) ||
                      (dob && line.includes(dob))
                    )
                  ) {
                    context.fillStyle = "black";
                    context.fillText(line, 10, 10); // 예시로 임의의 위치에 마스킹
                  }
                });
              }
            }

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
