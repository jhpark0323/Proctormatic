# Create your models here.

from django.db import models

class Taker(models.Model):
    id = models.BigAutoField(primary_key=True)
    exam_id = models.BigIntegerField()
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)  # 이메일 필드
    birth = models.DateField(null=True, blank=True)  # NULL 가능
    id_photo = models.CharField(max_length=255, default='비식별화된 신분증')
    web_cam = models.CharField(max_length=255, default='비식별화된 영상')
    verification_rate = models.IntegerField(null=True, blank=True)  # NULL 가능
    entry_time = models.TimeField(null=True, blank=True)  # NULL 가능
    exit_time = models.TimeField(null=True, blank=True)  # NULL 가능

    # class Meta:
        # db_table = 'taker'  # 테이블 이름 설정
        # constraints = [
        #     models.ForeignKey('Exam', to_field='id', on_delete=models.CASCADE)  # exam_id에 대한 외래 키 설정
        # ]

    def __str__(self):
        return f'{self.name} - {self.email}'  # 객체를 출력할 때 사용할 문자열
