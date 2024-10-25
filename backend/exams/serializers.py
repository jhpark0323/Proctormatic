from rest_framework import serializers
from .models import Exam
from takers.models import Taker

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ['title', 'date', 'start_time', 'end_time', 'exit_time', 'expected_taker', 'cost']
        read_only_fields = ['user']  # user는 뷰에서 처리되므로 시리얼라이저에서 읽기 전용

class ScheduledExamListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ['id', 'title', 'date', 'start_time', 'end_time', 'url', 'expected_taker']

class OngoingExamListSerializer(serializers.ModelSerializer):
    total_taker = serializers.SerializerMethodField()  # 동적으로 계산할 필드

    class Meta:
        model = Exam
        fields = ['id', 'title', 'date', 'start_time', 'end_time', 'url', 'expected_taker', 'total_taker']

    def get_total_taker(self, obj):
        # Taker 모델에서 특정 시험에 응시한 사람들의 수를 카운트
        return Taker.objects.filter(exam_id=obj.id).count()