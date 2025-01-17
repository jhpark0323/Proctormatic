from rest_framework import serializers
from .models import Exam
from takers.models import Taker, Logs, Abnormal
import datetime

class ExamSerializer(serializers.ModelSerializer):
    cheer_msg = serializers.CharField(allow_null=True, allow_blank=True, required=False)

    class Meta:
        model = Exam
        fields = ['title', 'date', 'start_time', 'end_time', 'exit_time', 'expected_taker', 'cheer_msg', 'cost']
        read_only_fields = ['user']

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
            'id', 'title', 'date', 'start_time', 'end_time', 'exit_time', 'expected_taker',
            'total_taker', 'cheer_msg', 'cost', 'taker_list'
        ]

    def get_taker_list(self, obj):
        # Taker 모델에서 특정 시험에 응시한 사람들의 리스트를 반환
        takers = Taker.objects.filter(exam_id=obj.id)
        return [
            {
                "taker_id": taker.id,
                "name": taker.name,
                "verification_rate": taker.verification_rate,
                "stored_state": taker.stored_state,
                "abnormal_cnt": taker.abnormalList.count()
            }
            for taker in takers
        ]

class AbnormalListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Abnormal
        exclude = ('id', 'taker',)

    def to_representation(self, instance):
        qs = super().to_representation(instance)
        return sorted(qs, key=lambda x: x['detected_time'], reverse=True)

class TakerDetailSerializer(serializers.ModelSerializer):
    number_of_entry = serializers.SerializerMethodField()
    entry_time = serializers.SerializerMethodField()
    exit_time = serializers.SerializerMethodField()
    abnormalList = AbnormalListSerializer(many=True, read_only=True)
    date = serializers.SerializerMethodField()

    class Meta:
        model = Taker
        fields = ('name', 'email', 'birth', 'id_photo', 'web_cam', 'verification_rate', 'date','entry_time', 'exit_time', 'number_of_entry', 'check_out_state', 'abnormalList')

    def get_number_of_entry(self, obj):
        return Logs.objects.filter(taker_id=obj.id, type='entry').count()-1

    def get_entry_time(self, obj):
        entry = Logs.objects.filter(taker_id=obj.id, type='entry').first()
        if entry:
            return entry.time
        else:
            return None

    def get_exit_time(self, obj):
        exit = Logs.objects.filter(taker_id=obj.id, type='exit').first()
        if exit:
            return exit.time
        else:
            return None
    
    def get_date(self, obj):
        # Taker와 연결된 Exam의 date 값 반환
        if isinstance(obj.exam.date, datetime.date):
            return obj.exam.date.strftime('%Y-%m-%d')
        return obj.exam.date