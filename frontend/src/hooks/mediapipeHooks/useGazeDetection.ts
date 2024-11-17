import { useRef } from "react";
import { FACEMESH_LEFT_EYE, FACEMESH_LEFT_IRIS } from "@mediapipe/face_mesh";
import axiosInstance from "@/utils/axios";

const useGazeDetection = (recordStartTime: Date) => {
  const gazeStartTimeRef = useRef<number | null>(null);
  const LOOK_UP_DURATION = 5000;

  const fetchPostAbnormal = (dir: string) => {
    const currentTime = new Date();

    // `end_time`은 현재 시간에서 `recordStartTime`을 뺀 결과
    const elapsedMilliseconds =
      currentTime.getTime() - recordStartTime.getTime();

    // 경과 시간을 시, 분, 초로 변환
    const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000) % 60;
    const elapsedMinutes = Math.floor(elapsedMilliseconds / (1000 * 60)) % 60;
    const elapsedHours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));

    // 포맷팅된 시간 문자열 생성 (HH:mm:ss)
    const endTimeFormatted = `${String(elapsedHours).padStart(2, "0")}:${String(
      elapsedMinutes
    ).padStart(2, "0")}:${String(elapsedSeconds).padStart(2, "0")}`;

    // `detected_time`은 `end_time`에서 5초 전
    const detectedMilliseconds = elapsedMilliseconds - 5000;
    const detectedSeconds = Math.floor(detectedMilliseconds / 1000) % 60;
    const detectedMinutes = Math.floor(detectedMilliseconds / (1000 * 60)) % 60;
    const detectedHours = Math.floor(detectedMilliseconds / (1000 * 60 * 60));

    // 포맷팅된 `detected_time` 문자열 생성 (HH:mm:ss)
    const detectedTimeFormatted = `${String(detectedHours).padStart(
      2,
      "0"
    )}:${String(detectedMinutes).padStart(2, "0")}:${String(
      detectedSeconds
    ).padStart(2, "0")}`;

    axiosInstance
      .post("/taker/abnormal/", {
        type: `eyesight_${dir}`,
        detected_time: detectedTimeFormatted,
        end_time: endTimeFormatted,
      })
      .then((response) => {
        console.log("이상행동 등록 성공: ", response.data);
      })
      .catch((error) => {
        console.error("이상행동 등록 실패: ", error);
      });
  };

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
        fetchPostAbnormal("left");
        gazeStartTimeRef.current = null;
      }
    } else if (leftEyeDiffX < -0.02) {
      if (gazeStartTimeRef.current === null) {
        gazeStartTimeRef.current = Date.now();
      }
      if (Date.now() - gazeStartTimeRef.current >= LOOK_UP_DURATION) {
        console.log("사용자가 오른쪽을 5초 동안 보고 있습니다");
        fetchPostAbnormal("right");
        gazeStartTimeRef.current = null;
      }
    } else if (leftEyeDiffY < -0.005) {
      if (gazeStartTimeRef.current === null) {
        gazeStartTimeRef.current = Date.now();
      }
      if (Date.now() - gazeStartTimeRef.current >= LOOK_UP_DURATION) {
        console.log("사용자가 위를 5초 동안 보고 있습니다");
        fetchPostAbnormal("up");
        gazeStartTimeRef.current = null;
      }
    } else {
      gazeStartTimeRef.current = null;
    }

    if (ctx) {
      ctx.save();
      ctx.restore();
    }
  };

  return { detectGaze };
};

export default useGazeDetection;
