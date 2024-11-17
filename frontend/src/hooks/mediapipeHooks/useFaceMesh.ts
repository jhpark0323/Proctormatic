import { useEffect } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const useFaceMesh = (
  videoRef: React.RefObject<HTMLVideoElement>,
  faceCanvasRef: React.RefObject<HTMLCanvasElement>,
  onResults: (results: any) => void
) => {
  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);

    const camera = new Camera(videoRef.current!, {
      onFrame: async () => {
        await faceMesh.send({ image: videoRef.current });
      },
      width: 800,
      height: 600,
    });
    camera.start();
  }, [videoRef, onResults]);
};

export default useFaceMesh;
