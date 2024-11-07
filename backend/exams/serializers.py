from rest_framework import serializers
from .models import Exam
from takers.models import Taker, Logs

class ExamSerializer(serializers.ModelSerializer):
    cheer_msg = serializers.CharField(allow_null=True, required=False)

    class Meta:
        model = Exam
        fields = ['title', 'date', 'start_time', 'end_time', 'exit_time', 'expected_taker', 'cheer_msg', 'cost']
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

class CompletedExamListSerializer(serializers.ModelSerializer):
    completed_upload = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = ['id', 'title', 'date', 'start_time', 'end_time', 'url', 'expected_taker', 'total_taker', 'completed_upload']

    def get_completed_upload(self, obj):
        # 해당 시험에 대한 `check_out_state`가 `done`인 응시자 수를 반환
        return Taker.objects.filter(exam=obj, check_out_state='done').count()

class ExamDetailTakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'date', 'start_time', 'end_time', 'expected_taker', 'cheer_msg'
        ]

class ExamDetailSerializer(serializers.ModelSerializer):
    # 응시자 리스트 시리얼라이저 필드
    taker_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'date', 'start_time', 'end_time', 'expected_taker',
            'total_taker', 'cheer_msg', 'taker_list'
        ]

    def get_taker_list(self, obj):
        # Taker 모델에서 특정 시험에 응시한 사람들의 리스트를 반환
        takers = Taker.objects.filter(exam_id=obj.id)
        return [
            {
                "taker_id": taker.id,
                "name": taker.name,
                "verification_rate": taker.verification_rate,
                "stored_state": taker.stored_state
            }
            for taker in takers
        ]

class TakerDetailSerializer(serializers.ModelSerializer):
    number_of_entry = serializers.SerializerMethodField()

    class Meta:
        model = Taker
        fields = ['name', 'email', 'birth', 'id_photo', 'verification_rate', 'number_of_entry', 'check_out_state']
    
    def get_number_of_entry(self, obj):
        return Logs.objects.filter(taker_id=obj.id, type='entry').count()-1