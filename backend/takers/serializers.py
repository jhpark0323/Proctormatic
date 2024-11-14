from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from exams.models import Exam
from datetime import date, datetime
from .models import Taker, Abnormal


class TakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Taker
        fields = ['name', 'email', 'exam']

class UpdateTakerSerializer(serializers.ModelSerializer):
    birth = serializers.CharField(
        error_messages={
            'invalid': "날짜 형식이 올바르지 않습니다. YYYYMMDD 형식이어야 합니다."
        }
    )

    class Meta:
        model = Taker
        fields = ['birth', 'id_photo', 'verification_rate']

    def validate_birth(self, value):
        if not value.isdigit() or len(value) != 8:
            raise serializers.ValidationError("날짜 형식이 올바르지 않습니다. YYYYMMDD 형식이어야 합니다.")

        try:
            birth = datetime.strptime(value, '%Y%m%d')
            if birth.date() > date.today():
                raise serializers.ValidationError('생년월일은 오늘 날짜 이전이어야 합니다.')
        except ValueError:
            raise serializers.ValidationError("날짜 형식이 올바르지 않습니다. YYYYMMDD 형식이어야 합니다.")

        return birth

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
    class Meta:
        model = Abnormal
        fields = ['taker', 'detected_time', 'end_time', 'type']
        extra_kwargs = {
            'detected_time': {
                'error_messages': {
                    'required': '발생 시간을 입력해주세요.',
                    'blank': '발생 시간을 입력해주세요.',
                }
            },
            'end_time': {
                'error_messages': {
                    'required': '종료 시간을 입력해주세요.',
                    'blank': '종료 시간을 입력해주세요.',
                }
            },
            'type': {
                'error_messages': {
                    'required': '타입을 입력해주세요.',
                    'blank': '타입을 입력해주세요.',
                }
            }
        }

    def validate(self, data):
        if data['detected_time'] >= data['end_time']:
            raise serializers.ValidationError("발생시간이 종료시간보다 큽니다.")
        return data