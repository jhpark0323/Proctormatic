from django.db import models
from django.conf import settings

class Exam(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 시험 생성자
    title = models.CharField(max_length=255)  # 시험 제목
    date = models.DateField()  # 시험 날짜
    entry_time = models.TimeField()  # 입장 시간
    start_time = models.TimeField()  # 시험 시작 시간
    exit_time = models.TimeField()  # 퇴장 시간
    end_time = models.TimeField()  # 시험 종료 시간
    url = models.CharField(max_length=255)  # 시험 URL
    expected_taker = models.IntegerField()  # 예상 참가자 수
    total_taker = models.IntegerField(default=0)  # 총 참가자 수
    cheer_msg = models.CharField(max_length=100, null=True, blank=True)  # 응원 메시지 (nullable)
    cost = models.IntegerField()  # 서비스 요금
    created_at = models.DateTimeField(auto_now_add=True)  # 생성일
    is_deleted = models.BooleanField(default=False)

    class Meta:
        db_table = 'exam'