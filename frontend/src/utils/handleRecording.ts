import { formatDateAndTime } from "@/utils/handleDateTimeChange";
import axiosInstance from "@/utils/axios";

export const startRecording = (
  mediaRecorder: MediaRecorder | null,
  setStartTime: React.Dispatch<React.SetStateAction<string | null>>,
  recordedChunksRef: React.MutableRefObject<Blob[]>
) => {
  if (mediaRecorder) {
    const { time } = formatDateAndTime(new Date());
    setStartTime(time);

    // ondataavailable 핸들러 추가: 데이터가 있을 때마다 recordedChunksRef에 추가
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
        console.log("새로운 데이터 청크 추가됨:", event.data);
      }
    };

    mediaRecorder.start();
    console.log("녹화를 시작합니다.");
  }
};

export const stopRecording = (
  mediaRecorder: MediaRecorder | null,
  recordedChunksRef: React.MutableRefObject<Blob[]>,
  startTime: string | null
) => {
  if (mediaRecorder) {
    const { time } = formatDateAndTime(new Date());

    mediaRecorder.stop();
    console.log("녹화를 종료합니다.");

    mediaRecorder.onstop = () => {
      console.log("MediaRecorder 중지 완료");

      // recordedChunksRef가 초기화되었는지 확인
      if (!recordedChunksRef.current) {
        console.error("recordedChunksRef가 정의되지 않았습니다.");
        recordedChunksRef.current = []; // 빈 배열로 초기화
      }

      // 녹화된 데이터가 있을 경우 전송
      if (recordedChunksRef.current.length > 0) {
        console.log("녹화 전송 시작");

        const webmBlob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });

        const formData = new FormData();
        formData.append("web_cam", webmBlob, "recorded_video.webm");
        formData.append("start_time", startTime || "");
        formData.append("end_time", time || "");

        console.log(startTime, time);

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
      } else {
        console.error("녹화된 데이터가 없습니다.");
      }
    };
  }
};
