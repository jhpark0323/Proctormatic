from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from exams.models import Exam
from datetime import date, datetime

from proctormatic.fields import CustomCharField, CustomCharFieldWithConsonant
from .models import Taker, Abnormal

DATE_FORMAT_ERROR = '날짜 형식이 올바르지 않습니다. YYYYMMDD 형식이어야 합니다.'


class TakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Taker
        fields = ['name', 'email', 'exam']

class UpdateTakerSerializer(serializers.ModelSerializer):
    birth = CustomCharField(
        max_length=8,
        min_length=8,
        error_messages={
            'invalid': DATE_FORMAT_ERROR,
            'min_length': DATE_FORMAT_ERROR,
            'max_length': DATE_FORMAT_ERROR
        }
    )

    class Meta:
        model = Taker
        fields = ['birth', 'id_photo', 'verification_rate']

    def validate_birth(self, value):
        try:
            birth = datetime.strptime(value, '%Y%m%d')
            if birth.date() > date.today():
                raise serializers.ValidationError('생년월일은 오늘 날짜 이전이어야 합니다.')
        except ValueError:
            raise serializers.ValidationError(DATE_FORMAT_ERROR)

        return value

class TakerTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_access_token(cls, taker):
        token = super().get_token(taker)
        token['token_type'] = 'access'
        token['role'] = "taker"

        exam = Exam.objects.get(id=taker.exam.id)
        exam_end_datetime = timezone.datetime.combine(exam.date, exam.end_time)

        token['exp'] = int(exam_end_datetime.timestamp())

        return token

class AbnormalSerializer(serializers.ModelSerializer):
    detected_time = CustomCharFieldWithConsonant(label='발생 시간')
    end_time = CustomCharFieldWithConsonant(label='종료 시간')
    type = CustomCharFieldWithConsonant(label='타입')

    class Meta:
        model = Abnormal
        fields = ['taker', 'detected_time', 'end_time', 'type']

    def validate(self, data):
        if data['detected_time'] >= data['end_time']:
            raise serializers.ValidationError("발생시간이 종료시간보다 큽니다.")
        return data