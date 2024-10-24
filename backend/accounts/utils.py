import random
from django.core.mail import send_mail
from django.conf import settings
from django_redis import get_redis_connection

def generate_verification_code():
    return str(random.randint(100000, 999999))

def send_verification_email(email, code):
    subject = '[프록토매틱] 이메일 인증번호'
    message = f'인증번호는 {code}입니다. \n5분 이내에 인증을 완료해주세요.'
    send_mail(subject, message, settings.EMAIL_HOST_USER, [email])

def save_verification_code_to_redis(email, code, expiration=300):
    redis_conn = get_redis_connection('default')
    redis_conn.set(f'verification_code:{email}', code, ex=expiration)