FROM python:3.11

WORKDIR /app

# ffmegp 설치 && libgl1 설치
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgl1-mesa-glx \
    libgl1-mesa-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1

COPY . .

RUN pip3 install -r requirements.txt

# 정적파일 생성
RUN python manage.py collectstatic --noinput

RUN python manage.py makemigrations
RUN python manage.py migrate

# 테스트 및 커버리지 리포트 생성
RUN coverage run manage.py test --noinput --keepdb
RUN coverage xml || exit 0  # 오류 무시

    
CMD ["sh", "-c", "python3 manage.py migrate && (celery -A proctormatic worker -l debug -P eventlet -c 8 &) && python3 manage.py runserver 0.0.0.0:8000"]
