import { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import axiosInstance from "@/utils/axios";

const useFaceMesh = (
  videoRef: React.RefObject<HTMLVideoElement>,
  faceCanvasRef: React.RefObject<HTMLCanvasElement>,
  recordStartTime: Date,
  onResults: (results: any) => void
) => {
  const [noFaceStartTime, setNoFaceStartTime] = useState<Date | null>(null);
  const [noFaceEndTime, setNoFaceEndTime] = useState<Date | null>(null);
  const noFaceStartTimeRef = useRef<Date | null>(null);

  const fetchPostAbnormal = (
    detectedTime: Date,
    endTime: Date,
    type: string
  ) => {
    // 시작 시간과 종료 시간을 recordStartTime으로부터의 경과 시간으로 계산
    const detectedMilliseconds =
      detectedTime.getTime() - recordStartTime.getTime();
    const endMilliseconds = endTime.getTime() - recordStartTime.getTime();

    // 경과 시간을 시, 분, 초로 변환
    const formatElapsedTime = (milliseconds: number) => {
      const seconds = Math.floor(milliseconds / 1000) % 60;
      const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
      const hours = Math.floor(milliseconds / (1000 * 60 * 60));
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
    };

    const detectedTimeFormatted = formatElapsedTime(detectedMilliseconds);
    const endTimeFormatted = formatElapsedTime(endMilliseconds);

    axiosInstance
      .post("/taker/abnormal/", {
        type: type,
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

  useEffect(() => {
    if (!videoRef.current) return;

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 2,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      const canvas = faceCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const video = videoRef.current;

      if (!ctx || !video) return;

      // 캔버스 초기화 및 비디오 프레임 그리기 (얼굴이 없더라도 계속 그리기)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 얼굴 인식 결과가 없을 때
      if (
        !results.multiFaceLandmarks ||
        results.multiFaceLandmarks.length === 0
      ) {
        if (noFaceStartTimeRef.current === null) {
          // 얼굴이 처음 사라진 시간 기록
          noFaceStartTimeRef.current = new Date();
          setNoFaceStartTime(noFaceStartTimeRef.current);
        }
        return;
      }

      // 얼굴이 감지되었을 때
      if (noFaceStartTimeRef.current !== null) {
        // 얼굴이 다시 나타났을 때 종료 시간 기록
        const currentEndTime = new Date();
        setNoFaceEndTime(currentEndTime);

        // 이상행동 서버로 전송 (부재 상태)
        fetchPostAbnormal(
          noFaceStartTimeRef.current,
          currentEndTime,
          "absence"
        );

        // 얼굴이 감지되었으므로 시작 시간 초기화
        noFaceStartTimeRef.current = null;
      }

      // 2명 이상의 얼굴이 감지되었을 때 overcrowded로 전송
      if (results.multiFaceLandmarks.length > 1) {
        const currentTime = new Date();

        // overcrowded 상태로 이상행동 서버로 전송
        fetchPostAbnormal(currentTime, currentTime, "overcrowded");
      }

      // 얼굴이 인식된 경우 onResults 콜백 함수 호출
      onResults(results);
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await faceMesh.send({ image: videoRef.current });
        }
      },
      width: 800,
      height: 600,
    });

    camera.start();
  }, [videoRef, onResults]);

  return { noFaceStartTime, noFaceEndTime };
};

export default useFaceMesh;
