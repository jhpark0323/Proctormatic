from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from exams.models import Exam
from .models import Taker

class TakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Taker
        fields = ['name', 'email', 'entry_time','exam']

class UpdateTakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Taker
        fields = ['birth', 'id_photo', 'verification_rate']

class TakerTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_access_token(cls, taker):
        token = super().get_token(taker)
        token['token_type'] = 'access'
        token['user_id'] = taker.id
        token['role'] = "taker"

        exam = Exam.objects.get(id=taker.exam.id)
        current_time = timezone.now()
        exam_end_datetime = timezone.datetime.combine(exam.date, exam.end_time)
        exam_end_datetime_utc = exam_end_datetime.astimezone(timezone.utc)

        if current_time >= exam_end_datetime:
            raise serializers.ValidationError("시험이 종료되었습니다. 토큰을 발급할 수 없습니다.")

        token['exp'] = int(exam_end_datetime_utc.astimezone(timezone.utc).timestamp())
        token['iat'] = int(current_time.timestamp())

        return token