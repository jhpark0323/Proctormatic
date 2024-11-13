FROM python:3.11

WORKDIR /app

COPY . .

RUN pip3 install -r requirements.txt

RUN python manage.py collectstatic --noinput

RUN coverage run manage.py test

RUN coverage xml

CMD ["sh", "-c", "python3 manage.py makemigrations && python3 manage.py migrate && (celery -A proctormatic worker -l debug -P eventlet -c 8 &) && python3 manage.py runserver 0.0.0.0:8000"]
