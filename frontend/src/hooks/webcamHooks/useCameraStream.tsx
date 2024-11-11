import { useEffect } from "react";

// 카메라 스트림 설정
const useCameraStream = (videoRef: React.RefObject<HTMLVideoElement>) => {
  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("카메라 접근에 실패했습니다:", err);
      }
    };
    getCameraStream();
  }, [videoRef]);
};

export default useCameraStream;
