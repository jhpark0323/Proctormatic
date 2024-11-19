import { useRef, useState } from "react";
import { startRecording, stopRecording } from "@/utils/handleRecording";
import axiosInstance from "@/utils/axios";

const useRecording = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);

  const handleStartRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 캔버스 스트림 생성
    const canvasStream = canvas.captureStream(30); // 초당 30프레임으로 스트림 캡처
    const mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType: "video/webm; codecs=vp9",
    });

    // MediaRecorder 설정
    mediaRecorderRef.current = mediaRecorder;

    // 녹화 시작
    if (mediaRecorderRef.current) {
      startRecording(mediaRecorderRef.current, setStartTime, recordedChunksRef);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      // 녹화 중지 시 onstop 핸들러 설정
      mediaRecorderRef.current.onstop = () => {
        console.log("MediaRecorder 중지 완료");

        // 녹화된 데이터가 있을 경우 전송
        if (recordedChunksRef.current.length > 0) {
          console.log("녹화 전송 시작");

          const webmBlob = new Blob(recordedChunksRef.current, {
            type: "video/webm",
          });

          const formData = new FormData();
          formData.append("web_cam", webmBlob, "recorded_video.webm");
          formData.append("start_time", startTime || "");
          formData.append("end_time", new Date().toISOString());

          axiosInstance
            .post("/taker/webcam/", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then((response) => {
              console.log("업로드 성공: ", response.data);
            })
            .catch((error) => {
              console.error("업로드 실패: ", error);
            });

          // 녹화 데이터 초기화
          recordedChunksRef.current = [];
        } else {
          console.error("녹화된 데이터가 없습니다.");
        }
      };

      mediaRecorderRef.current.stop();
      console.log("녹화를 종료합니다.");
    }
  };

  return {
    handleStartRecording,
    handleStopRecording,
    downloadUrl,
    mediaRecorderRef,
  };
};

export default useRecording;
