from rest_framework import serializers
from .models import Exam

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ['title', 'date', 'start_time', 'end_time', 'exit_time', 'expected_taker', 'coin']
        read_only_fields = ['user']  # user는 뷰에서 처리되므로 시리얼라이저에서 읽기 전용

class ScheduledExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ['id', 'title', 'date', 'start_time', 'end_time', 'url', 'expected_taker']