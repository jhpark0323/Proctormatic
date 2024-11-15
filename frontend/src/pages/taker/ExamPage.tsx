// import { useEffect, useRef, useState } from "react";
// import useFaceApiModels from "@/hooks/webcamHooks/useFaceApiModels";
// import useFaceTracking from "@/hooks/webcamHooks/useFaceTracking";
// import useCameraStream from "@/hooks/webcamHooks/useCameraStream";
// import { startRecording, stopRecording } from "@/utils/handleRecording";
// import HeaderBlue from "@/components/HeaderBlue";

// const ExamPage = () => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const faceCanvasRef = useRef<HTMLCanvasElement>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const recordedChunksRef = useRef<Blob[]>([]);
//   const [startTime, setStartTime] = useState<string | null>(null);

//   // 1. 웹캠 스트림 초기화
//   useCameraStream(videoRef);

//   // 2. Face API 모델 로드 및 비식별화 적용
//   useFaceApiModels();
//   useFaceTracking(videoRef, faceCanvasRef);

//   // 5. 녹화 기능
//   const handleStartRecording = () => {
//     if (mediaRecorderRef.current) {
//       startRecording(mediaRecorderRef.current, setStartTime, recordedChunksRef);
//     }
//   };

//   // 카메라 스트림 설정 및 MediaRecorder 초기화
//   useEffect(() => {
//     const initializeMediaRecorder = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//         });
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;

//           // MediaRecorder 초기화
//           mediaRecorderRef.current = new MediaRecorder(stream, {
//             mimeType: "video/webm",
//           });

//           // 녹화된 데이터 조각 저장
//           mediaRecorderRef.current.ondataavailable = (event) => {
//             if (event.data.size > 0) {
//               recordedChunksRef.current.push(event.data);
//               console.log("새로운 데이터 청크 추가됨:", event.data);
//             }
//           };
//         }
//       } catch (err) {
//         console.error("카메라 접근에 실패했습니다:", err);
//       }
//     };
//     initializeMediaRecorder();
//   }, []);

//   // 디버깅용 다운로드
//   const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
//   const handleStopRecording = () => {
//     if (mediaRecorderRef.current) {
//       stopRecording(mediaRecorderRef.current, recordedChunksRef, startTime);

//       mediaRecorderRef.current.onstop = () => {
//         if (recordedChunksRef.current.length > 0) {
//           const webmBlob = new Blob(recordedChunksRef.current, {
//             type: "video/webm",
//           });
//           const url = URL.createObjectURL(webmBlob);
//           setDownloadUrl(url);
//         }
//       };
//       recordedChunksRef.current = [];
//     }
//   };

//   return (
//     <>
//       <HeaderBlue />
//       <div>
//         <video
//           ref={videoRef}
//           autoPlay
//           muted
//           style={{ width: "640px", height: "480px" }}
//         />
//         <canvas
//           ref={faceCanvasRef}
//           style={{ position: "absolute", top: 0, left: 0 }}
//         />

//         {/* 녹화 버튼 */}
//         <div style={{ marginTop: "20px" }}>
//           <button onClick={handleStartRecording}>녹화 시작</button>
//           <button onClick={handleStopRecording}>녹화 종료</button>
//           {downloadUrl && (
//             <a href={downloadUrl} download="recorded_video.webm">
//               녹화된 영상 다운로드
//             </a>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default ExamPage;

import { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { startRecording, stopRecording } from "@/utils/handleRecording";
import HeaderBlue from "@/components/HeaderBlue";

const ExamPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const LOOK_UP_DURATION = 5000; // 5초 동안 시선을 감지할 시간
  const gazeStartTimeRef = useRef<number | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // MediaPipe Face Mesh 초기화 및 얼굴 추적 설정
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

        // 얼굴 모자이크 처리
        const boundingBox = getFaceBoundingBox(landmarks);
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(
          boundingBox.x,
          boundingBox.y,
          boundingBox.width,
          boundingBox.height
        );

        // 시선 분석: 사용자가 하늘을 5초 동안 바라보는지 감지
        const leftEye = landmarks[474];
        const rightEye = landmarks[473];
        const noseTip = landmarks[1];

        if (leftEye.y < noseTip.y && rightEye.y < noseTip.y) {
          // 시선을 위로 보고 있는지 확인 후 타이머 시작
          if (!gazeStartTimeRef.current) {
            gazeStartTimeRef.current = Date.now();
          }

          // 5초 이상 시선을 위로 유지할 경우
          if (Date.now() - gazeStartTimeRef.current >= LOOK_UP_DURATION) {
            if (!isLookingUp) {
              console.log("사용자가 5초 동안 하늘을 보고 있습니다");
              setIsLookingUp(true);
            }
          }
        } else {
          // 시선을 다른 곳으로 돌리면 타이머 초기화
          if (isLookingUp) {
            console.log("사용자가 시선을 다른 곳으로 돌렸습니다");
          }
          gazeStartTimeRef.current = null;
          setIsLookingUp(false);
        }
      }
    };

    faceMesh.onResults(onResults);

    const camera = new Camera(videoRef.current!, {
      onFrame: async () => {
        await faceMesh.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });
    camera.start();
  }, []);

  // 얼굴 경계 박스를 계산하는 함수
  const getFaceBoundingBox = (landmarks: any) => {
    const xCoords = landmarks.map((point: any) => point.x);
    const yCoords = landmarks.map((point: any) => point.y);
    const minX = Math.min(...xCoords) * 640;
    const minY = Math.min(...yCoords) * 480;
    const maxX = Math.max(...xCoords) * 640;
    const maxY = Math.max(...yCoords) * 480;
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  };

  // 녹화 시작
  const handleStartRecording = () => {
    if (mediaRecorderRef.current) {
      startRecording(mediaRecorderRef.current, setStartTime, recordedChunksRef);
    }
  };

  // 녹화 중지 및 다운로드 URL 생성
  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      stopRecording(mediaRecorderRef.current, recordedChunksRef, startTime);

      mediaRecorderRef.current.onstop = () => {
        if (recordedChunksRef.current.length > 0) {
          const webmBlob = new Blob(recordedChunksRef.current, {
            type: "video/webm",
          });
          const url = URL.createObjectURL(webmBlob);
          setDownloadUrl(url);
        }
      };
      recordedChunksRef.current = [];
    }
  };

  return (
    <>
      <HeaderBlue />
      <div>
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{ width: "640px", height: "480px" }}
        />
        <canvas
          ref={faceCanvasRef}
          width="640"
          height="480"
          style={{ position: "absolute", top: 0, left: 0 }}
        />

        {/* 녹화 버튼 */}
        <div style={{ marginTop: "20px" }}>
          <button onClick={handleStartRecording}>녹화 시작</button>
          <button onClick={handleStopRecording}>녹화 종료</button>
          {downloadUrl && (
            <a href={downloadUrl} download="recorded_video.webm">
              녹화된 영상 다운로드
            </a>
          )}
        </div>
      </div>
    </>
  );
};

export default ExamPage;
