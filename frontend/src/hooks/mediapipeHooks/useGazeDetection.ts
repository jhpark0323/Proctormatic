import { useRef, useState } from "react";
import { drawConnectors } from "@mediapipe/drawing_utils";
import {
  FACEMESH_TESSELATION,
  FACEMESH_RIGHT_EYE,
  FACEMESH_RIGHT_EYEBROW,
  FACEMESH_RIGHT_IRIS,
  FACEMESH_LEFT_EYE,
  FACEMESH_LEFT_EYEBROW,
  FACEMESH_LEFT_IRIS,
  FACEMESH_FACE_OVAL,
  FACEMESH_LIPS,
} from "@mediapipe/face_mesh";

const useGazeDetection = (LOOK_UP_DURATION: number) => {
  const gazeStartTimeRef = useRef<number | null>(null);
  const [gazeDirection, setGazeDirection] = useState("정면");

  const detectGaze = (landmarks: any, ctx: CanvasRenderingContext2D | null) => {
    const leftIris = landmarks[FACEMESH_LEFT_IRIS[0][0]]; // 왼쪽 홍채 중심
    const rightIris = landmarks[FACEMESH_RIGHT_IRIS[0][0]]; // 오른쪽 홍채 중심
    const leftEyeCenter = {
      x:
        (landmarks[FACEMESH_LEFT_EYE[0][0]].x +
          landmarks[FACEMESH_LEFT_EYE[4][0]].x) /
        2,
      y:
        (landmarks[FACEMESH_LEFT_EYE[0][0]].y +
          landmarks[FACEMESH_LEFT_EYE[4][0]].y) /
        2,
    };
    const rightEyeCenter = {
      x:
        (landmarks[FACEMESH_RIGHT_EYE[0][0]].x +
          landmarks[FACEMESH_RIGHT_EYE[4][0]].x) /
        2,
      y:
        (landmarks[FACEMESH_RIGHT_EYE[0][0]].y +
          landmarks[FACEMESH_RIGHT_EYE[4][0]].y) /
        2,
    };

    // 홍채의 위치를 통해 시선 방향 감지
    const leftEyeDiffX = leftIris.x - leftEyeCenter.x;
    const rightEyeDiffX = rightIris.x - rightEyeCenter.x;
    const avgDiffX = (leftEyeDiffX + rightEyeDiffX) / 2;

    if (avgDiffX > 0.02) {
      setGazeDirection("왼쪽");
      console.log("사용자가 왼쪽을 보고 있습니다");
    } else if (avgDiffX < -0.02) {
      setGazeDirection("오른쪽");
      console.log("사용자가 오른쪽을 보고 있습니다");
    } else {
      setGazeDirection("정면");
      // console.log("사용자가 정면을 보고 있습니다");
    }

    if (ctx) {
      // Canvas가 초기화되지 않도록 설정
      ctx.save();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // 얼굴의 각 특징점 그리기
      drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
        color: "#C0C0C070",
        lineWidth: 1,
      });
      drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, { color: "black" });
      drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYEBROW, {
        color: "#FF3030",
      });
      drawConnectors(ctx, landmarks, FACEMESH_RIGHT_IRIS, { color: "pink" });
      drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, { color: "#30FF30" });
      drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYEBROW, {
        color: "#30FF30",
      });
      drawConnectors(ctx, landmarks, FACEMESH_LEFT_IRIS, { color: "#30FF30" });
      drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, { color: "#E0E0E0" });
      drawConnectors(ctx, landmarks, FACEMESH_LIPS, { color: "#E0E0E0" });

      ctx.restore();
    }
  };

  return { detectGaze, gazeDirection };
};

export default useGazeDetection;
