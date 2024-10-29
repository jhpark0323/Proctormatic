FROM python:3.11

WORKDIR /usr/src/app

COPY requirements.txt /usr/src/app/
RUN pip3 install -r requirements.txt

COPY . /usr/src/app/

WORKDIR /usr/src/app/proctomatic

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]

EXPOSE 8000