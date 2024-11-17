import { useRef, useState } from "react";
import { startRecording, stopRecording } from "@/utils/handleRecording";

const useRecording = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);

  const handleStartRecording = () => {
    console.log(mediaRecorderRef); // 디버깅용
    if (mediaRecorderRef.current) {
      startRecording(mediaRecorderRef.current, setStartTime, recordedChunksRef);
    }
  };

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

  return {
    handleStartRecording,
    handleStopRecording,
    downloadUrl,
  };
};

export default useRecording;
