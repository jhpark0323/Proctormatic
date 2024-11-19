import cv2
from ultralytics import YOLO
import logging
from takers.models import Abnormal


def process_video_by_frame(video_path, model_path, taker_id):
    # YOLO 모델 로드
    model = YOLO(model_path)

    # 동영상 파일 열기
    cap = cv2.VideoCapture(video_path)

    # 라벨별 감지 시작 및 종료 시간 저장 딕셔너리
    detection_intervals = {}

    # 동영상 프레임 처리 루프
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # 현재 프레임의 시간 계산 (초 단위)
        frame_time = int(cap.get(cv2.CAP_PROP_POS_MSEC) / 1000)

        # YOLO로 객체 감지 수행
        results = model(frame, conf=0.5)

        try:
            boxes = results[0].boxes if hasattr(results[0], 'boxes') else results[0].detections

            current_detected_labels = set()

            for box in boxes:
                class_id = int(box.cls)
                label_name = results[0].names[class_id]
                current_detected_labels.add(label_name)

                # 새로운 라벨에 대해 초기화
                if label_name not in detection_intervals:
                    detection_intervals[label_name] = [{'start': frame_time, 'end': frame_time}]
                else:
                    last_interval = detection_intervals[label_name][-1]
                    # 이전 구간과 연속된 경우 종료 시간 업데이트
                    if last_interval['end'] == frame_time - 1:
                        last_interval['end'] = frame_time
                    else:
                        # 새로운 구간 추가
                        detection_intervals[label_name].append({'start': frame_time, 'end': frame_time})

        except AttributeError:
            logging.warning("모델 출력 형식이 예상과 다릅니다. 결과 확인이 필요합니다.")

    cap.release()

    # 연속 구간 병합 및 최종 출력
    for label, intervals in detection_intervals.items():
        merged_intervals = []
        current_interval = intervals[0]

        for interval in intervals[1:]:
            # 이전 구간과 연속된 경우 종료 시간 확장
            if interval['start'] <= current_interval['end'] + 1:
                current_interval['end'] = interval['end']
            else:
                # 연속되지 않으면 현재 구간 저장 후 새 구간 시작
                merged_intervals.append(current_interval)
                current_interval = interval
        # 마지막 구간 추가
        merged_intervals.append(current_interval)

        # 최종 병합된 결과 출력
        save_abnormal_batch(label, merged_intervals, taker_id)

    return detection_intervals


def save_abnormal_batch(label, intervals, taker):
    for interval in intervals:
        logging.info(f"Saving abnormal: label={label}, start={interval['start']}, end={interval['end']}, taker={taker}")

    abnormalities = [
        Abnormal(
            taker_id=taker,
            type=label,
            detected_time=seconds_to_time_format(interval['start']),
            end_time=seconds_to_time_format(interval['end'])
        )
        for interval in intervals
    ]
    Abnormal.objects.bulk_create(abnormalities)


def seconds_to_time_format(seconds):
    from datetime import timedelta
    return str(timedelta(seconds=seconds))
