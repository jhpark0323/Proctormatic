import { formatDateAndTime } from "@/utils/handleDateTimeChange";
import axiosInstance from "@/utils/axios";

export const startRecording = (
  mediaRecorder: MediaRecorder | null,
  setStartTime: React.Dispatch<React.SetStateAction<string | null>>
) => {
  if (mediaRecorder) {
    const { time } = formatDateAndTime(new Date());
    setStartTime(time);
    mediaRecorder.start();
    console.log("녹화를 시작합니다.");
  }
};

export const stopRecording = (
  mediaRecorder: MediaRecorder | null,
  setEndTime: React.Dispatch<React.SetStateAction<string | null>>,
  recordedChunks: Blob[],
  startTime: string | null,
  endTime: string | null
) => {
  if (mediaRecorder) {
    const { time } = formatDateAndTime(new Date());
    setEndTime(time);
    mediaRecorder.stop();
    console.log("녹화를 종료합니다.");

    // 녹화 종료 후 업로드 함수 호출
    uploadRecordedVideo(recordedChunks, startTime, time);
  }
};

export const uploadRecordedVideo = async (
  recordedChunks: Blob[],
  startTime: string | null,
  endTime: string | null
) => {
  if (recordedChunks.length > 0 && startTime && endTime) {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const formData = new FormData();
    formData.append("web_cam", blob, "recorded_video.webm");
    formData.append("start_time", startTime);
    formData.append("end_time", endTime);

    try {
      console.log(formData);

      // axios를 사용하여 POST 요청 보냄
      const response = await axiosInstance.post("/taker/webcam/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        console.log("업로드 성공");
      } else {
        console.error("업로드 실패");
      }
    } catch (err) {
      console.error("서버 통신에 실패했습니다:", err);
    }
  }
};
