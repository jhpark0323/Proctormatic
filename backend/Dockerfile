FROM python:3.11

WORKDIR /usr/src/app

COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY . .

WORKDIR ./proctomatic

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]

EXPOSE 8000