FROM python:3.11

WORKDIR /app

COPY . .

RUN pip3 install -r requirements.txt

RUN python3 manage.py collectstatic --noinput

CMD ["sh", "-c", "python3 manage.py makemigrations && python3 manage.py migrate && python3 manage.py runserver 0.0.0.0:8000"]
