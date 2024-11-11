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
    axiosInstance
      .post("/taker/webcam/", { recordedChunks, startTime, endTime })
      .then((response) => {
        console.log("업로드 성공: ", response.data);
      })
      .catch((error) => {
        console.log("업로드 실패: ", error);
      });
  }
};
