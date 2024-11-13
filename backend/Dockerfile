FROM python:3.11

WORKDIR /app

COPY . .

RUN pip3 install -r requirements.txt

# 정적파일 생성
RUN python manage.py collectstatic --noinput

# 테스트 및 커버리지 리포트 생성
RUN coverage run manage.py test --noinput --keepdb
RUN coverage xml


CMD ["sh", "-c", "python3 manage.py migrate && (celery -A proctormatic worker -l debug -P eventlet -c 8 &) && python3 manage.py runserver 0.0.0.0:8000"]
