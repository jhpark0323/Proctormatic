import { useEffect } from "react";
import * as faceapi from "face-api.js";

const useFaceTracking = (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>
) => {
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("play", () => {
        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current;
          const displaySize = {
            width: videoRef.current.videoWidth || 0,
            height: videoRef.current.videoHeight || 0,
          };
          faceapi.matchDimensions(canvas, displaySize);

          const intervalId = setInterval(async () => {
            if (videoRef.current) {
              const detections = await faceapi
                .detectAllFaces(
                  videoRef.current,
                  new faceapi.TinyFaceDetectorOptions()
                )
                .withFaceLandmarks();
              const resizedDetections = faceapi.resizeResults(
                detections,
                displaySize
              );
              const context = canvas.getContext("2d");

              if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = displaySize.width;
                canvas.height = displaySize.height;

                // 비디오 영상 그리기
                context.drawImage(
                  videoRef.current,
                  0,
                  0,
                  canvas.width,
                  canvas.height
                );

                // 얼굴 부분 모자이크 처리
                resizedDetections.forEach((detection) => {
                  const landmarks = detection.landmarks;
                  const leftEye = landmarks.getLeftEye();
                  const rightEye = landmarks.getRightEye();
                  const mouth = landmarks.getMouth();

                  const minX = Math.min(...leftEye.map((p) => p.x)) - 20;
                  const maxX = Math.max(...rightEye.map((p) => p.x)) + 20;
                  const minY = Math.min(leftEye[0].y, rightEye[0].y) - 10;
                  const maxY = Math.max(...mouth.map((p) => p.y));

                  const trapezoidWidth = maxX - minX;
                  const trapezoidHeight = maxY - minY;

                  const faceRegion = context.getImageData(
                    minX,
                    minY,
                    trapezoidWidth,
                    trapezoidHeight
                  );

                  const v = 15;
                  const smallWidth = Math.max(
                    1,
                    Math.floor(trapezoidWidth / v)
                  );
                  const smallHeight = Math.max(
                    1,
                    Math.floor(trapezoidHeight / v)
                  );

                  const smallCanvas = document.createElement("canvas");
                  smallCanvas.width = smallWidth;
                  smallCanvas.height = smallHeight;
                  const smallContext = smallCanvas.getContext("2d");

                  if (smallContext) {
                    // 원본 얼굴을 작은 크기로 축소하여 블러 효과를 만듦
                    smallContext.putImageData(faceRegion, 0, 0);
                    smallContext.drawImage(
                      canvas,
                      minX,
                      minY,
                      trapezoidWidth,
                      trapezoidHeight,
                      0,
                      0,
                      smallWidth,
                      smallHeight
                    );

                    // 작은 얼굴 영역을 원래 크기로 확대하여 모자이크 효과를 만듦
                    context.save();
                    context.beginPath();
                    context.moveTo(minX + 20, minY);
                    context.lineTo(maxX - 20, minY);
                    context.quadraticCurveTo(maxX, minY, maxX, minY + 20);
                    context.lineTo(maxX, maxY - 20);
                    context.quadraticCurveTo(maxX, maxY, maxX - 20, maxY);
                    context.lineTo(minX + 20, maxY);
                    context.quadraticCurveTo(minX, maxY, minX, maxY - 20);
                    context.lineTo(minX, minY + 20);
                    context.quadraticCurveTo(minX, minY, minX + 20, minY);
                    context.clip();
                    context.drawImage(
                      smallCanvas,
                      0,
                      0,
                      smallWidth,
                      smallHeight,
                      minX,
                      minY,
                      trapezoidWidth,
                      trapezoidHeight
                    );
                    context.restore();
                  }
                });
              }
            }
          }, 100);

          return () => clearInterval(intervalId);
        }
      });
    }
  }, [videoRef, canvasRef]);
};

export default useFaceTracking;

// import { useEffect } from "react";
// import * as faceapi from "face-api.js";

// const useFaceTracking = (
//   videoRef: React.RefObject<HTMLVideoElement>,
//   canvasRef: React.RefObject<HTMLCanvasElement>,
//   modelsLoaded: boolean
// ) => {
//   useEffect(() => {
//     if (!modelsLoaded) return;

//     const intervalId = setInterval(async () => {
//       if (videoRef.current && canvasRef.current) {
//         const video = videoRef.current;
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");
//         canvas.width = 640;
//         canvas.height = 480;

//         const detections = await faceapi.detectAllFaces(
//           video,
//           new faceapi.TinyFaceDetectorOptions()
//         );

//         ctx!.clearRect(0, 0, canvas.width, canvas.height);
//         detections.forEach((detection) => {
//           const { x, y, width, height } = detection.box;
//           ctx!.fillStyle = "rgba(0, 0, 0, 0.5)";
//           ctx!.fillRect(x, y, width, height);
//         });
//       }
//     }, 500);

//     return () => clearInterval(intervalId);
//   }, [modelsLoaded, videoRef, canvasRef]);
// };

// export default useFaceTracking;
