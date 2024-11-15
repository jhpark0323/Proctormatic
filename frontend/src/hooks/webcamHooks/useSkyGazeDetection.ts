import { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const SkyGazeDetector = ({
  videoRef,
  faceMesh,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  faceMesh: FaceMesh;
}) => {
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const onResults = (results: any) => {
      if (
        !results.multiFaceLandmarks ||
        results.multiFaceLandmarks.length === 0
      )
        return;

      const canvas = faceCanvasRef.current;
      const ctx = canvas?.getContext("2d");
      const video = videoRef.current;

      if (ctx && video) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const landmarks = results.multiFaceLandmarks[0];
        const leftEye = landmarks[474];
        const rightEye = landmarks[473];
        const noseTip = landmarks[1];

        // 시선 감지 로직 추가
        if (leftEye.y < noseTip.y && rightEye.y < noseTip.y) {
          console.log("사용자가 하늘을 보고 있습니다");
        }
      }
    };

    faceMesh.onResults(onResults);
  }, [faceMesh, videoRef]);
};

export default SkyGazeDetector;
