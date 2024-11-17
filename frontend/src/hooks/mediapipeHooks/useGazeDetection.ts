import { useRef } from "react";
import { FACEMESH_LEFT_EYE, FACEMESH_LEFT_IRIS } from "@mediapipe/face_mesh";

const useGazeDetection = () => {
  const gazeStartTimeRef = useRef<number | null>(null);
  const LOOK_UP_DURATION = 5000;

  const detectGaze = (landmarks: any, ctx: CanvasRenderingContext2D | null) => {
    // 왼쪽 홍채의 중앙을 계산
    const leftIrisPoints = FACEMESH_LEFT_IRIS.map(
      ([start]) => landmarks[start]
    );
    const leftIrisCenter = {
      x:
        leftIrisPoints.reduce((sum, point) => sum + point.x, 0) /
        leftIrisPoints.length,
      y:
        leftIrisPoints.reduce((sum, point) => sum + point.y, 0) /
        leftIrisPoints.length,
    };

    // 왼쪽 눈의 중심을 계산
    const leftEyeCenter = {
      x:
        (landmarks[FACEMESH_LEFT_EYE[0][0]].x +
          landmarks[FACEMESH_LEFT_EYE[3][0]].x) /
        2,
      y:
        (landmarks[FACEMESH_LEFT_EYE[0][0]].y +
          landmarks[FACEMESH_LEFT_EYE[3][0]].y) /
        2,
    };

    // 홍채의 위치를 통해 시선 방향 감지
    const leftEyeDiffX = leftIrisCenter.x - leftEyeCenter.x;
    const leftEyeDiffY = leftIrisCenter.y - leftEyeCenter.y;

    if (leftEyeDiffX > -0.015) {
      if (gazeStartTimeRef.current === null) {
        gazeStartTimeRef.current = Date.now();
      }
      if (Date.now() - gazeStartTimeRef.current >= LOOK_UP_DURATION) {
        console.log("사용자가 왼쪽을 5초 동안 보고 있습니다");
        gazeStartTimeRef.current = null;
      }
    } else if (leftEyeDiffX < -0.02) {
      if (gazeStartTimeRef.current === null) {
        gazeStartTimeRef.current = Date.now();
      }
      if (Date.now() - gazeStartTimeRef.current >= LOOK_UP_DURATION) {
        console.log("사용자가 오른쪽을 5초 동안 보고 있습니다");
        gazeStartTimeRef.current = null;
      }
    } else if (leftEyeDiffY < -0.005) {
      if (gazeStartTimeRef.current === null) {
        gazeStartTimeRef.current = Date.now();
      }
      if (Date.now() - gazeStartTimeRef.current >= LOOK_UP_DURATION) {
        console.log("사용자가 위를 5초 동안 보고 있습니다");
        gazeStartTimeRef.current = null;
      }
    } else {
      gazeStartTimeRef.current = null;
    }

    if (ctx) {
      ctx.save();
      // 캔버스 안 보이게
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  };

  return { detectGaze };
};

export default useGazeDetection;
